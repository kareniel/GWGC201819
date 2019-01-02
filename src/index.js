var Terminal = require('./terminal')

init()

function init () {
  document.addEventListener('DOMContentLoaded', () => {
    var termEl = document.querySelectorAll('.terminal')[0]
    var term = new Terminal(termEl)

    setupRightCanvas()
  })
}

function setupRightCanvas () {
  var rightCanvas = document.getElementById('right-screen')

  var ctx = rightCanvas.getContext('2d')

  ctx.fillStyle = 'red'
  ctx.fillRect(0, 0, rightCanvas.width, rightCanvas.height)

  ctx.font = '16px monospace'
  ctx.fillStyle = 'white'
  ctx.fillText('No signal', 16, 16)
}
