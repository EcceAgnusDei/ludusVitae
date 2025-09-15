import { Container, Grid } from "./game.js";

document.addEventListener("DOMContentLoaded", function () {
  const game = new Container("game", document.body);

  const gridContainer = new Container("gridcontainer", game.element);

  const grid = new Grid("gird", gridContainer.element);

  game.mount();
  game.waitMounting(gridContainer.mount.bind(gridContainer));
  gridContainer.waitMounting(grid.mount.bind(grid));
  grid.waitMounting(grid.createCells.bind(grid));

  const startButton = document.createElement("button");
  startButton.innerText = "Play";
  startButton.onclick = (event) => {
    if (event.target.innerText === "Play") {
      event.target.innerText = "Pause";
      grid.play();
    } else {
      event.target.innerText = "Play";
      grid.pause();
    }

    console.log(grid.trackedCells);
  };
  document.body.appendChild(startButton);

  const speedSlider = document.createElement("input");
  speedSlider.setAttribute("type", "range");
  speedSlider.setAttribute("min", "1");
  speedSlider.setAttribute("max", "100");
  speedSlider.setAttribute("value", "1");
  speedSlider.addEventListener("input", () => {
    grid.hundleSpeed(speedSlider.value);
  });
  document.body.appendChild(speedSlider);

  const gridSizeInput = document.createElement("input");
  gridSizeInput.setAttribute("type", "input");
  gridSizeInput.setAttribute("name", "gridsize");
  gridSizeInput.setAttribute("placeholder", "Taille de la grille");
  const gridSizeButton = document.createElement("button");
  gridSizeButton.innerText = "Ok";
  gridSizeButton.onclick = () => {
    if (
      parseInt(gridSizeInput.value) > 0 &&
      parseInt(gridSizeInput.value) < 101
    ) {
      grid.resize(parseInt(gridSizeInput.value));
      gridSizeInput.value = "";
    } else {
      gridSizeInput.value = "";
      alert("Veuillez entrer une valeur valide.");
    }
  };
  const gridSizeContainer = document.createElement("div");
  gridSizeContainer.appendChild(gridSizeInput);
  gridSizeContainer.appendChild(gridSizeButton);
  document.body.appendChild(gridSizeContainer);

  const saveButton = document.createElement("button");
  saveButton.innerText = "Sauvegarder";
  saveButton.onclick = () => {
    grid.saveLocaly();
  };
  document.body.appendChild(saveButton);

  const loadButton = document.createElement("button");
  loadButton.innerText = "Charger";
  loadButton.onclick = () => {
    grid.fetchLocaly();
  };
  document.body.appendChild(loadButton);
});
