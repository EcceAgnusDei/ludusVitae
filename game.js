let trackedCells = [];
let cellSize = "20px";
let gridSize = 10;
const maxInterval = 2000;

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
  constructor(
    x,
    y,
    id,
    parent,
    { trackedCells, gridSize, cells },
    cellSize = "20px"
  ) {
    super("div", id, parent);
    this.x = x;
    this.y = y;
    this.cells = cells;
    this.gridSize = gridSize;
    this.trackedCells = trackedCells;
    this.cellSize = cellSize;
    this.isAlive = false;
    this.willBeAlive = false;
    this.neighbours = 0;
    this.configureCell();
  }

  willItBeAlive() {
    if (this.isAlive) {
      if (this.neighbours == 2 || this.neighbours == 3) {
        this.willBeAlive = true;
      } else {
        this.willBeAlive = false;
      }
    } else if (this.neighbours == 3) {
      this.willBeAlive = true;
    } else {
      this.willBeAlive = false;
    }
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
        this.handleNeighbours(false);
      } else {
        this.setLife(true);
        this.handleNeighbours(true);
      }
    };
  }

  addNeighbour() {
    if (!this.trackedCells.includes(this)) {
      this.trackedCells.push(this);
    }
    this.neighbours++;
  }

  dellNeighbour() {
    //console.log(this.x, this.y, "has a nb dying (in dellnb)");
    this.neighbours--;
  }

  selectCellByCoord(x, y) {
    return this.cells.find((cell) => {
      return cell.x == x && cell.y == y;
    });
  }

  isOnGrid(x, y) {
    if (x <= 0 || x > this.gridSize || y <= 0 || y > this.gridSize) {
      return false;
    } else {
      return true;
    }
  }

  handleNeighbours(isBroughtToLife) {
    console.log(
      this.x,
      this.y,
      `${isBroughtToLife ? "getting alive" : "dying"}`
    );
    for (let i = this.x - 1; i <= this.x + 1; i++) {
      for (let j = this.y - 1; j <= this.y + 1; j++) {
        if ((i != this.x || j != this.y) && this.isOnGrid(i, j)) {
          const neighbour = this.selectCellByCoord(i, j);
          if (isBroughtToLife) {
            neighbour.addNeighbour();
          } else {
            neighbour.dellNeighbour();
          }
        }
      }
    }

    this.cells.forEach((cell) => {
      cell.element.innerText = `${cell.neighbours}`;
    });
  }

  setLife(isAlive) {
    if (isAlive) {
      this.isAlive = true;
      this.element.style.backgroundColor = "black";
      if (!this.trackedCells.includes(this)) {
        this.trackedCells.push(this);
      }
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
    this.cells = [];
    this.configureGrid();
  }

  nextState() {
    console.log("next");
    this.trackedCells.forEach((cell) => {
      cell.willItBeAlive();
    });
    this.trackedCells.forEach((cell) => {
      if (cell.isAlive != cell.willBeAlive) {
        cell.setLife(cell.willBeAlive);
        cell.handleNeighbours(cell.willBeAlive);
      }
    });
  }

  configureGrid() {
    this.element.style.width = "fit-content";
  }

  createCells() {
    for (let y = 1; y <= gridSize; y++) {
      const line = new Line(`line${y}`, this.element);
      for (let x = 1; x <= gridSize; x++) {
        const cell = new Cell(x, y, `x${x}y${y}`, line.element, this, cellSize);
        this.cells.push(cell);
        line.waitMounting(cell.mount.bind(cell));
      }
      this.waitMounting(line.mount.bind(line));
    }
  }
}

class Container extends Element {
  constructor(id, parent) {
    super("div", id, parent);
  }
}

export { Container, Grid };
