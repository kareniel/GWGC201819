module.exports.randomInt = function randomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min + 1)) + min
}

module.exports.sleep = async function (t) {
  return new Promise(resolve => setTimeout(() => resolve(), t))
}
