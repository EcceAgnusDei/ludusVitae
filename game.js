let trackedCells = [];
let cellSize = "20px";
let gridSize = 10;
const maxInterval = 2000;

const gridContainer = document.createElement("div");
gridContainer.setAttribute("id", "gridcontainer");
gridContainer.style.overflow = "auto";

const speedSlider = document.createElement("input");
speedSlider.setAttribute("type", "range");
speedSlider.setAttribute("min", "1");
speedSlider.setAttribute("max", "100");
speedSlider.setAttribute("value", "1");
speedSlider.addEventListener("input", () => {
  runner.handleSpeed(speedSlider.value);
});

const startButton = document.createElement("button");
startButton.innerText = "Play";
startButton.onclick = (event) => {
  if (event.target.innerText === "Play") {
    event.target.innerText = "Pause";
    runner.start();
  } else {
    event.target.innerText = "Play";
    runner.stop();
  }
};

const saveButton = document.createElement("button");
saveButton.innerText = "Sauvegarder";
saveButton.onclick = () => {
  saveLocaly();
};

const loadButton = document.createElement("button");
loadButton.innerText = "Charger";
loadButton.onclick = () => {
  fetchLocaly();
  unmountGrid();
  mountGrid();
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
    trackedCells = [];
    gridSize = parseInt(gridSizeInput.value);
    unmountGrid();
    mountGrid();
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
  if (parseInt(cellSizeInput.value) > 1 && parseInt(cellSizeInput.value) < 71) {
    cellSize = parseInt(cellSizeInput.value) + "px";
    trackedCells = [];
    unmountGrid();
    mountGrid();
    cellSizeInput.value = "";
  } else {
    cellSizeInput.value = "";
    alert("Veuillez entrer une valeur valide.");
  }
};

const cellSizeContainer = document.createElement("div");
cellSizeContainer.appendChild(cellSizeInput);
cellSizeContainer.appendChild(cellSizeButton);

function mountGrid() {
  gridContainer.appendChild(Grid(gridSize, cellSize));
  trackedCells.forEach((cell) => {
    if (cell.isAlive) {
      getCellByCoord(cell.x, cell.y).style.backgroundColor = "black";
    }
  });
}

function unmountGrid() {
  gridContainer.removeChild(gridContainer.firstChild);
}

function isAlive(cell) {
  return cell.style.backgroundColor === "black";
}

function getCellByCoord(x, y) {
  return document.querySelector(`[x="${x}"][y="${y}"]`);
}

function isOnGrid(cell) {
  if (cell.x > 0 && cell.x <= gridSize && cell.y > 0 && cell.y <= gridSize) {
    return true;
  } else {
    return false;
  }
}

function showNeighbours() {
  trackedCells.forEach((cell) => {
    getCellByCoord(cell.x, cell.y).style.color = "green";
    getCellByCoord(cell.x, cell.y).innerText = `${cell.neighbours.length}`;
  });
}

function cellIndex(cellCoord) {
  return trackedCells.findIndex((trackedCell) => {
    return trackedCell.x == cellCoord.x && trackedCell.y == cellCoord.y;
  });
}

function saveLocaly() {
  try {
    localStorage.setItem("grid", JSON.stringify(trackedCells));
    alert("Grille enregistrée");
  } catch {
    alert("Impossible d'enregistrer");
  }
}

function fetchLocaly() {
  try {
    trackedCells = structuredClone(JSON.parse(localStorage.getItem("grid")));
    alert("Grille chargée");
    const maxX = trackedCells.reduce((max, obj) =>
      obj["x"] > max["x"] ? obj : max
    );
    const maxY = trackedCells.reduce((max, obj) =>
      obj["y"] > max["y"] ? obj : max
    );
    gridSize = maxX.x > maxY.y ? maxX.x + 15 : maxY.y + 15;
  } catch {
    alert("Impossible de charger la grille");
  }
}

//gère le changement d'état de vie d'une cellule
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
      getCellByCoord(cellCoord.x, cellCoord.y).style.backgroundColor = "white";
    } else {
      trackedCells[cellIndex(cellCoord)].isAlive = true;
      getCellByCoord(cellCoord.x, cellCoord.y).style.backgroundColor = "black";
      for (let x = cellCoord.x - 1; x <= cellCoord.x + 1; x++) {
        for (let y = cellCoord.y - 1; y <= cellCoord.y + 1; y++) {
          if (x != cellCoord.x || (y != cellCoord.y && isOnGrid({ x, y }))) {
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
    }
  }
}

class Runner {
  constructor() {
    this.isPlaying = true;
    this.interval = maxInterval;
  }

  handleSpeed(divider) {
    this.interval = maxInterval / divider;
  }

  start() {
    showNeighbours();
    this.isPlaying = true;
    setTimeout(() => {
      if (this.isPlaying) {
        trackedCells.forEach((cell) => {
          if (cell.isAlive) {
            if (cell.neighbours.length < 2 || cell.neighbours.length > 3) {
              cell.willBeAlive = false;
            } else {
              cell.willBeAlive = true;
            }
          } else if (cell.neighbours.length == 3) {
            cell.willBeAlive = true;
          }
        });
        trackedCells.forEach((cell) => {
          if (cell.isAlive != cell.willBeAlive) {
            cell.isAlive = cell.willBeAlive;
            handleLife(cell, !cell.isAlive);
          }
        });
        this.isPlaying && this.start();
      }
    }, this.interval);
  }

  stop() {
    this.isPlaying = false;
  }
}

const runner = new Runner();

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
  mountGrid();
  const game = document.createElement("div");
  game.setAttribute("id", "game");

  game.appendChild(gridContainer);
  game.appendChild(startButton);
  game.appendChild(saveButton);
  game.appendChild(loadButton);
  game.appendChild(speedSlider);
  game.appendChild(gridSizeContainer);
  game.appendChild(cellSizeContainer);

  return game;
}

export default Game();
