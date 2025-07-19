import { Player } from "./factories";
import {
  terminalOutputStrings,
  runTerminal,
  addDragListeners,
  delay,
  displaySonarPoints,
  displayRadarPoints,
} from "./dom-display.js";
import {
  displayBoard,
  main,
  addSquareListeners,
  displayWinner,
} from "./dom-display";

const radarSweep = document.getElementById("radar-sweep");
const sonarSweep = document.getElementById("sonar-sweep");
// display board, place ships using option type, begin terminal output, and initialize game loop
export async function startGame(option) {
  main.innerText = "";
  radarSweep.style.opacity = "1";
  sonarSweep.style.opacity = "1";
  sonarSweep.style.animation = "linear-sweep 2s infinite linear";

  const playerOne = Player();
  const playerTwo = Player(true);
  if (option.target.id === "quick-deploy") {
    playerOne.squares = displayBoard(playerOne);
    playerTwo.squares = displayBoard(playerTwo);
    quickDeploy(playerOne);
    quickDeploy(playerTwo);
    await runTerminal(terminalOutputStrings);
    gameLoop(playerOne, playerTwo);
    //
    // const player = Player();
    // const ship = player.gameBoard.placeShip(player, "carrier");
    //
    // displayShip(player, ship);
  } else {
    playerOne.squares = displayBoard(playerOne);
    playerTwo.squares = displayBoard(playerTwo);
    await runTerminal(
      terminalOutputStrings.splice(0, terminalOutputStrings.length - 1),
    );
    quickDeploy(playerTwo);
    await placeFleet(playerOne);
    console.log("next");
    gameLoop(playerOne, playerTwo);
  }
}

function quickDeploy(player) {
  const ships = ["destroyer", "submarine", "cruiser", "battleship", "carrier"];

  ships.forEach((ship) => {
    let placed = false;
    while (!placed) {
      placed = player.gameBoard.placeShip(player, ship);
    }
  });
}

// Uses if else conditional in Gameboard factory
async function placeFleet(player) {
  const ships = ["destroyer", "submarine", "cruiser", "battleship", "carrier"];
  const selectionDiv = await runTerminal(
    [
      "> CLICK SHIPS TO DEPLOY THEN DRAG AND DROP ON BOARD TO STRATEGIC COORDINATES",
      "> (USE ARROW KEYS TO ROTATE):",
    ],
    ships,
  );

  for (const ship of ships) {
    let placed = false;
    while (!placed) {
      placed = await player.gameBoard.placeShip(player, ship, selectionDiv);
      // Ensure placeShip returns a Promise resolving to true when placed successfully
    }
  }
}

// Need to place ship, await final coordinates, then place next, checking for overlap

async function gameLoop(playerOne, playerTwo) {
  console.log("game loop init");
  let playerTurn = true;
  while (
    !playerOne.gameBoard.allShipsSunk() &&
    !playerTwo.gameBoard.allShipsSunk()
  ) {
    if (playerTurn) {
      let [square, hitResult] = await addSquareListeners(playerTwo, checkHit);
      console.log("Clicked square:", square.id);

      console.log("Hit result:", hitResult);

      if (hitResult === true) {
        continue;
      } else {
        playerTurn = !playerTurn;
      }
    } else {
      let [square, hitResult] = await randomTurn(playerOne, checkHit);
      console.log("Clicked square:", square.id);

      console.log("Hit result:", hitResult);

      if (hitResult === true) {
        continue;
      } else {
        playerTurn = !playerTurn;
      }
    }
  }
  await delay(500);
  const winner = playerOne.gameBoard.allShipsSunk() ? playerTwo : playerOne;
  const ships = document.querySelectorAll(".ship-img");
  for (const ship of ships) {
    if (ship.getAttribute("player-ship") === "false") {
      ship.style.opacity = 1;
    }
  }
  displayWinner(winner);
}

let incompleteCoods = null;
// choose random square for bot turn
async function randomTurn(opponent, callback) {
  let x, y, square;

  if (incompleteCoods !== null) {
    square = attackNearby(opponent, incompleteCoods);
    if (square) {
      [x, y] = square.id.split("-").slice(1).map(Number);
    } else {
      incompleteCoods = null; // reset if no valid neighbors
    }
  }

  if (!square) {
    do {
      x = Math.floor(Math.random() * 10);
      y = Math.floor(Math.random() * 10);
      square = document.getElementById(
        `${opponent.bot ? "bot" : "player"}-${x}-${y}`,
      );
    } while (getToggled(opponent, x, y));
  }

  let bomb = document.createElement("div");
  bomb.id = "toggle-bomb";
  square.setAttribute("toggled", "true");
  square.appendChild(bomb);

  const result = await callback(opponent, square, bomb); // ✅ await here

  if (result === true) {
    incompleteCoods = [x, y];
  }

  return [square, result]; // ✅ no need for Promise wrapper + resolve
}

// attack nearby squares until another is hit, continue on axis until ship sunk
function attackNearby(opponent, coordinates) {
  const [x, y] = coordinates;
  const directions = [
    [0, 1], // up
    [0, -1], // down
    [1, 0], // right
    [-1, 0], // left
  ];

  // Fisher-Yates Shuffle directions to randomize selection
  for (let i = directions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [directions[i], directions[j]] = [directions[j], directions[i]];
  }

  for (const [dx, dy] of directions) {
    const nx = x + dx;
    const ny = y + dy;

    if (
      nx >= 0 &&
      nx <= 9 &&
      ny >= 0 &&
      ny <= 9 &&
      !getToggled(opponent, nx, ny)
    ) {
      return document.getElementById(
        `${opponent.bot ? "bot" : "player"}-${nx}-${ny}`,
      );
    }
  }

  return null; // no valid neighbors
}

function getToggled(opponent, x, y) {
  const square = document.getElementById(
    `${opponent.bot ? "bot" : "player"}-${x}-${y}`,
  );
  return square.getAttribute("toggled") === "true";
}

// check hit using Gameboard factory function, and print and return result
export async function checkHit(player, square, bomb) {
  const location = square.id.split("-");
  console.log(location[1], location[2]);
  const result =
    player.gameBoard.receiveAttack(
      parseInt(location[1]),
      parseInt(location[2]),
    ) === "hit";
  if (!result) {
    square.classList.remove("hover");
    square.removeChild(bomb);
    bomb = null;
    const x = document.createElement("span");
    x.textContent = "x";
    x.id = "toggle-x";
    square.appendChild(x);
  } else {
    if (player.bot === true) {
      displaySonarPoints([location[1], location[2]]);
      displayRadarPoints([location[1], location[2]]);
    }
  }
  console.log("x is", location[1]);
  console.log("y is", location[2]);
  await runTerminal(
    attackReadouts(!player.bot, result, [location[1], location[2]]),
  );
  return result;
}

function attackReadouts(isBot, result, [x, y]) {
  const playerReadOut = [
    `> INITIATING AIRSTRIKE ON {${x} LATITUDE, ${y} LONGITUDE}`,
    `> AIRSTRIKE ${result ? "SUCCESS" : "FAIL"} AT {${x} LATITUDE, ${y} LONGITUDE}`,
    `> ${result ? "ENTER COORDINATES FOR NEXT ATTACK" : "ENEMY AIRSTRIKE INBOUND"}`,
  ];
  const enemyReadOut = [
    `> ENEMY AIRSTRIKE INCOMING AT {${x} LATITUDE, ${y} LONGITUDE}`,
    `> ENEMY AIRSTRIKE ${result ? "SUCCESS" : "fail"} at {${x} latitude, ${y} longitude}`,
    `> ${!result ? "ENTER COORDINATES FOR NEXT ATTACK" : "ENEMY AIRSTRIKE INBOUND"}`,
  ];
  let activeReadOut = isBot ? enemyReadOut : playerReadOut;
  activeReadOut.push("> AWAITING NEXT COMMAND...");
  activeReadOut = activeReadOut.map((string) => string.toUpperCase());

  return activeReadOut;
}

// handle calling of addDragListeners(player,ship,callback)
export async function dragAndDrop(player, ship, callback) {
  const board = document.getElementById(
    `${player.bot ? "bot" : "player"}-board`,
  );
  const shipElement = document.getElementById(
    `${player.bot ? "bot" : "player"}-${ship.type}`,
  );
  if (shipElement) {
    board.removeChild(shipElement);
    board.appendChild(addDragListeners(player, ship, callback));
  } else {
    return addDragListeners(player, ship, callback);
  }
}
