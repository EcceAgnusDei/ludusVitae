import { Grid } from "./game.js";

async function fetchGrids(path) {
  try {
    const response = await fetch(`https://localhost:3000/${path}`, {
      method: "GET",
      credentials: "include",
    });
    const result = await response.json();
    result.data.forEach((grid, index) => {
      const gridContainer = document.createElement("div");
      document.getElementById("gridsdisplayer").appendChild(gridContainer);
      const fetchedGrid = new Grid(
        false,
        gridContainer,
        `displayedgrid${index}`
      );
      fetchedGrid.mount();
      fetchedGrid.loadGrid(grid.alive_cells); ////!!!! agrandir grille au cas où
      fetchedGrid.setLikes(grid.likes);
    });
  } catch (error) {
    console.log(
      "Erreur lors de la recherche des grilles: ",
      error.message,
      error.stack
    );
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const gridContainer = document.getElementById("gridcontainer");
  const grid = new Grid(true, gridContainer, "gamegrid");
  grid.mount();

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

  const speedSlider = document.getElementById("speedslider");
  speedSlider.addEventListener("input", () => {
    grid.handleSpeed(speedSlider.value);
  });

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

  const saveButton = document.getElementById("savebutton");
  saveButton.onclick = () => {
    grid.saveInDb();
  };

  const loadButton = document.getElementById("loadbutton");
  loadButton.onclick = () => {
    grid.fetch(2);
  };

  const loadAllButton = document.getElementById("loadallbutton");
  loadAllButton.onclick = () => fetchGrids("grids/");

  const loadUserGridsButton = document.getElementById("loadusergridbutton");
  loadUserGridsButton.onclick = () => fetchGrids("mygrids/");

  const loginForm = document.getElementById("loginform");
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
      console.log(result);
    } catch (error) {
      console.log("Erreur lors de l'envoie du formulaire: ", error.message);
    }
  };

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
        console.log(result);
      } catch (error) {
        console.log("Erreur lors de l'envoie du formulaire: ", error.message);
      }
    }
  };
});
