# Monster Mash static deployment

## Platform and current status

**Chosen host: Netlify static hosting.** Its production URL can serve the beta and public launch on the same site; HTTPS and later custom domains are supported. Netlify can publish a manually uploaded `dist` folder now and [link a repository to that same site later](https://docs.netlify.com/configure-builds/repo-permissions-linking/). Successful deployments are atomic and prior production deploys can be republished for rollback. Visitors need no account, installation, password or backend. The game stores identity and cosmetic records locally in each browser.

**Public URL: pending initial Netlify site creation.** This workspace has no Git remote, Netlify token, CLI login, or linked site. Do not share a `127.0.0.1` address as a moderator URL. An [anonymous Netlify deploy expires unless claimed within one hour](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/), so it is unsuitable as the permanent game home.

## Initial production site — one manual action

1. From this project folder, run `node tools/build.mjs`. Node 24 is required; `netlify.toml` sets that version for later Git builds. The publish folder is `dist/` and contains HTML, JavaScript, assets, manifest, service worker, `_headers`, and `robots.txt` only. There are no functions or database migrations.
2. Sign in at [Netlify](https://app.netlify.com/). Choose **Add new project → Deploy manually**. Drag the entire **dist folder** to the upload area. Use a project/site name you intend to keep. The production URL Netlify gives that site, `https://<actual-site-name>.netlify.app/`, is the beta URL and remains the final release URL.
3. Open that actual HTTPS URL in desktop and mobile browsers. Confirm play, results, offline PWA reopen, and a direct visit to `https://<actual-site-name>.netlify.app/verify/`. Record the actual site URL here after creation. Send the site URL (or Site ID and access) back to the developer so hosted update tests can be completed.

[Netlify manual deploy guide](https://docs.netlify.com/manage/projects/add-new-project/) describes the current UI. No anonymous visitor login is enabled.

## Redeploy and Git integration

For manual updates, run `node tools/build.mjs` and upload the new `dist/` folder to **that same Netlify site's Deploys page**. Publish it as production; never create a second site for launch. A local shell with a Netlify login can instead use `netlify link` once, then `netlify deploy --prod --dir=dist` from the project folder. Avoid printing login tokens or putting them in Git.

For automatic updates later, push this repository to a GitHub/GitLab remote, then use **Project configuration → Build & deploy → Continuous deployment → Repository → Link repository** on the existing Netlify site. Production build command: `node tools/build.mjs`; publish directory: `dist`; Node version: `24`. A push to the selected production branch then redeploys the same URL. The local repository currently has no remote; choose the owner's repository rather than inventing one.

To roll back, open the site's **Deploys** list and **Publish Deploy** on a previous successful deploy. Check the menu and `/verify/` after rollback. A later Git push will publish newer code again if automatic builds are enabled. See [Netlify rollback guidance](https://docs.netlify.com/deploy/manage-deploys/manage-deploys-overview/).

## Beta flag, indexing and rules

`src/config.ts` contains `IS_BETA_BUILD=true`. It shows a small **BETA BUILD** label on the menu, results and saved card and enables the local **COPY DEBUG INFO** button. That button copies build hash, ruleset, browser, viewport, graphics mode and champion only when pressed; it transmits nothing. `tools/build.mjs` writes `X-Robots-Tag: noindex, nofollow`, HTML meta robots and `robots.txt` disallow during beta. Search directives discourage indexing but are not a password. For public launch, change the flag to `false`, rebuild and redeploy the same site. The build removes the beta label/indexing restrictions. Testers continue to use the same production URL.

Gameplay rules are `EVENT.rules` in `src/data.ts`. Change that string whenever scoring/balance rules change, then build and redeploy. The build embeds a 16-hex build ID into `src/config.js` and the service-worker cache name. MM3 run codes carry both IDs. `/verify/` highlights current vs historical rulesets; it does not replay a match or prevent forged codes. Older MM1/MM2 codes remain readable.

## Cache, offline and direct routes

`verify/index.html` makes `/verify/` a true static route with no server rewrite. `verify.html` remains for older links. `manifest.webmanifest` scopes the PWA to the site root. Netlify issues HTTPS for its site URL; a later custom domain can be attached in the same site's **Domain management → Add a domain** without moving the deployment. Follow the site's DNS prompts; Netlify can provision HTTPS for the custom domain. The original `.netlify.app` URL remains available.

The build hashes shipped source/assets into `dist/sw.js`'s `monster-mash-static-<hash>` cache. `/sw.js` is served with no-store/no-cache headers; pages are revalidated. The service worker precaches the shell, verifier and modules; art/audio cache lazily. On a new deployment, the game checks for a service-worker update. It activates while the menu is safe and defers an in-run reload until results/back-to-menu. Activation removes obsolete caches. Visitors should not need to clear browser storage. Netlify also invalidates changed static files at deployment. Local `tests/sw-update-browser.mjs` simulates old-to-new cache activation and offline reload; a hosted redeploy/reopen test remains required after the first URL exists.

## Reproducible checks

- `node tools/build.mjs`
- `node --test tests/*.test.mjs`
- Browser tests need Playwright and Edge/Chromium paths as described in existing test scripts. Run `tests/beta-verification-browser.mjs`, `tests/champion-music-browser.mjs`, `tests/browser.mjs`, and `tests/sw-update-browser.mjs` against the local server.
- `node tools/serve.mjs` serves `dist/` at `http://127.0.0.1:4173/`, including direct `/verify/` navigation. Stop any prior process on that port first.
- After each hosted deploy, test normal and mobile browsers, an existing PWA installation, offline reopen, a new direct `/verify/` load, and a second deployment to confirm cache replacement.
