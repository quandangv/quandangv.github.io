# Understandable Passwords - make random, yet understandable sentences to use as passwords
# Copyright 2022 Đặng Văn Quân
# 
# This file is part of Understandable Passwords.
# 
# Understandable Passwords is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or any later version.
# 
# Understandable Passwords is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
# 
# You should have received a copy of the GNU Affero General Public License along with Understandable Passwords. If not, see <https://www.gnu.org/licenses/>.
# 
# Contact email: gizapp@tutanota.com

from common import *
from wiktionaryparser import WiktionaryParser
import sys

wordlist = load_wordlist('wordlist.md')
prep_wordlist(wordlist)
parser = WiktionaryParser()

errors = []
for sing, plu in wordlist['noun']:
  if plu in wordlist['firstnoun']:
    errors.append('duplicate noun firstnoun ' + plu)
    print(errors[-1])

for word in wordlist['firstnoun']:
  if word in wordlist['adjective']:
    errors.append('duplicate firstnoun adjective ' + word)
    print(errors[-1])
  if wordlist['firstnoun'].count(word) > 1:
    errors.append('duplicate firstnoun noun ' + word)
    print(errors[-1])

checked_categories = ['adjective', 'adverb', 'verb']
count = 0
max_count = 0
for category in checked_categories:
  max_count += len(wordlist[category])
max_count += len(wordlist['noun'])

check_noun_number = False
if check_noun_number:
  for item in wordlist['noun']:
    count += 1
    print(count, '/', max_count, item)
    def check_singular():
      for info in parser.fetch(item[1]):
        for definition in info['definitions']:
          if definition['partOfSpeech'] == 'noun':
            for text in definition['text']:
              if text.startswith('plural of '):
                if f' {item[0]} ' in text or text.endswith(item[0]) or text.endswith(item[0]+'.'):
                  return True
    if not check_singular():
      errors.append(f'{item[0]} not singular of {item[1]}')
      print(errors[-1])

def check_category(list, category):
  global count
  for word in list:
    count += 1
    print(count, '/', max_count, word)
    def is_correct():
      for info in parser.fetch(word):
        for definition in info['definitions']:
          if definition['partOfSpeech'] == category:
            if category == 'verb':
              for text in definition['text']:
                if 'simple past tense' in text:
                  return True
            else:
              return True
    if not is_correct():
      errors.append(category + ' ' + word)
      print(word, 'is not a', category)
check_category(wordlist['firstnoun'], 'noun')
for category in checked_categories:
  check_category(wordlist[category], category)

print('ERRORS')
for error in errors:
  print(error)
print_stat(wordlist)
