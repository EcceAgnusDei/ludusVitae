function isAlive(cell) {
  return cell.getAttribute("alive") === "true";
}

function countNeighbour(coord) {
  for (let x = coord[0] - 1; coord[0] + 1; x++) {
    for (let y = coord[1] - 1; coord[1] + 1; y++) {
      if (coord[0] != x && coord[1] != y) {
        console.log("coucou");
      }
    }
  }
}

function aliveCellsNext(aliveCells) {
  const newAliveCells = [];
  for (let i = 0; i < aliveCells.length - 1; i++) {
    countNeighbour([aliveCells[0], aliveCells[1]]);
  }
  return newCells;
}

function markAliveCells(aliveCells) {
  aliveCells.array.forEach((cell) => {
    document.querySelector(
      `[x="${cell[0]}"][y="${cell[1]}"]`
    ).style.backgroundColor = "black";
  });
}

function launch(grid) {
  let aliveCells = getAliveCells(grid);
  markAliveCells(aliveCells);
}

function getAliveCells(grid) {
  const aliveCells = [];
  for (let i = 0; i < grid.children.length; i++) {
    for (let j = 0; j < grid.children[i].children.length; j++) {
      isAlive(grid.children[i].children[j]) && aliveCells.push([j + 1, i + 1]);
    }
  }
  return aliveCells;
}

function createGrid(gridSize) {
  const cellSize = "20px";
  const grid = document.createElement("div");
  const lifeObserver = new MutationObserver((cells) => {
    cells.forEach((cell) => {
      if (cell.target.getAttribute("alive") === "true") {
        cell.target.style.backgroundColor = "black";
      } else {
        cell.target.style.backgroundColor = "white";
      }
    });
  });
  for (let i = 0; i < gridSize; i++) {
    const line = document.createElement("div");
    line.style.display = "flex";
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement("div");
      cell.style.border = "1px solid black";
      cell.style.width = cellSize;
      cell.style.height = cellSize;
      cell.style.backgroundColor = "white";
      cell.setAttribute("x", `${j + 1}`);
      cell.setAttribute("y", `${i + 1}`);
      cell.setAttribute("alive", "false");
      lifeObserver.observe(cell, { attributes: true });
      cell.onclick = (cell) => {
        if (cell.target.getAttribute("alive") === "false") {
          cell.target.setAttribute("alive", "true");
        } else {
          cell.target.setAttribute("alive", "false");
        }
      };
      line.appendChild(cell);
    }
    grid.appendChild(line);
  }
  document.body.appendChild(grid);
  const startButton = document.createElement("button");
  startButton.innerText = "Start";
  document.body.appendChild(startButton);
  startButton.onclick = () => launch(grid);
}

export default createGrid;
