import { Container, Grid } from "./game.js";

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
});
