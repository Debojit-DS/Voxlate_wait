/**
 * Rebuilds public/models/voxlate-earpiece.glb from the CAD export
 * (Voxlate_Earpiece_v5_Parts.zip: body_front, body_back, ear_gel, touch_pad, volume_buttons .stl).
 *
 * The site ships this ~290 KB GLB instead of the 8 MB STL set: each part is welded,
 * simplified to ~40k triangles total, given crease-aware normals, quantized and
 * meshopt-compressed. Parts stay separate meshes so the page can colour and highlight them.
 *
 * The tools are not project dependencies; install them in a scratch folder and run:
 *   npm i meshoptimizer@0.22.0 @gltf-transform/core@4.1.1 @gltf-transform/extensions@4.1.1 @gltf-transform/functions@4.1.1
 *   node stl-to-glb.mjs <folder-with-stl-parts> <out.glb>
 */
import fs from 'fs';
import { MeshoptSimplifier, MeshoptEncoder } from 'meshoptimizer';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { quantize, meshopt } from '@gltf-transform/functions';

const [dir, out] = process.argv.slice(2);
await MeshoptSimplifier.ready; await MeshoptEncoder.ready;

const PARTS = [
  { file: 'body_front', ratio: 0.22 },
  { file: 'body_back', ratio: 0.22 },
  { file: 'ear_gel', ratio: 0.25 },
  { file: 'touch_pad', ratio: 0.35 },
  { file: 'volume_buttons', ratio: 0.5 },
];
const CREASE = Math.cos((38 * Math.PI) / 180);

function readStl(path) {
  const b = fs.readFileSync(path); const n = b.readUInt32LE(80);
  const p = new Float32Array(n * 9);
  for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) p[i * 9 + k] = b.readFloatLE(84 + i * 50 + 12 + k * 4);
  return p;
}
function weld(soup) {
  const map = new Map(); const pos = []; const idx = new Uint32Array(soup.length / 3);
  for (let i = 0; i < soup.length / 3; i++) {
    const x = soup[i*3], y = soup[i*3+1], z = soup[i*3+2];
    const key = `${Math.round(x*2e3)},${Math.round(y*2e3)},${Math.round(z*2e3)}`;
    let v = map.get(key); if (v === undefined) { v = pos.length / 3; map.set(key, v); pos.push(x, y, z); }
    idx[i] = v;
  }
  // drop degenerate triangles
  const keep = [];
  for (let t = 0; t < idx.length; t += 3) { const a = idx[t], b = idx[t+1], c = idx[t+2]; if (a !== b && b !== c && a !== c) keep.push(a, b, c); }
  return { pos: new Float32Array(pos), idx: new Uint32Array(keep) };
}
function compact(pos, idx) {
  const remap = new Int32Array(pos.length / 3).fill(-1); const np = []; const ni = new Uint32Array(idx.length);
  for (let i = 0; i < idx.length; i++) { let r = remap[idx[i]]; if (r < 0) { r = np.length / 3; remap[idx[i]] = r; np.push(pos[idx[i]*3], pos[idx[i]*3+1], pos[idx[i]*3+2]); } ni[i] = r; }
  return { pos: new Float32Array(np), idx: ni };
}
function creased(pos, idx) {
  const nf = idx.length / 3; const fn = new Float32Array(nf * 3); const vf = Array.from({ length: pos.length / 3 }, () => []);
  for (let f = 0; f < nf; f++) {
    const a = idx[f*3], b = idx[f*3+1], c = idx[f*3+2];
    const ux = pos[b*3]-pos[a*3], uy = pos[b*3+1]-pos[a*3+1], uz = pos[b*3+2]-pos[a*3+2];
    const vx = pos[c*3]-pos[a*3], vy = pos[c*3+1]-pos[a*3+1], vz = pos[c*3+2]-pos[a*3+2];
    fn[f*3] = uy*vz-uz*vy; fn[f*3+1] = uz*vx-ux*vz; fn[f*3+2] = ux*vy-uy*vx; // area weighted
    vf[a].push(f); vf[b].push(f); vf[c].push(f);
  }
  const unit = (f) => { const l = Math.hypot(fn[f*3], fn[f*3+1], fn[f*3+2]) || 1; return [fn[f*3]/l, fn[f*3+1]/l, fn[f*3+2]/l]; };
  const map = new Map(); const P = []; const N = []; const I = new Uint32Array(idx.length);
  for (let f = 0; f < nf; f++) {
    const u = unit(f);
    for (let k = 0; k < 3; k++) {
      const v = idx[f*3+k]; let nx = 0, ny = 0, nz = 0;
      for (const g of vf[v]) { const w = unit(g); if (u[0]*w[0]+u[1]*w[1]+u[2]*w[2] >= CREASE) { nx += fn[g*3]; ny += fn[g*3+1]; nz += fn[g*3+2]; } }
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      const key = `${v}|${Math.round(nx*64)},${Math.round(ny*64)},${Math.round(nz*64)}`;
      let o = map.get(key); if (o === undefined) { o = P.length / 3; map.set(key, o); P.push(pos[v*3], pos[v*3+1], pos[v*3+2]); N.push(nx, ny, nz); }
      I[f*3+k] = o;
    }
  }
  return { pos: new Float32Array(P), nor: new Float32Array(N), idx: I };
}

const parts = PARTS.map(({ file, ratio }) => {
  const w = weld(readStl(`${dir}/${file}.stl`));
  const target = Math.floor((w.idx.length * ratio) / 3) * 3;
  const [simp, err] = MeshoptSimplifier.simplify(w.idx, w.pos, 3, target, 0.002, ['LockBorder']);
  const c = compact(w.pos, simp);
  const r = creased(c.pos, c.idx);
  console.log(file, 'welded verts', w.pos.length / 3, 'tris', w.idx.length / 3, '->', r.idx.length / 3, 'tris,', r.pos.length / 3, 'verts, err', err.toFixed(5));
  return { name: file, ...r };
});

// centre on the overall bounding box, convert mm -> model units (1 unit = 10 mm)
const min = [1e9,1e9,1e9], max = [-1e9,-1e9,-1e9];
for (const p of parts) for (let i = 0; i < p.pos.length; i += 3) for (let a = 0; a < 3; a++) { min[a] = Math.min(min[a], p.pos[i+a]); max[a] = Math.max(max[a], p.pos[i+a]); }
const ctr = min.map((m, a) => (m + max[a]) / 2);
for (const p of parts) for (let i = 0; i < p.pos.length; i += 3) for (let a = 0; a < 3; a++) p.pos[i+a] = (p.pos[i+a] - ctr[a]) / 10;
console.log('bbox mm', min, max, 'centre', ctr);

const doc = new Document(); const buf = doc.createBuffer(); const scene = doc.createScene('earpiece');
for (const p of parts) {
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(p.pos).setBuffer(buf))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(p.nor).setBuffer(buf))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(p.pos.length / 3 > 65535 ? p.idx : new Uint16Array(p.idx)).setBuffer(buf))
    .setMaterial(doc.createMaterial(p.name));
  const mesh = doc.createMesh(p.name).addPrimitive(prim);
  scene.addChild(doc.createNode(p.name).setMesh(mesh));
}
doc.createExtension(KHRMeshQuantization).setRequired(true);
await doc.transform(quantize({ quantizePosition: 14, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: 'high' }));
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const glb = await io.writeBinary(doc);
fs.writeFileSync(out, glb);
console.log('wrote', out, glb.length, 'bytes');
