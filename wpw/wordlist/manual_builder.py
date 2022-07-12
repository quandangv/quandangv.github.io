from common import *
import sys

wordlist = load_wordlist(sys.argv[1])

while True:
  category = input('Enter the category (lowercase) of words, or\n  "QUIT" to exit, or\n  "LOAD" to reload\n')
  print()
  if category == 'QUIT':
    break
  if category == 'LOAD':
    wordlist = load_wordlist(sys.argv[1])
    continue
  if not category in wordlist:
    wordlist[category] = set()
    print('WARNING: Creating new category "' + category + '"')
  current_category = wordlist[category]
  print('Adding words to "' + category + '", leave an empty input to stop')
  while True:
    word = input().strip()
    if not word:
      save_wordlist(sys.argv[1], wordlist)
      print('Saved,', len(current_category), 'words in category')
      print_stat(wordlist)
      break
    if word in current_category:
      print('  Duplicated word!')
      continue
    current_category.add(word)
    print('  Got it')
    if len(current_category) % autosave_interval == 0:
      save_wordlist(sys.argv[1], wordlist)
      print('  Autosaved,', len(current_category), 'words in category')
