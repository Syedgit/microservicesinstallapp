cd ~/Desktop/ExportedNotes
for f in *.txt; do
  sed -E 's/<[^>]*>//g' "$f" > "clean_$f"
done
