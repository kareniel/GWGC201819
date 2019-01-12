var EventEmitter = require('events')

var audio = require('./audio')
var { randomInt, sleep } = require('./utils')
var { introText, credits, gameOverText } = require('./data')
const usage = {
  scan: `List available subsystems connected to this terminal.`,
  connect: `Connect to one of the station's subsystems.\n` +
           `Usage: connect <SUBSYSTEM>`,
  default: `Use 'help <COMMAND>' to learn how to use a given command.\n\n` +
           `Available commands:\n` +
           `scan\tconnect\n`
}

const SPEED = 1// 0

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
    this.context = 'login'
    this.subsystems = [{
      name: 'VIDEO',
      isOnline: true
    }, {
      name: 'DOOR',
      isOnline: true
    }, {
      name: 'SOUND',
      isOnline: false
    }]

    this.addListeners()

    this.start()
  }

  async start () {
    this.clear()
    await this.print(introText)

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
      if (delay) await sleep(20 * SPEED)
    }

    await sleep(40 * SPEED)
    this.printing = false
  }

  async clear () {
    this.historyEl.querySelectorAll('*').forEach(el => {
      this.historyEl.removeChild(el)
    })
  }

  async camera (args) {
    return this.emit('camera:' + args[0])
  }

  async help (args) {
    var cmd = args[0]
    var text = usage[cmd] || usage['default']

    await this.print(text)
  }

  async scan (cmd) {
    await this.clear()
    await this.print(
      `Online subsystems:\n` +
      this.subsystems
        .filter(s => s.isOnline)
        .map(s => s.name)
        .join('\t')
    )
  }

  async exec (text) {
    audio.play('enter')

    await this.print(this.preInput + text, false)

    var words = text.split(' ')
    var cmd = words[0]
    var args = words.slice(1)

    switch (this.context) {
      case 'shell':
        return this.execShell(cmd, args)
      case 'login':
        return this.execLogin(cmd, args)
      default:
    }
  }

  async execShell (cmd, args) {
    this.history.push(cmd + ' ' + args.join(''))

    var fn = this[cmd]

    if (!cmd) {
      await this.print('')
      return
    }

    if (!fn || typeof fn !== 'function') {
      await this.print(cmd + ': Command not found.')
      return
    }

    fn.call(this, args)
  }

  async connect (args) {
    var subsystem = args[0]
    var onlineSystems = this.subsystems
      .filter(s => s.isOnline)
      .map(s => s.name)

    if (!subsystem) return this.print(usage['connect'])

    if (!onlineSystems.includes(subsystem)) {
      await this.print(
        `Error: Subsystem '${subsystem}' not available. \n` +
        `Use 'scan' to get a list of available subsystems.`)
      return
    }

    await this.print(`Communication with ${subsystem} subsystem established.`)
  }

  async execLogin (cmd) {
    var name = cmd

    if (!name) return

    this.emit('player:set-name', name)
    this.context = 'shell'
    this.preInput = `${name}@ALPHA4:/$ `

    await this.print(
      `\nLogged in as ${name}. \n` +
      `Enter 'help' to list available commands.\n\n`
    )
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

  async die () {
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
