# Per chi lavora su questo repo

Sei arrivato su **systema77.com**, il sito dell'agenzia — il centro della
galassia SYSTEMA 77.

## Prima di toccare qualsiasi cosa

Leggi **`README.md`**. Porta il canone: la regola tipografica, i colori, la
mappa della galassia, cosa è acceso e cosa no, e il *perché* di ogni scelta.
Non è documentazione di cortesia: è il motivo per cui questo sito ha una voce
sola invece di sette.

## Prima di spingere

```
node strumenti/collaudo.mjs
```

Controlla i nomi che non si pubblicano, le chiavi in chiaro, i link morti, i
colori e il lessico di casa, lo scivolamento laterale e gli errori in console.
Se non trova Playwright non finge di aver guardato: lo dice.

**E leggi la sezione 6.** Elenca ogni punto in cui il sito dichiara che
qualcosa è acceso, attivo o vivo. Il collaudo non può aprirle: le apri tu.
Quella sezione esiste perché quel passo è mancato quattro volte in un mese,
e ogni volta il sito ha raccontato a degli sconosciuti una cosa che non era
vera.

## Se tocchi uno stato dichiarato (acceso, attivo, in prova…)

```
node strumenti/verita.mjs
```

Il giro chiede «le case dicono la stessa cosa?». Questo chiede **«la macchina
conferma?»** — legge l'interruttore vero (`animagame-site/assets/config.js`),
non quello che promettiamo.

Esiste per un buco che il giro non poteva vedere: il 15/09 la pagina diceva
«La stanza delle verifiche · attiva», il registro diceva `verifiche: attiva`,
e la macchina diceva `ACCESE: false` con `BACKEND_URL: null`. Tre voci
d'accordo, due false, giro **verde**.
📜 *Un giro che confronta la pagina col registro è verde quando mentono insieme.*

Si prova vivo da solo, in due sensi — e servono tutti e due: con la macchina
accesa deve diventare verde (o è un controllo sempre rosso, che non misura
niente), con la macchina spenta deve **rifiutare** (o non morde). Se una delle
due non si comporta come deve, si dichiara inaffidabile ed esce rosso.

⚠️ **Non è ancora dentro `galassia.mjs`, e c'è un ordine da rispettare.**
Il CI clona le altre case da **main**: finché `animagame-site/main` non porta
le stanze legate a `config.js` (PR animagame-site #14), agganciare questo
controllo al giro farebbe rosso il CI di QUESTA casa per una cosa da riparare
in un'altra. Provato, non dedotto: con `animagame` a main, `verita.mjs` esce 1.
L'aggancio è pronto e aspetta il suo turno — vedi la PR che lo porta.

## Se tocchi uno stato che vive anche altrove

```
node strumenti/galassia.mjs
```

Questo è il centro della galassia, e le altre case (il gioco, la voce, la
landing, la radio) stanno clonate accanto a questa cartella. Il giro lancia il
guardiano di ognuna, controlla che da ogni casa si vada alle altre, e
confronta quello che le pagine dichiarano con `stati-galassia.json`, la
verità unica. Radio, AURA, verifiche: se ne accendi o spegni una, **prima si
cambia il registro, poi le pagine, poi si rilancia il giro**. Leggi
`GALASSIA.md`: dice perché.

## Le tre che ci hanno fatto male davvero

1. **Non dichiarare quello che non hai misurato.** Se non hai potuto
   controllare, scrivilo: «non ho potuto aprirlo» vale più di «dovrebbe
   funzionare».
2. **Semplificare vuol dire togliere**, non riscrivere più corto.
3. **Un controllo scritto in una pagina statica non è un controllo**, e una
   chiave nel browser non è un segreto. Chiunque apra il sorgente li supera.

## Fra agenti

Un ramo per agente e per lavoro (`nome/cosa-fa`), e si unisce presto: i rami
che invecchiano si scontrano. Prima di ripartire su un ramo vecchio, portati
dentro `main`.

— lasciato da JUDY, 2026-09-05
