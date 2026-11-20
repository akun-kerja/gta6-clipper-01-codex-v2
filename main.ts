import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
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

  const content = readFileSync(sourceFile, 'utf8');
  let video: unknown;
  try {
    video = JSON.parse(content);
  } catch {
    throw new Error('VIDEO.json does not contain valid JSON');
  }
  if (typeof video !== 'object' || video === null || !('url' in video)) {
    throw new Error('VIDEO.json must contain a url field');
  }
  const videoUrl = (video as { url: unknown }).url;
  if (typeof videoUrl !== 'string') throw new Error('VIDEO.json url must be a string');
  if (!videoUrl.startsWith('https://www.youtube.com/') && !videoUrl.startsWith('https://youtu.be/')) {
    throw new Error('VIDEO.json url must start with https://www.youtube.com/ or https://youtu.be/');
  }
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(videoUrl);
  } catch {
    throw new Error('VIDEO.json url is not a well-formed URL');
  }
  if (
    parsedUrl.protocol !== 'https:' ||
    !['www.youtube.com', 'youtu.be'].includes(parsedUrl.hostname) ||
    parsedUrl.pathname.length < 2 ||
    parsedUrl.username !== '' ||
    parsedUrl.password !== ''
  ) {
    throw new Error('VIDEO.json url must be a YouTube URL');
  }

  mkdirSync(outputRoot, { recursive: true });
  copyFileSync(sourceFile, outputFile);
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`Unable to publish the video address: ${detail}`);
  process.exitCode = 1;
}
