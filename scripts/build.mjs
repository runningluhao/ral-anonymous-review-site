import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("source", "dist", { recursive: true });
await cp("public", "dist", { recursive: true });
const videoData = JSON.parse(await readFile("public/data/videos.json", "utf8"));
await writeFile(
  "dist/data/videos.js",
  `window.VIDEO_DATA = ${JSON.stringify(videoData, null, 2)};\n`,
  "utf8"
);
console.log("Built anonymous review site in dist/");
