let trackedCells = [];
//let isPlaying = false; //isPlaying est inaccessible au bouton start
//transformer la fonction start en objet

function isAlive(cell) {
  return cell.style.backgroundColor === "black";
}

function cellIndex(cellCoord) {
  return trackedCells.findIndex((trackedCell) => {
    return trackedCell.x == cellCoord.x && trackedCell.y == cellCoord.y;
  });
}

function handleLife(cellCoord, isDying) {
  if (
    trackedCells.findIndex((trackedCell) => {
      return cellCoord.x == trackedCell.x && cellCoord.y == trackedCell.y;
    }) == -1
  ) {
    trackedCells.push({
      x: cellCoord.x,
      y: cellCoord.y,
      neighbours: [],
      isAlive: true,
      willBeAlive: false,
    });
    handleLife(cellCoord, false);
  } else {
    if (isDying) {
      trackedCells.forEach((trackedCell) => {
        const cellIndexInNbs = trackedCell.neighbours.findIndex((nb) => {
          return cellCoord.x == nb.x && cellCoord.y == nb.y;
        });
        if (cellIndexInNbs != -1) {
          trackedCell.neighbours.splice(cellIndexInNbs, 1);
        }
      });
      document.querySelector(
        `[x="${cellCoord.x}"][y="${cellCoord.y}"]`
      ).style.backgroundColor = "white";
    } else {
      trackedCells[cellIndex(cellCoord)].isAlive = true;
      for (let x = cellCoord.x - 1; x <= cellCoord.x + 1; x++) {
        for (let y = cellCoord.y - 1; y <= cellCoord.y + 1; y++) {
          if (x != cellCoord.x || y != cellCoord.y) {
            const index = trackedCells.findIndex((trackedCell) => {
              return x == trackedCell.x && y == trackedCell.y;
            });
            if (index == -1) {
              trackedCells.push({
                x,
                y,
                neighbours: [{ x: cellCoord.x, y: cellCoord.y }],
                isAlive: false,
                willBeAlive: false,
              });
            } else {
              trackedCells[index].neighbours.push(cellCoord);
            }
          }
        }
      }
      document.querySelector(
        `[x="${cellCoord.x}"][y="${cellCoord.y}"]`
      ).style.backgroundColor = "black";
    }
  }
}

class Runner {
  constructor() {
    this.isPlaying = true;
    this.interval = 1000;
  }

  reset() {
    this.isPlaying = true;
  }

  start() {
    setTimeout(() => {
      if (this.isPlaying) {
        console.log("coucou");
        this.start();
      }
    }, this.interval);
  }

  stop() {
    this.isPlaying = false;
  }
}

function popUntrackedCells() {
  trackedCells = trackedCells.filter((cell) => {
    return cell.neighbours != 0 || cell.isAlive;
  });
}

function Cell(x, y, cellSize = "20px") {
  const cell = document.createElement("div");
  cell.style.border = "1px solid black";
  cell.style.width = cellSize;
  cell.style.height = cellSize;
  cell.style.backgroundColor = "white";
  cell.setAttribute("x", `${x}`);
  cell.setAttribute("y", `${y}`);
  cell.style.color = "green";

  cell.onclick = (cellElement) => {
    const cell = {
      x: parseInt(cellElement.target.getAttribute("x")),
      y: parseInt(cellElement.target.getAttribute("y")),
    };
    if (isAlive(cellElement.target)) {
      handleLife(cell, true);
    } else {
      handleLife(cell, false);
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

  const runner = new Runner();

  const speedSlider = document.createElement("input");
  speedSlider.setAttribute("type", "range");
  speedSlider.setAttribute("min", "1");
  speedSlider.setAttribute("max", "100");
  speedSlider.setAttribute("value", "1");
  speedSlider.addEventListener("input", () => {
    interval = baseInterval / this.value;
  });

  const startButton = document.createElement("button");
  startButton.innerText = "Play";
  startButton.onclick = (event) => {
    if (event.target.innerText === "Play") {
      event.target.innerText = "Pause";
      runner.reset();
      runner.start();
    } else {
      event.target.innerText = "Play";
      runner.stop();
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
