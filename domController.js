export function renderBoards(playerBoard, computerBoard) {
  const playerContainer = document.querySelector("#player-board");
  const computerContainer = document.querySelector("#computer-board"); 

  playerContainer.innerHTML = '';
  computerContainer.innerHTML = ''; 

  // generate 10x10 grids 
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      // player's square
      const playerCell = document.createElement('div');
      playerCell.classList.add('cell');
      playerCell.dataset.x = x;
      playerCell.dataset.y = y;

      // computer's square
      const computerCell = document.createElement('div');
      computerCell.classList.add('cell');
      computerCell.dataset.x = x;
      computerCell.dataset.y = y;
      computerContainer.appendChild(computerCell);
    }
  }
}
