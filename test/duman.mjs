// Duman testi: sayfa açılıyor mu, konsol hatası var mı, oyun başlıyor mu, bir etkileşim durumu değiştiriyor mu,
// telefon görünümünde taşma var mı. Hiçbir bağımlılık depoya eklenmez.
//
// Kullanım:  node test/duman.mjs [klasör]        (klasör verilmezse deponun kökü)
// Gerekli:   `playwright-core` (depo dışında kurulu olabilir: PW_MODULE=<node_modules'ın bulunduğu klasör>)
//            ve bir Chromium tabanlı tarayıcı: CHROMIUM=<tarayıcı exe yolu> (verilmezse Playwright'ın kendi tarayıcısı).
// Çıktı: "ok" / "n/a" / "FAIL" satırları, en sonda RESULT; hata varsa çıkış kodu 1.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.argv[2] || join(here, '..'));
const req = createRequire(process.env.PW_MODULE ? pathToFileURL(join(process.env.PW_MODULE, 'x.js')) : import.meta.url);
const { chromium } = req('playwright-core');
const IGNORED = /gc\.zgo\.at|goatcounter|fonts\.googleapis\.com|fonts\.gstatic\.com/;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.glb': 'model/gltf-binary' };
let failed = false;
const ok = (m) => console.log('ok   ' + m);
const fail = (m) => { failed = true; console.log('FAIL ' + m); };
const check = (c, m) => (c ? ok(m) : fail(m));

const srv = createServer((rq, rs) => {
  const p = normalize(decodeURIComponent(new URL(rq.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  let f = join(root, p || 'index.html');
  if (!f.startsWith(root)) { rs.writeHead(403).end(); return; }
  if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
  if (!existsSync(f)) { rs.writeHead(404, { 'content-type': 'text/plain' }).end('404'); return; }
  rs.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' }).end(readFileSync(f));
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = 'http://127.0.0.1:' + srv.address().port + '/';
console.log('hedef: ' + root);

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const attach = (page, errs) => {
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  page.on('requestfailed', (r) => { if (!IGNORED.test(r.url())) errs.push('requestfailed: ' + r.url()); });
  page.on('response', (r) => { if (r.status() >= 400 && !IGNORED.test(r.url())) errs.push(r.status() + ' ' + r.url()); });
};
const ready = (page) => page.waitForFunction(() => { const b = document.getElementById('b-play'); return b && !b.disabled; }, null, { timeout: 120000 });
try {
  for (const [name, vp, mobile] of [['masaustu 1366x768', { width: 1366, height: 768 }, false], ['telefon 390x844', { width: 390, height: 844 }, true]]) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile });
    await ctx.route(IGNORED, (r) => r.fulfill({ status: 200, body: '' }));
    const page = await ctx.newPage();
    const errs = [];
    attach(page, errs);
    await page.goto(base + '?low', { waitUntil: 'load' });
    await ready(page);
    check(true, `[${name}] sayfa açıldı, "Oyna" düğmesi etkin`);
    const title = await page.title();
    check(/Mehter/.test(title), `[${name}] başlık: ${title}`);
    const over = await page.evaluate(() => {
      const w = innerWidth, bad = [];
      for (const e of document.querySelectorAll('#scr-title button, #scr-title a')) { const r = e.getBoundingClientRect(); if (r.width && (r.left < -1 || r.right > w + 1)) bad.push(e.id || e.textContent); }
      return { h: document.documentElement.scrollWidth > w + 1, bad };
    });
    check(!over.h && !over.bad.length, `[${name}] başlık ekranında yatay taşma yok ${over.bad.join(',')}`);
    const href = await page.getAttribute('#scr-title .foot a', 'href');
    check(href === 'https://furkiozknn.github.io/', `[${name}] alt bağlantı oyunlar sayfasına gidiyor (${href})`);
    // Yenilikler penceresi (yalnız yeni sürümde var)
    if (await page.$('#b-news')) {
      await page.click('#b-news');
      const shown = await page.evaluate(() => !document.getElementById('scr-news').classList.contains('hidden') && document.querySelectorAll('#news-list li').length >= 3);
      check(shown, `[${name}] Yenilikler penceresi açılıyor ve maddeleri var`);
      const fit = await page.evaluate(() => { const r = document.querySelector('#scr-news .panel').getBoundingClientRect(); return r.left >= -1 && r.right <= innerWidth + 1 && document.documentElement.scrollWidth <= innerWidth + 1; });
      check(fit, `[${name}] Yenilikler kartı ekrana sığıyor`);
      await page.keyboard.press('Escape');
      check(await page.evaluate(() => document.getElementById('scr-news').classList.contains('hidden')), `[${name}] Esc ile kapanıyor`);
    } else console.log(`n/a  [${name}] Yenilikler penceresi bu sürümde yok`);
    // oyun başlıyor, bir etkileşim durumu değiştiriyor
    await page.click('#b-play');
    await page.click('#b-sel-start');
    await page.waitForFunction(() => window.mehter && window.mehter.screen === 'play', null, { timeout: 30000 });
    ok(`[${name}] oyun başladı (ekran: play)`);
    await page.keyboard.press('KeyP');
    check(await page.evaluate(() => window.mehter.screen === 'pause'), `[${name}] P ile duraklatma çalışıyor`);
    await page.click('#b-resume');
    check(await page.evaluate(() => window.mehter.screen === 'play'), `[${name}] Devam ile oyuna dönülüyor`);
    check(errs.length === 0, `[${name}] konsol/sayfa/ağ hatası yok` + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
    await ctx.close();
  }
  // sanal saatli oyun: girdisiz biter (ruh tükenir), sonuç ekranı gelir; yeni sürümde geçmişe yazılır
  {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    await ctx.route(IGNORED, (r) => r.fulfill({ status: 200, body: '' }));
    const page = await ctx.newPage();
    const errs = [];
    attach(page, errs);
    await page.goto(base + '?sim=0&low', { waitUntil: 'load' });
    await ready(page);
    const r = await page.evaluate(() => { const G = window.mehter; for (let i = 0; i < 200 && G.screen === 'play'; i++) window.mehterSim(5); return { screen: G.screen, defeat: G.result && G.result.defeat, hist: localStorage.getItem('arena.mehter.history') }; });
    check(r.screen === 'results' && r.defeat === true, `girdisiz oyun sonuç ekranına geldi (ekran ${r.screen}, yenilgi ${r.defeat})`);
    if (r.hist !== null) { const h = JSON.parse(r.hist); check(Array.isArray(h) && h.length === 1 && h[0].defeat === true, 'son marşlar kaydına yazıldı (' + r.hist.slice(0, 60) + ')'); } else console.log('n/a  son marşlar kaydı bu sürümde yok');
    check(errs.length === 0, 'sanal koşuda konsol/sayfa/ağ hatası yok' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
    await ctx.close();
  }
  // bot: vuruşları yapar, puan artar, geçmişe yazılmaz
  {
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    await ctx.route(IGNORED, (r) => r.fulfill({ status: 200, body: '' }));
    const page = await ctx.newPage();
    const errs = [];
    attach(page, errs);
    await page.goto(base + '?auto&low&sim=0', { waitUntil: 'load' });
    await ready(page);
    const r = await page.evaluate(() => { const G = window.mehter; for (let i = 0; i < 200 && G.screen === 'play'; i++) window.mehterSim(5); return { screen: G.screen, score: Math.round(G.score), perfect: G.cnt.perfect, defeat: G.result && G.result.defeat, errors: G.errors.length, hist: localStorage.getItem('arena.mehter.history') }; });
    check(r.screen === 'results' && r.defeat === false && r.score > 0 && r.perfect > 0, `bot şarkıyı bitirdi: skor ${r.score}, mükemmel ${r.perfect}`);
    check(r.errors === 0 && errs.length === 0, 'bot koşusunda oyun içi hata yok' + (errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''));
    check(r.hist === null, 'bot koşusu geçmişe yazmadı');
    await ctx.close();
  }
} catch (e) { fail('beklenmeyen: ' + (e && e.message)); }
await browser.close();
srv.close();
console.log(failed ? 'RESULT FAIL' : 'RESULT OK');
process.exit(failed ? 1 : 0);
