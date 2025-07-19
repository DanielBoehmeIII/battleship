export class Ship {
  constructor(type, length) {
    this.type = type;
    this.length = null;
    this.hits = Array(length).fill(false);
    this.sunk = false;
    this.length = length;
    this.horizontal = null;
    this.coordinates = null;

    // console.log(this.length);
  }

  hit(position) {
    if (position >= 0 && position < this.length) this.hits[position] = true;
  }

  isSunk() {
    return this.hits.every(Boolean); // returns callback for each element in array (Boolean)
  }
}
