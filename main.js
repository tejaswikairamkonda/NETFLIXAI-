const API_KEY = "YOUR_TMDB_API_KEY"; // get from https://www.themoviedb.org/settings/api
const BASE_URL = "https://api.themoviedb.org/3";

document.addEventListener("DOMContentLoaded", () => {
  const introScreen = document.getElementById("intro-screen");
  const introVideo = document.getElementById("intro-video");
  const introSound = document.getElementById("intro-sound");
  const app = document.getElementById("app");
  const mainContent = document.getElementById("main-content");

  const searchBtn = document.getElementById("searchBtn");
  const searchInput = document.getElementById("searchInput");

  const homeLink = document.getElementById("home-link");
  const categoriesLink = document.getElementById("categories-link");
  const topStarsLink = document.getElementById("top-stars-link");
  const profileLink = document.getElementById("profile-link");

  // Chatbot
  const chatBtn = document.getElementById("chatBtn");
  const chatPanel = document.getElementById("chatPanel");
  const chatSend = document.getElementById("chatSend");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");

  // Intro animation
  introVideo.play();
  introVideo.addEventListener("play", () => {
    introSound.play().catch(() => console.log("Autoplay blocked"));
  });

  introVideo.addEventListener("ended", () => {
    introScreen.style.display = "none";
    app.style.display = "block";
    loadHome();
  });

  // Home page (load trending movies)
  async function loadHome() {
    const res = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
    const data = await res.json();
    renderMovies(data.results, "Trending Now");
  }

  // Render movie list
  function renderMovies(movies, title) {
    mainContent.innerHTML = `
      <h1 style="text-align:center;margin-bottom:20px;">${title}</h1>
      <div class="movie-grid">
        ${movies
          .map(
            (m) => `
          <div class="movie-card" data-id="${m.id}">
            <img src="https://image.tmdb.org/t/p/w500${m.poster_path}" alt="${m.title}" />
            <p>${m.title}</p>
          </div>`
          )
          .join("")}
      </div>`;
    document.querySelectorAll(".movie-card").forEach((card) => {
      card.addEventListener("click", () => showMovieDetails(card.dataset.id));
    });
  }

  // Movie details
  async function showMovieDetails(id) {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos,credits`);
    const movie = await res.json();
    const trailer = movie.videos.results.find((v) => v.type === "Trailer");

    mainContent.innerHTML = `
      <button onclick="location.reload()" style="margin:10px;">⬅ Back</button>
      <h1>${movie.title}</h1>
      <p><b>Release:</b> ${movie.release_date}</p>
      <p><b>Genre:</b> ${movie.genres.map((g) => g.name).join(", ")}</p>
      <p><b>Cast:</b> ${movie.credits.cast.slice(0, 5).map((a) => a.name).join(", ")}</p>
      <p><b>Overview:</b> ${movie.overview}</p>
      ${
        trailer
          ? `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>`
          : "<p>No trailer available</p>"
      }`;
  }

  // Search
  searchBtn.addEventListener("click", async () => {
    const q = searchInput.value.trim();
    if (!q) return;
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${q}`);
    const data = await res.json();
    renderMovies(data.results, `Results for "${q}"`);
  });

  // Categories
  categoriesLink.addEventListener("click", async () => {
    const genresRes = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);
    const genres = await genresRes.json();
    mainContent.innerHTML = `
      <h1>Select Genre</h1>
      <div class="movie-grid">
        ${genres.genres
          .map(
            (g) => `<div class="movie-card" data-genre="${g.id}">
            <p style="text-align:center;">${g.name}</p></div>`
          )
          .join("")}
      </div>`;
    document.querySelectorAll("[data-genre]").forEach((el) => {
      el.addEventListener("click", async () => {
        const id = el.dataset.genre;
        const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${id}`);
        const data = await res.json();
        renderMovies(data.results, "Genre Results");
      });
    });
  });

  // Top stars
  topStarsLink.addEventListener("click", async () => {
    const res = await fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}`);
    const data = await res.json();
    mainContent.innerHTML = `
      <h1>Top Stars</h1>
      <div class="movie-grid">
        ${data.results
          .map(
            (p) => `<div class="movie-card" data-person="${p.id}">
            <img src="https://image.tmdb.org/t/p/w500${p.profile_path}" />
            <p>${p.name}</p></div>`
          )
          .join("")}
      </div>`;
    document.querySelectorAll("[data-person]").forEach((el) => {
      el.addEventListener("click", async () => {
        const id = el.dataset.person;
        const res = await fetch(`${BASE_URL}/person/${id}?api_key=${API_KEY}&append_to_response=movie_credits`);
        const person = await res.json();
        mainContent.innerHTML = `
          <button onclick="location.reload()" style="margin:10px;">⬅ Back</button>
          <h1>${person.name}</h1>
          <p><b>Known For:</b> ${person.known_for_department}</p>
          <p><b>Movies:</b></p>
          <div class="movie-grid">
          ${person.movie_credits.cast
            .slice(0, 10)
            .map(
              (m) => `<div class="movie-card"><img src="https://image.tmdb.org/t/p/w500${m.poster_path}" /><p>${m.title}</p></div>`
            )
            .join("")}
          </div>`;
      });
    });
  });

  // Profile
  profileLink.addEventListener("click", () => {
    mainContent.innerHTML = `
      <h1>User Profile</h1>
      <p>Name: John Doe</p>
      <p>Membership: Premium</p>
      <p>Email: johndoe@gmail.com</p>
      <p>Watchlist: Coming soon...</p>`;
  });

  // Chatbot
  chatBtn.addEventListener("click", () => {
    chatPanel.style.display = chatPanel.style.display === "none" ? "block" : "none";
  });

  chatSend.addEventListener("click", () => {
    const msg = chatInput.value.trim();
    if (!msg) return;
    chatMessages.innerHTML += `<p>🧑 ${msg}</p><p>🤖 NetflixAI: I'm learning to help you with movie suggestions!</p>`;
    chatInput.value = "";
  });
});
