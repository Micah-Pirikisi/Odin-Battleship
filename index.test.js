const Ship = require("./ship");
const Gameboard = require("./gameboard");

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
