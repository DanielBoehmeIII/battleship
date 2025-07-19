import "./style.css";
import "./media-query.css";
import { displayStart, highlightDots } from "./dom-display";
function startGame() {
  displayStart();
}

displayStart();

function setBoard() {
  main.innerHTML = "";
}

function quickDeploy() {}

function loadType() {}

function loadSingle() {}

function loadMulti() {}

function gameLoop() {}

function setupPieces() {}

function setMoveable() {}

function adjustPos() {}

function setPos() {}

function guess() {}

function getResult() {}

function switchTurn() {}

function checkWin() {}

function displayWinner() {}

setInterval(() => highlightDots("sonar"), 100); // every 100ms
setInterval(() => highlightDots("radar"), 100);
