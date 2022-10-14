# Esercitazione 2 - HTML/CSS/JS

In questa esercitazione andremo a esplorare il concetto di `localStorage` e
il suo uso per salvare localmente delle informazioni attraverso più richieste.

## Come usare questo progetto

``` bash
yarn dev # fa girare il server locale e mostra il sito in anteprima
```

## Obiettivi

Avete un web server all'URL: 

https://songs.vallauri-unofficial.workers.dev

il vostro obiettivo è chiamarlo per ottenere un token di sessione. Tale token lo dovete usare in una seconda pagina, per ottenere dal server una lista di canzoni che dovete mostrare nella pagina web, come più vi aggrada (vale anche `alert`, `console.log` oppure un render HTML di qualche tipo)

## Endpoint da chiamare

`POST https://songs.vallauri-unofficial.workers.dev/login`
``` JSON
{
  "email": "email@prova.net",
  "password": "123456"
}
```
Ottiene un `session_id` da usare per l'altro endpoint

`GET https://songs.vallauri-unofficial.workers.dev/songs`

Ottiene una lista di canzoni

> NOTA: Gli endpoint vanno in errore, simulando possibili problemi, questi errori vanno gestiti nel codice