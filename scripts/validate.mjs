import { access, readFile, stat } from "node:fs/promises";

const manifest = JSON.parse(await readFile("public/data/videos.json", "utf8"));
if (manifest.length !== 75) throw new Error(`Expected 75 videos, found ${manifest.length}`);
const ids = new Set();
for (const video of manifest) {
  if (ids.has(video.id)) throw new Error(`Duplicate video ID: ${video.id}`);
  ids.add(video.id);
  for (const field of ["src", "poster"]) {
    if (!video[field]) throw new Error(`${video.id} has no ${field}`);
    const path = `public/videos/${video[field]}`;
    await access(path);
    if ((await stat(path)).size === 0) throw new Error(`${path} is empty`);
  }
}
console.log(`Validated ${manifest.length} videos and ${manifest.length} posters.`);
