var Terminal = require('./terminal')
var Camera = require('./camera')

init()

class Marine {
  constructor (x = 0, y = 0) {
    this.x = x
    this.y = y
  }
}

class World {
  constructor () {
    this.marines = new Array(1).fill(new Marine(5, 5))

    var up = true

    setInterval(() => {
      if (up) {
        this.marines[0].x++
        up = false
      } else {
        this.marines[0].x--
        up = true
      }
    }, 1000)
  }
}

function init () {
  document.addEventListener('DOMContentLoaded', () => {
    startGame()
  })
}

function startGame () {
  var termEl = document.getElementById('left-screen')
  var term = new Terminal(termEl)

  var world = new World()

  var canvas = document.getElementById('right-screen')
  var camera = new Camera(canvas, world)

  camera.connect(term)

  term.on('reset', () => {
    termEl = null
    term = null
    world = null
    canvas = null
    camera = null

    startGame()
  })
}
