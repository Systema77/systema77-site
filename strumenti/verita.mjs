#!/usr/bin/env node
/* ◉ LA VERITÀ DICHIARATA — quello che diciamo corrisponde alla macchina?
 *
 *   node strumenti/verita.mjs
 *
 * ── PERCHÉ ESISTE ────────────────────────────────────────────────────────
 * Il giro (`galassia.mjs`) chiede: «le case dicono la stessa cosa?». È una
 * domanda utile e non è questa. Il 15/09 BRAINDANCE ha trovato il buco che
 * quella domanda non può vedere, e l'ha scritto meglio di chiunque:
 *
 *   📜 «Un giro che confronta la pagina col registro è verde quando mentono
 *      insieme.»
 *
 * Misurato: `animagame.io` scriveva «La stanza delle verifiche · attiva»,
 * `stati-galassia.json` scriveva `verifiche: attiva`, e `assets/config.js`
 * — la macchina — diceva `VERIFICHE.ACCESE: false` con `BACKEND_URL: null`.
 * Tre voci d'accordo, due delle quali false. Il giro era VERDE.
 *
 * Questo file fa l'altra domanda: **la macchina conferma?** Non legge quello
 * che promettiamo, legge l'interruttore. Un badge «attiva» vale solo se la
 * sua chiave è `true`; una riga del registro vale solo se il file che cita
 * dice la stessa cosa. Il registro cita `assets/config.js` dal primo giorno
 * — con la parola «dichiarato», che è precisamente il punto: lo cita e non
 * lo apre.
 *
 * ── LE DUE PROVE, E SERVONO TUTTE E DUE ──────────────────────────────────
 * 📜 «Verifica che un controllo RIFIUTI, non solo che accetti» — e il suo
 * gemello, che questa casa non aveva ancora scritto: **un controllo sempre
 * rosso è inutile quanto uno sempre verde.** Quindi alla fine questo file
 * prova sé stesso due volte, su copie in memoria:
 *   · una copia COERENTE (macchina accesa dove la pagina dice «attiva»)
 *     → il controllo deve diventare VERDE. Se resta rosso, è rotto.
 *   · una copia BUGIARDA (macchina spenta dove la pagina dice «attiva»)
 *     → il controllo deve diventare ROSSO. Se resta verde, non serve a niente.
 * Se una delle due non si comporta come deve, questo file si dichiara
 * inaffidabile ed esce rosso — qualunque cosa abbia trovato nel mondo vero.
 *
 * ── COSA NON PUÒ DIRE ────────────────────────────────────────────────────
 * Legge i SORGENTI, non la rete: un Worker vivo o morto non lo vede, e da
 * una sessione remota ogni host nostro è irraggiungibile (misurato ancora il
 * 15/09: tutti `000`). Quello che sta dietro una rotta HTTP resta una
 * promessa finché non la apre qualcuno.
 *
 * — lasciato da JUDY al systema, 2026-09-15
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ACCANTO = resolve(RADICE, '..');

const G = { verde: '\x1b[32m', rosso: '\x1b[31m', giallo: '\x1b[33m',
            muto: '\x1b[90m', forte: '\x1b[1m', fine: '\x1b[0m' };

/* ═══ LA MAPPA: quale interruttore regge quale parola ═══════════════════
   Si tiene QUI, in chiaro, perché è l'unica parte che una persona deve
   poter discutere. Una stanza senza interruttore non è un guasto: è una
   stanza che non ha ancora una macchina, e il controllo lo dice invece di
   inventarsi un verdetto. */
const MAPPA = {
  casa: join(ACCANTO, 'animagame-site'),
  macchina: 'assets/config.js',
  pagine: ['gioco.html', 'strumenti.html'],
  stanze: {
    'La stanza delle verifiche': 'VERIFICHE.ACCESE',
    'Guarda fuori':              'AURA.ACCESE',
    'Meteo':                     null,   // vive altrove (systema77.com/meteo.html)
    'Radio':                     null,   // vive altrove (systema77.com/radio.html)
    'Il falò':                   null,   // nessuna macchina: non è ancora costruita
  },
  // righe del registro che dipendono da un interruttore della macchina
  registro: { 'verifiche': { chiave: 'VERIFICHE.ACCESE', acceso: 'attiva' } },
};

/* Legge un interruttore da config.js senza eseguirlo: il file è di un'altra
   casa, e un `import` gli darebbe la nostra. Si guarda il testo. */
function interruttore(sorgente, chiave) {
  const [gruppo, campo] = chiave.includes('.') ? chiave.split('.') : [null, chiave];
  let zona = sorgente;
  if (gruppo) {
    const i = sorgente.indexOf(gruppo + ':');
    if (i < 0) return { trovato: false };
    zona = sorgente.slice(i, i + 900);
  }
  // si salta ciò che è commentato: un interruttore spiegato non è un interruttore acceso
  const pulita = zona.split('\n').filter((r) => !/^\s*(\/\/|\*|\/\*)/.test(r)).join('\n');
  const m = new RegExp(`\\b${campo}\\s*:\\s*(true|false|null|'[^']*')`).exec(pulita);
  return m ? { trovato: true, valore: m[1] } : { trovato: false };
}

const BADGE = /<(h2|h3)[^>]*>([^<]{2,60})<\/\1>\s*<span class="stato([^"]*)"[^>]*>([^<]*)<\/span>/g;

/* ── UN BADGE GOVERNATO NON È UNA PROMESSA, È UN MODELLO ──────────────────
   Dal 15/09 le stanze stanno dentro un `<article|section data-macchina="…"
   hidden>`: il testo «attiva» esiste nel sorgente ma si vede SOLO se
   `assets/stanze.js` lo scopre, e lo scopre solo se l'interruttore è true.
   Quel testo quindi non mente — è la frase che la stanza dirà quando sarà
   vera. Qui si riconosce quel caso, e si tiene il dente per gli altri.
   ⚠️ `hidden` da solo non basta: un `display:` nel foglio lo batte (misurato
   in un browser vero il 15/09 — le tre card di gioco.html restavano visibili
   con hidden messo). Per questo la pagina deve ANCHE portare la regola CSS
   che lo rende vincolante, e qui sotto si controlla che ci sia. */
const CONTENITORE = /<(article|section)\b[^>]*>/g;
function governato(html, dove) {
  let ultimo = null;
  CONTENITORE.lastIndex = 0;
  for (const c of html.matchAll(CONTENITORE)) {
    if (c.index > dove) break;
    ultimo = c[0];
  }
  if (!ultimo || !/data-macchina=/.test(ultimo)) return null;
  return { hidden: /\bhidden\b/.test(ultimo), chiave: /data-macchina="([^"]+)"/.exec(ultimo)?.[1] };
}
const REGOLA_CSS = /\[data-macchina\]\[hidden\]\s*\{[^}]*display\s*:\s*none\s*!important/;

/* Il controllo vero e proprio. Prende i testi in ingresso invece di leggerli
   da sé, così le prove di sé stesso possono passargli copie modificate senza
   toccare un solo file su disco. */
function controlla({ config, pagine, registro }) {
  const trovati = [];
  const detto = (t) => trovati.push(t);

  for (const [nome, chiave] of Object.entries(MAPPA.stanze)) {
    if (!chiave) continue;
    const i = interruttore(config, chiave);
    if (!i.trovato) { detto(`l'interruttore ${chiave} non esiste in ${MAPPA.macchina}`); continue; }
    const acceso = i.valore === 'true';
    for (const [file, html] of Object.entries(pagine)) {
      for (const m of html.matchAll(BADGE)) {
        if (m[2].trim() !== nome) continue;
        const parola = m[4].trim();
        // «attiva altrove» dichiara di vivere fuori: non la regge questa macchina
        if (parola !== 'attiva') continue;
        const g = governato(html, m.index);
        if (g) {
          // il badge lo scopre la macchina: si controlla il GOVERNO, non la parola
          if (!g.hidden) detto(`${file}: «${nome}» è legata a ${g.chiave} ma NON è hidden: si vede comunque`);
          else if (!REGOLA_CSS.test(html)) detto(`${file}: «${nome}» è hidden ma manca la regola CSS [data-macchina][hidden]{display:none!important} — un display del foglio la batte`);
          continue;
        }
        if (!acceso) detto(`${file} dice «${nome} · attiva» ma ${chiave} è ${i.valore}`);
      }
    }
  }

  const bk = interruttore(config, 'BACKEND_URL');
  for (const [voce, regola] of Object.entries(MAPPA.registro)) {
    const stato = registro?.stati?.[voce]?.stato;
    if (stato === undefined) { detto(`il registro non ha la voce «${voce}»`); continue; }
    const i = interruttore(config, regola.chiave);
    if (!i.trovato) { detto(`l'interruttore ${regola.chiave} non esiste`); continue; }
    if (stato === regola.acceso && i.valore !== 'true')
      detto(`il registro dice «${voce}: ${stato}» ma ${regola.chiave} è ${i.valore}`);
    if (stato === regola.acceso && bk.trovato && bk.valore === 'null')
      detto(`il registro dice «${voce}: ${stato}» ma BACKEND_URL è null: non c'è nessun motore`);
  }
  return trovati;
}

/* ═══ IL MONDO VERO ═════════════════════════════════════════════════════ */
console.log(`\n${G.forte}◉ LA VERITÀ DICHIARATA${G.fine} ${G.muto}— la macchina conferma quello che diciamo?${G.fine}`);

const percorsoConfig = join(MAPPA.casa, MAPPA.macchina);
if (!existsSync(percorsoConfig)) {
  console.log(`  ${G.giallo}NON CONTROLLATO${G.fine} — ${MAPPA.casa.split('/').pop()} non è clonata qui.`);
  console.log(`  ${G.muto}·${G.fine} questo controllo non finge di aver guardato: dice che non ha guardato`);
  process.exit(0);
}
const CONFIG = readFileSync(percorsoConfig, 'utf8');
const PAGINE = Object.fromEntries(MAPPA.pagine
  .filter((p) => existsSync(join(MAPPA.casa, p)))
  .map((p) => [p, readFileSync(join(MAPPA.casa, p), 'utf8')]));
const REGISTRO = JSON.parse(readFileSync(join(RADICE, 'stati-galassia.json'), 'utf8'));

const bugie = controlla({ config: CONFIG, pagine: PAGINE, registro: REGISTRO });
console.log(`\n${G.forte}── quello che diciamo, contro l'interruttore ──${G.fine}`);
if (!bugie.length) console.log(`  ${G.verde}✓${G.fine} ogni «attiva» ha un interruttore acceso dietro`);
else for (const b of bugie) console.log(`  ${G.rosso}✗${G.fine} ${b}`);

/* ═══ LE DUE PROVE DI SÉ ════════════════════════════════════════════════ */
console.log(`\n${G.forte}── questo controllo è vivo? ──${G.fine}`);
let rotto = false;

// ① una macchina COERENTE con quello che le pagine dicono → deve diventare verde
const coerente = CONFIG.replace(/ACCESE:\s*false/g, 'ACCESE: true')
                       .replace(/BACKEND_URL:\s*null/, "BACKEND_URL: 'https://esempio.invalid'");
const reg2 = JSON.parse(JSON.stringify(REGISTRO));
const restoCoerente = controlla({ config: coerente, pagine: PAGINE, registro: reg2 });
if (restoCoerente.length) {
  rotto = true;
  console.log(`  ${G.rosso}✗${G.fine} con la macchina ACCESA resta rosso (${restoCoerente.length}): il controllo è sempre rosso, quindi non misura niente`);
  restoCoerente.forEach((b) => console.log(`      ${G.muto}${b}${G.fine}`));
} else console.log(`  ${G.verde}✓${G.fine} con la macchina accesa diventa verde — non è un controllo sempre rosso`);

// ② una macchina SPENTA sotto una pagina che dice «attiva» → deve diventare rosso
const bugiarda = CONFIG.replace(/ACCESE:\s*true/g, 'ACCESE: false');
const finta = { 'finta.html': '<h2>La stanza delle verifiche</h2> <span class="stato">attiva</span>' };
const restoBugiardo = controlla({ config: bugiarda, pagine: finta, registro: REGISTRO });
if (!restoBugiardo.length) {
  rotto = true;
  console.log(`  ${G.rosso}✗${G.fine} con la macchina SPENTA e la pagina che dice «attiva» resta verde: il controllo non morde`);
} else console.log(`  ${G.verde}✓${G.fine} con la macchina spenta RIFIUTA — il controllo morde`);

/* ═══ LA FINE ═══════════════════════════════════════════════════════════ */
if (rotto) {
  console.log(`\n${G.rosso}${G.forte}✗ Questo controllo non è affidabile, e non conta quello che ha trovato sopra.${G.fine}`);
  process.exit(1);
}
if (bugie.length) {
  console.log(`\n${G.rosso}${G.forte}✗ ${bugie.length} cosa/e che diciamo e la macchina non conferma.${G.fine}`);
  console.log(`${G.muto}  Si ripara in quest'ordine: prima l'interruttore o il registro, poi le pagine.${G.fine}`);
  process.exit(1);
}
console.log(`\n${G.verde}${G.forte}✓ Quello che dichiariamo ha una macchina che lo regge.${G.fine}`);
console.log(`${G.muto}  Restano le rotte HTTP: un Worker vivo o morto questo file non lo vede.${G.fine}`);
process.exit(0);
