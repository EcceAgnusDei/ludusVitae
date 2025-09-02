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
  cell.setAttribute("willbealive", "false");

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
  const neighbourObserver = new MutationObserver((neighbourMutations) => {
    neighbourMutations.forEach((mutation) => {
      mutation.target.innerText = mutation.target
        .getAttribute("nbneighbour")
        .replace("nb", "");
      const nbNeighbour = parseInt(
        mutation.target.getAttribute("nbneighbour").replace("nb", "")
      );

      if (isAlive(mutation.target)) {
        console.log(
          mutation.target.getAttribute("x"),
          mutation.target.getAttribute("y"),
          " is alive"
        );
        if (nbNeighbour < 2 || nbNeighbour > 3) {
          mutation.target.setAttribute("willbealive", "false");
        } else {
          mutation.target.setAttribute("willbealive", "true");
        }
      } else if (nbNeighbour === 3) {
        mutation.target.setAttribute("willbealive", "true");
      } else {
        mutation.target.setAttribute("willbealive", "false");
      }
    });
  });

  lifeObserver.observe(cell, {
    attributes: true,
    attributeFilter: ["alive"],
  });
  neighbourObserver.observe(cell, {
    attributes: true,
    attributeFilter: ["nbneighbour"],
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

function start(grid, interval) {
  return setInterval(() => {
    grid.childNodes.forEach((line) => {
      line.childNodes.forEach((cell) => {
        cell.getAttribute("alive") != cell.getAttribute("willbealive") &&
          cell.setAttribute("alive", cell.getAttribute("willbealive"));
      });
    });
  }, interval);
}

function Grid(gridSize, cellSize) {
  const gridContainer = document.createElement("div");

  const grid = document.createElement("div");
  grid.setAttribute("time", "t0");

  let generationInterval;

  const timeObserver = new MutationObserver((timeMutations) => {
    timeMutations.forEach((timeMutation) => {
      timeMutation.target.childNodes.forEach((line) => {
        line.forEach((cell) => {});
      });
    });
  });

  for (let y = 1; y <= gridSize; y++) {
    const line = document.createElement("div");
    line.style.display = "flex";
    for (let x = 1; x <= gridSize; x++) {
      line.appendChild(Cell(x, y, cellSize));
    }
    grid.appendChild(line);
  }

  const startButton = document.createElement("button");
  startButton.innerText = "Play";
  startButton.onclick = (event) => {
    if (event.target.innerText === "Play") {
      generationInterval = start(grid, 3000);
      event.target.innerText = "Stop";
    } else {
      clearInterval(generationInterval);
      event.target.innerText = "Play";
    }
  };

  gridContainer.appendChild(grid);
  gridContainer.appendChild(startButton);

  return gridContainer;
}

export default Grid;
