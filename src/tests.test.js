import { Ship } from "./classes";
import { Player } from "./factories";
import { displayShip } from "./dom-display";

import fs from "fs";
import path from "path";

beforeEach(() => {
  const html = fs.readFileSync(
    path.resolve(__dirname, "./template.html"),
    "utf8",
  );
  document.body.innerHTML = html;
});
console.log(
  test("displayShip places carrier correctly", () => {
    document.body.innerHTML = `
    <div id="player-board">
      <div class="square"></div>
    </div>
    <div id="bot-board">
      <div class="square"></div>
    </div>
  `;

    const square = document.querySelectorAll(".square");
    square.getBoundingClientRect = jest.fn(() => ({
      width: 50,
      height: 50,
      top: 0,
      left: 0,
      bottom: 50,
      right: 50,
    }));

    const player = Player();
    const ship = player.gameBoard.placeShip(player, "carrier");

    displayShip(player, ship);

    const shipDiv = document.getElementById(
      `${player.bot ? "bot" : "player"}-carrier`,
    );
    expect(shipDiv).not.toBeNull();
    expect(shipDiv.style.width).toBe("250px");
  }),
);
