# Markdown Here Revival 4.0 Beta

**Le build beta di Markdown Here Revival 4.0 sono ora disponibili.**

MDHR 4.0 è il risultato di molte ore di lavoro per rendere la scrittura di e-mail Markdown
in Thunderbird un'esperienza più piacevole.

## Il grande cambiamento - _LIVE PREVIEW_

MDHR 4.0 presenta una finestra di composizione a schermo diviso. Scrivi la tua email in Markdown
a sinistra, e un'anteprima in tempo reale si aggiorna a destra. Non è necessario attivare/disattivare
avanti e indietro per vedere cosa cambia.

<div id="video"></div>

Il vecchio pulsante "Render" ora nasconde o mostra l'anteprima Markdown. Se l'anteprima
è nascosto, non viene eseguita alcuna elaborazione.

**MDHR 4.0 non può ancora essere scaricato dal sito Web di Thunderbird Addons.**
Vai a [GitLab Releases](https://gitlab.com/jfx2006/markdown-here-revival/-/releases)
e scarica l'ultima versione 4.0beta.

Questa versione beta sostituirà le versioni precedenti del componente aggiuntivo. Puoi tornare a una versione più vecchia
versione, ma potresti perdere alcune impostazioni.

Le build beta si aggiorneranno automaticamente da GitLab fino a quando non le rilascerò il
ATN. Spero di farlo all'inizio del 2024.

**È supportato solo Thunderbird 115.x.**Il supporto alla versione beta di Thunderbird arriverà prima
alla versione ATN. **Thunderbird 102 non sarà supportato.**

Eventuali bug possono essere segnalati [nella pagina dei problemi](https://gitlab.com/jfx2006/markdown-here-revival/-/issues).
L'etichetta **MDHR-4* * deve essere assegnata a questi bug.

Problemi noti

- <strike>Il contenuto dell'anteprima live non viene sincronizzato con l'editor</strike>
- <strike>Lo stato della modalità "Ribasso" non persiste e deve essere
un'opzione in Impostazioni MDHR per avviare il compositore in modalità normale o Markdown
modalità.</strike>
- <strike>Le firme HTML non vengono ignorate durante il rendering come nel precedente
versione (regressione)</strike>
- La posizione di anteprima live non sempre rimane in perfetta sincronia con il lato editor
