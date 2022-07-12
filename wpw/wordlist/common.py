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

def save_wordlist(path, wordlist):
  with open(path, 'wt') as wordlist_file:
    if path.endswith('.md'):
      for category in wordlist:
        print('#', category, file=wordlist_file)
        for word in wordlist[category]:
          print(word, file=wordlist_file)
    if path.endswith('.json'):
      print('const wordlist=', end='', file=wordlist_file,flush=True)
      for i in range(len(wordlist['noun'])):
        split = wordlist['noun'][i].split()
        wordlist['noun'][i] = split if len(split) >= 3 else split + [split[0]]
      wordlist.pop('plural noun', None)
      wordlist['verb'] = list(wordlist['verb']) + list(wordlist['nocap verb'])
      wordlist['adjective'] = list(wordlist['adjective']) + list(wordlist['nocap adjective'])
      wordlist.pop('nocap verb', None)
      wordlist.pop('nocap adjective', None)
      def serialize_sets(obj):
        if isinstance(obj, set):
          return list(obj)
      json.dump(wordlist, wordlist_file, default=serialize_sets)

def print_stat(wordlist):
  print(len(wordlist), 'categories')
  combinations = 1
  for category in wordlist:
    print(category, ':', len(wordlist[category]))
    combinations *= len(wordlist[category])

autosave_interval = 10
