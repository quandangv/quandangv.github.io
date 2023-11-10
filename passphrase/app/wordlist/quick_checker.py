license = '''/*
Understandable Passwords - make random, yet understandable sentences to use as passwords
Copyright 2022 Đặng Văn Quân

This file is part of Understandable Passwords.

Understandable Passwords is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.

Understandable Passwords is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with Understandable Passwords. If not, see <https://www.gnu.org/licenses/>.

Contact email: quandangv@gmail.com
*/'''

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
  print(license, file=wordlist_file)
  for category in wordlist:
    print('#', category, file=wordlist_file)
    wordlist[category] = list(wordlist[category])
    wordlist[category].sort()
    for word in wordlist[category]:
      print(word, file=wordlist_file)

wordlist['noun'] = list(wordlist['noun'])
wordlist['firstnoun'] = list(wordlist['firstnoun'])
wordlist.pop('plural noun', None)

for i in range(len(wordlist['noun'])):
  item = wordlist['noun'][i].split()
  if item[1].startswith(item[0]) and item[1][-1] == 's':
    item[1] = '_' + item[1][len(item[0]):-1]
  if len(item) > 2:
    item[2] = item[2].replace(item[0][:-2] + 'ing', '_')
  wordlist['noun'][i] = ','.join(item).replace(',_', '_')
for key in wordlist:
  wordlist[key] = ';'.join(wordlist[key])
with open('wordlist.tsx', 'wt') as wordlist_file:
  print(license + '\n// eslint-disable-next-line import/no-anonymous-default-export\nexport default ', end='', file=wordlist_file,flush=True)
  json.dump(wordlist, wordlist_file)
