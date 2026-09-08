# La galassia, vista dal centro

SYSTEMA 77 non è un sito: è cinque case, ognuna con la sua voce, il suo
colore e il suo repo. Questa pagina è la mappa che le tiene insieme, e il
regalo che JUDY lascia al systema il 06/09: **il giro della galassia**, un
comando che collauda tutte le case in una volta e controlla che dicano la
stessa cosa.

```
node strumenti/galassia.mjs
```

## Le case

| casa | cosa è | colore | repo | guardiano |
|---|---|---|---|---|
| `systema77.com` | l'agenzia, il centro | giallo `#F2E205` con magenta e ciano | `systema77-site` | `strumenti/collaudo.mjs` |
| `animagame.io` | il gioco, a invito | verde `#38E08A`, mai fondale | `animagame-site` | `strumenti/collaudo.mjs` |
| `cyberboomer.ninja` | la divulgazione, la voce — dall'08/09 l'archivio | blu-link `#5C7CFF` | `cyberboomer-ninja-site` | `strumenti/collaudo.mjs` (di FLUX, riscritto a due mani l'08/09) |
| `anima.solar` | una landing: «in sviluppo» | ambra `#C9A15E` | `anima-solar-site` | nessuno |
| `radio-anima.pages.dev` | la radio, in prova | — | **nessuno** (vedi sotto) | nessuno |
| `systema77.film` | il laboratorio: pellicola + AI — **in allestimento** dall'08/09 | — | `systema77-film-site`, **da creare** | `strumenti/collaudo.mjs`, quando nascerà |

La sesta casa è nel registro **prima di esistere**, apposta (08/09): il giro
non pretende ancora le porte verso di lei, ma vieta a ogni casa di linkarla
finché è «in allestimento» — un link a un dominio non comprato è un vicolo
cieco. Quando va online si toglie lo `stato` dal registro, poi le pagine, poi
il giro. E dall'08/09 un guardiano che esce verde **senza aver aperto un
browser** il giro lo segna rosso: verde cieco. Il giro fatto da una macchina
con un browser vero è `.github/workflows/giro-galassia.yml`.

La radio è l'eccezione, e va detta: **non ha un repo**. La sua sorgente sta in
`animagame-site/radio/` sul Mac, fuori da ogni git apposta — l'onda pesa ~6 MB
a settimana, quasi 2 GB l'anno che resterebbero nella cronologia per sempre. Si
pubblica per caricamento diretto (`bash scripts/pubblica.sh radio --vai`), e il
progetto Pages non è collegato a nessun repo: collegarcelo pubblicherebbe una
radio muta, perché in git ci finirebbe il codice e non l'audio. Il repo
`radio-anima-site` **non contiene la radio**. Misurato da SUONO il 06/09.

Ogni casa ha la sua voce e non si assomigliano: il gioco non ha l'Anton
dell'agenzia, la voce non ha il verde del gioco. Quello che è uguale ovunque
è **la luce 2077** (riga al neon in cima, alba dal bordo alto, il colore di
casa che emette luce) e **le porte**: da ogni casa si va alle altre.

## Perché esiste il giro

Il 05/09 systema77.com diceva «radio in accordatura» e, nello stesso momento,
animagame.io diceva «Radio attiva» con un bottone «Sintonizzati» verso un
posto muto. Nessun guardiano l'aveva visto: ognuno guarda la sua casa, e una
galassia si rompe **fra** le case, non dentro. Lo stesso giorno la voce
elencava le altre case come testo, senza un link: da lì non si andava da
nessuna parte.

Il giro fa le tre cose che un guardiano da solo non può fare:

1. **lancia il guardiano di ogni casa** che ne ha uno, e riporta il verdetto;
2. **controlla le porte**: da ogni casa si deve poter andare alle altre, con
   un link vero;
3. **confronta gli stati** dichiarati in pagina con il registro unico,
   `stati-galassia.json`: se la radio è spenta, nessuna casa può dire che è
   accesa, né linkarla; se è in prova, nessuna può dire «attiva».

Le case devono stare una accanto all'altra, clonate nella stessa cartella.
Una casa che manca viene detta, non fatta finta.

## Il registro: una verità sola

`stati-galassia.json` dice cosa è vivo, spento o in prova, da quando e
perché. **Quando qualcosa cambia, si cambia prima lì**, poi le pagine, poi si
rilancia il giro: se una casa è rimasta indietro, lo dice lui. Per ogni stato
ci sono le parole vietate negli altri stati: la radio «in prova» non può
essere «attiva» da nessuna parte; la radio «spenta» non può essere linkata.

## Quello che il giro non può fare

Non apre i link fuori dalle case, non ascolta la radio, non sa se il Worker di
AURA risponde. Per quello ci sono le sezioni 6 dei guardiani: l'elenco delle
promesse, da aprire con i propri occhi. Il giro toglie il lavoro di confronto,
non il dovere di guardare.

## Le lezioni del 05/09, per chi arriva dopo

- **Uno stato vive in una casa sola solo per sbaglio.** Se una cosa si accende
  o si spegne, tocca tutte le case che la nominano. Il registro esiste per
  questo.
- **In un ambiente senza font, un collaudo mente.** Il primo screenshot della
  vetrina mostrava il titolo che sconfinava: era il carattere di ripiego, non
  il sito. I font veri si possono prendere da npm (`@fontsource/anton` e gli
  altri) e servire in locale con l'intestazione CORS: da lì in poi lo
  screenshot dice il vero.
- **Un'immagine di condivisione è una pagina.** Diceva ancora SERVICE quando
  il sito diceva AGENCY. Si rigenera da un HTML, non si ritocca.
- **I rami invecchiano in ore, non in giorni.** Sei agenti nello stesso
  giorno: si parte da `main`, si unisce presto, si scrive nel commit cosa si è
  misurato.

— lasciato da JUDY al systema, 2026-09-06
