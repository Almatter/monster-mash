import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {Crucible} from '../src/crucible-sim.ts';
import {createIdentity} from '../src/identity.ts';
import {crucibleRun} from '../src/crucible-progress.ts';
import {encodeRun} from '../src/run-code.ts';
import {crucibleGrade} from '../src/crucible-grade.ts';
const g=new Crucible(17);g.time=600;g.winner=0;Object.assign(g.teams[0],{troopKills:1000,kills:6,guardianKills:10,crystalKills:5});Object.assign(g.teams[0].upgrades,{might:5,haste:5,vitality:5,armor:1});g.teams[0].augments=['bastion','brawler'];const run=crucibleRun(g,0,createIdentity({monsterId:g.teams[0].monster}),false,'cleared');run.build='0123456789abcdef';const expected=crucibleGrade(run.crucible),code=await encodeRun(run);assert.equal(expected.letter,'S');
const {chromium}=await import(pathToFileURL('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href),browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/verify/');await page.locator('#code').fill(code);await page.locator('#verify').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('VALID MONSTER'));assert.match(await page.locator('#output').innerText(),/PERFORMANCE GRADE\s+S.*100.0 \/ 100 performance points/s);assert.deepEqual(errors,[]);console.log(JSON.stringify({grade:expected.letter,points:expected.points,grace:expected.grace,authenticatedVerifier:true,errors}));await context.close();}finally{await browser.close();}
