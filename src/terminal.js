var EventEmitter = require('events')

module.exports = class Terminal extends EventEmitter {
  constructor (el) {
    super()

    this.el = el

    this.historyEl = el.querySelectorAll('#history')[0]
    this.inputEl = el.querySelectorAll('#input')[0]

    var text = document.createElement('pre')
    text.innerHTML = 'Hello!'

    this.history = [ text ]
    this.inputValue = ''
    this.historyEl.appendChild(text)

    this.audio = {
      enter: new Audio('sounds/enter.mp3'),
      backspace: new Audio('sounds/backsp.mp3'),
      keys: [
        new Audio('sounds/key0.mp3'),
        new Audio('sounds/key1.mp3'),
        new Audio('sounds/key2.mp3'),
        new Audio('sounds/key3.mp3'),
        new Audio('sounds/key4.mp3')
      ]
    }

    document.addEventListener('keyup', e => {
      if (e.key === 'Backspace') return this.erase()
    })

    document.addEventListener('keypress', e => {
      if (e.key === 'Enter') return this.exec()

      this.inputValue += String.fromCharCode(e.which)
      this.updateInput()
      this.play('key')
    })
  }

  erase () {
    this.inputValue = this.inputValue.slice(0, -1)
    this.updateInput()
    this.play('backspace')
  }

  exec () {
    var el = document.createElement('pre')
    el.innerHTML = this.inputValue

    this.history.push(el)
    this.historyEl.appendChild(el)

    this.inputValue = ''
    this.updateInput()
    this.play('enter')
  }

  updateInput () {
    this.inputEl.innerHTML = this.inputValue
  }

  play (key) {
    if (key === 'key') return this.playRandomKeySound()
    var el = this.audio[key]

    if (!el) return console.error(key, 'does not exist')

    el.currentTime = 0
    el.play()
  }

  playRandomKeySound () {
    var index = this.lastAudioKeyIndex

    while (index === this.lastAudioKeyIndex) {
      index = randomInt(0, 4)
    }

    var el = this.audio.keys[index]

    el.currentTime = 0
    el.play()

    this.lastAudioKeyIndex = index
  }
}

function randomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)

  return Math.floor(Math.random() * (max - min + 1)) + min
}
