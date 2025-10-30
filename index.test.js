const Ship = require("./ship");
const Gameboard = require("./gameboard");
const Player = require("./player");

// Ship tests
it("returns false when not all parts are hit", () => {
  const ship = new Ship(3);
  ship.hit();
  expect(ship.isSunk()).toBe(false);
});

it("returns true when all parts are hit", () => {
  const ship = new Ship(3);
  ship.hit();
  ship.hit();
  ship.hit();
  expect(ship.isSunk()).toBe(true);
});

// Gameboard tests
describe("Gameboard", () => {
  let board;

  beforeEach(() => {
    board = new Gameboard();
  });

  test("places ships correctly", () => {
    board.placeShip(3, [
      [0, 0],
      [0, 1],
      [0, 2],
    ]);
    expect(board.ships.length).toBe(1);
    expect(board.ships[0].coords).toEqual([
      [0, 0],
      [0, 1],
      [0, 2],
    ]);
    expect(board.ships[0].ship).toBeInstanceOf(Ship);
  });

  test("registers a hit when attack matches ship coords", () => {
    board.placeShip(2, [
      [1, 1],
      [1, 2],
    ]);
    const result = board.receiveAttack([1, 1]);
    expect(result).toBe(true);
    expect(board.ships[0].ship.hits).toBe(1);
  });

  test("registers a miss when attack does not hit any ship", () => {
    board.placeShip(2, [
      [1, 1],
      [1, 2],
    ]);
    const result = board.receiveAttack([3, 3]);
    expect(result).toBe(false);
    expect(board.missedShots).toContainEqual([3, 3]);
  });

  test("reports when all ships are sunk", () => {
    board.placeShip(2, [
      [0, 0],
      [0, 1],
    ]);
    board.receiveAttack([0, 0]);
    board.receiveAttack([0, 1]);
    expect(board.allShipsSunk()).toBe(true);
  });

  test("reports false when not all ships are sunk", () => {
    board.placeShip(2, [
      [0, 0],
      [0, 1],
    ]);
    board.receiveAttack([0, 0]);
    expect(board.allShipsSunk()).toBe(false);
  });
});

// Player tests
describe("Player class", () => {
  let player, computer, enemyBoard;

  beforeEach(() => {
    player = new Player(); // human player
    computer = new Player(true); // computer player
    enemyBoard = new Gameboard();
  });

  test("each player has their own gameboard", () => {
    expect(player.board).toBeInstanceOf(Gameboard);
    expect(computer.board).toBeInstanceOf(Gameboard);
    expect(player.board).not.toBe(computer.board);
  });

  test("human player attacks with given coordinates", () => {
    // Spy on the enemy board's receiveAttack
    const spy = jest.spyOn(enemyBoard, "receiveAttack").mockReturnValue(true);
    const result = player.attack(enemyBoard, [2, 3]);

    expect(spy).toHaveBeenCalledWith([2, 3]);
    expect(result).toBe(true);

    spy.mockRestore();
  });

  test("computer player attacks with random coordinates", () => {
    const spy = jest.spyOn(enemyBoard, "receiveAttack").mockReturnValue(true);

    const result = computer.attack(enemyBoard); // no coords passed
    expect(spy).toHaveBeenCalled();

    // Check the coords passed were within 0–9 range
    const coords = spy.mock.calls[0][0];
    expect(coords[0]).toBeGreaterThanOrEqual(0);
    expect(coords[0]).toBeLessThan(10);
    expect(coords[1]).toBeGreaterThanOrEqual(0);
    expect(coords[1]).toBeLessThan(10);

    spy.mockRestore();
  });

  test("generateRandomCoords() returns values within 0–9 range", () => {
    for (let i = 0; i < 20; i++) {
      const coords = computer.generateRandomCoords();
      expect(coords[0]).toBeGreaterThanOrEqual(0);
      expect(coords[0]).toBeLessThan(10);
      expect(coords[1]).toBeGreaterThanOrEqual(0);
      expect(coords[1]).toBeLessThan(10);
    }
  });
});
