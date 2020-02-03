#!/bin/bash

# Shortcut to invoke the Friendship is Card Games parser and write the results
# to the `ficg_cards.js` data file. Must be run from inside the `sh` directory.

python ../python/parse_ficg.py FICG_CARDS "Friendship is Card Games" < ../data/raw/ficg_raw.txt >../data/js/ficg_cards.js
