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
// ⚠️ CORREZIONE 2026-09-13, e va letta: la prima versione prendeva `--pollici` e
//    `--dpi` e calcolava i pixel. L'API di Printful NON ragiona cosi': da' una TELA
//    IN PIXEL FISSI. Misurata quel giorno su tutte e tre le magliette candidate
//    (Bella+Canvas 3001, Stanley/Stella STTU169, Gildan 64000): 1800x2400, uguale.
//    E quella tela e' VERTICALE (3:4) mentre il riquadro del disegno in pagina e'
//    ORIZZONTALE (218x176). Il disegno non riempie il file: ci va POSIZIONATO dentro.
//    Con la misura in pollici sarebbe uscito deformato, e si sarebbe visto solo su
//    una maglietta vera addosso a qualcuno.
//
// I colori della pagina, mappati sui nomi veri di Printful (prodotto 71,
// misurati il 13/09: 84 colori, i nostri quattro ci sono tutti):
//   nero → Black · bianco → White · grigio → Dark Grey · navy → Navy
//
// Uso:
//   node strumenti/genera-stampi.mjs
//   node strumenti/genera-stampi.mjs --frase "ALTRA FRASE" --largo 0.85 --alto-da 0.15
//
// — creato da DROP, 2026-09-13

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

// LA TELA — misurata, non ricordata: `/mockup-generator/printfiles/<id>` il 13/09.
const TELA = { largo: 1800, alto: 2400 };

// I DUE NUMERI CHE NON SONO UNA MISURA, e per questo si dichiarano a ogni corsa.
// Quanto e' largo il disegno sul petto e quanto scende dal collo NON si ricava dai
// dati: l'anteprima e' un DISEGNO di maglietta, non un modello in scala di una
// Bella+Canvas 3001, e l'API da' la tela ma non dove cade sul capo indossato.
// 📜 Un numero che non si e' misurato non si scrive come se lo fosse.
// La conferma vera e' un mockup Printful, e va fatta prima di qualunque ordine.
const LARGO = Number(arg('largo', '0.85'));      // frazione della larghezza di stampa
const ALTO_DA = Number(arg('alto-da', '0.15'));  // dove cade il bordo alto del disegno

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

// Il rapporto del disegno non si tocca MAI: si sceglie la larghezza, l'altezza segue.
function collocazione(tela, area, largo, altoDa) {
  const w = Math.round(tela.largo * largo);
  const h = Math.round(w * (area.alto / area.largo));
  return { w, h, x: Math.round((tela.largo - w) / 2), y: Math.round(tela.alto * altoDa) };
}
const POSA = collocazione(TELA, AREA, LARGO, ALTO_DA);

if (POSA.y + POSA.h > TELA.alto || POSA.w > TELA.largo) {
  console.error('✗ Con questi valori il disegno esce dalla tela di stampa. Non scrivo niente.');
  console.error(`    disegno ${POSA.w}x${POSA.h} a (${POSA.x},${POSA.y}) · tela ${TELA.largo}x${TELA.alto}`);
  process.exit(1);
}

// ── il banco: solo geometria, zero rete, zero browser ────────────────────────
// Nasce perche' da una sessione remota i caratteri non arrivano e l'attrezzo
// rifiuta (giustamente): senza questo, di questa riscrittura non potrei provare
// NIENTE da qui. La geometria pero' e' aritmetica, e l'aritmetica si prova ovunque.
if (process.argv.includes('--prova')) {
  const casi = [];
  const q = collocazione(TELA, AREA, 0.85, 0.15);
  casi.push(['il disegno sta dentro la tela', q.x >= 0 && q.y >= 0 &&
             q.x + q.w <= TELA.largo && q.y + q.h <= TELA.alto]);
  casi.push(['il rapporto del disegno non cambia',
             Math.abs(q.w / q.h - AREA.largo / AREA.alto) < 0.01]);
  casi.push(['il disegno e\' centrato in orizzontale',
             Math.abs(q.x - (TELA.largo - q.w - q.x)) <= 1]);
  const largo = collocazione(TELA, AREA, 1, 0.15);
  casi.push(['a larghezza piena tocca i bordi e non li supera',
             largo.w === TELA.largo && largo.x === 0]);
  const basso = collocazione(TELA, AREA, 0.85, 0.95);
  casi.push(['spinto in fondo ESCE — e il guardrail lo deve vedere',
             basso.y + basso.h > TELA.alto]);
  for (const [nome, ok] of casi) console.log(`  ${ok ? '✓' : '✗'} ${nome}`);
  const rotti = casi.filter(([, ok]) => !ok);
  console.log(rotti.length ? `\n✗ ${rotti.length} rotti` : `\n✓ ${casi.length} casi, tutti verdi`);
  process.exit(rotti.length ? 1 : 0);
}

// ── il giro ──────────────────────────────────────────────────────────────────
// L'import e' DINAMICO e sta qui, non in cima: cosi' `--prova` gira anche dove
// Playwright non c'e'. Un banco che non parte senza il browser non e' un banco.
// (Stessa forma di strumenti/collaudo.mjs, che lo cerca e dice se non lo trova.)
let chromium;
try { ({ chromium } = await import('playwright')); }
catch {
  console.error('✗ Playwright non e\' installato: non posso aprire la pagina.');
  console.error('  per farlo: npm i -D playwright  ·  e poi rilancia');
  process.exit(1);
}

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
console.log(`  tela:     ${TELA.largo}×${TELA.alto} px  ✓ misurata dall'API Printful il 13/09`);
console.log(`  disegno:  ${POSA.w}×${POSA.h} px a (${POSA.x},${POSA.y})  — largo ${LARGO}, alto-da ${ALTO_DA}`);
console.log(`  ⚠ larghezza e altezza del disegno NON sono una misura: dai dati non si ricavano.`);
console.log(`    Li conferma un mockup Printful, e va fatto prima di qualunque ordine.\n`);

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
    // La tela e' quella di Printful; il disegno ci sta DENTRO, in un <svg> annidato
    // che col suo viewBox + preserveAspectRatio non lo deforma mai.
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${TELA.largo}" height="${TELA.alto}" ` +
      `viewBox="0 0 ${TELA.largo} ${TELA.alto}">` +
      `<svg x="${POSA.x}" y="${POSA.y}" width="${POSA.w}" height="${POSA.h}" ` +
      `viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid meet">${disegno}</svg></svg>`;

    const nome = `stampo-${stampo.id}-${colore.id}`;
    writeFileSync(join(FUORI, nome + '.svg'), svg);

    const tela = await browser.newPage({ viewport: { width: TELA.largo, height: TELA.alto } });
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
