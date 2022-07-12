import sys
import secrets
import math
from common import *

wordlist = load_wordlist(sys.argv[1])
quantity_count = len(wordlist['singular quantity']) + len(wordlist['plural quantity'])
for category in wordlist:
  wordlist[category] = list(wordlist[category])
for i in range(len(wordlist['noun'])):
  split = wordlist['noun'][i].split()
  wordlist['noun'][i] = split if len(split) >= 3 else split + [split[0]]
rand_quotes = False
#wordlist['verb'] += [word.upper() for word in wordlist['verb']]
#wordlist['adjective'] += [word.upper() for word in wordlist['adjective']]
wordlist['verb'] += wordlist['nocap verb']
wordlist['adjective'] += wordlist['nocap adjective']

def add_rand_quotes(word):
  if secrets.randbelow(2):
    return word
  return '"' + word + '"'
def get_noun_group(size = 5):
  assert(size >= 1 and size <= 5)
  noun = secrets.choice(wordlist['noun'])
  if size == 1: return add_rand_quotes(noun[1]) if rand_quotes else noun[1]
  noun2 = secrets.choice(wordlist['noun'])[2]
  noun = [ f'{noun2}-{noun1}' if not rand_quotes or secrets.randbelow(3) < 1 else f'"{noun2} {noun1}"' if secrets.randbelow(2) < 1 else f'"{noun2}"-{noun1}' for noun1 in noun ]
  if size == 2: return noun[1]
  result = secrets.choice(wordlist['adjective']) + ' '
  if size == 3: return result + noun[1]
  result = secrets.choice(wordlist['adverb']) + ' ' + result
  if size == 4: return result + noun[1]
  quantity = secrets.randbelow(quantity_count)
  if quantity < len(wordlist['singular quantity']):
    quantity = secrets.choice(wordlist['singular quantity'])
    if quantity == 'a' and result[0].lower() in ['a', 'e', 'u', 'i', 'o']:
      quantity = 'an'
    return quantity + ' ' + result + noun[0]
  else:
    return secrets.choice(wordlist['plural quantity']) + ' ' + result + noun[1]

def calc_noun_choices(size):
  if size <= 0: return 1
  if size == 1:
    return len(wordlist['noun']) * (2 if rand_quotes else 1)
  if size == 2:
    return len(wordlist['noun']) ** 2 * (3 if rand_quotes else 1)
  if size == 3:
    return len(wordlist['adjective']) * len(wordlist['noun']) ** 2 * (3 if rand_quotes else 1)
  if size == 4:
    return len(wordlist['adverb']) * calc_noun_choices(3)
  return quantity_count * calc_noun_choices(4)

def calc_phrase_choices(noun_group_count, base_group_size):
  noun_choices = calc_noun_choices(base_group_size)
  if noun_group_count == 1:
    return noun_choices
  return noun_choices ** noun_group_count * len(wordlist['connector']) ** (noun_group_count - 2) * len(wordlist['verb']) * (noun_group_count - 1)

def get_targeted_phrase(target_bit_count):
  noun_group_count = 1
  base_group_size = 5
  while True:
    current_bit_count = math.log(calc_phrase_choices(noun_group_count, base_group_size), 2)
    if current_bit_count >= target_bit_count:
      break
    noun_group_count += 1
  base_group_size = 1
  while True:
    current_bit_count = math.log(calc_phrase_choices(noun_group_count, base_group_size), 2)
    print(current_bit_count, base_group_size)
    if current_bit_count >= target_bit_count:
      break
    base_group_size += 1
  last_group_target = target_bit_count - current_bit_count + math.log(calc_noun_choices(base_group_size), 2)
  last_group_size = 1
  while math.log(calc_noun_choices(last_group_size), 2) < last_group_target:
    last_group_size += 1
  print(base_group_size, noun_group_count, last_group_size)
  print(math.log(calc_noun_choices(last_group_size-1), 2) + current_bit_count - math.log(calc_noun_choices(base_group_size), 2))
  return get_phrase(noun_group_count, base_group_size, last_group_size)

def get_phrase(noun_group_count, base_group_size, last_group_size):
  if noun_group_count == 1:
    return get_noun_group(last_group_size)
  connector_count = noun_group_count - 1
  verb_position = secrets.randbelow(connector_count)
  result = ''
  for i in range(connector_count):
    result += get_noun_group(base_group_size)
    if i == verb_position:
      result += ' ' + secrets.choice(wordlist['verb']) + ' '
    else:
      result += ' ' + secrets.choice(wordlist['connector']) + ' '
  result += get_noun_group(last_group_size)
  return result

size = 3
print(get_phrase(size, 5, 5))
print('From', calc_phrase_choices(size, 5), 'choices')
print('With', math.log(calc_phrase_choices(size, 5), 2), 'bits of info')
print()
target_bit_count = 96
print('Phrase encompassing', target_bit_count, 'bits:', get_targeted_phrase(target_bit_count))
