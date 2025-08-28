function launch(grid) {
  const aliveCells = (grid.style.display = "none");
}

function createGrid(gridSize) {
  //alert("grid");
  const cellSize = "20px";
  const grid = document.createElement("div");
  for (let i = 0; i < gridSize; i++) {
    const ligne = document.createElement("div");
    ligne.style.display = "flex";
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement("div");
      cell.style.border = "1px solid black";
      cell.style.width = cellSize;
      cell.style.height = cellSize;
      cell.style.backgroundColor = "white";
      cell.setAttribute("x", `${j + 1}`);
      cell.setAttribute("j", `${i + 1}`);
      cell.onclick = () => {
        cell.style.backgroundColor =
          cell.style.backgroundColor === "black" ? "white" : "black";
      };
      ligne.appendChild(cell);
    }
    grid.appendChild(ligne);
  }
  document.body.appendChild(grid);
  const startButton = document.createElement("button");
  startButton.innerText = "Start";
  document.body.appendChild(startButton);
  startButton.onclick = () => launch(grid);
  //return grid;
}

export default createGrid;
