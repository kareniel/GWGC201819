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
