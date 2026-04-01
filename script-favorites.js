const favoritesList = document.getElementById("favoritesList");
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function displayFavorites() {
  favoritesList.innerHTML = "";
  if (favorites.length === 0) {
    favoritesList.innerHTML = "<p>No favorites yet.</p>";
    return;
  }

  favorites.map((event, index) => {
    const div = document.createElement("div");
    div.className = "event";
    div.innerHTML = `
      <h3>${event.year}</h3>
      <p>${event.text}</p>
      <button onclick="removeFavorite(${index})">Remove</button>
    `;
    favoritesList.appendChild(div);
  });
}

function removeFavorite(index) {
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
}

displayFavorites();