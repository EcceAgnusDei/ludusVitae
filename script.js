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
});
