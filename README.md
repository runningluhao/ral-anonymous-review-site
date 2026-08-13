# Anonymous Review Supplementary Website

This repository contains a standalone supplementary website prepared for
double-anonymous peer review. It presents the real-world experiment video
gallery accompanying the paper.

## Local build

Requires Node.js 18 or later and Python 3 for the preview server.

```bash
npm run validate
npm run build
npm run preview
```

Open `http://localhost:8000/`. All site URLs are relative so the generated
`dist/` directory also works when deployed below a GitHub Pages repository path.
