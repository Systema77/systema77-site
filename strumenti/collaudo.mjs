#!/usr/bin/env node
/* ◉ IL GUARDIANO — il collaudo della casa, in un file solo.
 *
 *   node strumenti/collaudo.mjs
 *
 * ── PERCHÉ ESISTE ────────────────────────────────────────────────────────
 * Fra agosto e settembre 2026 lo stesso errore è tornato quattro volte, e
 * ogni volta con una faccia diversa:
 *
 *   · un'animazione dichiarata pronta e ferma venti giorni, perché nessuno
 *     l'aveva mai vista muoversi;
 *   · un meteo dato per «funziona già» mentre la sua cornice era spenta;
 *   · una radio e un dominio scritti in pagina come vivi, mai aperti da
 *     nessuno;
 *   · una chiave a pagamento lasciata in chiaro in un repo pubblico.
 *
 * Nessuno di questi era distrazione. Erano tutti la stessa cosa: qualcuno
 * ha DICHIARATO invece di MISURARE, e nessuno dopo di lui ha avuto un modo
 * rapido per accorgersene.
 *
 * Questo file è quel modo. Non sostituisce l'occhio di nessuno: fa le
 * domande che ci siamo dimenticati di farci, e le fa sempre, a chiunque
 * lanci il comando — persona o agente.
 *
 * ── COME È FATTO ─────────────────────────────────────────────────────────
 * Nessuna dipendenza, per nessuna delle due parti: gira con Node e basta.
 * La parte col browser (scivolamento laterale, errori in console) CERCA un
 * browser già installato — Chrome, Brave, Chromium, o quello che indichi con
 * COLLAUDO_BROWSER — e lo pilota via CDP. Se non ne trova nessuno, il collaudo
 * NON finge di averla fatta: lo dice e passa oltre. È la stessa regola che
 * vale per le pagine.
 *   ⚠️ Fino al 13/09 qui c'era scritto «usa Playwright SE c'è», e quel «se»
 *   non si è mai avverato: chiedeva un PACCHETTO npm, e questa casa non ha un
 *   package.json. La sezione col browser non era mai girata su una macchina
 *   di persona — solo in CI, che però parte al cron o su una modifica a
 *   strumenti/, non quando cambia una pagina.
 *
 * ── LA REGOLA CHE NON PUÒ CONTROLLARE ────────────────────────────────────
 * L'ultima sezione elenca ogni punto in cui il sito dichiara che qualcosa
 * è acceso, attivo o vivo. Non le verifica: non può. Le mette in fila
 * perché qualcuno le apra con i propri occhi.
 * È l'unica sezione che non fallisce mai, ed è la più importante.
 *
 * — lasciato da JUDY al systema, 2026-09-05
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const RADICE = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* ═══ LE REGOLE DI QUESTA CASA ══════════════════════════════════════════
   Ogni casa della galassia ha le sue: se copi questo file altrove, cambia
   SOLO questo blocco. Il resto è uguale ovunque. */
const CASA = {
  nome: 'SYSTEMA 77 · systema77.com',

  // Nomi sotto revisione o vietati. Si cercano OVUNQUE nei file spediti,
  // commenti HTML compresi: anche quelli viaggiano, sul sito e su raw.
  nomiVietati: [
    { cosa: 'kiroshi',    perche: 'nome preso da un videogioco altrui — rischio di marchio' },
    { cosa: 'braindance', perche: 'nome preso da un videogioco altrui — rischio di marchio' },
  ],

  // Colori che in questa casa non si usano. (Qui il giallo è di casa:
  // è nel gioco che è vietato. Vedi la copia in animagame-site.)
  coloriVietati: [],

  // Parole che questa casa non dice. Cercate solo nel testo VISIBILE.
  lessicoVietato: [],

  // Cartelle e file che il collaudo non guarda.
  saltare: ['.git', 'node_modules', 'strumenti'],
};

/* ═══ attrezzi ══════════════════════════════════════════════════════════ */

const G = { verde: '\x1b[32m', rosso: '\x1b[31m', giallo: '\x1b[33m',
            muto: '\x1b[90m', forte: '\x1b[1m', fine: '\x1b[0m' };
let guai = 0;
const ok   = (t) => console.log(`  ${G.verde}✓${G.fine} ${t}`);
const male = (t) => { guai++; console.log(`  ${G.rosso}✗${G.fine} ${t}`); };
const nota = (t) => console.log(`  ${G.muto}·${G.fine} ${t}`);
const titolo = (t) => console.log(`\n${G.forte}── ${t} ──${G.fine}`);

function tuttiIFile(dir = RADICE, trovati = []) {
  for (const voce of readdirSync(dir)) {
    if (CASA.saltare.includes(voce)) continue;
    const p = join(dir, voce);
    if (statSync(p).isDirectory()) tuttiIFile(p, trovati);
    else trovati.push(p);
  }
  return trovati;
}

const relativo = (p) => p.slice(RADICE.length + 1);
const spediti = tuttiIFile().filter((p) => /\.(html|css|js|mjs|json|xml|txt|md)$/i.test(p));
const pagine  = spediti.filter((p) => p.endsWith('.html'));

/* Il testo che un visitatore legge davvero: via script, stili e commenti. */
function testoVisibile(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ');
}

console.log(`\n${G.forte}◉ IL GUARDIANO${G.fine} ${G.muto}— ${CASA.nome}${G.fine}`);
console.log(`${G.muto}  ${pagine.length} pagine, ${spediti.length} file spediti${G.fine}`);

/* ═══ 1 · I NOMI CHE NON SI PUBBLICANO ══════════════════════════════════
   Compresi i commenti HTML: questo repo è pubblico due volte, dal sito e
   da raw.githubusercontent.com. Un nome in un commento è un nome
   pubblicato. */
titolo('1 · i nomi che non si pubblicano');
if (!CASA.nomiVietati.length) nota('nessun nome in elenco per questa casa');
for (const { cosa, perche } of CASA.nomiVietati) {
  const dentro = spediti.filter((p) => new RegExp(cosa, 'i').test(readFileSync(p, 'utf8')));
  if (dentro.length) male(`«${cosa}» in ${dentro.map(relativo).join(', ')} — ${perche}`);
  else ok(`«${cosa}» non compare in nessun file`);
}

/* ═══ 2 · I SEGRETI ═════════════════════════════════════════════════════
   Una pagina statica che chiama un'API dal browser NON PUÒ tenere segreta
   una chiave: chiunque apra il sorgente la legge. Se qui sotto compare
   qualcosa, non è «da nascondere meglio» — è da limitare per dominio o da
   spostare dietro un worker. */
titolo('2 · chiavi e segreti in chiaro');
const CHIAVE = /(api[-_]?key|apikey|secret|token|password|passwd|bearer)\s*[:=]\s*['"`]([^'"`\s]{12,})['"`]/gi;
let segreti = 0;
for (const p of spediti) {
  const testo = readFileSync(p, 'utf8');
  for (const m of testo.matchAll(CHIAVE)) {
    // Un valore vuoto o palesemente finto non è un segreto.
    if (/^(null|undefined|xxx+|tuo|your|<.*>|\.\.\.|inserisci)/i.test(m[2])) continue;
    segreti++;
    const riga = testo.slice(0, m.index).split('\n').length;
    male(`${relativo(p)}:${riga} — sembra una chiave in chiaro (${m[1]})`);
  }
}
if (!segreti) ok('nessuna chiave in chiaro nei file spediti');
else nota('una chiave nel browser non si può nascondere: si limita per dominio, o passa da un worker');

/* ═══ 3 · GLI INDIRIZZI CHE NON PORTANO DA NESSUNA PARTE ════════════════ */
titolo('3 · link interni e ancore');
let rotti = 0, ancoreMorte = 0;
for (const p of pagine) {
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/href=["']([^"']+)["']/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|data:|tel:|#|\/\/)/i.test(href)) continue;
    const [file, ancora] = href.split('#');
    if (file) {
      const meta = join(RADICE, file);
      if (!existsSync(meta)) { rotti++; male(`${relativo(p)} → ${href} (il file non c'è)`); continue; }
      if (ancora && meta.endsWith('.html')) {
        const dentro = readFileSync(meta, 'utf8');
        if (!new RegExp(`id=["']${ancora}["']`).test(dentro)) {
          ancoreMorte++; male(`${relativo(p)} → ${href} (l'ancora non esiste)`);
        }
      }
    }
  }
}
if (!rotti && !ancoreMorte) ok('ogni link interno porta a un file che esiste, ogni ancora a un id che esiste');

/* ═══ 4 · I COLORI DI UN'ALTRA CASA ═════════════════════════════════════ */
titolo('4 · colori vietati');
if (!CASA.coloriVietati.length) nota('nessun colore vietato in questa casa');
for (const { cosa, perche } of CASA.coloriVietati) {
  // Solo dove il colore è USATO, non dove è spiegato in un commento.
  const dentro = spediti.filter((p) => {
    const t = readFileSync(p, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
    return new RegExp(cosa, 'i').test(t);
  });
  if (dentro.length) male(`${cosa} usato in ${dentro.map(relativo).join(', ')} — ${perche}`);
  else ok(`${cosa} non è usato da nessuna parte`);
}

/* ═══ 5 · LE PAROLE CHE QUESTA CASA NON DICE ════════════════════════════ */
titolo('5 · lessico');
if (!CASA.lessicoVietato.length) nota('nessuna parola vietata in questa casa');
for (const { cosa, perche } of CASA.lessicoVietato) {
  const dentro = pagine.filter((p) =>
    new RegExp(`\\b${cosa}\\b`, 'i').test(testoVisibile(readFileSync(p, 'utf8'))));
  if (dentro.length) male(`«${cosa}» visibile in ${dentro.map(relativo).join(', ')} — ${perche}`);
  else ok(`«${cosa}» non si legge in nessuna pagina`);
}

/* ═══ 6 · QUELLO CHE IL SITO DICHIARA VIVO ══════════════════════════════
   Questa sezione non fallisce mai, e va letta lo stesso — anzi, va letta
   per prima. Ogni riga è una promessa fatta a chi arriva: qualcuno deve
   averla aperta con i propri occhi, oggi, prima di diffondere il link.
   È esattamente il passo che è mancato quattro volte.
   Pesca larga di proposito: prende anche qualche «vivo» innocente di
   passaggio. Una riga in più da scorrere costa dieci secondi; una promessa
   sfuggita costa la fiducia del primo sconosciuto che ci clicca sopra. */
titolo('6 · quello che dichiariamo vivo — da aprire a mano');
const VIVO = /\b(acces[oa]|attiv[oa]|viv[oa]|funziona gi[àa]|si guarda adesso|guardalo adesso)\b/gi;
const promesse = [];
for (const p of pagine) {
  const testo = testoVisibile(readFileSync(p, 'utf8'));
  for (const m of testo.matchAll(VIVO)) {
    const attorno = testo.slice(Math.max(0, m.index - 60), m.index + 70).trim();
    promesse.push(`${relativo(p)} — «…${attorno}…»`);
  }
}
if (!promesse.length) nota('il sito non dichiara vivo niente');
else {
  console.log(`  ${G.giallo}${promesse.length} promesse di funzionamento.${G.fine} Aprile una per una:`);
  for (const r of promesse) nota(r);
}

/* ═══ 7 · IL BROWSER, SE C'È ════════════════════════════════════════════ */
titolo('7 · scivolamento laterale ed errori in console');
const LARGHEZZE = [320, 390, 768, 1024, 1280, 1600];

/* IL BROWSER SI CERCA, NON SI INSTALLA — misurato il 13/09.
   Fino a oggi qui c'era `await import('playwright')`: si chiedeva un PACCHETTO npm,
   e in questa casa nessun repo ha un package.json né node_modules. Quell'import non
   poteva riuscire — né in una sessione, né sul Mac — quindi questa sezione non è mai
   girata su una macchina di persona. In CI sì (giro-galassia.yml installa con
   --no-save), ma quel giro parte al cron delle 06:30 o su una modifica a strumenti/:
   una PAGINA cambiata e spinta non faceva scattare niente, e il CLAUDE.md di casa
   intanto diceva «prima di spingere, lancia il guardiano».
   Ora si cerca un browser GIÀ INSTALLATO e lo si pilota via CDP, che Node ha di serie
   dalla 22. Non è un meccanismo nuovo: è quello di cyberboomer.ninja, dove misura da
   giorni. Trapiantato, non inventato. */
const dentro = (dir, coda) => {
  try { return readdirSync(dir).filter((n) => n.startsWith('chromium')).sort().reverse().map((n) => join(dir, n, coda)); }
  catch { return []; }
};
const CANDIDATI_BROWSER = [
  process.env.COLLAUDO_BROWSER,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  ...dentro(process.env.PLAYWRIGHT_BROWSERS_PATH ?? '', 'chrome-linux/chrome'),
  ...dentro('/opt/pw-browsers', 'chrome-linux/chrome'),
  ...dentro(join(process.env.HOME ?? '', '.cache/ms-playwright'), 'chrome-linux/chrome'),
].filter(Boolean);
const BROWSER = CANDIDATI_BROWSER.find(existsSync);
// Come root (contenitori, CI) Chromium rifiuta di partire senza --no-sandbox: non è una
// scelta di sicurezza nostra, è la condizione per misurare qualcosa in quelle stanze.
const FLAG_ROOT = process.getuid?.() === 0 ? ['--no-sandbox'] : [];
const dormi = (ms) => new Promise((r) => setTimeout(r, ms));

function cdp(ws) {
  let id = 0; const attesa = new Map(); const eventi = [];
  const sock = new WebSocket(ws);
  sock.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && attesa.has(m.id)) { attesa.get(m.id)(m.result ?? {}); attesa.delete(m.id); }
    else if (m.method) eventi.push(m);
  });
  const pronto = new Promise((r) => sock.addEventListener('open', r));
  return {
    pronto, eventi,
    manda: (method, params = {}) => new Promise((r) => {
      const n = ++id; attesa.set(n, r); sock.send(JSON.stringify({ id: n, method, params }));
    }),
    chiudi: () => sock.close(),
  };
}

/* Il 13/09 questo guardiano diceva «✓ non ha trovato niente» anche quando la sezione 7
   non era girata: la riga finale prometteva una salute che nessuno aveva misurato. Un
   controllo saltato, a chi scorre cercando il rosso, somiglia troppo a un controllo
   passato. Ora la riga finale lo dice. Il codice d'uscita NON cambia apposta: resta 0,
   così galassia.mjs continua a riconoscere il caso e a chiamarlo «verde cieco» con la
   sua diagnosi, che è più precisa di un'uscita 1. */
let cieco = false;

if (!BROWSER) {
  console.log(`  ${G.giallo}NON COLLAUDATO${G.fine} — nessun browser trovato: cercato in ${CANDIDATI_BROWSER.length} posti (Mac, Linux, cache di Playwright).`);
  nota('indica il tuo: COLLAUDO_BROWSER=/percorso/del/browser  ·  e poi rilancia');
  nota('questo collaudo non finge di aver guardato: dice che non ha guardato');
  cieco = true;
} else {
  const portaCdp = 9000 + Math.floor(Math.random() * 900);
  const proc = spawn(BROWSER, ['--headless=new', `--remote-debugging-port=${portaCdp}`,
    `--user-data-dir=/tmp/collaudo-${portaCdp}`, '--no-first-run', '--no-default-browser-check',
    '--disable-gpu', '--hide-scrollbars', ...FLAG_ROOT], { stdio: 'ignore' });

  let vers = null;
  for (let i = 0; i < 40 && !vers; i++) {
    await dormi(250);
    try { vers = await (await fetch(`http://127.0.0.1:${portaCdp}/json/version`)).json(); } catch { /* non ancora in piedi */ }
  }
  if (!vers) {
    male(`il browser non si è avviato — ${BROWSER}`);
  } else {
    const b = cdp(vers.webSocketDebuggerUrl); await b.pronto;
    for (const p of pagine) {
      const male_a = [];
      for (const L of LARGHEZZE) {
        const { targetId } = await b.manda('Target.createTarget', { url: 'about:blank' });
        const lista = await (await fetch(`http://127.0.0.1:${portaCdp}/json/list`)).json();
        const pg = cdp(lista.find((x) => x.id === targetId).webSocketDebuggerUrl); await pg.pronto;
        await pg.manda('Runtime.enable'); await pg.manda('Log.enable'); await pg.manda('Network.enable');
        // Fuori non si esce: il collaudo misura le pagine, non la rete.
        await pg.manda('Network.setBlockedURLs', { urls: ['http://*', 'https://*', 'ws://*', 'wss://*'] });
        await pg.manda('Emulation.setDeviceMetricsOverride', { width: L, height: 900, deviceScaleFactor: 1, mobile: L < 500 });
        await pg.manda('Page.navigate', { url: 'file://' + p });
        await dormi(400);
        const { result } = await pg.manda('Runtime.evaluate', {
          expression: '({ largo: document.documentElement.scrollWidth, vista: window.innerWidth })',
          returnByValue: true,
        });
        const misura = result.value;
        // La larghezza chiesta dev'essere quella misurata. Senza <meta name="viewport"> il
        // browser in modo mobile ne inventa una più larga, e il controllo a 320px misurerebbe
        // una finestra che non esiste: un verde che non ha guardato niente. Provato il 13/09
        // su una pagina-esca senza quel meta — diceva 1280 mentre le chiedevo 320.
        if (misura.vista !== L) male_a.push(`${L}px non applicata (la finestra è ${misura.vista}px): manca <meta name="viewport">?`);
        if (misura.largo > misura.vista + 1) male_a.push(`${L}px scivola (${misura.largo}>${misura.vista})`);
        const errori = pg.eventi.flatMap((e) => {
          if (e.method === 'Runtime.exceptionThrown') return [e.params.exceptionDetails?.text ?? '?'];
          if (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')
            return [e.params.args?.map((a) => a.value ?? a.description).join(' ') ?? '?'];
          if (e.method === 'Log.entryAdded' && e.params.entry.level === 'error') return [e.params.entry.text];
          return [];
        }).filter((t) => !/Failed to load resource|ERR_/.test(String(t)));
        if (errori.length) male_a.push(`${L}px ${String(errori[0]).slice(0, 50)}`);
        pg.chiudi();
        await b.manda('Target.closeTarget', { targetId });
      }
      if (male_a.length) male(`${relativo(p)} — ${male_a.join(' · ')}`);
      else ok(`${relativo(p)} — pulita a ${LARGHEZZE.join('/')}px`);
    }
    b.chiudi();
  }
  proc.kill();
}

/* ═══ il verdetto ═══════════════════════════════════════════════════════ */
console.log();
if (guai) {
  const c = guai === 1 ? 'cosa da sistemare' : 'cose da sistemare';
  console.log(`${G.rosso}${G.forte}✗ ${guai} ${c} prima di spingere.${G.fine}\n`);
  process.exit(1);
}
if (cieco) {
  console.log(`${G.giallo}${G.forte}◐ VERDE CIECO — niente da sistemare in ciò che ho guardato.${G.fine}`);
  console.log(`${G.muto}  Ma la sezione 7 NON è girata: sbordamento e console non sono stati misurati.${G.fine}`);
  console.log(`${G.muto}  Non è un lasciapassare per spingere. Serve un browser — Chrome, Brave o${G.fine}`);
  console.log(`${G.muto}  Chromium vanno bene — e si indica con COLLAUDO_BROWSER=/percorso.${G.fine}`);
  console.log(`${G.muto}  In CI il giro ne installa uno. E galassia.mjs segna rosso questo caso.${G.fine}\n`);
} else {
  console.log(`${G.verde}${G.forte}✓ Il guardiano non ha trovato niente.${G.fine}`);
  console.log(`${G.muto}  Restano le promesse della sezione 6: quelle le apre una persona.${G.fine}\n`);
}
