# Lesson plan
  
In questa esercitazione andremo a esplorare il concetto di `localStorage` e
il suo uso per salvare localmente delle informazioni attraverso più richieste.

## Come usare questo progetto

``` bash
yarn dev #fa girare il server locale e mostra il sito in anteprima
```

## Obiettivi

L'obiettivo è chiamare il web server usando le `XMLHTTPRequest` per ottenere dei dati da un webserver JSON rappresentato da un cloudflare worker il cui codice è il seguente, salvare il token di sessione in localStorage o sessionStorage e usarlo in un altro endpoint

### Endpoints del server

#### Ottieni Token di sessione

`POST /login`

Esempio di payload: 
``` JSON
{
    "email": "mia-email@sito.com",
    "password": "123456"
}
```

Le risposte possono essere 2, casuali:

1. HTTP 200 OK
```JSON
{
    "session_token": "aksdfnaodinasdosa"
}
```
2. HTTP 500 Internal Server Error
```JSON
{
    "error": {
        "message": "Something went wrong"
    }
}
```

> NOTA: questo serve per educare lo studente a risolvere i possibili casi di errore

#### Ottieni una lista di oggetti dummy

`GET /songs?session_token=<session_token>`

1. HTTP 200 OK
Ritorna sempre la stessa risposta
``` JSON
[
    {
        "name": "Don't stop me now",
        "author": "Queen",
        "genre": "Rock",
        "tags": ["queen", "rock", "eighties"]
    },
    {
        "name": "We will rock you",
        "author": "Queen",
        "genre": "Rock",
        "tags": ["queen", "rock", "eighties"]
    },
    {
        "name": "Gangsta Paradise",
        "author": "Coolio",
        "genre": "Rap",
        "tags": ["coolio", "rap", "meme", "nineties"]
    },
    {
        "name": "Chop Suey",
        "author": "System of a Down",
        "genre": "Nu Metal",
        "tags": ["nu-metal", "metal", "soad", "system-of-a-down"]
    }
]
```
2. HTTP 500 Internal Server Error
``` JSON
{
    "error": {
        "message": "Something went wrong"
    }
}
```

# Corollario, il codice del worker

``` js
// worker.js
const error404 = Object.freeze({
  error: {
    message: "404 not found",
  }
});

const error500 = Object.freeze({
  error: {
    message: "Something went wrong",
  },
});

const song_list = Object.freeze([
  {
    name: "Don't stop me now",
    author: "Queen",
    genre: "Rock",
    tags: ["queen", "rock", "eighties"]
  },
  {
    name: "We will rock you",
    author: "Queen",
    genre: "Rock",
    tags: ["queen", "rock", "eighties"]
  },
  {
    name: "Gangsta Paradise",
    author: "Coolio",
    genre: "Rap",
    tags: ["coolio", "rap", "meme", "nineties"]
  },
  {
    name: "Chop Suey",
    author: "System of a Down",
    genre: "Nu Metal",
    tags: ["nu-metal", "metal", "soad", "system-of-a-down"]
  }
]);

export default {
  async fetch(request, env) {
    return await handleRequest(request).catch(
      (err) => {
          console.error(err.stack)
          return new Response(JSON.stringify(error500), { 
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          });
      }
    )
  }
}

/**
 * failRandomly throws an error randomly, with a 25% chance.
 * @throws {Error} randomly, to simulate failure.
 */
function failRandomly() {
  const random_failure_coefficient = Math.floor(Math.random() * 100)

  // 25% probability of a failure
  if (random_failure_coefficient <= 25) {
    throw new Error("Random failure occurred");
  }
}

/**
 * generateSessionID generates a 32 characters random session ID
 */
function generateSessionID() {
  const characters       = Object.freeze("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");
  const charactersLength = Object.freeze(characters.length);
    
  let result           = "";
  for (let i = 0; i < 32; i++) {
    result += characters.charAt(Math.floor(Math.random() *  charactersLength));
  }

  return result;
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname === "/login" && request.method === "POST") {
    failRandomly();

    const { email, password } = await request.json();
    if (!email || !password) {
      throw new Error("Bad body");
    } 

    const session_id = generateSessionID();
    const response = Object.freeze({
      session_id,
    });

    return new Response(JSON.stringify(response), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (pathname.startsWith("/songs") && request.method === "GET") {
    failRandomly();

    const { searchParams } = url;
    if (!searchParams.get("session_id")) throw new Error("Missing session ID");

    return new Response(JSON.stringify(song_list), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  return new Response(JSON.stringify(error404), { 
    status: 404,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
  });
}
```