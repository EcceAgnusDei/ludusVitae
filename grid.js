function isAlive(cell) {
  return cell.getAttribute("alive") === "true";
}

function handleNeighbourNumber(cell, isDying = false) {
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

function Cell(x, y, cellSize = "20px") {
  const cell = document.createElement("div");
  cell.style.border = "1px solid black";
  cell.style.width = cellSize;
  cell.style.height = cellSize;
  cell.style.backgroundColor = "white";
  cell.setAttribute("x", `${x}`);
  cell.setAttribute("y", `${y}`);
  cell.setAttribute("alive", "false");
  cell.setAttribute("nbneighbour", "nb0");
  cell.setAttribute("time", "t0");

  cell.style.color = "green";

  const lifeObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.target.getAttribute("alive") === "true") {
        mutation.target.style.backgroundColor = "black";
        handleNeighbourNumber(mutation.target);
      } else {
        mutation.target.style.backgroundColor = "white";
        handleNeighbourNumber(mutation.target, true);
      }
    });
  });

  lifeObserver.observe(cell, {
    attributes: true,
    attributeFilter: ["alive"],
  });
  cell.onclick = (cell) => {
    if (cell.target.getAttribute("alive") === "false") {
      cell.target.setAttribute("alive", "true");
    } else {
      cell.target.setAttribute("alive", "false");
    }
  };
  setInterval(() => {
    const currentlyAlive = isAlive(cell);
    const nbNeighbour = parseInt(
      cell.getAttribute("nbneighbour").replace("nb", "")
    );
    cell.getAttribute("x") == 4 &&
      cell.getAttribute("y") == 3 &&
      console.log(
        cell.getAttribute("x"),
        cell.getAttribute("y"),
        "nb",
        nbNeighbour
      );

    cell.innerText = nbNeighbour;

    if (cell.getAttribute("started") === "true") {
      let isCellAlive = currentlyAlive;
      if (isCellAlive) {
        if (nbNeighbour < 2 || nbNeighbour > 3) {
          cell.getAttribute("x") == 4 &&
            cell.getAttribute("y") == 3 &&
            console.log(
              "dying",
              cell.getAttribute("x"),
              cell.getAttribute("y"),
              "cause",
              nbNeighbour
            );
          isCellAlive = false;
        }
      } else if (nbNeighbour === 3) {
        isCellAlive = true;
      }

      //l'évènement ne doit se déclencher que si il y a changement d'état
      currentlyAlive != isCellAlive &&
        cell.setAttribute("alive", `${isCellAlive}`);
    }
  }, 5000);

  return cell;
}

function start(grid, interval) {
  setInterval(() => {
    grid.childNodes.forEach((line) => {
      line.forEach((cell) => {
        const time = parseInt(cell.getAttribute("time").replace("t", ""));
        cell.setAttribute("time", `t${time + 1}`);
      });
    });
  }, interval);
}

function Grid(gridSize, cellSize) {
  const gridContainer = document.createElement("div");

  const grid = document.createElement("div");
  for (let y = 1; y <= gridSize; y++) {
    const line = document.createElement("div");
    line.style.display = "flex";
    for (let x = 1; x <= gridSize; x++) {
      line.appendChild(Cell(x, y, cellSize));
    }
    grid.appendChild(line);
  }

  const startButton = document.createElement("button");
  startButton.innerText = "Start";
  startButton.onclick = () => start(grid, 3000);

  const stopButton = document.createElement("button");
  stopButton.innerText = "Stop";
  stopButton.onclick = () => {
    grid.childNodes.forEach((line) => {
      line.childNodes.forEach((cell) => {
        cell.setAttribute("started", "false");
      });
    });
  };

  gridContainer.appendChild(grid);
  gridContainer.appendChild(startButton);
  gridContainer.appendChild(stopButton);

  return gridContainer;
}

export default Grid;
