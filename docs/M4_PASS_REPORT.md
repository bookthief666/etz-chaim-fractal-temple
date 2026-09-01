# M4 Pass Report — Ritual / Study Integration

## Scope

M4 does not add another generic visual layer. It deepens the accepted M3B instrument through three separate experience modes and a provenance-bearing documentary layer while preserving the Tree, recursive realms, path metamorphosis, Kether resilience, and Fold performance constraints.

## 1. Three experience modes

### Pure Vision

- tapping a Sephirah enters it directly;
- study/path-selection furniture is withheld;
- active-realm title furniture is suppressed;
- return and mode controls remain faint but reachable;
- no documentary claims are required to render a realm.

### Study

- retains the full Sephirah and path folios;
- adds locator-bearing provenance for Hermetic claims;
- adds an optional `Dossier` drawer while inside a realm or path;
- keeps `Core` and `777` as independent documentary-display choices.

### Contemplation

- uses a small threshold card before entry;
- stage changes surface brief original contemplative phrases;
- phrases fade automatically and never claim to be historical quotations;
- visual geometry remains dominant.

The selected experience mode is persisted when browser storage is available, with a safe fallback when storage is blocked.

## 2. Documentary provenance lock

`src/data/sources.js` is now the registry for documentary witnesses. Historical/reception claims resolve through source IDs and explicit locators instead of a generic source-note paragraph.

Current primary-witness anchors:

- Crowley, *Liber 777 Revised*, Table I, cols. I–VII, key scales 1–10;
- Crowley, *Liber 777 Revised*, Table IV, cols. XCIX–CI, rows 1–10;
- Crowley, *Liber LVIII — Qabalah*, pagination marker {79}, retained for the Yesod/Malkuth angelic-order variant;
- *Liber 777 Revised*, key scale 22 for Lamed / Libra / path 5–6 / Justice;
- *Liber 777 Revised*, key scale 32 for Tau/Tav / Saturn / path 9–10 / The Universe.

The 777-specific Malkuth God-name is source-locked as **Adonai Melekh**. `Adonai ha-Aretz` belongs to a different 777 attribution context (Earth / 32-bis) and is therefore not silently substituted into the Table-I Sephirah record.

## 3. Historical path overlays remain separate from path mathematics

The two operative M3B paths now have documentary records:

- Geburah–Tiphareth: key 22 · Lamed · Libra · Justice;
- Yesod–Malkuth: key 32 · Tau/Tav · Saturn · The Universe.

These records do **not** drive the shader.

The five→six harmonization and phase→crystal condensation remain interpretive mathematical laws in `pathOperators.js` / `pathMetamorphosis.js`.

## 4. Restrained contemplative language

`ritualContent.js` contains original instrument text for:

- 10 realm thresholds;
- 40 realm depth-stage cues;
- two reversible four-stage path rites.

Every phrase is explicitly classified as original contemplative language, not a historical quotation.

## 5. Active study drawer

Study mode can reopen a compact dossier while the user remains inside a realm or path. It shows only the current material needed for orientation:

- active recursive stage;
- current contemplative line;
- mathematical law;
- optional 777 documentary overlay;
- provenance ledger.

The drawer is opt-in and closed by default.

## 6. Preserved invariants

M4 does not alter:

- 10-node / 22-edge topology;
- the ten distinct realm shader kinds;
- recursive depth epoch mechanics;
- M3B path shaders;
- canonical ray origin;
- camera-locked low-overhead ray boxes;
- adaptive Fold quality;
- WebGL context recovery;
- XR tracked-camera invariant;
- deterministic source policy.

## Verification performed in the artifact environment

- project static audit: PASS;
- 35 JS/JSX source modules parsed with TypeScript JSX parser: PASS;
- provenance registry validation: PASS;
- 10/10 Sephirah provenance records: PASS;
- operative path documentary overlays: PASS;
- 10/10 realm contemplation records: PASS;
- 2/2 reversible path contemplation records: PASS;
- topology/documentary/shader separation assertions: PASS.

Actual Vite bundling and mobile WebGL driver acceptance remain authoritative on the Fold because this artifact environment does not contain the project's installed dependency tree.
