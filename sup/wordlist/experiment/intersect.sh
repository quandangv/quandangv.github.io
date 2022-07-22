awk 'NR==FNR { lines[$0]=1; next } $0 in lines' adverbs.txt common.txt
