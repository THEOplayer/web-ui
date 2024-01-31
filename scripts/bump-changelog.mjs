import { readFileSync, writeFileSync } from 'node:fs';

const changelogPath = 'CHANGELOG.md';
const { version } = JSON.parse(readFileSync('package.json', 'utf-8'));

const now = new Date();
const year = String(now.getUTCFullYear());
const month = String(now.getUTCMonth() + 1).padStart(2, '0');
const day = String(now.getUTCDate()).padStart(2, '0');

let changelog = readFileSync(changelogPath, 'utf-8');
changelog = changelog.replace(/## Unreleased/, `## v${version} (${year}-${month}-${day})`);
writeFileSync(changelogPath, changelog, 'utf-8');
