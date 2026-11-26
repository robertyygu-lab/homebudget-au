// HomeBudget AU — the hand-in program (Node 22, standard library only).
//
// It takes this repository's app/ and screenshots/ and lays them out in the
// output directory, then writes /output/dossier.json with buildDossier from
// the vendored make.fun library. The library's copy in vendor/ must stay
// byte-for-byte as the kit shipped it: the scorer rebuilds the dossier with
// its own copy and compares the two.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(outputDir, 'screenshots');
mkdirSync(shotsDir, { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), shotsDir, { recursive: true });
}

// Caps the scorer enforces: the dossier text is capped at 160 KiB, at most
// four screenshots of 256 KiB each, and app/ holds at most 993 files and
// directories totalling 16 MiB. buildDossier refuses anything past them.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
