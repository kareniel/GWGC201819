var EventEmitter = require('events')

var audio = require('./audio')
var { randomInt, sleep } = require('./utils')
var { introText, credits, gameOverText } = require('./data')

module.exports = class Terminal extends EventEmitter {
  constructor (el) {
    super()

    this.prompts = {
      login: 'login: ',
      password: 'password: ',
      shell: 'hacker@spacecraft:/$ '
    }

    this.el = el
    this.preInput = this.prompts.login

    this.historyEl = el.querySelectorAll('#history')[0]
    this.inputEl = el.querySelectorAll('#input')[0]
    this.menuEl = el.querySelectorAll('#menu')[0]

    this.history = []
    this.inputValue = ''

    this.addListeners()
    this.clear()

    // this.load(loginProgram)
    this.updateInput()
  }

  addListeners () {
    this.onKeyPress = this.onKeyPress.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)

    document.addEventListener('keyup', this.onKeyUp)
    document.addEventListener('keypress', this.onKeyPress)
  }

  removeListeners () {
    document.removeEventListener('keyup', this.onKeyUp)
    document.removeEventListener('keypress', this.onKeyPress)
  }

  onKeyUp (e) {
    if (this.printing) return
    if (e.key === 'Backspace') return this.erase()
    if (e.key === 'Escape') return this.toggleMenu()
  }

  async onKeyPress (e) {
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
  }

  toggleMenu () {
    audio.beep()
    this.menuEl.style.display = this.menuEl.style.display === 'none'
      ? 'block'
      : 'none'
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

  async camera (args) {
    this.print(args.join(' '))
    return this.emit('camera:' + args[0])
  }

  async exec (text) {
    audio.play('enter')
    this.history.push(text)

    await this.print(this.preInput + text, false)

    var words = text.split(' ')
    var cmd = words[0]
    var args = words.slice(1)

    switch (cmd) {
      case '':
        await this.print('')
        break
      case 'clear':
        await this.clear()
        break
      case 'camera':
        await this.camera(args)
        break
      case 'cheat':
        await this.cheat(args)
        break
      case 'die':
        await this.gameOver()
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

  async gameOver () {
    var term = this

    this.removeListeners()
    this.emit('camera:end', 0)
    this.clear()

    await this.print(gameOverText)
    await sleep(2500)
    await this.print('            Press enter to try again')

    this.preInput = ' '

    document.addEventListener('keydown', async function onKeyDown (e) {
      if (e.key === 'Enter') {
        document.removeEventListener('keydown', onKeyDown)
        await sleep(100)
        term.emit('reset')
      }
    })
  }

  async cheat () {
    this.removeListeners()
    this.emit('camera:end', 1)

    for (let credit of credits) {
      this.clear()
      await this.print(credit)
      await sleep(2500)
    }

    await sleep(999999999)
  }
}
