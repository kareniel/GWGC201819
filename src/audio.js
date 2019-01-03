/* beep adapted from https://github.com/kapetan/browser-beep */

var FREQUENCY = 220
var INTERVAL = 250
var RAMP_VALUE = 0.00001
var RAMP_DURATION = 1

var { randomInt } = require('./utils')

module.exports = {
  lastAudioKeyIndex: 0,
  sounds: {
    enter: new Audio('sounds/enter.mp3'),
    backspace: new Audio('sounds/backsp.mp3'),
    keys: [
      new Audio('sounds/key0.mp3'),
      new Audio('sounds/key1.mp3'),
      new Audio('sounds/key2.mp3'),
      new Audio('sounds/key3.mp3'),
      new Audio('sounds/key4.mp3')
    ]
  },

  beep: _beep(),

  play (sound) {
    if (sound === 'key') return this._playRandomKeySound()

    var el = this.sounds[sound]

    if (!el) return console.error(sound, 'does not exist')

    el.currentTime = 0
    el.play()
  },

  _playRandomKeySound () {
    var index = this.lastAudioKeyIndex

    while (index === this.lastAudioKeyIndex) {
      index = randomInt(0, 4)
    }

    var el = this.sounds.keys[index]

    el.currentTime = 0
    el.play()

    this.lastAudioKeyIndex = index
  }
}

function _beep (options) {
  if (!options) options = {}

  var AudioContext = window.AudioContext || window.webkitAudioContext
  var context = new AudioContext()

  var frequency = options.frequency || FREQUENCY
  var interval = options.interval || INTERVAL

  var play = function () {
    var currentTime = context.currentTime
    var osc = context.createOscillator()
    var gain = context.createGain()

    osc.connect(gain)
    gain.connect(context.destination)

    gain.gain.setValueAtTime(gain.gain.value, currentTime)
    gain.gain.exponentialRampToValueAtTime(RAMP_VALUE, currentTime + RAMP_DURATION)

    osc.onended = function () {
      gain.disconnect(context.destination)
      osc.disconnect(gain)
    }

    osc.type = 'sine'
    osc.frequency.value = frequency
    osc.start(currentTime)
    osc.stop(currentTime + RAMP_DURATION)
  }

  var beep = function (times) {
    if (!times) times = 1

    ;(function loop (i) {
      play()
      if (++i < times) setTimeout(loop, interval, i)
    })(0)
  }

  beep.destroy = function () {
    if (!options.context) context.close()
  }

  return beep
}
