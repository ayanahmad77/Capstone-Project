document.getElementById("startBtn")?.addEventListener("click", () => {
  const year = document.getElementById("yearInput")?.value;
  if (!year) {
    alert("Please enter a year");
    return;
  }
  localStorage.setItem("selectedYear", year);
  window.location.href = "timeline.html";
});

function displayEvents(events) {
  timeline.innerHTML = "";

  events.map(event => {
    const div = document.createElement("div");
    div.className = "event";

    div.innerHTML = `
      <h3>${event.year}</h3>
      <p>${event.text}</p>
    `;

    timeline.appendChild(div);
  });
}

function handleSearch() {
  const year = document.getElementById("yearInput").value;

  if (!year) {
    alert("Please enter a year");
    return;
  }

  fetchEvents().then(events => {
    const filtered = events.filter(e => e.year == year);

    if (filtered.length === 0) {
      timeline.innerHTML = "<p>No events found for this year</p>";
    } else {
      displayEvents(filtered);
    }
  });
}