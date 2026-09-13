// ◉ genera-stampi.mjs — dai quattro stampi della pagina ai file di stampa
//
// La pagina `magliette.html` compone la frase A SCHERMO. Printful vuole
// un'immagine ad alta risoluzione a un indirizzo web. Questo attrezzo fa il
// passaggio, e lo fa in un modo solo:
//
//   📜 LA PAGINA E' LA VERITA' DEL DISEGNO.
//   Non riscrivo qui la composizione (corpo, a capo, spaziatura): apro la
//   pagina vera in un browser vero, le faccio disegnare lo stampo e ne porto
//   via il gruppo <g id="stampa">. Se riscrivessi l'algoritmo, un giorno la
//   pagina e la stampa direbbero due cose diverse, e nessuno se ne
//   accorgerebbe finche' non arriva la maglietta sbagliata a casa di qualcuno.
//
// ⛔ I file escono in `print/`, che e' GITIGNORATO apposta (vedi .gitignore,
//    scritto da SUONO il 10/08): questo repo e' pubblico e git non dimentica.
//    Vivono su Cloudflare Pages. Pubblicarli e' un atto del Direttore.
//
// Uso:
//   node strumenti/genera-stampi.mjs
//   node strumenti/genera-stampi.mjs --frase "ALTRA FRASE" --pollici 12 --dpi 300
//
// — creato da DROP, 2026-09-13

import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const QUI = dirname(fileURLToPath(import.meta.url));
const CASA = resolve(QUI, '..');
const PAGINA = join(CASA, 'magliette.html');
const FUORI = join(CASA, 'print');

// ── gli argomenti, senza dipendenze ──────────────────────────────────────────
const arg = (nome, pre) => {
  const i = process.argv.indexOf('--' + nome);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : pre;
};

// ⚠️ NON CONFERMATO CONTRO IL CATALOGO PRINTFUL. L'area di stampa vera di una
// maglietta si CHIEDE all'API (`/products/<id>`), non si ricorda: da una
// sessione remota api.printful.com risponde 403, quindi qui c'e' un default
// generoso e dichiarato, non una misura. Dal Mac si chiede e si rigenera.
const POLLICI = Number(arg('pollici', '12'));
const DPI = Number(arg('dpi', '300'));

// ── l'area di stampa, letta DALLA PAGINA e mai ricordata ─────────────────────
// Se un giorno qualcuno sposta il riquadro nella pagina, questo la segue. Se
// non la trova, si ferma: un riquadro indovinato stampa storto.
function areaDallaPagina(sorgente) {
  const m = sorgente.match(
    /var\s+AREA\s*=\s*\{\s*x:\s*(-?[\d.]+)\s*,\s*cima:\s*(-?[\d.]+)\s*,\s*largo:\s*(-?[\d.]+)\s*,\s*alto:\s*(-?[\d.]+)/);
  if (!m) {
    console.error('✗ Non trovo `var AREA = { x, cima, largo, alto }` in magliette.html.');
    console.error('  Non invento un riquadro di stampa: senza quello il disegno esce storto.');
    process.exit(1);
  }
  const [, x, cima, largo, alto] = m.map(Number);
  return { x, cima, largo, alto };
}

const sorgente = readFileSync(PAGINA, 'utf8');
const AREA = areaDallaPagina(sorgente);
const VIEWBOX = `${AREA.x - AREA.largo / 2} ${AREA.cima} ${AREA.largo} ${AREA.alto}`;

const LARGO_PX = Math.round(POLLICI * DPI);
const ALTO_PX = Math.round(LARGO_PX * (AREA.alto / AREA.largo));

// ── il giro ──────────────────────────────────────────────────────────────────
const browser = await chromium.launch();
const pagina = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errori = [];
pagina.on('pageerror', e => errori.push(String(e)));
await pagina.goto(pathToFileURL(PAGINA).href, { waitUntil: 'networkidle' });

// 📜 IL CONTROLLO CHE VALE PIU' DI TUTTI GLI ALTRI.
// I caratteri arrivano da Google Fonts, cioe' dalla RETE. Se non arrivano, il
// browser ripiega su Impact o sul monospace di sistema e disegna lo stesso:
// il file uscirebbe con il carattere sbagliato SENZA UN ERRORE. Un guasto
// silenzioso in un file che poi finisce stampato su un capo vero.
// ⚠️ NON si usa `document.fonts.check()`: risponde `true` anche quando non c'e'
// NESSUN @font-face da aspettare — cioe' proprio nel caso che deve intercettare.
// Misurato il 13/09: con la rete chiusa, check('16px Anton') = true, @font-face
// registrati = 0, e sono usciti 16 file col carattere di ripiego, tutti verdi.
// 📜 Una guardia che non puo' dire di no non e' una guardia.
// Qui si guarda l'elenco vero dei caratteri caricati, e si misura la larghezza:
// se il carattere voluto misura come il generico, non c'e'.
const fonts = await pagina.evaluate(async () => {
  await document.fonts.ready;
  const caricato = n => [...document.fonts].some(f => f.family.replace(/["']/g, '') === n && f.status === 'loaded');
  const c = document.createElement('canvas').getContext('2d');
  const largo = ff => { c.font = '100px ' + ff; return c.measureText('FATTO DA NOI UMANI').width; };
  const generico = largo('sans-serif');
  const diverso = ff => Math.abs(largo(ff) - generico) / generico > 0.03;
  return {
    anton: caricato('Anton') && diverso("'Anton'"),
    mono: caricato('Share Tech Mono') && diverso("'Share Tech Mono'"),
    registrati: document.fonts.size
  };
});
if (!fonts.anton || !fonts.mono) {
  console.error('✗ I CARATTERI NON SONO ARRIVATI — non scrivo nessun file.');
  console.error(`    Anton: ${fonts.anton ? 'ok' : 'MANCA'} · Share Tech Mono: ${fonts.mono ? 'ok' : 'MANCA'} · @font-face registrati: ${fonts.registrati}`);
  console.error('  Vengono da fonts.googleapis.com. Senza, il browser ripiega su un altro');
  console.error('  carattere e disegna lo stesso: il file sarebbe sbagliato e sembrerebbe giusto.');
  await browser.close();
  process.exit(1);
}

// la frase di casa e' quella che sta GIA' nella pagina, fusa in main: non la
// invento qui. Si puo' scavalcare con --frase.
const frasePagina = await pagina.inputValue('#frase');
const FRASE = arg('frase', frasePagina);

// I bottoni in pagina non hanno un `data-id`: si riconoscono dal NOME, quello
// che legge una persona. L'id (che serve al nome del file) sta solo negli
// elenchi del sorgente — quindi lo leggo da li', con la stessa regola
// dell'AREA: dalla pagina, mai a memoria.
function elenco(nome) {
  const m = sorgente.match(new RegExp(`var\\s+${nome}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!m) return [];
  return [...m[1].matchAll(/id:\s*'([^']+)'[^}]*?nome:\s*'([^']+)'/g)]
    .map(([, id, nome]) => ({ id, nome }));
}
const STAMPI = elenco('STAMPI');
const COLORI = elenco('COLORI');

// I nomi che la pagina mostra davvero adesso: se il sorgente e il DOM non
// dicono la stessa cosa, mi fermo. Un file di stampa col nome sbagliato e'
// peggio di nessun file.
const inPagina = await pagina.evaluate(() => ({
  stampi: [...document.querySelectorAll('#stampi .scelta')].map(b => b.textContent.trim()),
  colori: [...document.querySelectorAll('#colori .scelta')].map(b => b.textContent.trim())
}));

const combacia = (elenco, visti) =>
  elenco.length === visti.length && elenco.every((v, i) => v.nome === visti[i]);

if (!STAMPI.length || !COLORI.length ||
    !combacia(STAMPI, inPagina.stampi) || !combacia(COLORI, inPagina.colori)) {
  console.error('✗ Gli elenchi del sorgente e i bottoni in pagina non combaciano.');
  console.error(`    sorgente: ${STAMPI.map(s => s.nome).join(', ')} · ${COLORI.map(c => c.nome).join(', ')}`);
  console.error(`    in pagina: ${inPagina.stampi.join(', ')} · ${inPagina.colori.join(', ')}`);
  console.error('  Mi fermo invece di indovinare: un file col nome sbagliato stampa la cosa sbagliata.');
  await browser.close();
  process.exit(1);
}

mkdirSync(FUORI, { recursive: true });

console.log(`\n◉ GLI STAMPI → FILE DI STAMPA`);
console.log(`  frase:    «${FRASE}»${arg('frase', null) ? '' : '  (quella della pagina)'}`);
console.log(`  riquadro: ${VIEWBOX}  (letto dalla pagina, non ricordato)`);
console.log(`  misura:   ${LARGO_PX}×${ALTO_PX} px — ${POLLICI}″ a ${DPI} dpi`);
console.log(`  ⚠ la misura NON e' confermata contro il catalogo Printful: si chiede all'API, dal Mac.\n`);

await pagina.fill('#frase', FRASE);

let scritti = 0;
for (const stampo of STAMPI) {
  for (const colore of COLORI) {
    await pagina.click(`#stampi .scelta:text-is("${stampo.nome}")`);
    await pagina.click(`#colori .scelta:text-is("${colore.nome}")`);
    await pagina.waitForTimeout(60);

    const disegno = await pagina.$eval('#stampa', g => g.innerHTML.trim());
    if (!disegno) {
      console.error(`  ✗ ${stampo.id}/${colore.id}: il gruppo <g id="stampa"> e' vuoto. Non scrivo il file.`);
      continue;
    }

    // SVG autonomo: solo il disegno, fondo trasparente, nessuna maglietta.
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" ` +
      `width="${LARGO_PX}" height="${ALTO_PX}">${disegno}</svg>`;

    const nome = `stampo-${stampo.id}-${colore.id}`;
    writeFileSync(join(FUORI, nome + '.svg'), svg);

    const tela = await browser.newPage({ viewport: { width: LARGO_PX, height: ALTO_PX } });
    await tela.setContent(
      `<style>html,body{margin:0;background:transparent}svg{display:block}</style>` +
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Share+Tech+Mono&display=swap">` +
      svg, { waitUntil: 'networkidle' });
    // Lo stesso controllo di sopra, di nuovo — e non e' una ripetizione inutile:
    // questa e' UN'ALTRA pagina, che ricarica i caratteri per conto suo. Controllare
    // solo la prima lascerebbe passare un PNG col carattere di ripiego mentre
    // l'SVG accanto e' giusto: due file gemelli che dicono due cose diverse.
    const okFont = await tela.evaluate(async () => {
      await document.fonts.ready;
      const caricato = n => [...document.fonts].some(f => f.family.replace(/["']/g, '') === n && f.status === 'loaded');
      return caricato('Anton') && caricato('Share Tech Mono');
    });
    if (!okFont) {
      console.error(`  ✗ ${nome}: i caratteri non sono arrivati in questa pagina. Non scrivo il PNG.`);
      await tela.close();
      continue;
    }
    await tela.screenshot({ path: join(FUORI, nome + '.png'), omitBackground: true });
    await tela.close();

    scritti++;
    console.log(`  ✓ ${nome}`);
  }
}

await browser.close();

if (errori.length) {
  console.error(`\n✗ ${errori.length} errori in console nella pagina:`);
  errori.slice(0, 3).forEach(e => console.error('    ' + e));
  process.exit(1);
}

console.log(`\n✓ ${scritti} file in print/  (SVG + PNG)`);
console.log(`  print/ e' gitignorato: questo repo e' pubblico e git non dimentica.`);
console.log(`  Vanno su Cloudflare Pages — e pubblicarli lo decide il Direttore.\n`);
