import { copyFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// The make.fun runner mounts this repository at /bot and reads the submitted
// video address from /output/VIDEO.json.
const sourceRoot = process.env.MAKEFUN_BOT_DIR || '/bot';
const outputRoot = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const sourceFile = join(sourceRoot, 'VIDEO.json');
const outputFile = join(outputRoot, 'VIDEO.json');

try {
  const metadata = statSync(sourceFile);
  if (!metadata.isFile()) throw new Error('VIDEO.json is not a regular file');
  mkdirSync(outputRoot, { recursive: true });
  copyFileSync(sourceFile, outputFile);
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`Unable to publish the video address: ${detail}`);
  process.exitCode = 1;
}
