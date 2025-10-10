import { Grid } from "./game.js";

function likeButton(grid, user) {
  let state = grid.likes.includes(user.user_id + "") ? "unlike" : "like";
  const button = document.createElement("button");
  button.innerText = state;
  async function like() {
    const response = await fetch(
      `https://localhost:3000/like/${grid.grid_id}`,
      {
        method: "PUT",
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur HTTP : ${errorData.error || response.status}`);
    }

    const result = await response.json();
    console.log(result.data);
    state = "unlike";
  }
  async function unlike() {
    const response = await fetch(
      `https://localhost:3000/unlike/${grid.grid_id}`,
      {
        method: "PUT",
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur HTTP : ${errorData.error || response.status}`);
    }

    const result = await response.json();
    console.log(result.data);
    state = "like";
  }

  button.onclick = async () => {
    if (state === "like") {
      try {
        await like();
      } catch (error) {
        console.log("Erreur lors du like:", error.message);
      }
    } else if (state === "unlike") {
      try {
        await unlike();
      } catch (error) {
        console.log("Erreur lors du unlike:", error.message);
      }
    }
    button.innerHTML = state;
  };
  return button;
}

async function fetchGrids(path) {
  try {
    const response = await fetch(`https://localhost:3000/${path}`, {
      method: "GET",
      credentials: "include",
    });
    const result = await response.json();
    result.data.grids.forEach((grid, index) => {
      const gridContainer = document.createElement("div");
      const likesContainer = document.createElement("div");
      const likesNumber = document.createElement("div");
      document.getElementById("gridsdisplayer").appendChild(gridContainer);
      const fetchedGrid = new Grid(
        false,
        gridContainer,
        `displayedgrid${index}`
      );
      fetchedGrid.mount();
      fetchedGrid.loadGrid(grid.alive_cells);
      gridContainer.appendChild(likesContainer);
      likesContainer.style.display = "flex";
      likesContainer.appendChild(likesNumber);
      likesNumber.innerText = grid.likes.length;
      if (result.data.user) {
        likesContainer.appendChild(likeButton(grid, result.data.user));
      } else {
        const likesText = document.createElement("div");
        likesText.innerText = "likes";
        likesContainer.appendChild(likesText);
      }
    });
  } catch (error) {
    console.log(
      "Erreur lors de la recherche des grilles: ",
      error.message,
      error.stack
    );
  }
}

function hundleLogin() {
  const loginForm = document.getElementById("loginform");
  const logoutButton = document.getElementById("logoutbutton");
  logoutButton.onclick = async () => {
    const result = await logout();
    console.log(result);
    if (result.success) {
      changeState("logout");
    }
  };

  function changeState(state) {
    if (state === "login") {
      loginForm.style.display = "none";
      logoutButton.style.display = "block";
    } else {
      loginForm.style.display = "block";
      logoutButton.style.display = "none";
    }
  }

  async function logout() {
    const resp = await fetch(`https://localhost:3000/logout`, {
      method: "POST",
      credentials: "include",
    });
    const result = await resp.json();
    return result;
  }

  (async function authentifyWithSessionId() {
    try {
      const resp = await fetch("https://localhost:3000/login", {
        method: "POST",
        credentials: "include",
      });
      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(`Erreur HTTP : ${errorData.error || resp.status}`);
      }
      const result = await resp.json();
      if (result.success) {
        changeState("login");
        return result.data;
      } else {
        return undefined;
      }
    } catch (error) {
      console.log(
        "Erreur lors de l'authentification de démarrage: ",
        error.message,
        error.stack
      );
      return undefined;
    }
  })();

  (function handleLoginForm() {
    const emailInput = document.getElementById("loginemail");
    const passwordInput = document.getElementById("loginpassword");

    loginForm.onsubmit = async (event) => {
      event.preventDefault();
      try {
        const response = await fetch("https://localhost:3000/login", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userEmail: emailInput.value,
            userPassword: passwordInput.value,
          }),
        });
        const result = await response.json();

        if (result.success) {
          changeState("login");
        }

        console.log(result);
      } catch (error) {
        console.log("Erreur lors de l'envoie du formulaire: ", error.message);
      }
    };
  })();

  (function hundleSignin() {
    const signinForm = document.getElementById("signinform");
    const signinEmailInput = document.getElementById("signinemail");
    const signinPasswordInput = document.getElementById("signinpassword");
    const signinNameInput = document.getElementById("signinname");
    signinForm.onsubmit = async (event) => {
      event.preventDefault();
      if (signinPasswordInput.value.length < 7) {
        alert("Mot de passe trop court");
      } else {
        try {
          const response = await fetch("https://localhost:3000/signin", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail: signinEmailInput.value,
              userPassword: signinPasswordInput.value,
              userName: signinNameInput.value,
            }),
          });
          const result = await response.json();
          alert(result.signin.message);
          if (result.login.success) {
            changeState("login");
          }
        } catch (error) {
          console.log("Erreur lors de l'envoie du formulaire: ", error.message);
          alert("Une erreur est survenue");
        }
      }
    };
  })();
}

function hundleGame() {
  const gridContainer = document.getElementById("gridcontainer");
  const grid = new Grid(true, gridContainer, "gamegrid");
  grid.mount();

  async function saveInDb(data) {
    try {
      const response = await fetch(`https://localhost:3000/post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erreur HTTP : ${errorData.error || response.status}`);
      }

      const result = await response.json();
      console.log("Données sauvegardées avec succés : ", result.data);
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  }

  async function saveLocaly(data) {
    try {
      localStorage.setItem("grid", JSON.stringify(data));
      alert("Grille enregistrée");
    } catch {
      alert("Impossible d'enregistrer");
    }
  }

  async function loadLocaly() {
    try {
      grid.loadGrid(JSON.parse(localStorage.getItem("grid")), 5, true);
      alert("Grille chargée");
    } catch {
      alert("Impossible de charger la grille");
    }
  }

  (function hundlePlay() {
    const playButton = document.getElementById("playbutton");
    playButton.onclick = (event) => {
      if (event.target.innerText === "Play") {
        event.target.innerText = "Pause";
        grid.play();
      } else {
        event.target.innerText = "Play";
        grid.pause();
      }
    };
  })();

  (function hundleSpeed() {
    const speedSlider = document.getElementById("speedslider");
    speedSlider.addEventListener("input", () => {
      grid.handleSpeed(speedSlider.value);
    });
  })();

  (function hundleGridSize() {
    const gridSizeInputX = document.getElementById("gridsizeinputx");
    gridSizeInputX.value = `${grid.gridSize.x}`;
    const gridSizeInputY = document.getElementById("gridsizeinputy");
    gridSizeInputY.value = `${grid.gridSize.y}`;
    const gridSizeButton = document.getElementById("gridsizebutton");
    gridSizeButton.onclick = () => {
      if (
        parseInt(gridSizeInputX.value) > 0 &&
        parseInt(gridSizeInputX.value) < 101 &&
        parseInt(gridSizeInputY.value) > 0 &&
        parseInt(gridSizeInputY.value) < 101
      ) {
        const x = parseInt(gridSizeInputX.value);
        const y = parseInt(gridSizeInputY.value);
        const cellsToClick = grid.getAliveCellsCoords();
        grid.resize({
          x,
          y,
        });
        grid.toggleCells(cellsToClick, true);
        gridSizeInputX.value = `${x}`;
        gridSizeInputY.value = `${y}`;
      } else {
        alert("Entrez une valeur entre 1 et 100");
      }
    };
  })();

  (function hundleCellSize() {
    const cellSizeInput = document.getElementById("cellsizeinput");
    const cellSizeButton = document.getElementById("cellsizebutton");
    cellSizeButton.onclick = () => {
      if (
        parseInt(cellSizeInput.value) > 1 &&
        parseInt(cellSizeInput.value) < 71
      ) {
        const cellsToClick = grid.getAliveCellsCoords();
        grid.resize(cellSizeInput.value + "px");
        grid.toggleCells(cellsToClick, true);
        cellSizeInput.value = "";
      } else {
        cellSizeInput.value = "";
        alert("Entrez une valeur entre 0 et 70");
      }
    };
  })();

  (function hundleSave() {
    const saveButton = document.getElementById("savebutton");
    saveButton.onclick = () => {
      saveInDb(grid.getAliveCellsCoords());
    };
  })();

  (function hundleSaveLocaly() {
    const saveButton = document.getElementById("savelocalybutton");
    saveButton.onclick = () => {
      saveLocaly(grid.getAliveCellsCoords());
    };
  })();

  (function hundleLoad() {
    const loadButton = document.getElementById("loadbutton");
    loadButton.onclick = () => {
      loadLocaly();
    };
  })();
}

document.addEventListener("DOMContentLoaded", function () {
  hundleLogin();
  hundleGame();

  const loadAllButton = document.getElementById("loadallbutton");
  loadAllButton.onclick = () => fetchGrids("grids/");
  const loadUserGridsButton = document.getElementById("loadusergridbutton");
  loadUserGridsButton.onclick = () => fetchGrids("mygrids/");
});
