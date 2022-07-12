from common import *
from wiktionaryparser import WiktionaryParser
import sys

wordlist = load_wordlist(sys.argv[1])
parser = WiktionaryParser()
count = 0
checked_categories = ['adjective', 'adverb', 'verb']
max_count = 0
for category in checked_categories:
  max_count += len(wordlist[category])

errors = []
for category in checked_categories:
  for word in wordlist[category]:
    count += 1
    print(count, '/', max_count, word)
    def is_correct():
      for info in parser.fetch(word):
        for definition in info['definitions']:
          if definition['partOfSpeech'] == category:
            return True
    if not is_correct():
      errors.append(category + ' ' + word)
      print(word, 'is not a', category)

print('ERRORS')
for error in errors:
  print(error)
print_stat(wordlist)
