/**
 * submitForm calls the /login endpoint and saves the session_id into
 * localStorage or sessionStorage.
 */
function submitForm() {
  event.preventDefault();
  const txtEmail = document.getElementById("email");
  const txtPassword = document.getElementById("password");

  const user = {
    email: txtEmail.value,
    password: txtPassword.value
  };

  window.localStorage.setItem("user", JSON.stringify(user));
  getToken();
}


function getToken() {
  const xhr = new XMLHttpRequest();

  xhr.open("POST", "https://songs.vallauri-unofficial.workers.dev/login", true);

  xhr.onreadystatechange = () => handleReadyStateChange(xhr,
    () => {
      const { session_id } = JSON.parse(xhr.responseText);

      window.localStorage.setItem("token", session_id);
      requestSongs();
    }, handleError);

  xhr.onerror = () => {
    handleError(xhr);
  }

  xhr.send(window.localStorage.getItem("user"));
}

/**
 * requestSongs calls the /songs endpoint using the session_id from
 * localStorage or sessionStorage.
 * @return The list of songs, or null
 */
function requestSongs() {
  const token = window.localStorage.getItem("token");
  const xhr = new XMLHttpRequest();
  xhr.open("GET",
    `https://songs.vallauri-unofficial.workers.dev/songs?session_id=${token}`,
    true);

  xhr.onreadystatechange = () => handleReadyStateChange(xhr,
    () => {
      const { responseText } = xhr;

      showSongs(responseText);
    }, handleError)

  xhr.send();
}

/**
 * showSongs takes an array of songs and dinamically shows it to the
 * user
 * @param songs The list of songs to show
 */
function showSongs(json_songs) {
  const songs = JSON.parse(json_songs);

  if (songs === null || songs.length === 0) {
    console.error("there are no songs");
    return;
  }

  window.location = "./pagina.html";

  console.log("dopo ");

  const table = createTable(songs);

  document.getElementById("songs_table_container")
    .append(table);
}


function createTable(songs) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  let tr = document.createElement("tr");

  for (const label in songs[0]) {
    const th = document.createElement("th");
    th.innerText = label;
    tr.append(th);
  }
  thead.append(tr);

  table.append(thead);

  for (const { name, author, genre, tags } of songs) {
    tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${name}</td>
      <td>${author}</td>
      <td>${genre}</td>
      <td>${tags.join(" - ")}</td>
    `

    tbody.append(tr);
  }

  table.append(tbody);

  return table;
}


function handleReadyStateChange(xhr, successFn, errorFn) {
  if (xhr.readyState == 4 && xhr.status == 200) {
    successFn();
  }
  else if (xhr.readyState == 4 && xhr.status != 200) {
    errorFn(xhr);
  }
}


function handleError({ status, responseText }) {
  console.error("status code: " + status);
  console.error(responseText);
}