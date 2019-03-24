# This script can be used to download all pages of Deckbrew's card JSON listings
# (if you know how many pages there are; I had to experiment to find out).

LAST_PAGE=168
SLEEP_DURATION=5

for i in `seq 0 $LAST_PAGE`
do
    wget -O deckbrew_$i.json https://api.deckbrew.com/mtg/cards?page=$i
    sleep $SLEEP_DURATION
done
