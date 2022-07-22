const generator = {nounGroup:{}, phrase:{}}
generator.quantityCount = wordlist['singular quantity'].length + wordlist['plural quantity'].length
generator.param = {}

const uint8Array = new Uint8Array(1)
const uint16Array = new Uint16Array(1)
const uint32Array = new Uint32Array(1)
function randbelow(max) {
  // generate random number from Crypto.getRandomValues using rejection sampling
  let naturalRange = 0
  let container = null
  if (max <= 256) {
    container = uint8Array
    naturalRange = 256
  } else if (max <= 65536) {
    container = uint16Array
    naturalRange = 65536
  } else {
    container = uint32Array
    naturalRange = 4294967296
  }
  const discardLimit = naturalRange - naturalRange % max
  while (true) {
    window.crypto.getRandomValues(container)
    if (container[0] < discardLimit)
      return container[0] % max
  }
}
function randChoice(list) {
  return list[randbelow(list.length)]
}
generator.nounGroup.rand = function(size) {
  assert(size >= 1 && size <= 5)
  let noun = randChoice(wordlist.noun)
  if (size === 1) return noun[1]
  noun2 = randChoice(wordlist.firstnoun)
  noun = noun.map(word => `${noun2}-${word}`)
  if (size === 2) return noun[1]
  let result = randChoice(wordlist.adjective) + ' '
  if (size === 3) return result + noun[1]
  result = randChoice(wordlist.adverb) + ' ' + result
  if (size === 4) return result + noun[1]
  const rand = randbelow(generator.quantityCount)
  if (rand < wordlist['singular quantity'].length) {
    let quantity = wordlist['singular quantity'][rand]
    if (quantity === 'a' && ['a', 'e', 'i', 'o', 'u'].includes(result[0].toLowerCase()))
      quantity = 'an'
    return quantity + ' ' + result + noun[0]
  } else
    return wordlist['plural quantity'][rand - wordlist['singular quantity'].length] + ' ' + result + noun[1]
}

generator.nounGroup.choices = [1]
generator.nounGroup.choices.unshift(generator.nounGroup.choices[0] * wordlist.noun.length)
generator.nounGroup.choices.unshift(generator.nounGroup.choices[0] * wordlist.firstnoun.length)
generator.nounGroup.choices.unshift(generator.nounGroup.choices[0] * wordlist.adjective.length)
generator.nounGroup.choices.unshift(generator.nounGroup.choices[0] * wordlist.adverb.length)
generator.nounGroup.choices.unshift(generator.nounGroup.choices[0] * generator.quantityCount)
generator.nounGroup.choices = generator.nounGroup.choices.map(num => BigInt(num)).reverse()
console.log(generator.nounGroup.choices)

generator.nounGroup.randChain = function({bitCount, groupSize}={}) {
  assert(bitCount > 0)
  let groupCount = 0
  let targetChoices = 2n ** BigInt(bitCount)
  let currentChoices = 1n
  let groupChoices = generator.nounGroup.choices[groupSize]
  while (currentChoices < targetChoices) {
    groupCount += 1
    currentChoices *= groupChoices
  }
  groupSize = 0
  currentChoices = 1n
  while (currentChoices < targetChoices) {
    groupSize += 1
    currentChoices = generator.nounGroup.choices[groupSize] ** BigInt(groupCount)
  }
  currentChoices /= generator.nounGroup.choices[groupSize]
  targetChoices /= currentChoices
  let firstGroupSize = 1
  for (;generator.nounGroup.choices[firstGroupSize] <= targetChoices; firstGroupSize++);

  let result = generator.nounGroup.rand(firstGroupSize)
  for (let i = 1; i < groupCount; i++)
    result += ', ' + generator.nounGroup.rand(groupSize)
  return [result, currentChoices * generator.nounGroup.choices[firstGroupSize]]
}

generator.phrase.rand = function(groupCount, groupSize, firstGroupSize) {
  assert(groupCount > 0 && groupCount < 512)
  if (firstGroupSize == null) firstGroupSize = groupSize
  if (groupCount <= 1)
    return generator.nounGroup.rand(firstGroupSize)
  const connectorCount = groupCount - 1
  const verbPosition = randbelow(connectorCount)
  let result = ''
  for (let i = 0; i < connectorCount; i++)
    result += ' ' + randChoice(i === verbPosition ? wordlist.verb : wordlist.connector) + ' ' + generator.nounGroup.rand(groupSize)
  return generator.nounGroup.rand(firstGroupSize) + result
}

generator.phrase.choices = function(groupCount, groupSize, firstGroupSize) {
  if (firstGroupSize == null) firstGroupSize = groupSize
  if (groupCount <= 1)
    return generator.nounGroup.choices[firstGroupSize]
  return generator.nounGroup.choices[groupSize] ** BigInt(groupCount - 1) * generator.nounGroup.choices[firstGroupSize] * BigInt(wordlist.connector.length) ** BigInt(groupCount - 2) * BigInt(wordlist.verb.length) * BigInt(groupCount - 1)
}
generator.phrase.combined = function({groupCount, groupSize, firstGroupSize}={}) {
  return [generator.phrase.rand(groupCount, groupSize, firstGroupSize), generator.phrase.choices(groupCount, groupSize, firstGroupSize)]
}

generator.minEntropy = function({bitCount}={}) {
  let groupCount = 1
  let targetChoices = 2n ** BigInt(bitCount)
  let currentChoices = 0
  while (true) {
    currentChoices = generator.phrase.choices(groupCount, 5)
    if (currentChoices >= targetChoices) break
    groupCount += 1
  }
  let groupSize = 1
  while (true) {
    currentChoices = generator.phrase.choices(groupCount, groupSize)
    if (currentChoices >= targetChoices) break
    groupSize += 1
  }
  currentChoices /= generator.nounGroup.choices[groupSize]
  targetChoices /= currentChoices
  firstGroupSize = 1
  for (;generator.nounGroup.choices[firstGroupSize] <= targetChoices; firstGroupSize++);
  return [generator.phrase.rand(groupCount, groupSize, firstGroupSize), currentChoices * generator.nounGroup.choices[firstGroupSize]]
}
