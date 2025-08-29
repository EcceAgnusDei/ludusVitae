function isAlive(cell) {
  return getComputedStyle(cell).backgroundColor === "rgb(0, 0, 0)";
}

function newCells(aliveCells) {
  for (let i = 0; i < aliveCells.length - 1; i++) {
    const newCells = [];
    for (let j = i + 1; j < aliveCells.length; j++) {
      if (
        Math.abs(aliveCells[i].x - aliveCells[j].x) > 2 ||
        Math.abs(aliveCells[i].y - aliveCells[j].y) > 2
      )
        break;
      else {
        switch (
          JSON.stringify([
            aliveCells[i].x - aliveCells[j].x,
            aliveCells[i].y - aliveCells[j].y,
          ])
        ) {
          case JSON.stringify([-2, -2]):
            console.log("-2 -2");
          case JSON.stringify([2, -2]):
            console.log("2 -2");
          case JSON.stringify([0, -2]):
            console.log("0 -2");
          case JSON.stringify([-2, 0]):
            console.log("-2 0");
          case JSON.stringify([-1, 0]):
            console.log("0 -1");
          case JSON.stringify([1, -2]):
            console.log("1 -2");
          case JSON.stringify([-1, -2]):
            console.log("-1 -2");
        }
      }
    }
  }
}

function launch(grid) {
  const aliveCells = [];
  for (let i = 0; i < grid.children.length; i++) {
    for (let j = 0; j < grid.children[i].children.length; j++) {
      isAlive(grid.children[i].children[j]) &&
        aliveCells.push({ x: j + 1, y: i + 1 });
    }
  }
  newCells(aliveCells);
}

function createGrid(gridSize) {
  //alert("grid");
  const cellSize = "20px";
  const grid = document.createElement("div");
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
      cell.onclick = () => {
        cell.style.backgroundColor =
          cell.style.backgroundColor === "black" ? "white" : "black";
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
  //return grid;
}

export default createGrid;
