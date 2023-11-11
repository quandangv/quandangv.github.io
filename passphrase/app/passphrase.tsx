//@ts-nocheck The wordlist processing part is tricky to adapt to typescript, since it expands strings to string arrays in place
import wordlist from './wordlist/wordlist'

// Make a passphrase with to satisfy the specified number of bits of information
// For reference, the longest key length used by AES is 256 bits
export function makePassphrase(bitCount) {
  if(!bitCount)
    throw Error('bitCount in falsy')
  // First determine the format to generate
  let groupCount = 1, groupSize = 1, miniGroupSize = 1

  // Try every setting from the smallest until we reach the desired bit count
  // This is to ensure we generate the most compact passphrase
  while(calculateBitCount(groupCount, 4) < bitCount)
    groupCount += 1
  // Check from the smallest group sizes
  let currentBitCount
  while (true) {
    currentBitCount = calculateBitCount(groupCount, groupSize)
    if (currentBitCount >= bitCount) break
    groupSize += 1
  }
  // Focus to the mini group and try to minimize its size too
  currentBitCount -= groupBitCount[groupSize]
  bitCount -= currentBitCount // bitCount is now the target for the mini group
  while(groupBitCount[miniGroupSize] <= bitCount)
    miniGroupSize++
  return rndPhrase(groupCount, groupSize, miniGroupSize)
}
// Calculates the number of possible passphrases in a specific format
export function calculateBitCount(groupCount, groupSize, miniGroupSize) {
  if(groupSize > 4)
    throw Error('invalid groupSize: ' + groupSize)
  if (miniGroupSize == null) miniGroupSize = groupSize
  if (groupCount <= 1)
    return groupBitCount[miniGroupSize]
  const longGroupCount = Math.floor(groupCount/2)
  const verbCount = Math.ceil(groupCount/3)
  return groupBitCount[groupSize] * (groupCount - longGroupCount)
    + groupBitCount[miniGroupSize] + groupBitCount[groupSize+1] * (longGroupCount-1)
    + Math.log2(wordlist.connector.length) * (groupCount - verbCount*2)
    + Math.log2(wordlist.phraseconnector.length) * (verbCount -1)
    + Math.log2(wordlist.verb.length) * verbCount
    // Account for position of different group sizes: we have 1 mini group and some long groups, the rest are normal (short) group, all placed randomly
    + Math.log2(groupCount * combination(groupCount-1, longGroupCount))
    // Different position of the verb in each phrase: every 3-group phrase have 2 places for verbs. We essentially count the number of 3-group phrase
    + (groupCount % 3 == 1 ? (groupCount-4)/3 : Math.floor(groupCount/3))
}
// Generates a passphrase in the specified format by joining random groups together
export function rndPhrase(groupCount, groupSize, miniGroupSize) {
  if(groupCount <= 0 || groupCount >= 512)
    throw Error('invalid groupCount')
  if (miniGroupSize == null) miniGroupSize = groupSize
  if (groupCount <= 1)
    return rndGroup(miniGroupSize)
  // The generated phrase would contain a mini group, some long groups, and short groups
  const longGroupCount = Math.floor(groupCount/2)
  // Initialize the group size array to randomly pick out sizes for new groups
  const sizes = [miniGroupSize]
  for(let i = 1; i < longGroupCount; i++)
    sizes.push(groupSize+1) // Add long groups
  while(sizes.length < groupCount)
    sizes.push(groupSize) // Add short groups
  const popSize = _=> sizes.splice(rndInt(sizes.length), 1)[0]

  let result = rndGroup(popSize())
  result = result[0].toUpperCase() + result.slice(1)
  const append = connectors => result += ' ' + rndChoice(connectors) + ' ' + rndGroup(popSize())
  const completePhrase = _=> {
    if(rndBool()) {
      append(wordlist.verb)
      append(wordlist.connector)
    } else {
      append(wordlist.connector)
      append(wordlist.verb)
    }
  }
  // The default phrase size is 3 groups. If the groupCount is not divisible by 3, use 2-group phrases to pad the remainder
  // If the remainder is 2, we add a 2-phrase at the front. If the remainder is 1, we add a 2-phrase at the front and another at the end
  if(groupCount % 3)
    append(wordlist.verb)
  else
    completePhrase()
  // Add the generic 3-phrases
  for(let i = Math.floor((groupCount-2)/3); i-- > 0;) {
    append(wordlist.phraseconnector)
    completePhrase()
  }
  if(groupCount % 3 == 1) {
    append(wordlist.phraseconnector)
    append(wordlist.verb)
  }
  return result
}

// Pre-process the wordlist. This allows the wordlist file to be much more compact
for (const key in wordlist)
  wordlist[key] = wordlist[key].split(';')
for (let i = 0; i < wordlist.noun.length; i++) {
  const item = wordlist.noun[i] = wordlist.noun[i].replaceAll('_', ',_').split(',')
  if (item[1][0] === '_')
    item[1] = item[1].replace('_', item[0]) + 's'
  if (item.length > 2) {
    item[2] = item[2].replaceAll('_', item[0].substring(0, item[0].length - 2) + 'ing')
    wordlist.firstnoun.push(item.pop())
  } else {
    wordlist.firstnoun.push(item[0])
  }
}

// We create word groups by successively adding 2 nouns, an adjective, and an adverb
// This is the number of choices for each group size
const groupBitCount = [0, wordlist.noun, wordlist.firstnoun, wordlist.adjective, wordlist.noun, wordlist.adverb]
for(let i = 1, p = 1; i < groupBitCount.length; i++)
  groupBitCount[i] = Math.log2(p *= groupBitCount[i].length)
// This generates a random group
function rndGroup(size:number) {
  if(size < 1 || size > 5)
    throw Error('invalid size')
  let group = rndChoice(wordlist.noun)[1]
  if (size === 1) return group
  group = rndChoice(wordlist.firstnoun) + ' ' + group
  if (size === 2) return group
  group = rndChoice(wordlist.firstnoun) + '-' + group
  if (size === 3) return group
  group = rndChoice(wordlist.adjective) + ' ' + group
  if (size === 4) return group
  group = rndChoice(wordlist.adverb) + ' ' + group
  return group
}
// This uses Crypto.getRandomValues and rejection sampling to generate random integers
const uint8Array = new Uint8Array(1)
const uint16Array = new Uint16Array(1)
const uint32Array = new Uint32Array(1)
function rndInt(max:number) {
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
function rndBool() {
  window.crypto.getRandomValues(uint8Array)
  return uint8Array % 2
}
function rndChoice(list:Array<any>) {
  return list[rndInt(list.length)]
}
function factorial(n) {
  if (n < 2)
    return 1;
  return (n * factorial(n - 1));
}
function combination(n, k) {
  return factorial(n) / (factorial(k) * factorial(n-k))
}
