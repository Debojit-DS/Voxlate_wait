/**
 * Rebuilds public/models/voxlate-earpiece.glb from the v9 CAD export
 * (Voxlate_v9_Website/parts: shell_front, shell_back, touch_panel, led_strip, ear_gel, volume_buttons,
 * logo .stl). v9 = v8 plus the logo mark on the touch panel.
 *
 * The site ships this small GLB instead of the 10 MB STL set: each part is welded,
 * simplified, given crease-aware normals, quantized and meshopt-compressed.
 * Parts stay separate meshes so the page can colour them, light the LED strip and highlight them.
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
  { file: 'shell_front', ratio: 0.22 },
  { file: 'shell_back', ratio: 0.22 },
  { file: 'touch_panel', ratio: 0.3 },
  { file: 'led_strip', ratio: 0.45 },
  { file: 'ear_gel', ratio: 0.25 },
  { file: 'volume_buttons', ratio: 0.5 },
  { file: 'logo', ratio: 1 }, // tiny (312 triangles): kept as modelled
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
  return { name: file, ...r, welded: w.pos };
});

// Light spill: for the surfaces around the LED strip, store how far each vertex is from the
// strip (0 = touching, 1 = GLOW_MM or further) so the page can tint them with the LED colour.
const GLOW_MM = 4;
const GLOW_PARTS = ['shell_front'];
// Distances are to the strip's triangles, not its vertices: the CAD strip is tessellated into long
// thin triangles, and vertex distances would ripple into visible bands.
function closestOnTriangle(p, a, b, c) {
  // Ericson, Real-Time Collision Detection 5.1.5
  const sub = (u, v) => [u[0]-v[0], u[1]-v[1], u[2]-v[2]]; const dot = (u, v) => u[0]*v[0] + u[1]*v[1] + u[2]*v[2];
  const at = (o, u, s, v = [0,0,0], t = 0) => [o[0] + u[0]*s + v[0]*t, o[1] + u[1]*s + v[1]*t, o[2] + u[2]*s + v[2]*t];
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a);
  const d1 = dot(ab, ap), d2 = dot(ac, ap); if (d1 <= 0 && d2 <= 0) return a;
  const bp = sub(p, b); const d3 = dot(ab, bp), d4 = dot(ac, bp); if (d3 >= 0 && d4 <= d3) return b;
  const vc = d1*d4 - d3*d2; if (vc <= 0 && d1 >= 0 && d3 <= 0) return at(a, ab, d1 / (d1 - d3));
  const cp = sub(p, c); const d5 = dot(ab, cp), d6 = dot(ac, cp); if (d6 >= 0 && d5 <= d6) return c;
  const vb = d5*d2 - d1*d6; if (vb <= 0 && d2 >= 0 && d6 <= 0) return at(a, ac, d2 / (d2 - d6));
  const va = d3*d6 - d5*d4; if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) return at(b, sub(c, b), (d4 - d3) / ((d4 - d3) + (d5 - d6)));
  const den = 1 / (va + vb + vc); return at(a, ab, vb * den, ac, vc * den);
}
{
  const ledPart = parts.find((p) => p.name === 'led_strip');
  const led = ledPart.welded;
  const tris = weld(readStl(`${dir}/led_strip.stl`)).idx;
  const cell = 1; const grid = new Map();
  const key = (x, y, z) => `${x},${y},${z}`;
  const vert = (i) => [led[i*3], led[i*3+1], led[i*3+2]];
  for (let t = 0; t < tris.length; t += 3) {
    const vs = [vert(tris[t]), vert(tris[t+1]), vert(tris[t+2])];
    const lo = [0, 1, 2].map((a) => Math.floor(Math.min(vs[0][a], vs[1][a], vs[2][a]) / cell));
    const hi = [0, 1, 2].map((a) => Math.floor(Math.max(vs[0][a], vs[1][a], vs[2][a]) / cell));
    for (let x = lo[0]; x <= hi[0]; x++) for (let y = lo[1]; y <= hi[1]; y++) for (let z = lo[2]; z <= hi[2]; z++) {
      const k = key(x, y, z); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(t);
    }
  }
  const reach = Math.ceil(GLOW_MM / cell);
  for (const p of parts) {
    if (!GLOW_PARTS.includes(p.name)) continue;
    const glow = new Float32Array(p.pos.length / 3);
    for (let v = 0; v < glow.length; v++) {
      const q = [p.pos[v*3], p.pos[v*3+1], p.pos[v*3+2]];
      const cx = Math.floor(q[0] / cell), cy = Math.floor(q[1] / cell), cz = Math.floor(q[2] / cell);
      let best = GLOW_MM * GLOW_MM; const seen = new Set();
      for (let a = -reach; a <= reach; a++) for (let b = -reach; b <= reach; b++) for (let c = -reach; c <= reach; c++) {
        const list = grid.get(key(cx + a, cy + b, cz + c)); if (!list) continue;
        for (const t of list) {
          if (seen.has(t)) continue; seen.add(t);
          const r = closestOnTriangle(q, vert(tris[t]), vert(tris[t+1]), vert(tris[t+2]));
          const d = (r[0]-q[0])**2 + (r[1]-q[1])**2 + (r[2]-q[2])**2; if (d < best) best = d;
        }
      }
      glow[v] = Math.sqrt(best) / GLOW_MM;
    }
    p.glow = glow;
    console.log(p.name, 'verts near LED', glow.filter((g) => g < 1).length);
  }
}

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
  if (p.glow) prim.setAttribute('_LED_DISTANCE', doc.createAccessor().setType('SCALAR').setArray(p.glow).setBuffer(buf));
  const mesh = doc.createMesh(p.name).addPrimitive(prim);
  scene.addChild(doc.createNode(p.name).setMesh(mesh));
}
doc.createExtension(KHRMeshQuantization).setRequired(true);
await doc.transform(quantize({ quantizePosition: 14, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: 'high' }));
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const glb = await io.writeBinary(doc);
fs.writeFileSync(out, glb);
console.log('wrote', out, glb.length, 'bytes');
