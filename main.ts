// Spotlight entry for the @crisxai5 bounty on make.fun (Node 22, stdlib only).
//
// The entry itself is the X post: an agent-made spotlight card introducing
// @crisxai5 as a must-follow AI & crypto voice, posted from a public X
// account with the mention, the profile link, hashtags and one of the
// entrant's makefun- play codes in the post text. This program does the one
// mechanical job the grader needs: it carries POST.json, which names that
// post's address, from the repository into /output/POST.json, where the
// house gate reads it. Nothing written here is scored; the house reads the
// post's likes, reposts and quotes from X itself.
//
// Local dry run (mirrors the grader's paths):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// On success it prints nothing and out/POST.json is byte-identical to POST.json.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const source = join(BOT_DIR, 'POST.json');
const target = join(OUTPUT_DIR, 'POST.json');

// Fail loudly instead of shipping a malformed pointer: the gate refuses an
// entry whose POST.json does not parse, so a bad file must never copy silently.
const raw = readFileSync(source, 'utf8');
const parsed = JSON.parse(raw) as unknown;
if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
  throw new Error('POST.json must be a JSON object like {"url": "https://x.com/<handle>/status/<id>"}');
}
if (typeof (parsed as { url?: unknown }).url !== 'string') {
  throw new Error('POST.json must carry a string "url" field naming the X post');
}
const postUrl = (parsed as { url: string }).url;
// Second gate: the address must at least point at an X status page. The
// placeholder shipped in POST.json ("https://x.com/<handle>/status/<id>")
// passes this shape check on purpose so the repo runs before the post
// exists; the house gate, not this program, verifies the post is real,
// public, in-window and carries the mention plus a play code.
if (!/^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/.+\/status\/[^/?#]+/.test(postUrl)) {
  throw new Error(`POST.json url does not look like an X post address: ${postUrl}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(source, target);
