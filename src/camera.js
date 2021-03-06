var glitchCanvas = require('./glitch')
var { randomInt, sleep } = require('./utils')

module.exports = class Camera {
  constructor (canvas, world) {
    var ctx = canvas.getContext('2d')

    canvas.width = 720 / 2 // 45 tiles
    canvas.height = 480 / 2 // 30 tiles

    this.ctx = ctx
    this.canvas = canvas
    this.world = world

    this.online = false

    this.x = 0
    this.y = 0
    this.buses = []

    this.init()
  }

  async init () {
    this.tiles = await this.loadTiles()

    this.map = require('../sprites/spacestation.map.json')
    this.tileset = require('../sprites/spacestation.json')

    this.loop()
  }

  loadTiles () {
    return new Promise(resolve => {
      var img = new Image()

      img.onload = function () {
        resolve(img)
      }

      img.src = 'http://localhost:8080/tiles.png'
    })
  }

  loop () {
    if (this.gameOver) return this.renderGameOver()

    requestAnimationFrame(async () => {
      await this.draw()
      this.loop()
    })
  }

  async draw () {
    if (this.online) {
      this.drawOnline()

      if (randomInt(0, 25) === 0) {
        await glitchCanvas(this.canvas)
        await sleep(randomInt(5, 100))
      }
    } else {
      this.drawOffline()
    }
  }

  drawBG () {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  drawLayer (layer) {
    let x = 0
    let y = 0
    let world = null
    let index = 0
    let tileId = 0

    for (y = 0; y < 30; y++) {
      for (x = 0; x < 45; x++) {
        world = this.toWorld(x, y)
        index = (layer.width * world.y) + world.x
        tileId = layer.data[index]

        this.drawTile(tileId, x, y)
      }
    }
  }

  drawTile (tileId, x, y) {
    tileId = tileId - 1 // stupid tiled offset
    var row = Math.floor(tileId / this.tileset.columns)
    var col = tileId - (row * this.tileset.columns)

    this.ctx.drawImage(
      this.tiles,
      col * 16, row * 16, 16, 16,
      x * 16, y * 16, 16, 16
    )
  }

  drawSprites () {
    this.world.marines.forEach(marine => {
      this.drawTile(22, marine.x, marine.y)
    })
  }

  toWorld (x, y) {
    return {
      x: x + this.x,
      y: y + this.y
    }
  }

  toScreen (x, y) {
    return {
      x: x - this.x,
      y: y - this.y
    }
  }

  drawOnline () {
    this.drawBG()

    this.drawLayer(this.map.layers[0])
    this.drawSprites()
    this.drawLayer(this.map.layers[1])
    this.drawLayer(this.map.layers[2])
  }

  drawOffline () {
    this.ctx.fillStyle = 'blue'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.font = '16px monospace'
    this.ctx.fillStyle = 'white'
    this.ctx.fillText('No signal', 16, 32)
  }

  connect (bus) {
    this.buses.push(bus)

    bus.on('camera:on', () => {
      this.online = true
    })

    bus.on('camera:off', () => {
      this.online = false
    })

    bus.on('camera:left', () => {
      this.x -= 4
    })

    bus.on('camera:right', () => {
      this.x += 4
    })

    bus.on('camera:up', () => {
      this.y -= 4
    })

    bus.on('camera:down', () => {
      this.y += 4
    })

    bus.on('camera:end', (ending) => {
      this.ending = ending
      this.gameOver = true
    })
  }

  renderGameOver () {
    if (this.ending >= 1) return this.ending1()

    return this.ending0()
  }

  ending0 () {
    this.ctx.fillStyle = 'red'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  ending1 () {
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
