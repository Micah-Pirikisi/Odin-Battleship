import startGame from "./gameController.js";
import { renderBoards, updateBoard } from "./domController.js";
import Gameboard from "./gameboard.js";
import Player from "./player.js";

// Start game with empty boards
const { human, computer } = startGame();
renderBoards(human.board, computer.board, true); // true: show player ships

// --- Ship placement setup ---
// Start with classic Battleship fleet: one 5, one 4, two 3s, one 2
const shipLengths = [5, 4, 3, 3, 2];
let currentShipIndex = 0;
let isHorizontal = true;
let isPlacing = true;

// Orientation toggle button
const orientationBtn = document.querySelector("#orientation-btn");
let lastHover = null; // track last hovered cell so orientation toggle can re-run preview
orientationBtn.addEventListener("click", () => {
  isHorizontal = !isHorizontal;
  orientationBtn.textContent = isHorizontal ? "Horizontal" : "Vertical";
  // re-run preview at last hover so the change is immediately visible
  if (lastHover) renderPreviewAt(lastHover.x, lastHover.y);
});

// Random placement button
const randomBtn = document.querySelector("#randomize-btn");
randomBtn.addEventListener("click", () => {
  // randomize for the current placement target (single-player human or two-player current placer)
  const targetPlayer = isTwoPlayer ? players[placementPlayerIndex] : human;
  randomizePlayerShips(targetPlayer);
  updateBoardAndStatus("#player-board", targetPlayer.board, true);
  isPlacing = false;
  currentShipIndex = shipLengths.length;
  renderPalette();
});

// Remove last ship button
const removeShipBtn = document.querySelector("#remove-ship-btn");
removeShipBtn.addEventListener("click", () => {
  const targetPlayer = isTwoPlayer ? players[placementPlayerIndex] : human;
  if (!targetPlayer.board.ships || targetPlayer.board.ships.length === 0) {
    alert("No ships to remove.");
    return;
  }
  targetPlayer.board.ships.pop();
  if (currentShipIndex > 0) currentShipIndex--;
  // re-enter placement mode so preview/palette work after randomize/remove
  isPlacing = true;
  updateBoardAndStatus("#player-board", targetPlayer.board, true);
  renderPalette();
  // clear previews
  document
    .querySelectorAll("#player-board .cell.preview")
    .forEach((c) => c.classList.remove("preview"));
});

// Two-player button and pass overlay
const twoPlayerBtn = document.querySelector("#two-player-btn");
const passOverlay = document.querySelector("#pass-overlay");
const passTitle = document.querySelector("#pass-title");
const passInstructions = document.querySelector("#pass-instructions");
const passContinue = document.querySelector("#pass-continue");
let isTwoPlayer = false;
let players = [human];
let activeIndex = 0; // index of player whose turn it is (0 or 1)
let placementPlayerIndex = 0; // which player is currently placing (used for two-player placement)

const instructionsEl = document.querySelector("#instructions");

function setInstructions(txt) {
  if (instructionsEl) instructionsEl.textContent = txt || "";
}

twoPlayerBtn.addEventListener("click", () => {
  isTwoPlayer = !isTwoPlayer;
  twoPlayerBtn.textContent = isTwoPlayer ? "1v1: On" : "2-Player Mode";
  if (isTwoPlayer) {
    // create second human player and let them place manually as well
    const player2 = new Player(false);
    players = [human, player2];
    activeIndex = 0;
    placementPlayerIndex = 0; // start with player 1 placing
    isPlacing = true;
    currentShipIndex = 0;
    renderBoards(players[0].board, players[1].board, true);
    renderPalette();
    setInstructions(
      "Player 1: place your ships. Use drag, click or Randomize."
    );
    showPassOverlayForPlayer(1);
  } else {
    // revert to single-player vs computer
    players = [human];
    activeIndex = 0;
    // ensure computer still exists and has fleet
    // computer (created at start) should have fleet—if not, randomize it
    if (!computer.board.ships || computer.board.ships.length === 0)
      randomizePlayerShips(computer);
    renderBoards(human.board, computer.board, true);
  }
});

function showPassOverlayForPlayer(playerNumber) {
  passTitle.textContent = "Pass the device";
  passInstructions.textContent = `Player ${playerNumber}, press Continue when ready to take your turn.`;
  passOverlay.classList.remove("hidden");
}

passContinue.addEventListener("click", () => {
  // handle two-player overlay continuation
  if (!isTwoPlayer) {
    passOverlay.classList.add("hidden");
    return;
  }

  // Placement phase: player1 first
  if (placementPlayerIndex === 0 && isPlacing) {
    // reveal player 1's placement screen
    const active = players[0];
    const opponent = players[1];
    renderBoards(active.board, opponent.board, true);
    renderPalette();
    setInstructions("Player 1: place your ships.");
    passOverlay.classList.add("hidden");
    return;
  }

  // player1 finished, now start player2 placement
  if (placementPlayerIndex === 0 && !isPlacing) {
    placementPlayerIndex = 1;
    isPlacing = true;
    currentShipIndex = 0;
    const active = players[1];
    const opponent = players[0];
    renderBoards(active.board, opponent.board, true);
    renderPalette();
    setInstructions("Player 2: place your ships.");
    passOverlay.classList.add("hidden");
    return;
  }

  // player2 placement screen
  if (placementPlayerIndex === 1 && isPlacing) {
    const active = players[1];
    const opponent = players[0];
    renderBoards(active.board, opponent.board, true);
    renderPalette();
    setInstructions("Player 2: place your ships.");
    passOverlay.classList.add("hidden");
    return;
  }

  // player2 finished placement -> start match with player1 to move first
  if (placementPlayerIndex === 1 && !isPlacing) {
    activeIndex = 0;
    renderBoards(players[0].board, players[1].board, true);
    renderPalette();
    setInstructions("Player 1: your turn. Attack the enemy board.");
    passOverlay.classList.add("hidden");
    return;
  }
});

// Ship palette (drag source)
function renderPalette() {
  const palette = document.querySelector("#ship-palette");
  palette.innerHTML = "";
  if (!isPlacing) return;
  // show the current ship to place
  const length = shipLengths[currentShipIndex];
  if (!length) return;
  const el = document.createElement("div");
  el.classList.add("palette-ship");
  el.textContent = `${length}`;
  el.draggable = true;
  el.dataset.length = length;
  el.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", String(length));
  });
  palette.appendChild(el);
}

// initial palette render
renderPalette();

// Player manual placement
const playerBoardContainer = document.querySelector("#player-board");
playerBoardContainer.addEventListener("click", (e) => {
  if (!isPlacing) return;
  const target = e.target;
  if (!target.classList.contains("cell")) return;

  const x = Number(target.dataset.x);
  const y = Number(target.dataset.y);
  const length = shipLengths[currentShipIndex];

  // generate coordinates for the ship
  const coords = [];
  for (let i = 0; i < length; i++) {
    coords.push(isHorizontal ? [x + i, y] : [x, y + i]);
  }

  // check if valid for the current placement target
  const targetPlayer = isTwoPlayer ? players[placementPlayerIndex] : human;
  if (targetPlayer.board.canPlaceShip(coords)) {
    targetPlayer.board.placeShip(length, coords);
    updateBoardAndStatus("#player-board", targetPlayer.board, true);
    currentShipIndex++;
    if (currentShipIndex >= shipLengths.length) {
      isPlacing = false;
      if (isTwoPlayer) {
        if (placementPlayerIndex === 0) {
          // finished player 1 placement: prompt pass to player 2
          showPassOverlayForPlayer(2);
          setInstructions("Player 1 finished. Pass the device to Player 2.");
        } else {
          // finished player 2 placement: start two-player match
          setInstructions("Both players placed. Pass to Player 1 to start.");
          placementPlayerIndex = 0;
          activeIndex = 0;
          showPassOverlayForPlayer(1);
        }
      } else {
        alert("All ships placed! Start attacking.");
      }
    }
  } else {
    alert("Invalid placement! Try again.");
  }
});

// preview on hover to show where the ship would be placed
playerBoardContainer.addEventListener("mousemove", (e) => {
  if (!isPlacing) return;
  const target = e.target;
  if (!target.classList.contains("cell")) return;

  // clear any previous previews
  document
    .querySelectorAll("#player-board .cell.preview")
    .forEach((c) => c.classList.remove("preview"));

  const x = Number(target.dataset.x);
  const y = Number(target.dataset.y);
  lastHover = { x, y };
  const length = shipLengths[currentShipIndex];
  const coords = [];
  for (let i = 0; i < length; i++) {
    coords.push(isHorizontal ? [x + i, y] : [x, y + i]);
  }

  // highlight preview cells if they are in-bounds
  for (const [px, py] of coords) {
    const cell = playerBoardContainer.querySelector(
      `.cell[data-x="${px}"][data-y="${py}"]`
    );
    if (cell) cell.classList.add("preview");
  }
});

playerBoardContainer.addEventListener("mouseleave", () => {
  document
    .querySelectorAll("#player-board .cell.preview")
    .forEach((c) => c.classList.remove("preview"));
});

// drag & drop handlers for palette -> board placement
playerBoardContainer.addEventListener("dragover", (e) => {
  e.preventDefault();
  if (!isPlacing) return;
  const data = e.dataTransfer.getData("text/plain");
  if (!data) return;
  const length = Number(data);
  const target = e.target;
  if (!target.classList.contains("cell")) return;
  // show preview for dragged ship length
  document
    .querySelectorAll("#player-board .cell.preview")
    .forEach((c) => c.classList.remove("preview"));
  const x = Number(target.dataset.x);
  const y = Number(target.dataset.y);
  for (let i = 0; i < length; i++) {
    const px = isHorizontal ? x + i : x;
    const py = isHorizontal ? y : y + i;
    const cell = playerBoardContainer.querySelector(
      `.cell[data-x="${px}"][data-y="${py}"]`
    );
    if (cell) cell.classList.add("preview");
  }
});

playerBoardContainer.addEventListener("drop", (e) => {
  e.preventDefault();
  if (!isPlacing) return;
  const data = e.dataTransfer.getData("text/plain");
  if (!data) return;
  const length = Number(data);
  const target = e.target;
  if (!target.classList.contains("cell")) return;
  const x = Number(target.dataset.x);
  const y = Number(target.dataset.y);
  const coords = [];
  for (let i = 0; i < length; i++) {
    coords.push(isHorizontal ? [x + i, y] : [x, y + i]);
  }
  // respect two-player placement target
  const targetPlayer = isTwoPlayer ? players[placementPlayerIndex] : human;
  if (targetPlayer.board.canPlaceShip(coords)) {
    targetPlayer.board.placeShip(length, coords);
    currentShipIndex++;
    updateBoardAndStatus("#player-board", targetPlayer.board, true);
    renderPalette();
    if (currentShipIndex >= shipLengths.length) {
      isPlacing = false;
      if (isTwoPlayer) {
        // finish placement for this player
        if (placementPlayerIndex === 0) {
          showPassOverlayForPlayer(2);
          setInstructions("Player 1 finished. Pass the device to Player 2.");
        } else {
          // both players done; start two-player match
          setInstructions("Both players placed. Start play.");
          // show pass overlay to player 1 to start
          placementPlayerIndex = 0;
          activeIndex = 0;
          showPassOverlayForPlayer(1);
        }
      } else {
        alert("All ships placed! Start attacking.");
      }
    }
  } else {
    alert("Invalid placement (overlap/adjacent/out-of-bounds).");
  }
});

// --- Game attack logic ---
const computerBoardContainer = document.querySelector("#computer-board");
computerBoardContainer.addEventListener("click", (e) => {
  if (isPlacing) return; // cannot attack until ships placed
  const target = e.target;
  if (!target.classList.contains("cell")) return;

  const x = Number(target.dataset.x);
  const y = Number(target.dataset.y);

  if (target.classList.contains("hit") || target.classList.contains("miss"))
    return;

  if (!isTwoPlayer) {
    // single-player: human vs computer
    const humanResult = human.attack(computer.board, [x, y]);
    updateBoardAndStatus("#computer-board", computer.board, false); // hide enemy ships

    if (computer.board.allShipsSunk()) {
      showWinnerOverlay("You win!");
      return;
    }

    // On hit: show message and keep human's turn
    if (humanResult.hit) {
      setInstructions("Hit! Your turn continues - attack again.");
      return;
    }

    // Human missed, computer's turn
    setInstructions("Miss! Computer's turn...");

    // Computer takes turn with delays for visual feedback
    function computerTurn() {
      let computerHits = 0;
      let keepGoing = true;

      function makeMove() {
        if (!keepGoing) return;

        const compResult = computer.attack(human.board);
        updateBoardAndStatus("#player-board", human.board, true);

        if (human.board.allShipsSunk()) {
          showWinnerOverlay("Computer wins!");
          return;
        }

        if (compResult.hit) {
          computerHits++;
          setInstructions(
            `Computer hit your ship! (${computerHits} hits this turn)`
          );
          // Delay before next hit attempt
          setTimeout(makeMove, 800);
        } else {
          setInstructions("Computer missed. Your turn!");
          keepGoing = false;
        }
      }

      // Start first move after initial delay
      setTimeout(makeMove, 500);
    }

    computerTurn();
  } else {
    // two-player mode: players array and activeIndex handle turns
    const active = players[activeIndex];
    const opponent = players[1 - activeIndex];

    // active player attacks opponent
    const result = active.attack(opponent.board, [x, y]);
    // re-render boards so attacker sees their own ships and misses/hits on opponent
    renderBoards(active.board, opponent.board, true);
    updateAllStatuses();

    if (opponent.board.allShipsSunk()) {
      showWinnerOverlay(`Player ${activeIndex + 1} wins!`);
      return;
    }

    // Only swap turns if the attack was a miss
    if (!result.hit) {
      // Swap turn and show pass overlay
      activeIndex = 1 - activeIndex;
      showPassOverlayForPlayer(activeIndex + 1);
    } else {
      setInstructions(`Player ${activeIndex + 1}: Hit! Attack again.`);
    }
  }
});

// --- Helper for random placement ---
function randomizePlayerShips(player) {
  player.board.ships = [];
  // use current shipLengths configuration
  shipLengths.forEach((length) => {
    let placed = false;
    while (!placed) {
      const horizontal = Math.random() < 0.5;
      // choose start so the ship will fit inside 0..9
      const x = horizontal
        ? Math.floor(Math.random() * (10 - length + 1))
        : Math.floor(Math.random() * 10);
      const y = horizontal
        ? Math.floor(Math.random() * 10)
        : Math.floor(Math.random() * (10 - length + 1));
      const coords = [];
      for (let i = 0; i < length; i++) {
        coords.push(horizontal ? [x + i, y] : [x, y + i]);
      }
      if (player.board.canPlaceShip(coords)) {
        player.board.placeShip(length, coords);
        placed = true;
      }
    }
  });
}

// helper to re-render preview at given coords (used after orientation toggle)
function renderPreviewAt(x, y) {
  if (!lastHover) return;
  // clear previous previews
  document
    .querySelectorAll("#player-board .cell.preview")
    .forEach((c) => c.classList.remove("preview"));
  if (!isPlacing) return;
  const length = shipLengths[currentShipIndex];
  const coords = [];
  for (let i = 0; i < length; i++)
    coords.push(isHorizontal ? [x + i, y] : [x, y + i]);
  for (const [px, py] of coords) {
    const cell = playerBoardContainer.querySelector(
      `.cell[data-x="${px}"][data-y="${py}"]`
    );
    if (cell) cell.classList.add("preview");
  }
}

// ---------- Guidance (help) flow ----------
const helpBtn = document.querySelector("#help-btn");
const guidanceOverlay = document.querySelector("#guidance-overlay");
const guidanceTitle = document.querySelector("#guidance-title");
const guidanceText = document.querySelector("#guidance-text");
const guidancePrev = document.querySelector("#guidance-prev");
const guidanceNext = document.querySelector("#guidance-next");
const guidanceClose = document.querySelector("#guidance-close");

const guidanceSteps = [
  {
    title: "Welcome",
    text: "Welcome to Battleship — place your ships using drag, click, or Randomize. Use Orientation to rotate.",
  },
  {
    title: "Placement",
    text: "Drag the ship from the palette or hover and click a cell to place it. Remove Last Ship to undo.",
  },
  {
    title: "Two-Player",
    text: "Enable 2-Player Mode to let two people place ships. Use the pass screen to hand the device.",
  },
  {
    title: "Attacking",
    text: "Click the enemy board to attack. Hits are red, misses are white. The AI will hunt after a hit.",
  },
  {
    title: "Reset & Status",
    text: "Use Reset to restart. The status boxes show remaining and damaged ships for each side.",
  },
];
let guidanceIndex = 0;

function showGuidance(i = 0) {
  guidanceIndex = Math.max(0, Math.min(i, guidanceSteps.length - 1));
  const s = guidanceSteps[guidanceIndex];
  guidanceTitle.textContent = s.title;
  guidanceText.textContent = s.text;
  guidanceOverlay.classList.remove("hidden");
}

function hideGuidance() {
  guidanceOverlay.classList.add("hidden");
}

helpBtn.addEventListener("click", () => showGuidance(0));
guidancePrev.addEventListener("click", () => showGuidance(guidanceIndex - 1));
guidanceNext.addEventListener("click", () => showGuidance(guidanceIndex + 1));
guidanceClose.addEventListener("click", hideGuidance);

// ---------- Reset / Winner overlay ----------
const resetBtn = document.querySelector("#reset-btn");
const winnerOverlay = document.querySelector("#winner-overlay");
const winnerTitle = document.querySelector("#winner-title");
const winnerText = document.querySelector("#winner-text");
const winnerReset = document.querySelector("#winner-reset");

resetBtn.addEventListener("click", () => location.reload());
winnerReset.addEventListener("click", () => location.reload());

function showWinnerOverlay(text) {
  winnerText.textContent = text;
  winnerOverlay.classList.remove("hidden");
}

// ---------- Ship status display ----------
function renderShipStatusFor(gameboard, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  container.innerHTML = "";
  if (!gameboard || !gameboard.ships) return;
  for (const entry of gameboard.ships) {
    const len = entry.ship.length;
    const hits = entry.ship.hits.filter(Boolean).length;
    const sunk = entry.ship.isSunk();
    const line = document.createElement("div");
    line.classList.add("ship-line");
    const label = document.createElement("span");
    label.textContent = `Ship ${len}`;
    const status = document.createElement("span");
    status.innerHTML = sunk
      ? `<span class="sunk">Sunk</span>`
      : hits > 0
      ? `<span class="damaged">${hits}/${len} hit</span>`
      : `${len} intact`;
    line.appendChild(label);
    line.appendChild(status);
    container.appendChild(line);
  }
}

function updateAllStatuses() {
  // player status always based on human in single-player, or active players in two-player
  const playerBoard = isTwoPlayer ? players[activeIndex].board : human.board;
  const opponentBoard = isTwoPlayer
    ? players[1 - activeIndex].board
    : computer.board;
  renderShipStatusFor(playerBoard, "#player-status");
  renderShipStatusFor(opponentBoard, "#opponent-status");
}

// call regularly after updates
const origUpdateBoard = updateBoard;
// wrap updateBoard to also refresh statuses
function updateBoardAndStatus(selector, gameboard, showShips = false) {
  origUpdateBoard(selector, gameboard, showShips);
  updateAllStatuses();
}
// Replace usages in this file: reassign updateBoard variable used by other functions
// Note: existing imports reference updateBoard; to keep code changes minimal we shadow local usages

// initial status update (safe now that helpers and variables are defined)
updateAllStatuses();
