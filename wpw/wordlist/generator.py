import secrets
import math
from common import *

wordlist = load_wordlist('wordlist.md')
quantity_count = len(wordlist['singular quantity']) + len(wordlist['plural quantity'])
for category in wordlist:
  wordlist[category] = list(wordlist[category])
for i in range(len(wordlist['noun'])):
  split = wordlist['noun'][i].split()
  wordlist['noun'][i] = split
  wordlist['firstnoun'].append(split[0] if len(split) <= 2 else split[2])

def get_noun_group(size = 5):
  assert(size >= 1 and size <= 5)
  noun = secrets.choice(wordlist['noun'])
  if size == 1: noun[1]
  noun2 = secrets.choice(wordlist['firstnoun'])
  noun = [ f'{noun2}-{noun1}' for noun1 in noun ]
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

noun_choices_arr = [1]*6
noun_choices_arr[1] = noun_choices_arr[0] * len(wordlist['noun'])
noun_choices_arr[2] = noun_choices_arr[1] * len(wordlist['firstnoun'])
noun_choices_arr[3] = noun_choices_arr[2] * len(wordlist['adjective'])
noun_choices_arr[4] = noun_choices_arr[3] * len(wordlist['adverb'])
noun_choices_arr[5] = noun_choices_arr[4] * quantity_count

def calc_phrase_choices(noun_group_count, base_group_size):
  noun_choices = noun_choices_arr[base_group_size]
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
  last_group_target = target_bit_count - current_bit_count + math.log(noun_choices_arr[base_group_size], 2)
  last_group_size = 1
  while math.log(noun_choices_arr[last_group_size], 2) < last_group_target:
    last_group_size += 1
  print(base_group_size, noun_group_count, last_group_size)
  print(math.log(noun_choices_arr[last_group_size-1], 2) + current_bit_count - math.log(noun_choices_arr[base_group_size], 2))
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
target_bit_count = 64
print('Phrase encompassing', target_bit_count, 'bits:', get_targeted_phrase(target_bit_count))
