var EventEmitter = require('events')

var audio = require('./audio')
var { randomInt, sleep } = require('./utils')

module.exports = class Terminal extends EventEmitter {
  constructor (el) {
    super()

    this.el = el
    this.preInput = 'hacker@spacecraft:/$ '

    this.historyEl = el.querySelectorAll('#history')[0]
    this.inputEl = el.querySelectorAll('#input')[0]

    this.history = []
    this.inputValue = ''

    document.addEventListener('keyup', e => {
      if (this.printing) return
      if (e.key === 'Backspace') return this.erase()
    })

    document.addEventListener('keypress', async (e) => {
      if (this.printing) return
      if (e.key === 'Enter') {
        this.eraseInput()
        await this.exec(this.inputValue)
        this.inputValue = ''
        this.updateInput()

        return
      }

      this.inputValue += String.fromCharCode(e.which)
      this.updateInput()
      audio.play('key')
    })

    this.updateInput()
  }

  erase () {
    this.inputValue = this.inputValue.slice(0, -1)
    this.updateInput()
    audio.play('backspace')
  }

  async print (text, delay = true) {
    this.printing = true
    var el = document.createElement('pre')

    this.historyEl.appendChild(el)

    this.updateScroll()

    for (let char of text.split('')) {
      el.innerHTML = el.innerHTML + char
      if (delay) await sleep(20)
    }

    await sleep(40)
    this.printing = false
  }

  async clear () {
    this.historyEl.querySelectorAll('*').forEach(el => {
      this.historyEl.removeChild(el)
    })
  }

  async exec (cmd) {
    audio.play('enter')
    this.history.push(cmd)

    await this.print(this.preInput + cmd, false)

    switch (cmd) {
      case '':
        await this.print('')
        break
      case 'clear':
        await this.clear()
        break
      default:
        await this.print(cmd + ': Command not found.')
        break
    }
  }

  updateInput () {
    this.inputEl.innerHTML = this.preInput + this.inputValue + '█'
  }

  eraseInput () {
    this.inputEl.innerHTML = ''
  }

  updateScroll () {
    this.el.scrollTop = this.el.scrollHeight
  }
}
