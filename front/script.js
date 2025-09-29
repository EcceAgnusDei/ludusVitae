import { Grid } from "./game.js";

document.addEventListener("DOMContentLoaded", function () {
  const gridContainer = document.getElementById("gridcontainer");
  const grid = new Grid("grid", gridContainer);
  grid.mount();
  grid.waitMounting(grid.createCells.bind(grid));

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

  const gridSizeInput = document.getElementById("gridsizeinput");
  const gridSizeButton = document.getElementById("gridsizebutton");
  gridSizeButton.onclick = () => {
    if (
      parseInt(gridSizeInput.value) > 0 &&
      parseInt(gridSizeInput.value) < 101
    ) {
      const cellsToClick = grid.getAliveCellsCoords();
      grid.resize(parseInt(gridSizeInput.value), cellsToClick);
      gridSizeInput.value = "";
    } else {
      gridSizeInput.value = "";
      alert("Veuillez entrer une valeur valide.");
    }
  };

  const cellSizeInput = document.getElementById("cellsizeinput");
  const cellSizeButton = document.getElementById("cellsizebutton");
  cellSizeButton.onclick = () => {
    if (
      parseInt(cellSizeInput.value) > 1 &&
      parseInt(cellSizeInput.value) < 71
    ) {
      grid.resize(cellSizeInput.value + "px", grid.getAliveCellsCoords());
      cellSizeInput.value = "";
    } else {
      cellSizeInput.value = "";
      alert("Veuillez entrer une valeur valide.");
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

  const loginForm = document.getElementById("loginform");
  const emailInput = document.getElementById("loginemail");
  const passwordInput = document.getElementById("loginpassword");
  loginForm.onsubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
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
        const response = await fetch("http://localhost:3000/signin", {
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
