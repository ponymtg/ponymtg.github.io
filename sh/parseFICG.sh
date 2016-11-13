#!/bin/bash

# Shortcut to invoke the Friendship is Card Games parser and write the results to the `ficg_cards.js` data file. Must be
# run from inside the `sh` directory.

python ../python/parseFICG.py ../data/raw/ficg_raw.txt FICG_CARDS "Friendship is Card Games" > ../data/js/ficg_cards.js
