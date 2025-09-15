let trackedCells = [];
let cellSize = "20px";
let gridSize = 10;
const maxInterval = 2000;

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

  remove() {
    this.element.remove();
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
    { trackedCells, gridSize, cells, trackedCellsData, waitMounting },
    cellSize = "20px"
  ) {
    super("div", id, parent);
    this.x = x;
    this.y = y;
    this.cells = cells;
    this.gridSize = gridSize;
    this.trackedCells = trackedCells;
    this.trackedCellsData = trackedCellsData;
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
    this.element.innerText = `${this.neighbours}`;
  }

  dellNeighbour() {
    this.neighbours--;
    this.element.innerText = `${this.neighbours}`;
  }

  selectCellByCoord(x, y) {
    const selectedCell = this.cells.find((cell) => {
      return cell.x == x && cell.y == y;
    });
    return selectedCell;
  }

  isOnGrid(x, y) {
    if (x <= 0 || x > this.gridSize || y <= 0 || y > this.gridSize) {
      return false;
    } else {
      return true;
    }
  }

  handleNeighbours(isBroughtToLife) {
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
  constructor(id, parent) {
    super("div", id, parent);
    this.trackedCells = [];
    this.trackedCellsData = [];
    this.cells = [];
    this.baseInterval = 2000;
    this.gridSize = 10;
    this.cellSize = "20px";
    this.isPlaying = false;
    this.timerId = null;
    this.devider = 1;
    this.configureGrid();
  }

  resize(gridSize) {
    this.gridSize = gridSize;
    this.createCells();
  }

  saveLocaly() {
    const toStringify = [];
    this.trackedCells.forEach(({ x, y, isAlive }) => {
      if (isAlive) {
        toStringify.push({ x, y });
      }
    });
    try {
      localStorage.setItem("grid", JSON.stringify(toStringify));
      alert("Grille enregistrée");
    } catch {
      alert("Impossible d'enregistrer");
    }
  }

  fetchLocaly() {
    try {
      this.cells = [];
      this.trackedCells = [];

      this.trackedCellsData = JSON.parse(localStorage.getItem("grid"));
      const maxX = this.trackedCellsData.reduce((max, obj) =>
        obj["x"] > max["x"] ? obj : max
      );
      const maxY = this.trackedCellsData.reduce((max, obj) =>
        obj["y"] > max["y"] ? obj : max
      );
      const gridSize = maxX.x > maxY.y ? maxX.x + 15 : maxY.y + 15;
      this.resize(gridSize);

      this.trackedCellsData.forEach(({ x, y }) => {
        document.getElementById(`x${x}y${y}`).click();
      });

      alert("Grille chargée");
    } catch {
      alert("Impossible de charger la grille");
    }
  }

  hundleSpeed(devider) {
    this.devider = devider;
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  nextState() {
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

  play() {
    this.isPlaying = true;
    this.timerId = setTimeout(() => {
      this.nextState();
      this.play();
    }, this.baseInterval / this.devider);
  }

  pause() {
    this.isPlaying = false;
    clearTimeout(this.timerId);
  }

  configureGrid() {
    this.element.style.width = "fit-content";
  }

  createCells() {
    this.element.innerHTML = ""; //réinitialisation
    for (let y = 1; y <= this.gridSize; y++) {
      const line = new Line(`line${y}`, this.element);
      for (let x = 1; x <= this.gridSize; x++) {
        const cell = new Cell(
          x,
          y,
          `x${x}y${y}`,
          line.element,
          this,
          this.cellSize
        );
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
