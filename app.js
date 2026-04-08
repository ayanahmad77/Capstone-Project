const timeline = document.getElementById("timeline");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");

let eventsData = [];

// ================= FETCH BETTER EVENTS =================
async function loadEvents() {
  const year = document.getElementById("yearInput")?.value || localStorage.getItem("year");

  if (!year) return alert("Enter a year");

  timeline.innerHTML = `
    <div class="event-card">Loading...</div>
    <div class="event-card">Loading...</div>
  `;

  try {
    // Step 1: search pages
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${year}%20history&format=json&origin=*`);
    const data = await res.json();

    const results = data.query.search.slice(0, 8);

    // Step 2: get detailed summaries (with images)
    const detailed = await Promise.all(
      results.map(async (item) => {
        const title = item.title;

        try {
          const pageRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
          const pageData = await pageRes.json();

          return {
            year,
            text: pageData.extract || title,
            img: pageData.thumbnail?.source || "https://picsum.photos/200"
          };
        } catch {
          return {
            year,
            text: title,
            img: "https://picsum.photos/200"
          };
        }
      })
    );

    eventsData = detailed;
    render(eventsData);

  } catch (err) {
    timeline.innerHTML = "<p>Error loading data</p>";
    console.error(err);
  }
}

// ================= RENDER =================
function render(data) {
  timeline.innerHTML = data.map((e, i) => `
    <div class="event-card">
      <img src="${e.img}" class="event-img">
      <div class="event-content">
        <h3>${e.year}</h3>
        <p>${e.text}</p>
        <button onclick="saveFav('${e.text.replace(/'/g, "")}')">❤️ Save</button>
      </div>
    </div>
  `).join('');
}

// ================= FAVORITES =================
function saveFav(text) {
  let fav = JSON.parse(localStorage.getItem("fav") || "[]");

  if (!fav.includes(text)) {
    fav.push(text);
    localStorage.setItem("fav", JSON.stringify(fav));
  }
}

// ================= SEARCH =================
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

if (searchInput) {
  searchInput.oninput = debounce(() => {
    const val = searchInput.value.toLowerCase();

    render(eventsData.filter(e =>
      e.text.toLowerCase().includes(val)
    ));
  }, 300);
}

// ================= SORT =================
if (sortSelect) {
  sortSelect.onchange = () => {
    let sorted = [...eventsData];

    if (sortSelect.value === "asc") {
      sorted.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortSelect.value === "desc") {
      sorted.sort((a, b) => b.text.localeCompare(a.text));
    }

    render(sorted);
  };
}

// ================= AUTO LOAD =================
if (timeline) {
  loadEvents();
}