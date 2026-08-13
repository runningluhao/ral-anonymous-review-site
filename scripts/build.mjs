import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("source", "dist", { recursive: true });
await cp("public", "dist", { recursive: true });
console.log("Built anonymous review site in dist/");
