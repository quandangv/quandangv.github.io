import requests
from bs4 import BeautifulSoup
import time

def scrape(path):
  global soup
  r = requests.get('https://en.wiktionary.org' + path)
  soup = BeautifulSoup(r.text, 'html.parser')
  root = soup.find(id='mw-pages')
  for item in root.find_all('li'):
    if item.a:
      print(item.a.text)
    else:
      print(str(item))
scrape('/wiki/Category:English_words_prefixed_with_super-')

while True:
  next = soup.find('a', text='next page')
  if not next: break
  time.sleep(0.5)
  scrape(next['href'])
