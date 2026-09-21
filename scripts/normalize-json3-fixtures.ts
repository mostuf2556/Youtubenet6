import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { normalizeJson3Tracks } from '../src/utils/captionParser';

const videoId = 'L2Ryrr6txwA';
const sourceDir = join(process.cwd(), 'test', 'fixtures', videoId);
const outputDir = join(process.cwd(), 'test', 'fixtures', `${videoId}_normalized`);
const languages = ['ar', 'en', 'he', 'it', 'ru'];

const rawTracks = Object.fromEntries(
  await Promise.all(languages.map(async (language) => [language, await readFile(join(sourceDir, `${language}.json`), 'utf8')]))
);
const normalized = normalizeJson3Tracks(rawTracks, 'en', videoId);

await mkdir(outputDir, { recursive: true });
await Promise.all(
  Object.entries(normalized).map(([language, artifact]) =>
    writeFile(join(outputDir, `${language}.json`), `${JSON.stringify(artifact, null, 2)}\n`, 'utf8')
  )
);

console.log(`Wrote ${Object.keys(normalized).length} normalized JSON3 tracks to ${outputDir}`);