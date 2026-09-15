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

## Se tocchi la radio

```
node strumenti/prova-onda.mjs
```

Il guardiano legge i file; questo apre `radio.html` in un browser vero, le fa
credere che siano le 20:30 (`?finta=20:30`) e **misura da che secondo parte
l'audio**. Serve perché `currentTime` è un numero che esiste solo mentre la
pagina è viva: nessun grep poteva accorgersi che l'onda ripartiva da zero
mentre la barra diceva «in diretta adesso».

Ogni prova gira due volte: sulla pagina vera, dove deve passare, e su una
copia **sabotata** dove deve fallire. Se la copia sabotata passa, il file esce
rosso lo stesso e si dichiara inutile — 📜 *verifica che un controllo
RIFIUTI, non solo che accetti.*

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
