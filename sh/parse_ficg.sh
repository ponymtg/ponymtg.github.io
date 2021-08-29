#!/bin/bash

# Shortcut to invoke the Friendship is Card Games parser and write the results
# to the `ficg_cards.json` data file. Must be run from inside the `sh`
# directory.

python ../python/parse_ficg.py "Friendship is Card Games" < ../data/raw/ficg_raw.txt >../data/json/ficg_cards.json
