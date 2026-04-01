const timeline = document.getElementById("timeline");
const loading = document.getElementById("loading");
const year = localStorage.getItem("selectedYear");
const yearDisplay = document.getElementById("yearDisplay");
const searchInput = document.getElementById("searchInput");
const sortBtn = document.getElementById("sortBtn");

yearDisplay.textContent = year;

let eventsData = [];
let asc = true;

async function fetchEvents() {
  try {
    loading.style.display = "block";
    const res = await fetch("https://history.muffinlabs.com/date");
    const data = await res.json();
    loading.style.display = "none";

    eventsData = data.data.Events.filter(e => e.year == year);
    displayEvents(eventsData);
  } catch (err) {
    loading.style.display = "none";
    timeline.innerHTML = "<p>Error fetching data</p>";
  }
}

function displayEvents(events) {
  timeline.innerHTML = "";
  if (events.length === 0) {
    timeline.innerHTML = "<p>No events found for this year</p>";
    return;
  }

  events.map((event, index) => {
    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = `
      <h3>${event.year}</h3>
      <p>${event.text}</p>
      <button onclick="viewEvent(${index})">View Details</button>
      <button onclick="addFavorite(${index})">❤️ Favorite</button>
    `;
    timeline.appendChild(div);
  });
}

function viewEvent(index) {
  localStorage.setItem("selectedEvent", index);
  window.location.href = "event.html";
}

function addFavorite(index) {
  const favs = JSON.parse(localStorage.getItem("favorites")) || [];
  favs.push(eventsData[index]);
  localStorage.setItem("favorites", JSON.stringify(favs));
  alert("Added to favorites!");
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = eventsData.filter(e => e.text.toLowerCase().includes(query));
  displayEvents(filtered);
});

sortBtn.addEventListener("click", () => {
  asc = !asc;
  const sorted = eventsData.sort((a, b) => asc ? a.year - b.year : b.year - a.year);
  displayEvents(sorted);
});

fetchEvents();