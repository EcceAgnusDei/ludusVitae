import { Grid } from "./game.js";

function likeButton(grid, user) {
  let state = grid.likes.includes(user.user_id + "") ? "unlike" : "like";
  const button = document.createElement("button");
  button.setAttribute("class", "loginonly");
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
      likesContainer.appendChild(likeButton(grid, result.data.user));
      const likesText = document.createElement("div");
      document.setAttribute("class", "loginonly");
      likesText.innerText = "likes";
      likesContainer.appendChild(likesText);
    });
  } catch (error) {
    console.log(
      "Erreur lors de la recherche des grilles: ",
      error.message,
      error.stack
    );
  }
}

function handleLogin() {
  const loginForm = document.getElementById("loginform");
  loginForm.setAttribute("class", "logoutonly");

  const logoutButton = document.getElementById("logoutbutton");
  logoutButton.setAttribute("class", "loginonly");
  logoutButton.onclick = async () => {
    const result = await logout();
    console.log(result);
    if (result.success) {
      changeState("logout");
    }
  };

  const loadUserGridsButton = document.getElementById("loadusergridbutton");
  loadUserGridsButton.setAttribute("class", "loginonly");

  const saveButton = document.getElementById("savebutton");
  saveButton.setAttribute("class", "loginonly");

  let userId;
  changeState("logout");

  function changeState(state) {
    const logoutOnly = document.getElementsByClassName("logoutonly");
    const loginOnly = document.getElementsByClassName("loginonly");
    for (let element of logoutOnly) {
      console.log("logout only");
      if (state === "logout") {
        console.log("show", element);
        element.style.display = "block";
      } else {
        console.log("hide", element);
        element.style.display = "none";
      }
    }
    for (let element of loginOnly) {
      console.log("login only");
      if (state === "login") {
        element.style.display = "block";
      } else {
        element.style.display = "none";
      }
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
        userId = result.data.userId;
      }
      console.log(result.message);
    } catch (error) {
      console.log(
        "Erreur lors de l'authentification de démarrage: ",
        error.message,
        error.stack
      );
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
          userId = result.data.userId;
        }

        console.log(result);
      } catch (error) {
        console.log("Erreur lors de l'envoie du formulaire: ", error.message);
      }
    };
  })();

  (function handleSignin() {
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
            userId = result.login.data.userId;
          }
        } catch (error) {
          console.log("Erreur lors de l'envoie du formulaire: ", error.message);
          alert("Une erreur est survenue");
        }
      }
    };
  })();

  (function handleLoad() {
    const loadAllButton = document.getElementById("loadallbutton");
    loadAllButton.onclick = () => fetchGrids("grids/");
    loadUserGridsButton.onclick = () => fetchGrids("mygrids/");

    async function fetchGrids(path) {
      try {
        const response = await fetch(`https://localhost:3000/${path}`, {
          method: "GET",
          credentials: "include",
        });
        const result = await response.json();
        result.data.grids.forEach((grid, index) => {
          console.log(grid);
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
          fetchedGrid.loadGrid(grid.alive_cells, grid.grid_size);
          gridContainer.appendChild(likesContainer);
          likesContainer.style.display = "flex";
          likesContainer.appendChild(likesNumber);
          likesNumber.innerText = grid.likes.length;
          if (result.data.user) {
            likesContainer.appendChild(likeButton(grid, result.data.user)); ///!!! voir si on peut pas gérer la vérification coté client
          } else {
            const likesText = document.createElement("div");
            likesText.innerText = "likes";
            likesContainer.appendChild(likesText);
          }
        });
      } catch (error) {
        console.log(
          "Erreur lors du chargement des grilles: ",
          error.message,
          error.stack
        );
      }
    }
  })();
}

function handleGame() {
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
      const localGrid = JSON.parse(localStorage.getItem("grid"));
      grid.loadGrid(localGrid.aliveCells, localGrid.gridSize, true);
      alert("Grille chargée");
    } catch {
      alert("Impossible de charger la grille");
    }
  }

  (function handlePlay() {
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

  (function handleSpeed() {
    const speedSlider = document.getElementById("speedslider");
    speedSlider.addEventListener("input", () => {
      grid.handleSpeed(speedSlider.value);
    });
  })();

  (function handleGridSize() {
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

  (function handleCellSize() {
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

  (function handleSave() {
    const saveButton = document.getElementById("savebutton");
    saveButton.onclick = () => {
      saveInDb({
        aliveCells: grid.getAliveCellsCoords(),
        gridSize: grid.gridSize,
      });
    };
  })();

  (function handleSaveLocaly() {
    const saveButton = document.getElementById("savelocalybutton");
    saveButton.onclick = () => {
      saveLocaly({
        aliveCells: grid.getAliveCellsCoords(),
        gridSize: grid.gridSize,
      });
    };
  })();

  (function handleLoad() {
    const loadButton = document.getElementById("loadbutton");
    loadButton.onclick = () => {
      loadLocaly();
    };
  })();
}

document.addEventListener("DOMContentLoaded", function () {
  handleLogin();
  handleGame();
});
