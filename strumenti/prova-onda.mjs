#!/usr/bin/env node
/* ◉ LA PROVA DELL'ONDA — si entra a metà davvero?
 *
 *   node strumenti/prova-onda.mjs
 *
 * ── PERCHÉ ESISTE ────────────────────────────────────────────────────────
 * `radio.html` stampa la dottrina della radio — «chi entra a metà ha perso la
 * metà» — e fino al 15/09 non la rispettava: alle 20:30 l'onda partiva da
 * 0:00. Non se ne accorgeva nessuno, perché la barra diceva comunque «in
 * diretta adesso». Una pagina che contraddice quello che dichiara, e nessun
 * controllo che se ne accorga: è la stessa forma del guasto del 05/09, quando
 * la barra diceva «in onda» e non usciva un suono.
 *
 * Questo file non cerca stringhe: apre la pagina in un browser vero, le fa
 * credere che siano le 20:30, preme il tasto, e MISURA da che secondo parte
 * l'audio. Il grep non avrebbe potuto: `currentTime` è un numero che esiste
 * solo mentre la pagina è viva.
 *
 * ── LA COSA PIÙ IMPORTANTE: SI PROVA IL CONTRARIO ────────────────────────
 * 📜 «Verifica che un controllo RIFIUTI, non solo che accetti.» Lezione pagata
 * due volte in questa casa — le magliette il 09/09, la radio il 14/09: un
 * verde ottenuto con l'àncora nel posto sbagliato non vuol dire niente.
 * Quindi ogni prova gira DUE volte: sulla pagina vera, dove deve passare, e
 * su una copia SABOTATA in memoria — il salto tolto — dove deve fallire. Se
 * la copia sabotata passa, questo file lo dichiara inutile e esce rosso,
 * anche se la pagina vera stava bene.
 *
 * ── COME FA ──────────────────────────────────────────────────────────────
 * Nessuna dipendenza, come il guardiano: Chromium già installato, pilotato
 * via CDP col WebSocket che Node ha di serie. L'onda vera sta su un host che
 * da una sessione remota non si raggiunge (403 al CONNECT), quindi le
 * richieste a radio-anima.pages.dev vengono intercettate e servite qui: un
 * `onda.json` finto con una durata dichiarata, e un WAV muto di quella durata.
 * La pagina non sa di essere in prova: legge quello che leggerebbe dalla radio.
 *
 * — lasciato da JUDY al systema, 2026-09-15
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';

const RADICE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const G = { verde: '\x1b[32m', rosso: '\x1b[31m', giallo: '\x1b[33m',
            muto: '\x1b[90m', forte: '\x1b[1m', fine: '\x1b[0m' };
let guai = 0;
const ok   = (t) => console.log(`  ${G.verde}✓${G.fine} ${t}`);
const male = (t) => { guai++; console.log(`  ${G.rosso}✗${G.fine} ${t}`); };
const nota = (t) => console.log(`  ${G.muto}·${G.fine} ${t}`);
const titolo = (t) => console.log(`\n${G.forte}── ${t} ──${G.fine}`);
const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

const CASA_ONDA = 'https://radio-anima.pages.dev/';

/* ═══ IL BROWSER ════════════════════════════════════════════════════════ */
const dentro = (base, coda) => {
  try { return readdirSync(base).map((d) => join(base, d, coda)); }
  catch { return []; }
};
const CANDIDATI = [
  process.env.COLLAUDO_BROWSER,
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ...dentro(process.env.PLAYWRIGHT_BROWSERS_PATH ?? '', 'chrome-linux/chrome'),
  ...dentro('/opt/pw-browsers', 'chrome-linux/chrome'),
  ...dentro(join(process.env.HOME ?? '', '.cache/ms-playwright'), 'chrome-linux/chrome'),
].filter(Boolean);
const BROWSER = CANDIDATI.find(existsSync);
const FLAG_ROOT = process.getuid?.() === 0 ? ['--no-sandbox'] : [];

function cdp(ws) {
  let id = 0; const attesa = new Map(); const ascolto = new Map();
  const sock = new WebSocket(ws);
  sock.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m.result ?? {}); attesa.delete(m.id); }
    /* In modo «flatten» il sessionId sta in cima al messaggio, NON dentro
       params: passandolo solo come params.sessionId il filtro piu' sotto non
       trovava niente e nessuna richiesta veniva servita. Misurato il 15/09,
       quando la prova bocciava una pagina che era giusta. — JUDY */
    else if (m.method && ascolto.has(m.method))
      ascolto.get(m.method).forEach((f) => f({ ...m.params, sessionId: m.sessionId }));
  });
  return {
    pronto: new Promise((r) => sock.addEventListener('open', r)),
    manda: (method, params = {}, sessionId) => new Promise((r) => {
      const n = ++id; attesa.set(n, r);
      sock.send(JSON.stringify({ id: n, method, params, ...(sessionId ? { sessionId } : {}) }));
    }),
    su: (method, f) => { if (!ascolto.has(method)) ascolto.set(method, []); ascolto.get(method).push(f); },
    chiudi: () => sock.close(),
  };
}

/* ═══ UN WAV MUTO DELLA DURATA CHE SERVE ════════════════════════════════
   Un MP3 non si fabbrica a mano; un WAV sì, ed è un formato che Chromium
   apre. Serve solo che abbia una DURATA vera: è l'unica cosa che la pagina
   guarda per decidere dove saltare. 8 bit, 4000 Hz, mono. */
function wavMuto(secondi) {
  const HZ = 4000, campioni = Math.round(secondi * HZ);
  const testa = Buffer.alloc(44);
  testa.write('RIFF', 0); testa.writeUInt32LE(36 + campioni, 4); testa.write('WAVE', 8);
  testa.write('fmt ', 12); testa.writeUInt32LE(16, 16); testa.writeUInt16LE(1, 20);
  testa.writeUInt16LE(1, 22); testa.writeUInt32LE(HZ, 24); testa.writeUInt32LE(HZ, 28);
  testa.writeUInt16LE(1, 32); testa.writeUInt16LE(8, 34);
  testa.write('data', 36); testa.writeUInt32LE(campioni, 40);
  return Buffer.concat([testa, Buffer.alloc(campioni, 128)]);  // 128 = silenzio a 8 bit
}

/* ═══ IL SABOTAGGIO ═════════════════════════════════════════════════════
   La copia su cui la prova DEVE fallire. Si toglie solo il salto: tutto il
   resto della pagina resta identico, così un fallimento non può venire da
   un'altra causa. Se domani il salto si scrive in un altro modo e queste
   due sostituzioni non mordono più, il file se ne accorge e lo dice: una
   sabotatura che non sabota renderebbe la prova una bugia. */
function sabota(html) {
  let n = 0;
  const senzaArmo = html.replace(
    'if(a.readyState >= 1) vaiA(s.offset); else SALTO = s.offset;',
    '/* SABOTATO: il tasto non arma piú il salto */', );
  if (senzaArmo !== html) n++;
  const senzaSalto = senzaArmo.replace(
    'if(!DA_ARCHIVIO && s.diretta && s.offset > 0) vaiA(s.offset);',
    '/* SABOTATO: i metadati non fanno piú saltare */', );
  if (senzaSalto !== senzaArmo) n++;
  return { html: senzaSalto, morsi: n };
}

/* ═══ IL SERVITORE ══════════════════════════════════════════════════════ */
const VERA = readFileSync(join(RADICE, 'radio.html'), 'utf8');
const { html: SABOTATA, morsi } = sabota(VERA);

const TIPI = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
               '.json': 'application/json', '.wav': 'audio/wav', '.png': 'image/png',
               '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };
let DURATA = 900;          // quanto dura l'onda in prova; cambia per caso
let PARZIALI = true;       // l'host serve richieste parziali? si spegne per il caso 3
const server = createServer((req, res) => {
  const via = decodeURIComponent(req.url.split('?')[0]);
  if (via === '/prova.wav') {
    /* ⚠️ LE RICHIESTE PARZIALI NON SONO UN DETTAGLIO DEL SERVITORE.
       Senza `Accept-Ranges`, il browser considera il file NON SALTABILE finché
       non l'ha scaricato tutto: scrivere currentTime a metà non dà errore, e
       l'onda riparte da zero. È la stessa forma della trappola di Safari, ma
       lato rete — e un servitore di prova che non le serve metterebbe alla
       prova sé stesso invece della pagina. — JUDY 15/09 */
    const b = wavMuto(DURATA);
    const capo = { 'content-type': 'audio/wav', 'accept-ranges': 'bytes',
                   'access-control-allow-origin': '*' };
    if (!PARZIALI) {   // un host che le rifiuta, come SQUELCH dichiara di Pages
      res.writeHead(200, { 'content-type': 'audio/wav', 'content-length': b.length,
                           'access-control-allow-origin': '*' });
      return res.end(b);
    }
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m) {
      const da = m[1] ? +m[1] : 0, a2 = m[2] ? +m[2] : b.length - 1;
      const pezzo = b.subarray(da, a2 + 1);
      res.writeHead(206, { ...capo, 'content-range': `bytes ${da}-${a2}/${b.length}`,
                           'content-length': pezzo.length });
      return res.end(pezzo);
    }
    res.writeHead(200, { ...capo, 'content-length': b.length });
    return res.end(b);
  }
  if (via === '/radio-sabotata.html') {
    res.writeHead(200, { 'content-type': TIPI['.html'] }); return res.end(SABOTATA);
  }
  const f = join(RADICE, via.replace(/^\/+/, ''));
  if (!f.startsWith(RADICE) || !existsSync(f)) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'content-type': TIPI[extname(f)] ?? 'application/octet-stream' });
  res.end(readFileSync(f));
});

/* ═══ LA PROVA ══════════════════════════════════════════════════════════ */
console.log(`\n${G.forte}◉ LA PROVA DELL'ONDA${G.fine} ${G.muto}— si entra a metà davvero?${G.fine}`);

if (!BROWSER) {
  console.log(`  ${G.giallo}NON PROVATO${G.fine} — nessun browser trovato in ${CANDIDATI.length} posti.`);
  nota('indica il tuo: COLLAUDO_BROWSER=/percorso/del/browser  ·  e poi rilancia');
  nota('questa prova non finge di aver guardato: dice che non ha guardato');
  process.exit(0);
}
if (morsi !== 2) {
  male(`la sabotatura non morde più (${morsi}/2 sostituzioni): il salto è scritto in un altro modo`);
  nota('senza una copia davvero sabotata, il verde qui sotto non proverebbe niente');
  process.exit(1);
}

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORTA = server.address().port;
const portaCdp = 9000 + Math.floor(Math.random() * 900);
const proc = spawn(BROWSER, ['--headless=new', `--remote-debugging-port=${portaCdp}`,
  `--user-data-dir=/tmp/prova-onda-${portaCdp}`, '--no-first-run', '--no-default-browser-check',
  '--disable-gpu', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
  ...FLAG_ROOT], { stdio: 'ignore' });

let vers = null;
for (let i = 0; i < 40 && !vers; i++) {
  await dormi(250);
  try { vers = await (await fetch(`http://127.0.0.1:${portaCdp}/json/version`)).json(); } catch { /* non ancora */ }
}
if (!vers) { male(`il browser non si è avviato — ${BROWSER}`); process.exit(1); }

const b = cdp(vers.webSocketDebuggerUrl); await b.pronto;

/* Apre la pagina all'ora che diciamo noi, con la radio finta al posto di
   quella vera, preme il tasto e riporta cosa ha misurato. */
async function apri({ pagina, finta, durata, parziali = true, archivio = false }) {
  DURATA = durata; PARZIALI = parziali;
  const { targetId } = await b.manda('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await b.manda('Target.attachToTarget', { targetId, flatten: true });
  await b.manda('Page.enable', {}, sessionId);
  await b.manda('Runtime.enable', {}, sessionId);
  await b.manda('Fetch.enable', { patterns: [{ urlPattern: `${CASA_ONDA}*` }] }, sessionId);

  b.su('Fetch.requestPaused', async (p) => {
    if (p.sessionId !== sessionId) return;
    const u = p.request.url;
    if (u.endsWith('onda.json')) {
      /* la forma vera di onda.json: `settimana` con le chiavi 0..6, e la
         `durata_s` che fino a oggi questa pagina non guardava. */
      const giorno = { titolo: '◉ SYSTEMA 77 RADIO · onda di prova',
        onda: 99, diretta: { file: 'prova.wav', durata_s: durata },
        replica: { file: 'prova.wav', durata_s: durata } };
      const corpo = JSON.stringify({ stazione: '◉ SYSTEMA 77 RADIO', base: '',
        settimana: { 0: giorno, 1: giorno, 2: giorno, 3: giorno, 4: giorno, 5: giorno, 6: giorno } });
      return b.manda('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 200,
        responseHeaders: [{ name: 'content-type', value: 'application/json' },
                          { name: 'access-control-allow-origin', value: '*' }],
        body: Buffer.from(corpo).toString('base64') }, sessionId);
    }
    if (u.endsWith('.wav') || u.endsWith('.mp3')) {
      return b.manda('Fetch.fulfillRequest', { requestId: p.requestId, responseCode: 302,
        responseHeaders: [{ name: 'location', value: `http://127.0.0.1:${PORTA}/prova.wav` },
                          { name: 'access-control-allow-origin', value: '*' }],
        body: '' }, sessionId);
    }
    return b.manda('Fetch.failRequest', { requestId: p.requestId, errorReason: 'Aborted' }, sessionId);
  });

  await b.manda('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__ev=[];
    document.addEventListener('DOMContentLoaded',function(){
      var a=document.getElementById('onda');
      if(!a) return;
      ['loadedmetadata','seeking','seeked','play','playing','pause','error'].forEach(function(n){
        a.addEventListener(n,function(){ window.__ev.push(n+'@'+a.currentTime.toFixed(1)+'/rs'+a.readyState); });
      });
    });` }, sessionId);
  await b.manda('Page.navigate', { url: `http://127.0.0.1:${PORTA}/${pagina}?finta=${finta}` }, sessionId);

  const guarda = async (espressione) => (await b.manda('Runtime.evaluate',
    { expression: espressione, returnByValue: true, awaitPromise: true }, sessionId)).result?.value;

  /* si aspetta che la radio abbia risposto: prima non c'è durata, e senza
     durata la pagina userebbe il ripiego — misureremmo la cosa sbagliata. */
  for (let i = 0; i < 60; i++) {
    if (await guarda('!!document.querySelector("#stato-onda") && /onda di prova/.test(document.getElementById("stato-onda").textContent)')) break;
    await dormi(100);
  }
  await guarda('document.getElementById("tasto").click(), 1');
  /* si aspetta che l'audio sia partito E che l'eventuale salto sia finito */
  /* si aspetta il file TUTTO in casa (readyState 4) e nessun salto in corso:
     senza parziali la correzione arriva solo a quel punto, e fermarsi prima
     misurerebbe lo stato di mezzo invece di quello finale. */
  for (let i = 0; i < 150; i++) {
    if (await guarda('(function(){var a=document.getElementById("onda");return !a.paused && a.readyState===4 && !a.seeking;})()')) break;
    await dormi(100);
  }
  await dormi(400);

  if (process.env.DIAGNOSI) {
    console.log('    DIAGNOSI', JSON.stringify({
      src: await guarda('document.getElementById("onda").currentSrc'),
      durata: await guarda('document.getElementById("onda").duration'),
      readyState: await guarda('document.getElementById("onda").readyState'),
      eventi: await guarda('(window.__ev||[]).join(" > ")'),
    }));
  }
  if (archivio) {
    await guarda('document.querySelector(".onda-vecchia").click(), 1');
    for (let i = 0; i < 100; i++) {
      if (await guarda('(function(){var a=document.getElementById("onda");return !a.paused && !a.seeking;})()')) break;
      await dormi(100);
    }
    await dormi(400);
  }

  const esito = {
    da: await guarda('document.getElementById("onda").currentTime'),
    quando: await guarda('document.getElementById("quando").textContent'),
    suona: await guarda('!document.getElementById("onda").paused'),
    esito: await guarda('document.getElementById("esito").textContent'),
  };
  await b.manda('Target.closeTarget', { targetId });
  return esito;
}

/* ── i casi ───────────────────────────────────────────────────────────── */
const INIZIO = 20 * 60 + 26;   // 20:26 in minuti

titolo('1 · si entra a metà onda (20:30, onda da 15 minuti)');
{
  const atteso = (20 * 60 + 30 - INIZIO) * 60;          // 240 s dopo l'inizio
  const vero = await apri({ pagina: 'radio.html', finta: '20:30', durata: 900 });
  const scarto = Math.abs((vero.da ?? -1) - atteso);
  if (!vero.suona) male('l’audio non è partito: la prova non ha potuto misurare niente');
  else if (scarto <= 6) ok(`entra a ${Math.round(vero.da)}s invece che a 0 (atteso ~${atteso}s, scarto ${scarto.toFixed(1)}s)`);
  else male(`entra a ${Math.round(vero.da)}s, atteso ~${atteso}s — il salto non c'è o è sbagliato`);

  nota('la stessa prova sulla copia SABOTATA, dove DEVE fallire:');
  const rotto = await apri({ pagina: 'radio-sabotata.html', finta: '20:30', durata: 900 });
  const scartoRotto = Math.abs((rotto.da ?? -1) - atteso);
  if (scartoRotto <= 6) male(`la copia sabotata ha PASSATO (entra a ${Math.round(rotto.da)}s): questa prova non prova niente`);
  else ok(`la copia sabotata parte da ${Math.round(rotto.da ?? -1)}s e la prova la RIFIUTA — il controllo morde`);
}

titolo('2 · la finestra è lunga quanto l’onda, non 15 minuti fissi');
{
  /* onda 01 dura 392,18 s: alle 20:40 è finita da un pezzo. Con la costante
     di prima la pagina diceva ancora «in diretta adesso». */
  const vero = await apri({ pagina: 'radio.html', finta: '20:40', durata: 392.18 });
  if (vero.quando === 'in replica') ok('alle 20:40 su un’onda da 6′32″ dice «in replica»');
  else male(`alle 20:40 su un’onda da 6′32″ dice «${vero.quando}» — la finestra non segue la durata`);

  const dentroLa = await apri({ pagina: 'radio.html', finta: '20:30', durata: 900 });
  if (dentroLa.quando === 'in diretta adesso') ok('alle 20:30 dentro l’onda dice «in diretta adesso»');
  else male(`alle 20:30 dentro l’onda dice «${dentroLa.quando}» — la diretta non viene riconosciuta`);
}

titolo('3 · l\u2019host non serve richieste parziali');
{
  /* SQUELCH lo dichiara di Cloudflare Pages, dove la radio vive davvero. Da qui
     quell'host non si raggiunge (403 al CONNECT), quindi non lo verifichiamo:
     ci mettiamo nella condizione peggiore e chiediamo alla pagina di reggerla.
     Senza parziali il primo salto viene IGNORATO in silenzio e l'onda riparte
     da zero: la pagina se ne deve accorgere e correggersi a file scaricato. */
  const atteso = (20 * 60 + 30 - INIZIO) * 60;
  const vero = await apri({ pagina: 'radio.html', finta: '20:30', durata: 900, parziali: false });
  const scarto = Math.abs((vero.da ?? -1) - atteso);
  /* Misurato il 15/09: senza parziali il browser NON salta, nemmeno a file
     scaricato. Non e\u0300 una cosa che la pagina possa riparare — quindi qui non
     si pretende il salto: si pretende che NON MENTA. O entra a meta\u0300, o dice
     da dove sta partendo. Il rosso vero sarebbe il terzo caso: parte da zero
     e continua a dire «sta suonando», come se niente fosse. */
  if (scarto <= 8) ok(`anche senza parziali entra a ${Math.round(vero.da)}s`);
  else if (/riparte dall/.test(vero.esito || '')) ok(`non puo\u0300 saltare e LO DICE: «${vero.esito}»`);
  else male(`parte da ${Math.round(vero.da ?? -1)}s e dice «${vero.esito}» — il salto si perde in silenzio`);
}

titolo('4 · l’avviso non sopravvive a chi lo smentisce');
{
  /* Trovato rileggendo il proprio diff, non da un guasto in pagina. Se il salto
     si è rivelato impossibile l'avviso resta acceso — e poi l'ascoltatore
     sceglie una REPLICA dall'archivio, che per dottrina parte dall'inizio. La
     pagina gli direbbe «da qui non si entra a metà» davanti a una cosa che
     dall'inizio ci parte apposta: una frase falsa, della stessa famiglia di
     tutte le altre riparate qui. */
  const vero = await apri({ pagina: 'radio.html', finta: '20:30', durata: 900,
                            parziali: false, archivio: true });
  if (/non si entra a met/.test(vero.esito || ''))
    male(`sulla replica dice ancora «${vero.esito}» — un avviso acceso che ormai mente`);
  else ok(`sulla replica l'avviso è spento: «${vero.esito}»`);
}

/* ── la fine ──────────────────────────────────────────────────────────── */
b.chiudi(); proc.kill(); server.close();
if (guai) {
  console.log(`\n${G.rosso}${G.forte}✗ ${guai} cosa/e da riparare.${G.fine}`);
  process.exit(1);
}
console.log(`\n${G.verde}${G.forte}✓ L'onda si prende a metà, e la prova sa rifiutare.${G.fine}`);
console.log(`${G.muto}  Resta quello che nessun browser senza orecchie può dire: che si SENTA.${G.fine}`);
console.log(`${G.muto}  Quello lo prova una persona, alle 20.26.${G.fine}`);
process.exit(0);
