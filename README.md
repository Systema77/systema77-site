# SYSTEMA 77 — systema77.com

Il sito dell'agenzia. **AI Agent Agency**: automazione con agenti AI,
produzione per terzi, ricerca e sviluppo. Più una casa editrice, un'officina
e un gioco.

## Le pagine

| file | cos'è |
|---|---|
| `index.html` | la home: il binario a **sei quadri**, uno per voce di menu più l'apertura |
| `servizi.html` | **automazione · produzione per terzi · ricerca e sviluppo** — e il contatto. È la pagina da cui arriva il lavoro |
| `editrice.html` | la casa editrice: i libri, lo shop, il controllo |
| `officina.html` | dove si fabbrica — porta alle tre stanze |
| `immagini.html` · `film.html` · `musica.html` | le tre stanze dell'officina |
| `progetti.html` | **solo ANIMA GAME**, e porta ad `animagame.io` |
| `chill.html` | AURA (in allestimento) · radio (in accordatura) · podcast |
| `divulgazione.html` | la porta verso `cyberboomer.ninja` — la divulgazione sta su un pianeta suo |
| `aura.html` | **AURA per il pubblico**: il cielo a icone, e la finestra delle richieste. Motore dichiarato e spento |
| `meteo.html` | **la console del Direttore** — staccata dal sito, vedi sotto |
| `stile.css` · `s77.js` | il sistema. Un foglio, un file di comportamento |
| `storie.html` | rinvio: l'indirizzo vecchio porta alla casa editrice |
| `bilancia.html` | **staccata dal sito** — vedi sotto |

## Le due porte

Dal 2026-09-07 la testata del sito ha **due porte**, ratificate dal Direttore:

| porta | colore | dove va | cosa c'è dietro |
|---|---|---|---|
| **SOLDI** — *per voi* | giallo `#F2E205` | `servizi.html` | la metà che fattura: lo shop (magliette, adesivi, libri) e le commesse — automazione, immagine, video |
| **EGO** — *per me* | magenta `#FF2E88` | `officina.html` | il laboratorio personale: officina, immagini, film, musica |

**Perché due e non un menu.** Il sito faceva due mestieri con una voce sola. Adesso
chi arriva sceglie prima *di chi è* la cosa che sta guardando: se è per lui o se è
del Direttore. La riga sotto la testata elenca le stanze **della porta in cui si è**,
e cambia con la porta.

**Chill · Progetti · Divulgazione** non sono in testata: stanno nella mappa a piè di
pagina, raggiungibile dal rinvio «la galassia ↓». Non sono una terza porta — sono
stanze che non appartengono a nessuna delle due metà.

**Il gioco resta fuori dalla porta dei soldi.** Ai giocatori non si vende niente:
sono la base organica, non il cliente. `animagame.io` sta nella mappa, in verde.

⚠️ **Se aggiungi una pagina**, decidi a quale metà appartiene e mettila nella riga
delle stanze giusta (`nav.menu.ego` o `nav.menu.soldi`). Una pagina senza metà
esiste ma non si raggiunge: è successo a `divulgazione.html`, che il 07/09 non era
in nessuno dei due posti.


## Le regole della casa

1. **La regola tipografica**, e viene prima di tutte. Quattro caratteri, quattro mestieri:
   - **Anton** → l'annuncio. Solo titoli.
   - **Archivo Black** (`.claim`) → la promessa. Una riga, quella che deve restare in testa.
   - **Share Tech Mono** (`.etichetta`, `.stato`, `.riga-mono`) → **etichette e stati soltanto.**
     Mai una frase. Se supera sei parole non è un'etichetta: è una voce umana.
   - **Newsreader** (`.dice`) → la voce umana. Frasi vere, in minuscolo, che si leggono.

   **Il testo ha tre volumi, e il bianco è il più alto** (revisione 04/09 sera:
   «i testi sono tutti bianchi»). Il bianco era il default, quindi non voleva
   dire niente. Adesso:
   `.dice.forte` bianco e più grande — **una per blocco, mai due** ·
   `.dice` grigio chiaro, il corpo · `.dice.piccola` grigio muto, il dettaglio.

   **La pagina usa la larghezza che ha.** Contenitore a 1360px e blocchi in
   **due colonne** sopra i 1000px (`.due`): a sinistra chi parla, a destra cosa
   dice. La misura di lettura resta corta — quella non si allarga mai, righe
   lunghe si perdono — ma è la pagina a occupare lo spazio, non il paragrafo.

   **Semplificare vuol dire togliere.** Un paragrafo in più non si riscrive
   più corto: si cancella.

   Il 04/09 il Direttore ha scritto «i testi piccoli non si leggono» e
   «ridurrei tutti i testi a qualcosa per il pubblico, non nostro interno».
   Erano lo stesso problema: **tutto** il sito era scritto in mono maiuscolo
   spaziato, cioè col carattere delle etichette usato per fare i paragrafi.
   Quando l'unico stile disponibile è l'etichetta, si finisce a scrivere per
   sigle. `.dice` esiste per non farlo più.

2. **Niente numeri, clienti o prezzi inventati.** Non c'è un listino perché
   ogni lavoro è diverso, e si dice così invece di riempire con un finto.

3. **Diritti prima, sempre.** Quello che esce dall'officina è nostro o ha
   un'autorizzazione scritta *prima*. In pagina non compaiono nomi di opere,
   marchi o autori di altri — nemmeno come esempio di cosa sappiamo fare.

4. **Gli stati sono onesti.** «In allestimento» vuol dire in allestimento.
   Una sala vuota non si annuncia aperta.

5. **Un indirizzo non si rompe.** Se una pagina cambia nome, la vecchia resta
   e rinvia (vedi `storie.html`).

## La luce (2077)

Il 05/09 il Direttore: «la vetrina la trovo un po' spenta di colori: tanto
giallo, tanto bianco, poco magenta o ciano. Rendila un po' più 2077». Vero:
in sei quadri il magenta compariva due volte e il ciano una. Adesso la luce
c'è anche dove non c'è una parola da colorare, e non muove niente:

- **la riga al neon** sotto il menu (giallo → magenta → ciano), su ogni pagina;
- **gli aloni** negli angoli dei quadri e dell'annuncio di ogni pagina
  (`.luce-m` `.luce-c` `.luce-g` `.luce-v` `.luce-mc`), alfa mai sopra il 16%:
  è luce, non fondale;
- **il gigante sdoppiato** ai bordi, ciano a sinistra e magenta a destra, fermo;
- AGENCY in ciano, la GALASSIA in magenta: il giallo lo tengono il 77 e le
  porte di casa. (05/09: era SERVICE. Il Direttore: «sarà ovunque AGENCY».)

**I testi**, stesso giorno: «manca formattazione, punti a capo,
giustificazioni». Il corpo (`.dice`) è giustificato con la sillabazione
italiana sopra i 700px e a bandiera sotto, dove la riga è corta e la
giustificazione apre buchi. Le frasi forti, i claim e i titoli vanno a capo
bilanciati (`text-wrap:balance`): niente parola sola sull'ultima riga. I
claim a tre voci stanno su tre righe, col punto colorato in fondo.

## La galassia

SYSTEMA 77 è il centro; intorno ci sono altri pianeti, ognuno col suo indirizzo.
Il componente `.galassia` è la mappa, e sta **sul piede di ogni pagina**: da
qualunque punto del sito si vede dove si può andare.

**Il colore è l'indirizzo, non una decorazione:**

| colore | vuol dire |
|---|---|
| **giallo** | si resta qui, su `systema77.com` |
| verde · magenta · ciano | è un altro pianeta, e sotto c'è scritto quale |

I pianeti di oggi: `animagame.io` (il gioco) e `cyberboomer.ninja` (la
divulgazione). La radio torna nella mappa quando suona. La mappa è scritta
in ogni pagina, uguale: quando cambia, cambia in tutte (`grep -n stella` le
trova).

## Gli stati, il 05/09

**La radio è spenta.** Il Direttore ha aperto il link e ha detto «la radio non
è accesa»: `chill.html` dice «in accordatura», nessun bottone, nessun
indirizzo, e la radio non sta nella mappa. Quando suona, si riaccende in una
riga per pagina.

**AURA ha due facce.** `meteo.html` — i grafici, le quattro località, i tre
modelli — è **la console del Direttore**: «quelli li vedrò solo io». È
staccata dal sito come la bilancia: nessun link, fuori da `sitemap.xml`,
`noindex`. Non è privata: chi ha l'indirizzo la apre. Diventa privata quando
passa dietro il suo banco.
`aura.html` è quello che vede il pubblico: **un'icona per giorno e due
numeri**, e una finestra dove scrivere cosa si deve fare («sabato vado a fare
windsurf sul lago di Como: a che ora c'è il vento migliore?»). Le due rotte
(`GET /previsione`, `POST /richiesta`) sono dichiarate in fondo alla pagina e
**spente**: le accende chi tiene il Worker di AURA. Finché sono spente la
pagina mostra le otto icone e dice «in allestimento». La chiave del meteo non
sta in `aura.html` e non ci starà mai.
La porta di AURA (chi lascia il numero) sta ancora dentro `meteo.html`: quando
il Worker risponde, va spostata in `aura.html`.

## Il telefono in verticale

Fino al 03/09 chi apriva il sito col telefono in piedi trovava un cartello a
tutto schermo — «GIRA IL TELEFONO» — prima di qualsiasi contenuto. Il link
adesso si diffonde, e un link condiviso si apre col telefono in mano.

Da oggi: **in verticale il sito si apre e basta**, coi sei quadri in colonna,
stesso contenuto per intero. L'invito a girare resta, ma è una striscia in
fondo alla home che si chiude con una ×. Chi gira il telefono ritrova il
binario esattamente com'era: l'artificio non è stato toccato, è stata tolta
la porta chiusa che gli stava davanti.

## La bilancia

`bilancia.html` è **staccata dal sito**: nessun link ci arriva, sta fuori da
`sitemap.xml` ed è `noindex`. Ordine del Direttore del 04/09: «la bilancia, per
me, resta per il momento qualcosa all'interno di animagame». Il file non è
stato cancellato — aspetta di trovare casa in `animagame-site`.
Portava anche in chiaro un nome preso da un videogioco altrui: è stato tolto
dal titolo e dalle scritte, per la stessa cautela già decisa su ANIMA GAME.

— creato da D.R.A.G.O. 2026-07-28 · riscritture JUDY 2026-08-08 ·
  **v1 operativa, JUDY 2026-09-04** · radio spenta, AURA a icone e la luce 2077, JUDY 2026-09-05
