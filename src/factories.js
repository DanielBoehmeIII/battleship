import { Ship } from "./classes";
import { displayShip } from "./dom-display";
import { dragAndDrop } from "./dom-actions";
// Gameboard factory
export function Gameboard() {
  const ships = [];
  const missedAttacks = [];

  // check for overlap using ships[] coordinates as an object to compare to a single set of newCoords
  const isOverlap = (newCoords) => {
    for (const { coordinates } of ships) {
      for (const coord of coordinates) {
        for (const newCoord of newCoords) {
          if (coord[0] === newCoord[0] && coord[1] === newCoord[1]) {
            console.log("Overlap detected:", newCoord, "with", coord);
            return true;
          }
        }
      }
    }
    return false;
  };

  // if selectionDiv, use dragAndDrop() to set new coords, resolve a promise, and return this resolve,
  // else, choose non-overlapping random coord for ship
  const placeShip = async (player, type, selectionDiv) => {
    const shipLengths = {
      carrier: 5,
      battleship: 4,
      cruiser: 3,
      submarine: 3,
      destroyer: 2,
    };
    const length = shipLengths[type];
    const ship = new Ship(type, length);

    let coordinates = [];
    let attempts = 0;
    const maxAttempts = 100;

    if (!selectionDiv) {
      // Random placement logic
      do {
        ship.horizontal = Math.round(Math.random()) === 0;
        const isHorizontal = ship.horizontal;
        const maxX = isHorizontal ? 9 - length : 9;
        const maxY = isHorizontal ? 9 : 9 - length;
        const startX = Math.floor(Math.random() * (maxX + 1));
        const startY = Math.floor(Math.random() * (maxY + 1));

        coordinates = [];
        for (let i = 0; i < length; i++) {
          const x = isHorizontal ? startX + i : startX;
          const y = isHorizontal ? startY : startY + i;
          coordinates.push([x, y]);
        }
        console.log(
          `Trying to place ${type} at [${coordinates[0]}] horizontal? ${isHorizontal}`,
        );
        attempts++;
        if (attempts > maxAttempts) {
          throw new Error(
            `Failed to place ${type} after ${maxAttempts} attempts.`,
          );
        }
      } while (isOverlap(coordinates));

      ship.coordinates = coordinates;
      ships.push({ ship, coordinates });
      displayShip(player, ship);
      console.log(`Placed ${type} at`, coordinates);
      return ship;
    } else {
      // Manual placement

      ship.horizontal = false;
      return new Promise((resolve) => {
        for (const selectionElement of selectionDiv.children) {
          selectionElement.addEventListener(
            "click",
            async (event) => {
              const selectedType = event.target.id.split("-")[0];
              const length = shipLengths[selectedType];
              const ship = new Ship(selectedType, length);

              // Call drag and drop and await placement
              await dragAndDrop(player, ship, displayShip);

              ships.push({ ship, coordinates: ship.coordinates });

              console.log(`Placed ${ship.type} at`, ship.coordinates);
              resolve(ship); // resolve when placed
            },
            { once: true },
          );
        }
      });
    }
  };
  const receiveAttack = (x, y) => {
    for (const { ship, coordinates } of ships) {
      for (let i = 0; i < coordinates.length; i++) {
        const [shipX, shipY] = coordinates[i];
        if (shipX === x && shipY === y) {
          ship.hit(i);
          console.log("hit");
          return "hit";
        }
      }
    }
    missedAttacks.push([x, y]);
    console.log("miss");
    return "miss";
  };

  const allShipsSunk = () => ships.every(({ ship }) => ship.isSunk());

  return {
    isOverlap,
    placeShip,
    receiveAttack,
    allShipsSunk,
    missedAttacks,
    ships,
  };
}

// contains object and factory info to simplify access of vars and functions in different scopes
export function Player(isBot) {
  const bot = isBot || false;
  const gameBoard = Gameboard();
  const squares = [];
  return {
    bot,
    gameBoard,
    squares,
  };
}
