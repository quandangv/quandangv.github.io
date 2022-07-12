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
  console.assert(size >= 1 && size <= 5)
  let noun = randChoice(wordlist.noun)
  if (size === 1) return noun[1]
  noun2 = randChoice(wordlist.noun)[2]
  noun = noun.map(word => `${noun2}-${word}`)
  if (size === 1) return noun[1]
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

generator.nounGroup.choices = function(size) {
  console.assert(size <= 5)
  if (size <= 0) return 1n
  if (size === 1) return generator.nounGroup.choices(size - 1) * BigInt(wordlist.noun.length)
  if (size === 2) return generator.nounGroup.choices(size - 1) * BigInt(wordlist.noun.length)
  if (size === 3) return generator.nounGroup.choices(size - 1) * BigInt(wordlist.adjective.length)
  if (size === 4) return generator.nounGroup.choices(size - 1) * BigInt(wordlist.adverb.length)
  return generator.nounGroup.choices(size - 1) * BigInt(generator.quantityCount)
}

generator.phrase.rand = function(groupCount, groupSize, lastGroupSize) {
  if (groupCount <= 1)
    return generator.nounGroup.rand(lastGroupSize)
  const connectorCount = groupCount - 1
  const verbPosition = randbelow(connectorCount)
  let result = ''
  for (let i = 0; i < connectorCount; i++)
    result += generator.nounGroup.rand(groupSize) + ' ' + randChoice(i === verbPosition ? wordlist.verb : wordlist.connector) + ' '
  return result + generator.nounGroup.rand(lastGroupSize)
}

generator.phrase.choices = function(groupCount, groupSize, lastGroupSize) {
  if (lastGroupSize === undefined) lastGroupSize = groupSize
  if (groupCount <= 1)
    return generator.nounGroup.choices(lastGroupSize)
  return generator.nounGroup.choices(groupSize) ** BigInt(groupCount - 1) * generator.nounGroup.choices(lastGroupSize) * BigInt(wordlist.connector.length) ** BigInt(groupCount - 2) * BigInt(wordlist.verb.length) * BigInt(groupCount - 1)
}

generator.minEntropy = function(bitCount) {
  let groupCount = 1
  let targetChoices = 2n ** BigInt(bitCount)
  let currentChoices = 0
  while (true) {
    console.log(groupCount)
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
  currentChoices /= generator.nounGroup.choices(groupSize)
  targetChoices /= currentChoices
  lastGroupSize = 1
  for (;generator.nounGroup.choices(lastGroupSize) <= targetChoices; lastGroupSize++);
  console.log(groupCount, groupSize, lastGroupSize)
  return [generator.phrase.rand(groupCount, groupSize, lastGroupSize), currentChoices * generator.nounGroup.choices(lastGroupSize)]
}
