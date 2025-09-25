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
    { trackedCells, gridSize, cells, isOnGrid },
    cellSize = "20px"
  ) {
    super("div", id, parent);
    this.x = x;
    this.y = y;
    this.cells = cells;
    this.gridSize = gridSize;
    this.trackedCells = trackedCells;
    this.isOnGrid = isOnGrid;
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
    this.cells = [];
    this.baseInterval = 2000;
    this.gridSize = 10;
    this.isPlaying = false;
    this.timerId = null;
    this.devider = 1;
    this.count = 0;
    this.configureGrid();
  }

  popUntrackedCells() {
    this.trackedCells = this.trackedCells.filter((cell) => {
      return cell.neighbours != 0 || cell.isAlive;
    });
  }

  resize(value, cellsToClickCoords = []) {
    if (typeof value == "string") {
      this.cells.forEach((cell) => {
        cell.element.style.width = value;
        cell.element.style.height = value;
      });
    } else {
      this.gridSize = value;
      this.createCells();
      this.clickCells(cellsToClickCoords);
    }
  }

  getAliveCellsCoords() {
    return this.trackedCells.filter((cell) => {
      return cell.isAlive;
    });
  }

  isOnGrid(x, y) {
    if (x <= 0 || x > this.gridSize || y <= 0 || y > this.gridSize) {
      return false;
    } else {
      return true;
    }
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

  async saveInDb() {
    try {
      const response = await fetch(`https://api.exemple.com/data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP : ${response.status}`);
      }

      const result = await response.json();
      console.log("Données mises à jour avec succès :", result);
      return result;
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      throw error;
    }
  }

  clickCells(cellsToClick) {
    cellsToClick.forEach(({ x, y }) => {
      if (this.isOnGrid(x, y)) document.getElementById(`x${x}y${y}`).click();
    });
  }

  fetchLocaly() {
    try {
      const trackedCellsData = JSON.parse(localStorage.getItem("grid"));
      const maxX = trackedCellsData.reduce((max, obj) =>
        obj["x"] > max["x"] ? obj : max
      );
      const maxY = trackedCellsData.reduce((max, obj) =>
        obj["y"] > max["y"] ? obj : max
      );
      const gridSize = maxX.x > maxY.y ? maxX.x + 15 : maxY.y + 15;
      this.resize(gridSize, trackedCellsData);

      alert("Grille chargée");
    } catch {
      alert("Impossible de charger la grille");
    }
  }

  handleSpeed(devider) {
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
      this.count++;
      if (this.count % 20 == 0) {
        this.popUntrackedCells();
      }
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
    this.cells = [];
    this.trackedCells = [];

    for (let y = 1; y <= this.gridSize; y++) {
      const line = new Line(`line${y}`, this.element);
      for (let x = 1; x <= this.gridSize; x++) {
        const cell = new Cell(x, y, `x${x}y${y}`, line.element, this);
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
