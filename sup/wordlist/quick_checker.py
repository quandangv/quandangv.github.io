from common import *
from wiktionaryparser import WiktionaryParser
import sys

wordlist = load_wordlist('wordlist.md')
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
              return text[len('plural of '):].replace('.', '')
    return None
  singular = find_singular()
  count += 1
  if singular:
    print(str(count) + '/' + str(len(wordlist['plural noun'])), 'Singular of', item, 'is', singular)
    if not singular in singular_nouns:
      nouns.append(singular + ' ' + item)
      singular_nouns.add(singular)
  else:
    errors.append(item)
    print("Can't find singular of", item)

print('errors', errors)
wordlist['plural noun'] = []
print_stat(wordlist)
with open('wordlist.md', 'wt') as wordlist_file:
  for category in wordlist:
    print('#', category, file=wordlist_file)
    wordlist[category] = list(wordlist[category])
    wordlist[category].sort()
    for word in wordlist[category]:
      print(word, file=wordlist_file)

prep_wordlist(wordlist)
with open('wordlist.js', 'wt') as wordlist_file:
  print('const wordlist=', end='', file=wordlist_file,flush=True)
  json.dump(wordlist, wordlist_file)
