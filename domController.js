export function renderBoards(playerBoard, computerBoard) {
  const playerContainer = document.querySelector("#player-board");
  const computerContainer = document.querySelector("#computer-board");

  playerContainer.innerHTML = "";
  computerContainer.innerHTML = "";

  // generate 10x10 grids
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      // player's square
      const playerCell = document.createElement("div");
      playerCell.classList.add("cell");
      playerCell.dataset.x = x;
      playerCell.dataset.y = y;
      playerContainer.appendChild(playerCell);

      // computer's square
      const computerCell = document.createElement("div");
      computerCell.classList.add("cell");
      computerCell.dataset.x = x;
      computerCell.dataset.y = y;
      computerContainer.appendChild(computerCell);
    }
  }
}

export function updateBoard(selector, gameboard) {
  const boardContainer = document.querySelector(selector);

  for (const cell of boardContainer.children) {
    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);

    // reset classes
    cell.classList.remove("hit", "miss");

    // check for hits
    const hit = gameboard.ships.some((entry) =>
      entry.coords.some(([cx, cy], i) => {
        return cx === x && cy === y && entry.ship.hits[i]; // Ship tracks hits array
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
    }
  }
}
