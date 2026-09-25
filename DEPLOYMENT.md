# Monster Mash on GitHub Pages

## Destination and status

- Owner: **Almatter**. Intended separate repository: [Almatter/monster-mash](https://github.com/Almatter/monster-mash). The account-root character-builder repository is out of scope and must not be changed.
- Production branch: `main`. Publish source: **GitHub Actions**. Build: `npm ci --ignore-scripts`, then `npm run build` (Node 24). Artifact: `dist/` only.
- Permanent beta/final URL: [https://Almatter.github.io/monster-mash/](https://Almatter.github.io/monster-mash/). Direct verifier: [https://Almatter.github.io/monster-mash/verify/](https://Almatter.github.io/monster-mash/verify/).
- **Live since 2026-09-25:** the separate public `Almatter/monster-mash` repository is connected as `origin`, Pages uses GitHub Actions, and the production URL and direct verifier return 200. The first hosted browser pass covered all five champions, palettes, gameplay, run verification, project-only PWA scope and mobile landscape. A second changed-icon deployment exposed a CDN propagation edge case: a newly activated worker could cache the previous icon. The corrected online-refresh worker passed a third real deployment test: an already-open browser switched from `monster-mash-static-70aba059e7949ae5` to `monster-mash-static-b2e3949f5e5ab3b4`, fetched the changed icon, and reopened the menu and direct verifier offline. A normal-profile Chromium installability check reported no errors. The account-root URL returned GitHub's 404 page when checked; no account-root repository or Pages setting was changed.

## First deployment

For a new machine, the account owner signs into GitHub CLI once with `gh auth login --hostname github.com --web --git-protocol https` as **Almatter**. After that, check `gh auth status` and `gh api user --jq .login`; the latter must return `Almatter`. Check `gh repo view Almatter/monster-mash` before creation. If it already exists, inspect its history and purpose and do not force-push or overwrite unknown work. Otherwise create a new **public, empty** `Almatter/monster-mash` repository without an initial README or license. GitHub Free supports Pages in public repositories.

Rename the local production branch to `main` if safe, add only `https://github.com/Almatter/monster-mash.git` as `origin`, verify `git remote -v`, then push `main` normally. Do not add the character-builder repository as a remote. Configure the new repository's **Settings → Pages → Build and deployment → Source → GitHub Actions**. GitHub's [publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow) show this setting. With authenticated tooling it can instead be set via the [Pages REST API](https://docs.github.com/en/rest/pages/pages) with `build_type: workflow`. The committed `.github/workflows/deploy-pages.yml` builds on pushes to `main` or manual dispatch, checks the artifact, uploads only `dist/`, and deploys with the supported Pages actions. Wait for the `github-pages` deployment to succeed before sharing the URL.

## Production contents and size (local measurement)

The full local project folder at the pre-deployment measurement, including `.git`, source art, tests and generated `dist`, was **258,641,171 bytes (246.7 MiB)**. The clean production `dist/` is **23,302,971 bytes (22.2 MiB)** across 154 files. A fresh Edge visit to `/monster-mash/` fetched about **2,374,480 bytes (2.26 MiB)** across 60 unique resources on the initial menu; this is an uncompressed local estimate and CDN transfer sizes may differ. The five champion art groups are lazy-loaded, totaling **22,213,548 bytes (21.2 MiB)**; Devourer is 3.09 MB, Sovereign 3.39 MB, Calamity 3.89 MB, Titan 5.53 MB and Overlord 6.31 MB (decimal units). The rest of the asset directory is about 0.91 MB. Generated music uses Web Audio and adds no downloaded music master.

Ten largest deployed files, in bytes:

| File under `dist/` | Bytes |
|---|---:|
| `assets/monsters/overlord/gameplay-base.webp` | 969,066 |
| `assets/monsters/overlord/selection-base.webp` | 944,172 |
| `assets/monsters/titan/gameplay-base.webp` | 726,998 |
| `assets/monsters/titan/selection-base.webp` | 724,648 |
| `assets/monsters/sovereign/selection-base.webp` | 720,304 |
| `assets/monsters/calamity/selection-base.webp` | 710,846 |
| `assets/monsters/calamity/gameplay-base.webp` | 654,190 |
| `assets/monsters/overlord/gameplay-secondary.webp` | 539,096 |
| `assets/monsters/sovereign/gameplay-base.webp` | 534,842 |
| `assets/monsters/overlord/selection-secondary.webp` | 530,298 |

`tools/build.mjs` starts with a clean `dist/` and omits development labs/scripts, original art sources, tests, documentation, dependencies and Netlify-only headers. `tools/check-pages-build.mjs` enforces the key artifact boundaries. Source repository contents are separate from the Pages artifact.

## Paths, PWA and updates

There is no Vite dependency or base setting. Every HTML/module/CSS/art/audio URL used by the game is relative to its project page. The manifest's `start_url`, `scope`, and icon use `./`. `src/main.ts` registers `./sw.js` with scope `./`, which resolves to `/monster-mash/` at the Pages URL. The worker also declines requests outside its registration scope, so it cannot control or cache the account-root character-builder site. The verifier is a real `dist/verify/index.html`, with no rewrite needed. `verify.html` remains a historical link.

The build hashes shipped runtime content into `monster-mash-static-<hash>` and replaces the build ID in `src/config.js`. The worker precaches the shell, verifier and JavaScript; art is cached lazily. Scoped requests revalidate online and refresh their cached copy, with the cached response used when the network is unavailable. On a return visit, service-worker registration checks for updates; visible tabs check again on return. A waiting worker activates on the menu, while an active run finishes before reloading. Activation deletes old versioned caches. GitHub Pages does not honor custom `_headers`, so cache correctness relies on the changed worker bytes, registration `updateViaCache: none`, online revalidation, offline cache fallback, and versioned caches. Local project-path tests cover offline reload and a simulated new-asset deployment. The real hosted changed-asset/reopen test passed after the online-refresh correction. Repeat it if the worker strategy changes.

## Beta, verifier and updates

`src/config.ts` has `IS_BETA_BUILD=true`. It shows a small BETA BUILD label and optional copyable debug details, and the build adds `noindex,nofollow` HTML metadata. Flip the flag to `false`, commit and push `main` to launch at the **same URL**. A project-subpath `robots.txt` is included but cannot govern the whole account domain; the page metadata is the relevant indexing directive. There is no password, account, backend, database or automatic debug transmission.

`src/data.ts` holds `EVENT.rules`; bump it when gameplay/scoring rules change. MM3 run codes include rules and build IDs plus a lightweight digest. The static `/monster-mash/verify/` page checks the digest and plausibility and reads older MM1/MM2 codes. It is not an anti-cheat authority.

For updates, commit changes and push `main`; the workflow rebuilds and deploys the same site. Check the workflow run, menu, direct verifier, desktop/mobile art and audio, existing PWA offline reopen, and return visits after an asset change. To roll back, revert the bad commit on `main` and push the revert, or use `git revert <commit>`; this preserves history and triggers the same workflow. Do not force-push. Verify the older build and service-worker cache activation after rollback.

## Local verification

Run `node tools/build.mjs`, `node tools/check-pages-build.mjs`, and `node --test tests/*.test.mjs`. `node tools/serve.mjs` serves both `/` and the production-like `http://127.0.0.1:4173/monster-mash/` and its direct `verify/` route. With Playwright and Edge/Chromium paths set, run `node tests/pages-subpath-browser.mjs` and `BASE_PATH=/monster-mash/ node tests/sw-update-browser.mjs`. `node tools/measure-initial-pages.mjs` measures a fresh local menu download. The hosted tests passed on 2026-09-25. Re-run `SITE_ORIGIN=https://almatter.github.io node tests/pages-subpath-browser.mjs` and `SITE_ORIGIN=https://almatter.github.io node tests/pages-installability-browser.mjs` after major releases. `tests/pages-live-update-browser.mjs` holds an old hosted tab while a changed asset is deployed, then checks cache replacement and offline reload.
