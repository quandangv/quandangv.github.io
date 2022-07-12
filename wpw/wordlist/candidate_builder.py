import requests
from wiktionaryparser import WiktionaryParser
from common import *
import sys

wordlist_path = sys.argv[1]
candidate_path = sys.argv[2]
candidate_start = 0 if len(sys.argv) <= 3 else int(sys.argv[3])

wordlist = load_wordlist(wordlist_path)
candidates = []
with open(candidate_path) as candidate_file:
  for line in candidate_file:
    candidates.append(line.strip())

parser = WiktionaryParser()
print('Assign category for a random word')
print('  <empty> - STOP')
print('  0 - SKIP WORD')
print('  * - ALL AVAILABLE')
category_map = []
for category in wordlist:
  category_map.append(category)
  print(' ', len(category_map), '-', category)
assert(len(category_map) < 10)

for i in range(candidate_start, len(candidates)):
  candidate = candidates[i]
  print(i, 'fetching "' + candidate + '"...')
  word_info = parser.fetch(candidate)
  available_categories = []
  for info in word_info:
    for definition in info['definitions']:
      if definition['partOfSpeech'] in category_map:
        available_categories.append(definition['partOfSpeech'])
  if not available_categories:
    continue
  print()
  print(candidate)
  for info in word_info:
    etymology = info['etymology']
    if len(etymology) > 60:
      etymology = etymology[:57] + '...'
    print(' ', etymology)
    for definition in info['definitions']:
      category = definition['partOfSpeech']
      if category in category_map:
        texts = definition['text']
        print(' ', category.upper(), texts[0])
        if len(texts) > 5:
          for item in texts[1:4]:
            print('   ', item)
          print('   ', '...')
        else:
          for item in texts[1:]:
            print('   ', item)
    print('  ')
  while True:
    try:
      category_text = input()
      if not category_text:
        category = None
        break
      if category_text == '*':
        category = available_categories
        break
      category = []
      if category_text == '0':
        break
      for char in category_text:
        item = category_map[int(char) - 1]
        if not item in category:
          category.append(item)
      break
    except Exception:
      pass
    print('  Invalid input!')
  if category == None:
    save_wordlist(wordlist_path, wordlist)
    print('  Saved')
    print_stat(wordlist)
    break
  for item in category:
    if not candidate in wordlist[item]:
      wordlist[item].add(candidate)
      if i % autosave_interval == 0:
        save_wordlist(wordlist_path, wordlist)
        print('  Autosaved')
