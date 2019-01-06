/* Adapted from https://github.com/snorpey/glitch-canvas */

var { randomInt, sleep } = require('./utils')

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const base64Map = base64Chars.split('')
const reversedBase64Map = { }

var canvas = document.createElement('canvas')

base64Map.forEach((val, key) => { reversedBase64Map[val] = key })

module.exports = function glitchCanvas (canvas) {
  return new Promise(async (resolve) => {
    var ctx = canvas.getContext('2d')
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    var base64URL = await imageDataToBase64(imageData, randomInt(0, 100))
    var glitched = glitchImageData(base64URL)
    var img = new Image(canvas.width, canvas.height)
    var timer = setTimeout(() => {
      resolve()
    }, 200)

    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      clearTimeout(timer)
      resolve()
    }

    img.src = glitched
  })
}

function imageDataToBase64 (imageData, quality = 90) {
  return new Promise((resolve, reject) => {
    canvas.width = imageData.width
    canvas.height = imageData.height

    var ctx = canvas.getContext('2d')

    ctx.putImageData(imageData, 0, 0)

    var base64URL = canvas.toDataURL('image/jpeg', quality / 100)

    resolve(base64URL)
  })
}

function glitchImageData (base64URL) {
  var byteArray = base64ToByteArray(base64URL)
  var glitchedByteArray = glitchByteArray(byteArray)
  var glitchedBase64URL = byteArrayToBase64(glitchedByteArray)

  return glitchedBase64URL
}

function jpgHeaderLength (byteArr) {
  let result = 417

  for (var i = 0, len = byteArr.length; i < len; i++) {
    if (byteArr[i] === 0xFF && byteArr[i + 1] === 0xDA) {
      result = i + 2
      break
    }
  }

  return result
}

function base64ToByteArray (base64URL) {
  const result = [ ]
  let prev

  for (var i = 23, len = base64URL.length; i < len; i++) {
    const currrentChar = reversedBase64Map[ base64URL.charAt(i) ]
    const digitNum = (i - 23) % 4

    switch (digitNum) {
      // case 0: first digit - do nothing, not enough info to work with
      case 1: // second digit
        result.push(prev << 2 | currrentChar >> 4)
        break

      case 2: // third digit
        result.push((prev & 0x0f) << 4 | currrentChar >> 2)
        break

      case 3: // fourth digit
        result.push((prev & 3) << 6 | currrentChar)
        break
    }

    prev = currrentChar
  }

  return result
}

function glitchByteArray (byteArray) {
  var seed = randomInt(0, 100)
  var amount = randomInt(0, 100)
  var iterationCount = 1

  const headerLength = jpgHeaderLength(byteArray)
  const maxIndex = byteArray.length - headerLength - 4

  const amountPercent = amount / 100
  const seedPercent = seed / 100

  for (var iterationIndex = 0; iterationIndex < iterationCount; iterationIndex++) {
    const minPixelIndex = (maxIndex / iterationCount * iterationIndex) | 0
    const maxPixelIndex = (maxIndex / iterationCount * (iterationIndex + 1)) | 0

    const delta = maxPixelIndex - minPixelIndex
    let pixelIndex = (minPixelIndex + delta * seedPercent) | 0

    if (pixelIndex > maxIndex) {
      pixelIndex = maxIndex
    }

    const indexInByteArray = ~~(headerLength + pixelIndex)

    byteArray[indexInByteArray] = ~~(amountPercent * 256)
  }

  return byteArray
}

function byteArrayToBase64 (byteArray) {
  const result = [ 'data:image/jpeg;base64,' ]
  let byteNum
  let previousByte

  for (var i = 0, len = byteArray.length; i < len; i++) {
    const currentByte = byteArray[i]
    byteNum = i % 3

    switch (byteNum) {
      case 0: // first byte
        result.push(base64Map[ currentByte >> 2 ])
        break
      case 1: // second byte
        result.push(base64Map[(previousByte & 3) << 4 | (currentByte >> 4)])
        break
      case 2: // third byte
        result.push(base64Map[(previousByte & 0x0f) << 2 | (currentByte >> 6)])
        result.push(base64Map[currentByte & 0x3f])
        break
    }

    previousByte = currentByte
  }

  if (byteNum === 0) {
    result.push(base64Map[(previousByte & 3) << 4])
    result.push('==')
  } else {
    if (byteNum === 1) {
      result.push(base64Map[(previousByte & 0x0f) << 2])
      result.push('=')
    }
  }

  return result.join('')
}
