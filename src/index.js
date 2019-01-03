var Terminal = require('./terminal')
var Camera = require('./camera')

init()

function init () {
  document.addEventListener('DOMContentLoaded', () => {
    var termEl = document.getElementById('left-screen')
    var term = new Terminal(termEl)

    var canvas = document.getElementById('right-screen')
    var camera = new Camera(canvas)

    global.camera = camera

    camera.connect(term)
  })
}
