export function renderBoards(playerBoard, computerBoard) {
  const container = document.querySelector("#boards-container");
  container.innerHTML = ""; // clear any previous content

  // Create both labeled boards (top numbers, left letters)
  renderLabeledBoard("Your Board", "player-board", container);
  renderLabeledBoard("Enemy Board", "computer-board", container);

  // populate 10x10 grid cells inside each board-grid
  const playerGrid = document.querySelector("#player-board");
  const computerGrid = document.querySelector("#computer-board");

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      // player's square
      const playerCell = document.createElement("div");
      playerCell.classList.add("cell");
      playerCell.dataset.x = x;
      playerCell.dataset.y = y;
      playerGrid.appendChild(playerCell);

      // computer's square
      const computerCell = document.createElement("div");
      computerCell.classList.add("cell");
      computerCell.dataset.x = x;
      computerCell.dataset.y = y;
      computerGrid.appendChild(computerCell);
    }
  }

  // reveal player's ships during placement: add .ship to each occupied player cell
  if (playerBoard && playerBoard.ships) {
    for (const entry of playerBoard.ships) {
      for (const [sx, sy] of entry.coords) {
        const shipCell = playerGrid.querySelector(
          `.cell[data-x="${sx}"][data-y="${sy}"]`
        );
        if (shipCell) shipCell.classList.add("ship");
      }
    }
  }
}

export function updateBoard(selector, gameboard, showShips = false) {
  const boardContainer = document.querySelector(selector);

  for (const cell of boardContainer.querySelectorAll(".cell")) {
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    // reset classes
    cell.classList.remove("hit", "miss", "ship");

    // check for hits
    const hit = gameboard.ships.some((entry) =>
      entry.coords.some(([cx, cy], i) => {
        return cx === x && cy === y && entry.ship.hits[i];
      })
    );

    if (hit) {
      cell.classList.add("hit");
      continue;
    }

    // check for misses
    const miss = gameboard.missedAttacks.some(
      ([mx, my]) => mx === x && my === y
    );

    if (miss) {
      cell.classList.add("miss");
      continue;
    }

    // show ships if allowed (for player board)
    if (showShips) {
      const hasShip = gameboard.ships.some((entry) =>
        entry.coords.some(([cx, cy]) => cx === x && cy === y)
      );
      if (hasShip) cell.classList.add("ship");
    }
  }
}

export function renderLabeledBoard(title, boardId, container) {
  const letters = "ABCDEFGHIJ".split("");

  const wrapper = document.createElement("div");
  wrapper.classList.add("board-wrapper");

  const heading = document.createElement("h2");
  heading.textContent = title;
  wrapper.appendChild(heading);

  // top labels: empty corner + 1..10
  const top = document.createElement("div");
  top.classList.add("top-labels");
  top.innerHTML =
    `<div></div>` +
    Array.from({ length: 10 }, (_, i) => `<div>${i + 1}</div>`).join("");
  wrapper.appendChild(top);

  // row with side labels (A-J) and the grid
  const row = document.createElement("div");
  row.classList.add("board-row");

  const side = document.createElement("div");
  side.classList.add("side-labels");
  side.innerHTML = letters.map((l) => `<div>${l}</div>`).join("");
  row.appendChild(side);

  const grid = document.createElement("div");
  grid.classList.add("board-grid");
  grid.id = boardId;
  row.appendChild(grid);

  wrapper.appendChild(row);
  container.appendChild(wrapper);
}
