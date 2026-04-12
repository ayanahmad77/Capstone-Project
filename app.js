// ================= THEME (FULLY FIXED) =================

// APPLY SAVED THEME
const isSavedLight = localStorage.getItem("theme") === "true";

if (isSavedLight) {
  document.body.classList.add("light");
}

// APPLY ICON AFTER LOAD
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("button[onclick='toggleTheme()']")
    .forEach(btn => btn.textContent = isSavedLight ? "☀️" : "🌙");
});

// TOGGLE THEME
function toggleTheme() {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  localStorage.setItem("theme", isLight);

  document.querySelectorAll("button[onclick='toggleTheme()']")
    .forEach(btn => btn.textContent = isLight ? "☀️" : "🌙");
}


// ================= ELEMENTS =================
const timeline = document.getElementById("timeline");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const favContainer = document.getElementById("favorites");
const yearInput = document.getElementById("yearInput");

let eventsData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 4;


// ================= AUTO FILL YEAR =================
if (yearInput && localStorage.getItem("year")) {
  yearInput.value = localStorage.getItem("year");
}


// ================= FETCH EVENTS =================
async function loadEvents() {
  const year = yearInput.value;
  if (!year) return alert("Enter a year");

  timeline.innerHTML = `<p>Loading...</p>`;

  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${year}&format=json&origin=*`);
    const data = await res.json();

    const results = data.query.search.slice(0, 8);

    const detailed = await Promise.all(
      results.map(async (item) => {
        const page = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${item.title}`);
        const info = await page.json();

        return {
          year,
          text: info.extract || item.title,
          img: info.thumbnail?.source || "https://picsum.photos/200"
        };
      })
    );

    currentPage = 1;
    eventsData = detailed;
    filteredData = detailed;

    render(filteredData);

  } catch {
    timeline.innerHTML = "<p>Error loading data</p>";
  }
}


// ================= RENDER =================
function render(data) {
  const start = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(start, start + itemsPerPage);

  timeline.innerHTML = paginatedData.map(e => `
    <div class="event-card">
      <img src="${e.img}">
      <div class="event-content">
        <h3>${e.year}</h3>
        <p>${e.text}</p>

        <button onclick="toggleFav('${e.text.replace(/'/g,"")}')">
          ${JSON.parse(localStorage.getItem("fav") || "[]").includes(e.text) ? "💖" : "🤍"}
        </button>
      </div>
    </div>
  `).join("");

  renderPagination(data.length);
}


// ================= FAVORITES =================
function toggleFav(text) {
  let fav = JSON.parse(localStorage.getItem("fav") || "[]");

  if (fav.includes(text)) {
    fav = fav.filter(f => f !== text);
  } else {
    fav.push(text);
  }

  localStorage.setItem("fav", JSON.stringify(fav));

  render(filteredData);
}


// ================= SHOW FAVORITES PAGE =================
if (favContainer) {
  const fav = JSON.parse(localStorage.getItem("fav") || "[]");

  favContainer.innerHTML = fav.length
    ? fav.map(f => `<div class="event-card"><p>${f}</p></div>`).join("")
    : "<p>No favorites yet</p>";
}


// ================= SEARCH (Debounce) =================
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

if (searchInput) {
  searchInput.oninput = debounce(() => {
    const val = searchInput.value.toLowerCase();

    filteredData = eventsData.filter(e =>
      e.text.toLowerCase().includes(val)
    );

    currentPage = 1;
    render(filteredData);
  }, 300);
}


// ================= SORT =================
if (sortSelect) {
  sortSelect.onchange = () => {
    let sorted = [...filteredData];

    if (sortSelect.value === "asc") {
      sorted.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortSelect.value === "desc") {
      sorted.sort((a, b) => b.text.localeCompare(a.text));
    }

    filteredData = sorted;
    currentPage = 1;
    render(filteredData);
  };
}


// ================= PAGINATION =================
function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  let buttons = `<div style="margin-top:20px;">`;

  for (let i = 1; i <= totalPages; i++) {
    buttons += `
      <button onclick="changePage(${i})"
        style="margin:5px; ${i === currentPage ? 'background:#6366f1;' : ''}">
        ${i}
      </button>`;
  }

  buttons += `</div>`;

  timeline.innerHTML += buttons;
}

function changePage(page) {
  currentPage = page;
  render(filteredData);
}