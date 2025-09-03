const trackedCells = [];

function isAlive(cell) {
  return cell.style.backgroundColor === "black";
}

/*function handleNeighbourNumber(cell, isDying = false) {
  for (
    let x = parseInt(cell.getAttribute("x")) - 1;
    x <= parseInt(cell.getAttribute("x")) + 1;
    x++
  ) {
    for (
      let y = parseInt(cell.getAttribute("y")) - 1;
      y <= parseInt(cell.getAttribute("y")) + 1;
      y++
    ) {
      if (!(x == cell.getAttribute("x") && y == cell.getAttribute("y"))) {
        const neighbour = document.querySelector(`[x="${x}"][y="${y}"]`);
        if (neighbour) {
          const currentNb = parseInt(
            neighbour.getAttribute("nbneighbour").replace("nb", "")
          );
          if (isDying) {
            neighbour.setAttribute("nbneighbour", `nb${currentNb - 1}`);
          } else {
            neighbour.setAttribute("nbneighbour", `nb${currentNb + 1}`);
          }
        }
      }
    }
  }
}*/

function pushCell(x, y, isDying) {
  const cellIndex = trackedCells.findIndex((cell) => {
    return cell.x == x && cell.y == y;
  });
  console.log(cellIndex, x, y);
  if (isDying) {
    trackedCells[cellIndex].isAlive = false;
    for (let nbx = x - 1; nbx <= x + 1; nbx++) {
      for (let nby = y - 1; nby <= y + 1; nby++) {
        if (nbx != x || nby != y) {
          const nbIndex = trackedCells.findIndex((cell) => {
            return cell.x == nbx && cell.y == nby;
          });
          trackedCells[nbIndex].neighbours--;
          if (
            !trackedCells[nbIndex].isAlive &&
            trackedCells[nbIndex].neighbours == 0
          ) {
            trackedCells.splice(nbIndex, 1);
          }
        }
      }
    }
    if (trackedCells[cellIndex].neighbours == 0) {
      trackedCells.splice(cellIndex, 1);
    }
  } else {
    if (cellIndex == -1) {
      trackedCells.push({ x, y, neighbours: 0, isAlive: true });
    } else {
      trackedCells[cellIndex].isAlive = true;
    }
    for (let nbx = x - 1; nbx <= x + 1; nbx++) {
      for (let nby = y - 1; nby <= y + 1; nby++) {
        if (nbx != x || nby != y) {
          const nbIndex = trackedCells.findIndex((cell) => {
            return cell.x == nbx && cell.y == nby;
          });
          if (nbIndex == -1) {
            trackedCells.push({
              x: nbx,
              y: nby,
              neighbours: 1,
              isAlive: false,
            });
          } else {
            trackedCells[nbIndex].neighbours++;
          }
        }
      }
    }
  }
  console.log(trackedCells);
}

function start(grid, interval) {
  return setInterval(() => {}, interval);
}

function Cell(x, y, cellSize = "20px") {
  const cell = document.createElement("div");
  cell.style.border = "1px solid black";
  cell.style.width = cellSize;
  cell.style.height = cellSize;
  cell.style.backgroundColor = "white";
  cell.setAttribute("x", `${x}`);
  cell.setAttribute("y", `${y}`);
  //cell.setAttribute("alive", "false");
  //cell.setAttribute("nbneighbour", "nb0");
  //cell.setAttribute("willbealive", "false");

  cell.style.color = "green";

  /*const lifeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.getAttribute("alive") === "true") {
        mutation.target.style.backgroundColor = "black";
        handleNeighbourNumber(mutation.target);
      } else {
        mutation.target.style.backgroundColor = "white";
        handleNeighbourNumber(mutation.target, true);
      }
    });
  });*/
  /*const neighbourObserver = new MutationObserver((neighbourMutations) => {
    neighbourMutations.forEach((mutation) => {
      mutation.target.innerText = mutation.target
        .getAttribute("nbneighbour")
        .replace("nb", "");
      const nbNeighbour = parseInt(
        mutation.target.getAttribute("nbneighbour").replace("nb", "")
      );

      if (isAlive(mutation.target)) {
        if (nbNeighbour < 2 || nbNeighbour > 3) {
          mutation.target.setAttribute("willbealive", "false");
        } else {
          mutation.target.setAttribute("willbealive", "true");
        }
      } else if (nbNeighbour === 3) {
        mutation.target.setAttribute("willbealive", "true");
      } else {
        mutation.target.setAttribute("willbealive", "false");
      }
    });
  });*/

  /*lifeObserver.observe(cell, {
    attributes: true,
    attributeFilter: ["alive"],
  });*/
  /*neighbourObserver.observe(cell, {
    attributes: true,
    attributeFilter: ["nbneighbour"],
  });*/
  cell.onclick = (cell) => {
    if (isAlive(cell.target)) {
      cell.target.style.backgroundColor = "white";
      pushCell(
        parseInt(cell.target.getAttribute("x")),
        parseInt(cell.target.getAttribute("y")),
        true
      );
    } else {
      cell.target.style.backgroundColor = "black";
      pushCell(
        parseInt(cell.target.getAttribute("x")),
        parseInt(cell.target.getAttribute("y")),
        false
      );
    }
  };

  return cell;
}

function Grid(gridSize, cellSize) {
  const grid = document.createElement("div");
  grid.setAttribute("id", "grid");
  grid.style.width = "fit-content";

  for (let y = 1; y <= gridSize; y++) {
    const line = document.createElement("div");
    line.style.display = "flex";
    for (let x = 1; x <= gridSize; x++) {
      line.appendChild(Cell(x, y, cellSize));
    }
    grid.appendChild(line);
  }

  return grid;
}

function Game() {
  const game = document.createElement("div");
  game.setAttribute("id", "game");

  let cellSize = "20px";
  let gridSize = 10;
  let grid = Grid(gridSize, cellSize);

  let generationInterval;
  const interval = 3000;

  const speedSlider = document.createElement("input");
  speedSlider.setAttribute("type", "range");
  speedSlider.setAttribute("min", "1");
  speedSlider.setAttribute("max", "100");
  speedSlider.setAttribute("value", "1");
  speedSlider.addEventListener("input", () => {
    clearInterval(generationInterval);

    if (startButton.innerText === "Pause") {
      generationInterval = start(grid, interval / speedSlider.value);
    }
  });

  const startButton = document.createElement("button");
  startButton.innerText = "Play";
  startButton.onclick = (event) => {
    if (event.target.innerText === "Play") {
      generationInterval = start(grid, interval / speedSlider.value);
      event.target.innerText = "Pause";
    } else {
      clearInterval(generationInterval);
      event.target.innerText = "Play";
    }
  };

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
      gridContainer.removeChild(grid);
      gridSize = parseInt(gridSizeInput.value);
      grid = Grid(gridSize, cellSize);
      gridContainer.appendChild(grid);
      gridSizeInput.value = "";
    } else {
      gridSizeInput.value = "";
      alert("Veuillez entrer une valeur valide.");
    }
  };

  const gridSizeContainer = document.createElement("div");
  gridSizeContainer.appendChild(gridSizeInput);
  gridSizeContainer.appendChild(gridSizeButton);

  const cellSizeInput = document.createElement("input");
  cellSizeInput.setAttribute("type", "input");
  cellSizeInput.setAttribute("name", "cellSize");
  cellSizeInput.setAttribute("placeholder", "Taille d'une cellule");

  const cellSizeButton = document.createElement("button");
  cellSizeButton.innerText = "Ok";
  cellSizeButton.onclick = () => {
    if (
      parseInt(cellSizeInput.value) > 1 &&
      parseInt(cellSizeInput.value) < 71
    ) {
      cellSize = parseInt(cellSizeInput.value) + "px";
      gridContainer.removeChild(grid);
      grid = Grid(gridSize, cellSize);
      gridContainer.appendChild(grid);
      cellSizeInput.value = "";
    } else {
      cellSizeInput.value = "";
      alert("Veuillez entrer une valeur valide.");
    }
  };

  const cellSizeContainer = document.createElement("div");
  cellSizeContainer.appendChild(cellSizeInput);
  cellSizeContainer.appendChild(cellSizeButton);

  const gridContainer = document.createElement("div");
  gridContainer.setAttribute("id", "gridcontainer");
  gridContainer.style.overflow = "auto";
  gridContainer.appendChild(grid);

  game.appendChild(gridContainer);
  game.appendChild(startButton);
  game.appendChild(speedSlider);
  game.appendChild(gridSizeContainer);
  game.appendChild(cellSizeContainer);

  return game;
}

export default Game();
