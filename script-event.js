const eventDetails = document.getElementById("eventDetails");
const eventIndex = localStorage.getItem("selectedEvent");
const eventsData = JSON.parse(localStorage.getItem("favorites")) || [];

if (eventsData[eventIndex]) {
  const e = eventsData[eventIndex];
  eventDetails.innerHTML = `
    <h2>${e.year}</h2>
    <p>${e.text}</p>
    <button onclick="window.history.back()">Back</button>
  `;
} else {
  eventDetails.innerHTML = "<p>Event not found</p>";
}