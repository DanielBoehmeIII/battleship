import { startGame } from "./dom-actions";
const content = document.getElementById("main-content-div");
export const main = document.getElementById("display");

// Adds event listeners for startGame(option)
export function displayStart() {
  const prompt = document.createElement("div");
  prompt.id = "type-prompt";
  prompt.textContent = "Select Game Mode:";
  const typeContainer = document.createElement("div");
  typeContainer.id = "type-container";
  const quickDeploy = document.createElement("div");
  quickDeploy.id = "quick-deploy";
  quickDeploy.textContent = "Quick Deploy";
  quickDeploy.addEventListener("mouseover", () => {
    quickDeploy.style.transform = "scale(1.1)";
  });
  quickDeploy.addEventListener("mouseleave", () => {
    quickDeploy.style.transform = "scale(1)";
  });
  quickDeploy.addEventListener("click", (quickDeploy) => {
    startGame(quickDeploy);
  });
  const placeFleet = document.createElement("div");
  placeFleet.id = "place-fleet";
  placeFleet.textContent = "Place Fleet";
  placeFleet.addEventListener("mouseover", () => {
    placeFleet.style.transform = "scale(1.1)";
  });
  placeFleet.addEventListener("mouseleave", () => {
    placeFleet.style.transform = "scale(1)";
  });
  placeFleet.addEventListener("click", (placeFleet) => {
    startGame(placeFleet);
  });
  typeContainer.appendChild(quickDeploy);
  typeContainer.appendChild(placeFleet);
  main.appendChild(prompt);
  main.appendChild(typeContainer);
}

// Displays the player's board using rows and squares
export function displayBoard(player) {
  const idString = player.bot ? "bot-" : "player-";
  const playerDiv = document.createElement("div");
  playerDiv.classList.add("player-div");
  playerDiv.id = idString + "div";

  const name = document.createElement("span");
  name.classList.add("name");
  name.id = idString + "name";
  name.textContent = player.bot ? "Bot" : "Player";
  playerDiv.appendChild(name);

  const playerBoard = document.createElement("div");
  playerBoard.classList.add("board");
  playerBoard.id = idString + "board";

  const playerHash = [];
  for (let i = 0; i < 10; i++) {
    const row = document.createElement("div");
    row.classList.add("board-row");
    row.id = idString + `row-${i}`;
    playerHash[i] = [];

    for (let j = 0; j < 10; j++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.id = idString + `${j}-${i}`;
      row.appendChild(square);
      playerHash[i][j] = square; // ✅ fixed syntax
    }

    playerBoard.appendChild(row);
  }

  playerDiv.appendChild(playerBoard);
  main.appendChild(playerDiv);

  return playerHash;
}

export const terminalOutputStrings = [
  "> SYSTEM BOOT SEQUENCE INITIATED...<br>",
  "> LOADING KERNEL MODULES [OK]<br>",
  "> MOUNTING ROOT FILESYSTEM [OK]<br>",
  "> /dev/sda1 CLEAN<br>",
  "> CHECKING NETWORK ADAPTERS...<br>",
  "> eth0: LINK UP - IP 192.168.0.45<br>",
  "> wlan0: NO DEVICE FOUND<br>",
  "> STARTING SERVICES...<br>",
  "> sonar-daemon [RUNNING]<br>",
  "> radar-sweep [ACTIVE]<br>",
  "> net-listener [RUNNING]<br>",
  "> cpu-monitor [RUNNING]<br>",
  "> MEMORY USAGE: 42%<br>",
  "> CPU LOAD: 18%<br>",
  "> GPU STATUS: OPERATIONAL<br>",
  "> SYSTEM CLOCK: 14:35:07<br>",
  "> INITIALIZING SONAR SWEEP...<br>",
  "> SWEEP RANGE: 200m<br>",
  "> SWEEP SPEED: 0.75Hz<br>",
  "> PING... RESPONSE RECEIVED [137ms]<br>",
  "> PING... RESPONSE RECEIVED [142ms]<br>",
  "> PING... RESPONSE RECEIVED [140ms]<br>",
  "> AWAITING NEXT COMMAND...",
];

const terminal = document.getElementById("terminal");

// Appends spans and ship selection imgs for place fleet
export async function runTerminal(strings, imgSrcs) {
  const term = document.getElementById("terminal");
  let termSpan = document.getElementById("terminal-span");

  if (!termSpan) {
    termSpan = document.createElement("span");
    termSpan.id = "terminal-span";
    term.appendChild(termSpan);
  } else {
    // Clear existing content if re-running
    // termSpan.innerHTML = "";
  }

  const container = document.getElementById("ship-select-div");
  if (container) {
    term.removeChild(container);
  }

  for (const line of strings) {
    const lineSpan = document.createElement("span");
    lineSpan.innerHTML = line;
    termSpan.appendChild(lineSpan);

    // Check overflow
    while (termSpan.scrollHeight > term.clientHeight) {
      if (termSpan.firstChild) {
        termSpan.removeChild(termSpan.firstChild);
      } else {
        break;
      }
    }

    await delay(100);
  }

  if (imgSrcs) {
    const imgContainer = document.createElement("div");
    imgContainer.id = "ship-select-div";
    term.appendChild(imgContainer);

    for (const imgSrc of imgSrcs) {
      const imgElement = document.createElement("img");
      imgElement.id = `${imgSrc}-select`;
      imgElement.classList.add("ship-select");
      imgElement.src = `assets/jpg/${imgSrc}.jpg`;
      imgContainer.appendChild(imgElement);

      await delay(100);

      // Check overflow after DOM updates
      while (
        termSpan.scrollHeight + imgContainer.clientHeight >
        term.clientHeight
      ) {
        if (termSpan.firstChild) {
          termSpan.removeChild(termSpan.firstChild);
        } else {
          break;
        }
      }
    }

    return imgContainer;
  }
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// displays ships using offsets of .getBoundingClientRect
// shipElements have an absolute pos so grid cannot be used in this fashion
export function displayShip(player, ship) {
  const playerBoard = document.getElementById(
    `${player.bot ? "bot" : "player"}-board`,
  );
  const coordinates = ship.coordinates;
  const isHorizontal = ship.horizontal;

  const square = playerBoard.querySelector(".square");
  const { width: squareWidth, height: squareHeight } =
    square.getBoundingClientRect();

  const shipElement = document.createElement("div");
  shipElement.classList.add("ship-div");
  shipElement.id = `${player.bot ? "bot" : "player"}-${ship.type}`;
  const shipImg = document.createElement("img");
  shipImg.src = `assets/jpg/${ship.type}.jpg`;
  shipImg.classList.add("ship-img");
  shipImg.setAttribute("player-ship", `${player.bot ? "false" : "true"}`);

  const gridContainer = playerBoard.querySelector(".board-row");
  const gridOffset = gridContainer.getBoundingClientRect();
  const boardOffset = playerBoard.getBoundingClientRect();

  const offsetX = gridOffset.left - boardOffset.left;
  const offsetY = gridOffset.top - boardOffset.top;

  shipElement.style.left = ship.horizontal
    ? `${offsetX + coordinates[0][0] * squareWidth}px`
    : `${offsetX + coordinates[0][0] * squareWidth + squareWidth}px`;
  shipElement.style.top = `${offsetY + coordinates[0][1] * squareHeight}px`;
  shipElement.style.left =
    shipElement.style.left === "0"
      ? `${squareWidth * 9}px`
      : shipElement.style.left;

  // Position on grid by square size and coordinates

  // Set size as if horizontal
  shipElement.style.width = `${ship.length * squareWidth}px`;
  shipElement.style.height = `${squareHeight}px`;

  if (isHorizontal) {
  } else {
    shipElement.style.transformOrigin = "top left";
    shipElement.style.transform = `rotate(90deg)`;
  }

  shipElement.appendChild(shipImg);
  playerBoard.appendChild(shipElement);
  console.log(coordinates);
  console.log({ left: shipElement.style.left, top: shipElement.style.top });
  return shipElement;
}

export function displaySonarPoints(coordinates) {
  const container = document.getElementById("sonar");

  const dot = document.createElement("div");
  dot.classList.add("dot");
  dot.classList.add("sonar-dot");
  dot.style.gridRowStart = parseInt(coordinates[1]) + 1; // row index + 1
  dot.style.gridColumnStart = parseInt(coordinates[0]) + 1; // column index + 1

  // Position on grid by square size and coordinates

  // Set size as if horizontal

  container.appendChild(dot);
  return dot;
}

const container = document.getElementById("radar");

const dotContainer = document.createElement("div");
dotContainer.id = "radar-dot-div";
container.appendChild(dotContainer);

export function displayRadarPoints(coordinates) {
  const dot = document.createElement("div");
  dot.classList.add("dot"); // <-- now safe, dot is defined
  dot.classList.add("radar-dot");
  dot.style.gridRowStart = parseInt(coordinates[1]) + 1; // row index + 1
  dot.style.gridColumnStart = parseInt(coordinates[0]) + 1; // column index + 1

  dotContainer.appendChild(dot);

  return dot;
}

// Add listeners for attacks
export async function addSquareListeners(opponent, callback) {
  const opponentBoard = document.getElementById(
    `${opponent.bot ? "bot" : "player"}-board`,
  );
  const squares = opponentBoard.querySelectorAll(".square");

  return new Promise((resolve) => {
    // Store listeners so they can be removed later
    const listeners = [];

    for (const square of squares) {
      square.setAttribute("toggled", "false");
      let bomb;

      const mouseEnterHandler = () => {
        if (square.getAttribute("toggled") === "false") {
          bomb = document.createElement("div");
          bomb.id = "toggle-bomb";
          square.classList.add("hover");
          square.appendChild(bomb);
        }
      };

      const mouseLeaveHandler = () => {
        if (square.getAttribute("toggled") === "false") {
          square.classList.remove("hover");
          if (bomb) {
            square.removeChild(bomb);
            bomb = null;
          }
        }
      };

      const clickHandler = async () => {
        if (square.getAttribute("toggled") === "false") {
          square.setAttribute("toggled", "true");
          square.classList.remove("hover");

          // Cleanup listeners on all squares
          for (const { sq, enter, leave, click } of listeners) {
            sq.removeEventListener("mouseenter", enter);
            sq.removeEventListener("mouseleave", leave);
            sq.removeEventListener("click", click);
          }

          resolve([square, await callback(opponent, square, bomb)]);
        } else {
          square.style.animation = "none";
          square.offsetHeight; // trigger reflow
          square.style.animation = "shake";
        }
      };

      square.addEventListener("mouseenter", mouseEnterHandler);
      square.addEventListener("mouseleave", mouseLeaveHandler);
      square.addEventListener("click", clickHandler);

      // Save listener references
      listeners.push({
        sq: square,
        enter: mouseEnterHandler,
        leave: mouseLeaveHandler,
        click: clickHandler,
      });
    }
  });
}

let clickCount = 0;

// add listeners for place fleet's drag and drop
export function addDragListeners(player, ship, callback) {
  return new Promise((resolve) => {
    const playerBoard = document.getElementById(
      `${player.bot ? "bot" : "player"}-board`,
    );
    const squares = playerBoard.querySelectorAll(".square");

    const listeners = [];

    const board = playerBoard;
    let shipElement = document.getElementById(
      `${player.bot ? "bot" : "player"}-${ship.type}`,
    );
    let coordinates = [];
    let overlap = false;

    const clearPreviewSquares = () => {
      for (const sq of squares) {
        delete sq.dataset.preview;
      }
    };

    const mouseEnterHandler = (square) => {
      overlap = false; // reset overlap each time

      const isHorizontal = ship.horizontal;
      const id = square.id.split("-");
      const startX = parseInt(id[1]);
      const startY = parseInt(id[2]);

      coordinates = [];

      if (
        (isHorizontal && startX + ship.length <= 10) ||
        (!isHorizontal && startY + ship.length <= 10)
      ) {
        for (let i = 0; i < ship.length; i++) {
          const x = isHorizontal ? startX + i : startX;
          const y = isHorizontal ? startY : startY + i;
          coordinates.push([x, y]);
        }

        if (!player.gameBoard.isOverlap(coordinates)) {
          ship.coordinates = coordinates;
          callback(player, ship); // show preview
          square.dataset.preview = "true";
        } else {
          overlap = true;
          clearPreviewSquares();
        }
      } else {
        overlap = true; // out of bounds
        clearPreviewSquares();
      }
    };

    const mouseLeaveHandler = (square) => {
      shipElement = document.getElementById(
        `${player.bot ? "bot" : "player"}-${ship.type}`,
      );
      if (shipElement && board.contains(shipElement)) {
        board.removeChild(shipElement);
      }

      delete square.dataset.preview;
      console.log("Preview cleared for", square.id);
    };

    const mouseClickHandler = (square) => {
      if (!overlap) {
        console.log("no overlap, placing ship");

        clearPreviewSquares();

        shipElement = document.getElementById(
          `${player.bot ? "bot" : "player"}-${ship.type}`,
        );

        if (shipElement && !board.contains(shipElement)) {
          board.appendChild(shipElement);
        }

        // Remove all listeners after placement
        for (const { sq, enter, leave, click } of listeners) {
          sq.removeEventListener("mouseenter", enter);
          sq.removeEventListener("mouseleave", leave);
          sq.removeEventListener("click", click);
        }
        window.removeEventListener("keydown", keyDownHandler);

        resolve(ship);
      } else {
        console.log("overlap detected, cannot place ship here");
        if (shipElement) {
          shipElement.style.animation = "shake 0.5s";
          shipElement.addEventListener(
            "animationend",
            () => {
              shipElement.style.animation = "";
            },
            { once: true },
          );
        }
      }
    };

    const keyDownHandler = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        ship.horizontal = !ship.horizontal;
        clearPreviewSquares();

        // Recompute preview on rotation using lastHoveredSquare
      }
    };

    // Attach event listeners to each square
    for (const square of squares) {
      const enter = () => mouseEnterHandler(square);
      const leave = () => mouseLeaveHandler(square);
      const click = () => mouseClickHandler(square);

      square.addEventListener("mouseenter", enter);
      square.addEventListener("mouseleave", leave);
      square.addEventListener("click", click);

      listeners.push({ sq: square, enter, leave, click });
    }

    window.addEventListener("keydown", keyDownHandler);
  });
}

export function displayWinner(winner) {
  runTerminal([`> ${winner.bot ? "BOT" : "PLAYER"}` + " WINS!"]);
}

// change dot elements' css in respective sonar and radar divs when sweep overlaps
export function highlightDots(type) {
  const dots = document.querySelectorAll(`.${type}-dot`);
  const sweep = document.getElementById(`${type}-sweep`);
  const sweepPos = sweep.getBoundingClientRect();

  if (dots.length > 0) {
    // Define a refined region for radar
    let refinedSweepPos = sweepPos;

    if (type === "radar") {
      const inset = 10; // pixels to inset each side; adjust as needed
      refinedSweepPos = {
        top: sweepPos.top + inset,
        bottom: sweepPos.bottom - inset,
        left: sweepPos.left + inset,
        right: sweepPos.right - inset,
      };
    }

    for (const dot of dots) {
      const dotPos = dot.getBoundingClientRect();
      if (
        !(
          dotPos.left > refinedSweepPos.right ||
          dotPos.right < refinedSweepPos.left ||
          dotPos.bottom < refinedSweepPos.top ||
          dotPos.top > refinedSweepPos.bottom
        )
      ) {
        dot.setAttribute("highlighted", "true");
      } else if (
        dotPos.left > refinedSweepPos.right ||
        dotPos.right < refinedSweepPos.left ||
        dotPos.bottom < refinedSweepPos.top ||
        dotPos.top > refinedSweepPos.bottom
      ) {
        dot.setAttribute("highlighted", "false");
      }
    }
  }
}
