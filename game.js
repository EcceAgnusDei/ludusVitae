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
    if (isOnGrid(cell)) {
      getCellByCoord(cell.x, cell.y).style.color = "green";
      getCellByCoord(cell.x, cell.y).innerText = `${cell?.neighbours.length}`;
    }
  });
}

function cellIndex(x, y) {
  return trackedCells.findIndex((trackedCell) => {
    return trackedCell.x == x && trackedCell.y == y;
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
function handleLife(x, y, isDying) {
  if (
    trackedCells.findIndex((trackedCell) => {
      return x == trackedCell.x && y == trackedCell.y;
    }) == -1
  ) {
    trackedCells.push({
      x,
      y,
      neighbours: [],
      isAlive: true,
      willBeAlive: false,
    });
    handleLife(x, y, false);
  } else {
    if (isDying) {
      trackedCells.forEach((trackedCell) => {
        const cellIndexInNbs = trackedCell.neighbours.findIndex((nb) => {
          return x == nb.x && y == nb.y;
        });
        if (cellIndexInNbs != -1) {
          trackedCell.neighbours.splice(cellIndexInNbs, 1);
        }
      });
      getCellByCoord(x, y).style.backgroundColor = "white";
    } else {
      trackedCells[cellIndex(x, y)].isAlive = true;
      getCellByCoord(x, y).style.backgroundColor = "black";
      for (let i = x - 1; i <= x + 1; i++) {
        for (let j = y - 1; j <= y + 1; j++) {
          if (i != x || (j != y && isOnGrid({ i, j }))) {
            const index = trackedCells.findIndex((trackedCell) => {
              return i == trackedCell.x && j == trackedCell.y;
            });
            if (index == -1) {
              trackedCells.push({
                i,
                j,
                neighbours: [{ x, y }],
                isAlive: false,
                willBeAlive: false,
              });
            } else {
              trackedCells[index].neighbours.push({ x, y });
            }
          }
        }
      }
    }
  }
}

class Runner {
  constructor() {
    this.isPlaying = false;
    this.interval = maxInterval;
    this.count = 0;
  }

  isRunning() {
    return this.isPlaying;
  }

  handleSpeed(divider) {
    this.interval = maxInterval / divider;
  }

  start() {
    showNeighbours();
    this.isPlaying = true;
    setTimeout(() => {
      if (this.isPlaying) {
        this.count++;
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
        this.count % 20 == 0 && popUntrackedCells();
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

class Element {
  constructor(tag, id, parent) {
    this.element = document.createElement(tag);
    this.element.setAttribute("id", id);
    this.parent = parent;
    this.noInfinitLoop = 0;
    this.id = id;
  }

  mount() {
    this.parent.appendChild(this.element);
  }

  waitMounting(callback) {
    if (typeof this.element === "undefined" && this.noInfinitLoop < 100) {
      setTimeout(() => {
        this.noInfinitLoop++;
        this.waitMounting();
      }, 1);
    } else if (this.noInfinitLoop >= 100) {
      throw new Error("Erreur dans le chargement de la page");
    } else {
      callback();
    }
  }
}

class Cell extends Element {
  constructor(x, y, id, parent, cellSize = "20px") {
    super(div, id, parent);
    this.x = x;
    this.y = y;
    this.cellSize = cellSize;
    this.isAlive = false;
    this.neighbours = [];
    this.configureCell();
  }

  configureCell() {
    this.element.style.border = "1px solid black";
    this.element.style.width = this.cellSize;
    this.element.style.height = this.cellSize;
    this.element.style.backgroundColor = "white";
    this.element.style.color = "green"; //pour le developpement
    this.element.onclick = () => {
      if (this.isAlive) {
        this.setLife(false);
      } else {
        this.setLife(true);
      }
    };
  }

  addNeighbour(x, y) {
    this.neighbours.push(x, y);
  }

  setLife(isAlive) {
    if (isAlive) {
      this.isAlive = true;
      this.element.style.backgroundColor = "black";
    } else {
      this.isAlive = false;
      this.element.style.backgroundColor = "white";
    }
  }
}

class Line extends Element {
  constructor(id, parent) {
    super("div", id, parent);
    this.configureLine();
  }

  configureLine() {
    this.element.style.display = "flex";
  }
}

class Grid extends Element {
  constructor(gridSize, id, parent, trackedCells = []) {
    super("div", id, parent);
    this.gridSize = gridSize;
    this.trackedCells = structuredClone(trackedCells);
    this.configureGrid();
  }

  configureGrid() {
    this.element.style.width = "fit-content";
  }

  createCells() {
    for (let y = 1; y <= gridSize; y++) {
      const line = new Line(`line${y}`, "grid");
      for (let x = 1; x <= gridSize; x++) {
        const cell = new Cell(x, y, `x${x}y${y}`, `line${y}`, cellSize);
        line.waitMounting(cell.mount);
      }
      this.element.waitMounting(line.mount);
    }
  }
}

class Container extends Element {
  constructor(id, parent) {
    super("div", id, parent);
  }
}

const game = new Container("game");

const gridContainer = new Container("gridcontainer", game);

const grid = new Grid(10, "gird", gridContainer);
function Game() {
  const game = document.createElement("div");
  game.setAttribute("id", "game");
  const gridContainer = document.createElement("div");
  gridContainer.setAttribute("id", "gridcontainer");
  game.appendChild(gridContainer);
  document.addEventListener("DOMContentLoaded", function () {
    const grid = new Grid(gridSize, "gridcontainer");
  });

  return game;
}

export default Game();
