import math
import json

def load_wordlist(path):
  wordlist = {}
  with open(path, 'rt') as wordlist_file:
    current_category = None
    for line in wordlist_file:
      line = line.strip()
      if line:
        if line.startswith('#'):
          line = line[line.find(' '):].strip().lower()
          current_category = set()
          wordlist[line] = current_category
        elif current_category != None:
          current_category.add(line)
        else:
          print('WARNING: Uncategorized word:', line)
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
