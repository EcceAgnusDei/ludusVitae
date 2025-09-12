import { Container, Grid } from "./game.js";

document.addEventListener("DOMContentLoaded", function () {
  const game = new Container("game", document.body);

  const gridContainer = new Container("gridcontainer", game.element);

  const grid = new Grid(10, "gird", gridContainer.element);

  game.mount();
  game.waitMounting(gridContainer.mount.bind(gridContainer));
  gridContainer.waitMounting(grid.mount.bind(grid));
  grid.waitMounting(grid.createCells.bind(grid));

  const startButton = document.createElement("button");
  startButton.innerText = "Play";
  startButton.onclick = () => {
    grid.nextState();
    console.log(grid.trackedCells);
  };
  document.body.appendChild(startButton);
});
