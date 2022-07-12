from common import *
from wiktionaryparser import WiktionaryParser
import sys

wordlist = load_wordlist(sys.argv[1])
parser = WiktionaryParser()
nouns = []
singular_nouns = set()
for item in wordlist['noun']:
  singular = item[:item.find(' ')]
  plural = item[item.find(' ') + 1:]
  if not singular in singular_nouns and singular != plural:
    nouns.append(item)
    singular_nouns.add(singular)
wordlist['noun'] = nouns
errors = []
count = 0
for item in list(wordlist['plural noun']):
  def find_singular():
    for info in parser.fetch(item):
      for definition in info['definitions']:
        if definition['partOfSpeech'] == 'noun':
          for text in definition['text']:
            if text.startswith('plural of '):
              return text[len('plural of '):]
    return None
  singular = find_singular()
  if singular:
    count += 1
    print(str(count) + '/' + str(len(wordlist['plural noun'])), 'Singular of', item, 'is', singular)
    if not singular in singular_nouns:
      nouns.append(singular + ' ' + item)
      singular_nouns.add(singular)
  else:
    errors.append(item)
    print("Can't find singular of", item)

print('errors', errors)
save_wordlist(sys.argv[1] if len(sys.argv) <= 2 else sys.argv[2], wordlist)
print_stat(wordlist)
