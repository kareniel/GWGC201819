var glitchCanvas = require('./glitch')
var { randomInt, sleep } = require('./utils')

module.exports = class Camera {
  constructor (canvas) {
    var ctx = canvas.getContext('2d')

    this.ctx = ctx
    this.canvas = canvas

    this.loop()
  }

  loop () {
    requestAnimationFrame(async () => {
      await this.draw()
      this.loop()
    })
  }

  async draw () {
    this.drawOffline()

    if (randomInt(0, 25) === 0) {
      await glitchCanvas(this.canvas)
      await sleep(randomInt(5, 100))
    }
  }

  drawOffline () {
    this.ctx.fillStyle = 'red'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.font = '16px monospace'
    this.ctx.fillStyle = 'white'
    this.ctx.fillText('No signal', 16, 16)
  }
}
