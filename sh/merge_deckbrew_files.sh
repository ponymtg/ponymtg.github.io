# If you have a directory containing only Deckbrew JSON pages (as produced by `sh/download_deckbrew`), this merges them
# all into a single JS file, and outputs it.

DECKBREW_DIR_PATH=data/json/deckbrew
OUTPUT_FILE_PATH=data/js/deckbrew.js
JAVASCRIPT_VAR_NAME="DECKBREW_CARDS"

rm -f $OUTPUT_FILE_PATH
echo "var $JAVASCRIPT_VAR_NAME = [" >> $OUTPUT_FILE_PATH

for deckbrew_file in `ls $DECKBREW_DIR_PATH`
do
    tail -n +2 deckbrew/$deckbrew_file | head -n -1 >> $OUTPUT_FILE_PATH
    echo "," >> $OUTPUT_FILE_PATH
done

echo "]" >> $OUTPUT_FILE_PATH
