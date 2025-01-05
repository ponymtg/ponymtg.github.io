"""Token parser. Reads in a cards JSON file and attempts to create the tokens
that each card is capable of producing."""
import json, sys
from parse_ficg_functions import *
from parse_token_functions import *

err('Waiting for a cards JSON file on standard input...')

cards = json.load(sys.stdin)
match_strength_threshold = 0.5

err(f'Read {len(cards)} cards.')

err('Creating tokens...')
tokens = []
for card in cards:
    card_tokens = create_tokens_from_card(card, match_strength_threshold)
    for card_token in card_tokens:
        if card_token not in tokens:
            tokens.append(card_token)

err(f'Created {len(tokens)} tokens.')
json.dump(tokens, sys.stdout, indent=4)
