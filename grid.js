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
  cell.setAttribute("willbealive", "false");
  cell.setAttribute("nbneighbour", "nb0");
  cell.setAttribute("started", "false");

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
  const nbNeighbourObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const nbNeighbour = parseInt(
        mutation.target.getAttribute("nbneighbour").replace("nb", "")
      );
      mutation.target.innerText = nbNeighbour;
      if (mutation.target.getAttribute("started") === "true") {
        if (isAlive(mutation.target)) {
          if (nbNeighbour < 2 || nbNeighbour > 3) {
            mutation.target.setAttribute("willbealive", "false");
          }
        } else if (nbNeighbour === 3) {
          mutation.target.setAttribute("willbealive", "true");
        }
      }
    });
  });
  const willBeAliveObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      setTimeout(() => {
        mutation.target.setAttribute(
          "alive",
          mutation.target.getAttribute("willBeAlive")
        );
      }, 2000);
    });
  });

  lifeObserver.observe(cell, {
    attributes: true,
    attributeFilter: ["alive"],
  });
  nbNeighbourObserver.observe(cell, {
    attribute: true,
    attributeFilter: ["nbneighbour", "started"],
  });
  willBeAliveObserver.observe(cell, {
    attribute: true,
    attributeFilter: ["willbealive"],
  });

  cell.onclick = (cell) => {
    if (cell.target.getAttribute("alive") === "false") {
      cell.target.setAttribute("alive", "true");
    } else {
      cell.target.setAttribute("alive", "false");
    }
  };

  return cell;
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
  startButton.onclick = () => {
    grid.childNodes.forEach((line) => {
      line.childNodes.forEach((cell) => {
        cell.setAttribute("started", "true");
      });
    });
  };

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
