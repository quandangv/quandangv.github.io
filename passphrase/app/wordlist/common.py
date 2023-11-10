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

import math
import json

def load_wordlist(path):
  wordlist = {}
  with open(path, 'rt') as wordlist_file:
    current_category = None
    for line in wordlist_file:
      line = line.strip()
      if line.startswith('#'):
        line = line[line.find(' '):].strip().lower()
        current_category = set()
        wordlist[line] = current_category
      elif current_category != None:
        if line:
          current_category.add(line)
  print('Loaded wordlist')
  return wordlist

def prep_wordlist(wordlist):
  wordlist['noun'] = list(wordlist['noun'])
  wordlist['firstnoun'] = list(wordlist['firstnoun'])
  wordlist.pop('plural noun', None)
  for i in range(len(wordlist['noun'])):
    split = wordlist['noun'][i].split()
    wordlist['firstnoun'].append(split[0] if len(split) <= 2 else split[2])
    wordlist['noun'][i] = split[:2]

def print_stat(wordlist):
  print(len(wordlist), 'categories')
  combinations = 1
  for category in wordlist:
    print(category, ':', len(wordlist[category]))
    combinations *= len(wordlist[category])

autosave_interval = 10
