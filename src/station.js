class Marine {}

module.exports = class Station {
  constructor () {
    this.marines = new Array(3).fill(new Marine())
  }
}
