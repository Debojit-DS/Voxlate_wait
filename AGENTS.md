# Voxlate website — design guide for agents

Read this before changing anything people can see. Every new page, section or component must look like
it was always part of this site. When a request and this guide disagree, ask the owner before building;
when the owner decides something new about the look, update this file in the same change.

---

## 1. The look in one paragraph

Warm paper-white pages with a faint blue grid, deep navy type and navy buttons, and one royal-blue accent
used sparingly. Big, tight Cabinet Grotesk headlines; calm Switzer body text. The brand motif is the
infinity loop (∞): languages go in, Voxlate sits in the middle, your language comes out. It appears as the
3D ribbon on the homepage, as the separator on tapes, and as the path the FAQ lens travels. Motion is
calm, continuous and explained by the content (a ribbon flows, a laptop opens, a light changes with the
mode). Nothing looks generated, templated or "AI".

**The two colours that define the site are paper white and navy `#0D1B2A`.** Royal blue `#1F3FB8` is an
accent, not a base colour. Reference for the whole feel: the "Ready to be heard in every language?" gift
section (`components/home/WaitlistGift.tsx`): navy panel, paper and slate-blue tapes, Cabinet Grotesk,
blue ∞ between items.

---

## 2. Colour

Tokens live in `app/globals.css` (`@theme`) and are used as Tailwind classes (`bg-ink`, `text-slate`, …).
Never hard-code a hex that already has a token.

| Role | Token / value | Use |
| --- | --- | --- |
| Page | `--color-page` `#F4F3EF` | Every page background (warm paper, never pure white behind text) |
| Surface | `--color-surface` `#FBFBF9` | Alternate bands, cards, chips, fields |
| Ink / navy | `--color-ink` `#0D1B2A` (`--color-night` is the same) | Headlines, body emphasis, **all buttons**, dark panels, footer, front tapes |
| Ink hover | `--color-ink-hover` `#1C2F4A` | Hover state of navy buttons |
| Slate | `--color-slate` `#4B5567` | Secondary text, captions |
| Line | `--color-line` `#DDDAD2` | Hairlines, section borders (decorative) |
| Line strong | `--color-line-strong` `#868375` | Control borders, inactive numerals (meets 3:1) |
| Royal blue | `--color-primary` `#1F3FB8` | Accent only: ∞ marks, the second line of a headline, link hover, focus ring, homepage ribbon band, active nav underline |
| Mist | `--color-mist` `#E6EAF4` | Quiet blue tint for skeletons and tags |
| Tape slate-blue | `#8D97AD` | The second tape colour (gift section, waitlist wall) |
| Tape pale | `#CBD1DC` | Furthest-back tapes on paper |
| Blue on navy | `#6F86FF` / `#8FA0FF` | Accents placed on navy (∞ on navy tapes, meeting-mock highlights) where `#1F3FB8` would be too dark |
| P2P green | `--color-p2p` `#0C7F4A` | Physical page P2P mode only (circles, ribbon) |
| P2E blue | `--color-p2e` `#1F3FB8` | Physical page P2E mode |
| Danger / success | `--color-danger` `#B42318`, `--color-success` `#1F7A4D` | Form states only |

Earpiece LED light colours (3D only, see §8): blue `#3566FF`, green `#1ED47F`.

Rules:
- Buttons are navy everywhere (decided by the owner, Nov 2026). On a navy panel, the button is outlined in paper (see the gift section).
- Blue appears in small amounts: one highlighted phrase per headline at most.
- No purple, no gradients on text, no neon, no glow. The single exception is the earpiece's LED strip, which is a real light.
- The variables under `:root` for the demo page (`--bg-base`, `--accent-purple`, …) are legacy; do not use them for new work.

---

## 3. Type

- **Cabinet Grotesk** (Fontshare, variable, `/public/fonts`) for display: `.vx-display` = weight 700, `letter-spacing: -0.025em`, `line-height: 0.98`. Tapes and ribbons use it at weight 600.
- **Switzer** (Fontshare, variable) for body and UI.
- **Inter** only inside the logo wordmark (`components/ui/Logo.tsx`). Never for UI.
- Non-Latin names and words fall back through `--font-indic` (Noto Devanagari, Bengali, Tamil, Telugu, Gujarati, Kannada, Arabic, Japanese, Chinese). Use it on anything that shows user names or other languages.
- Headlines are sentence case. **Uppercase with an outline line** is reserved for the gift-style banners: `.vx-outline` on navy, `.vx-outline-ink` on paper (filled with paper so nothing shows through).
- Hero lines can grow bolder under the pointer (`.vx-line` with `--w-rest` / `--w-hover`, the variable weight axis).
- Typical sizes: page hero `clamp(2.4rem, 10vw, 3.25rem)` → `lg: clamp(3rem, 4.3vw, 4.6rem)`; section title `clamp(2rem, 3.8vw, 3.25rem)`; body 16–18px with `leading-relaxed`; captions 13–15px.
- Labels (`.vx-label`): 13px, weight 500, slate, sentence case. No tiny ALL-CAPS eyebrows, no pills above headlines.

---

## 4. Layout and spacing

- Container: `.page-container` (max 1168px, 20px gutter, 32px from 768px).
- Left-aligned by default. Centre only a single message that the whole screen frames (the waitlist wall, the Digital headline above the closed laptop).
- 4-pt spacing. Sections: `py-16 lg:py-24`, separated by `border-t border-line` or an alternate `bg-surface` band.
- Page heads: `.vx-page-head` padding.
- Radii: buttons and fields 10px, small buttons and chips 8px, panels 14px, feature panels 28px, the laptop 22px.
- The navbar is 72px, sticky and transparent at the top. Full-screen heroes pull up under it with `-mt-[72px]` and must keep that 72px band readable: either fade quiet art out under it (the homepage circles) or start busy art below it (the waitlist wall starts under the navbar with a hairline).
- Must work at 375px wide with no sideways scroll. Check 1440 × 900 and 375 × 812.

---

## 5. Components (reuse before inventing)

All shared classes are in `app/theme.css`.

- **Primary button** `.vx-btn` (52px, navy, white text, radius 10) and `.vx-btn-sm` (42px). One primary button per view. "Join the Waitlist" is always this button.
- **Text link** `.vx-link`: ink, underlined with a line-strong rule, turns blue on hover, often with `ArrowRight` 16px.
- **Chip** `.vx-chip`: 40px toggles; pressed = navy fill.
- **Fields** `.vx-field`, `.vx-field-label`, `.vx-choice` (radio cards), `.vx-field-error`.
- **Station circles** `.vx-marker`: circles that ride the ribbon; `--act` 0→1 fills them; `--marker-color` colours them per page.
- **Tapes** (gift section, waitlist wall): a band in Cabinet Grotesk 600, items written as `text ∞ text ∞`, ∞ at `1.6em` in blue, tape 48–56px tall with a soft drop shadow, the text running in a seamless loop (two copies, `translateX(-50%)`). Navy tapes carry paper text and a `#6F86FF` ∞; paper or slate tapes carry ink text and a `#1F3FB8` ∞. Tapes are always solid: never translucent, faded or blurred.
- **Waitlist wall** (`/waitlist`): solid navy and slate tapes cross the whole page from under the navbar to the footer, carrying only members' names, in random order, each exactly once (no CTA text on the tapes). Spare tapes carry just ∞ marks. A paper "plaque" (`.vx-plaque`, double hairline frame) holds the thank-you and the button; it is sticky on desktop and scrolls away on phones.
- **Grid paper** `.vx-grid`: 32px squares, 7% blue lines, faded at the edges. Hero sections sit on it.
- **Icons**: lucide, square caps (set globally). No icon boxes, no sparkle icons.
- **Logo**: `components/ui/Logo.tsx`. Only its size may change; never crop, recolour or filter it.

---

## 6. Motifs

- **Infinity (∞)**: `components/home/lemniscate.ts`. Use it as the brand thread: separators, paths, loops. Do not decorate with it randomly.
- **Ribbons and tapes**: the homepage 3D ribbon carries words in other languages on one lobe and English on the other; tapes carry calls to action and the waitlist names. New ribbon-like elements must copy the tape spec above.
- **Grid paper**: continue it under anything full-screen.
- **The earpiece**: the real CAD model, never a picture.

---

## 7. Motion

- Library: framer-motion for scroll (`useScroll`, `useTransform`); CSS keyframes for loops.
- Pinned scroll stories use `components/home/story/Station.tsx` (`makeChoreography`, `useStationStyle`, `StationPanel`): fractions of the pinned distance with a dwell on each station.
- Easing `cubic-bezier(0.2, 0.8, 0.2, 1)`. UI feedback 150–200ms; reveals 300–700ms; loops linear.
- Loops pause when off screen; tapes pause on hover where reading matters.
- Every animation has a `prefers-reduced-motion` path (static, readable).
- Allowed flourishes: unrolling tapes, subtle pointer depth (a few px, nearer layers move more), a light filling the LED strip. Not allowed: bouncing, springy overshoot on content, confetti, glitch effects.
- A magnifier or any "copy of the content" effect must lay out exactly like the original (same weight, size, spacing) or it drifts. See the note in `.vx-faq-q`.

---

## 8. 3D (three.js)

- Loaded lazily (`import("./scene")`) so three.js stays out of the first bundle; transparent canvas over the paper page; `NeutralToneMapping`, `RoomEnvironment` lighting.
- Model (v9): `public/models/voxlate-earpiece.glb`, built from `Voxlate_v9_Website/parts/*.stl` by `scripts/stl-to-glb.mjs` (separate meshes: shell_front, shell_back, touch_panel, led_strip, ear_gel, volume_buttons, logo).
- Materials (`components/home/story/earpiece.ts`): warm-white lacquered front shell, navy back, glossy dark-blue touch panel with the satin-silver logo set into it, LED strip drawn as light with a halo (`ledGlow.ts`) and spill on the front shell only.
- The earpiece can always be turned by hand, all the way round: `DeviceHandle.tsx` lays an invisible handle over it (mouse drag spins and tips it, sideways swipes on touch, arrow keys). It coasts, then settles back to the story pose after a few seconds or when the page scrolls on.
- LED colour: blue on the homepage; green for P2P and blue for P2E on the Physical page (the new colour fills the strip from the bottom of the stem up).
- Never bake per-vertex effects onto the touch panel (its long CAD triangles band).

---

## 9. Words

- Plain, specific, honest. Voxlate is in development: say "being built to", "designed to", "target specs". No launch dates or claims that are not true today.
- No hype words ("revolutionary", "seamless", "unleash", "cutting-edge"). No fake reviews, stock faces or AI-generated images; recreate visuals in code or use the real model.
- Product facts: Digital = meeting software (Voxlate Microphone / Speaker in Zoom, Meet, Teams). Physical = wearable earpiece. **P2P = People to People**: any group of any size that doesn’t share a language (a chat in a mall, a market, a street) talking together like any group conversation, each in their own language, with no extra steps; every voice stays distinct, keeping its tone and sense of distance, so you know who is talking. **P2E = Person to Environment** (seminars, lectures, guided tours, markets).
- Waitlist privacy: public pages show members only as first name and last initial ("Priya S."), each once, never with join dates, emails, photos, roles or companies.

---

## 10. Accessibility

- Text contrast at least 4.5:1 (body) and 3:1 (large display, control borders).
- Focus ring: 2px royal-blue outline, 2px offset (global `:focus-visible`).
- Decorative animation is `aria-hidden`; its content is also given as real text (e.g. the waitlist names as an `sr-only` list).
- Tap targets at least 40px. Respect reduced motion (§7).

---

## 11. Never

Purple gradients · gradient text · glows (except the LED) · glossy blobs · pills above headlines · tiny
ALL-CAPS labels · sparkle "AI" icons · icons in coloured boxes · stat banners · fake reviews or stock
avatars · centre-everything layouts · hype words · bouncing · Inter for UI · AI-generated images ·
restyling the Navbar or Footer without asking.

---

## 12. Working process

1. Change only the page or part asked for. Shared pieces (Navbar, Footer, `theme.css` tokens) only with the owner's OK.
2. Reuse tokens and `vx-*` classes; add new shared styles to `app/theme.css` under a titled section.
3. Look at the result in the browser at 1440 × 900 and 375 × 812, including the reduced-motion path when motion changed.
4. `npx tsc --noEmit -p .` and `npx eslint` on the changed files. (Lint errors in `app/login/LoginForm.tsx` and `components/auth/AuthProvider.tsx` predate this guide.)
5. Update this file when the owner sets a new design rule.

---

## 13. Where things are

| Area | Files |
| --- | --- |
| Tokens and base styles | `app/globals.css` |
| Shared `vx-*` classes, fonts, animations | `app/theme.css` |
| Homepage story (3D ribbon, stations) | `components/home/story/` (`HomeStory.tsx`, `scene.ts`, `earpiece.ts`, `ledGlow.ts`, `Station.tsx`, `DigitalMock.tsx`, `words.ts`) |
| Physical page (P2P / P2E story) | `components/product/ModeStory.tsx`, `app/physical-version/page.tsx` |
| Digital page (opening laptop) | `components/product/LaptopStory.tsx`, `app/digital-version/page.tsx` |
| Waitlist wall | `components/waitlist/WaitlistWall.tsx`, `app/waitlist/page.tsx` |
| Gift CTA (closing section on every page) | `components/home/WaitlistGift.tsx` |
| FAQ lens, reviews loop | `components/home/FaqLens.tsx`, `components/home/ReviewsLoop.tsx` |
| Public name rule | `lib/publicName.ts`, `backend/lib/publicName.ts` |
| Model pipeline | `scripts/stl-to-glb.mjs`, `Voxlate_v9_Website/` |

---

## 14. Reference library (the owner's picks)

Look here for ideas, then translate them into this site's palette, type and motion rules; never paste a
look in as-is.

| Need | Sources |
| --- | --- |
| Components | 21st.dev, Origin UI (originkit), Spell UI |
| Text animation | Kawaii, Kinetics, Animation Dictionary |
| Fonts | Fontshare, Fonts In Use, Fontesk |
| 3D and scroll | Scrolltide, Getlayers, Motionsites |
| Colour | Pinterest, Coolors |
| Sections and details | Unsection, details.so, Supahero |
| Backgrounds | background.supply, Gradient Lab, Super Visuals |
| General inspiration | Pinterest, Awwwards, curated.design |
| Sound | Bencho, UIFSX |
