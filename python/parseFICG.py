# Friendship is Card Games text dump parser
#
# Given a text file containing a dump of card text from FanOfMostEverything's
# Friendship is Card Games posts, this script will attempt to parse it into a
# structured format and output the result as JSON. A "dump of card text", in
# this case, is a direct copy-paste of card listings from FanOfMostEverything's
# card blog posts.
import sys
from parseFICG_functions import *

# When typos appear in the type line, this causes problems for the parser as it
# uses that line to determine where a card starts and ends. For this reason, we
# are going to perform simple text correction of some known typos before
# processing the dump.
SPELLING_CORRECTIONS = {}
SPELLING_CORRECTIONS['Enchatment'] = 'Enchantment'
SPELLING_CORRECTIONS['Enchantent'] = 'Enchantment'
SPELLING_CORRECTIONS['Sorcey'] = 'Sorcery'

# Read command line arguments.
if len(sys.argv) < 2:
    print("python "+sys.argv[0]+ " JS_VARIABLE_NAME [SET_NAME]")
    print("""
Given an input stream of raw card data in FanOfMostEverything's textual format,
parse it into structured JSON of the form accepted by PonyMTG, and output the
result.

JS_VARIABLE_NAME    The name of the variable which will contain the JSON
                    string. (This doesn't really matter; it can be anything).

SET_NAME            The name of the set. If given, this will populate the `set`
                    field on every output card.
""")
    sys.exit()

js_variable_name = sys.argv[1]
set_name = None
if len(sys.argv) >= 3:
    set_name = sys.argv[2]

# Open the dump file and obtain its contents.
ficg_raw_dump = sys.stdin.read()

# Correct some known typos.
for typo in SPELLING_CORRECTIONS:
    ficg_raw_dump = ficg_raw_dump.replace(typo, SPELLING_CORRECTIONS[typo])

# The set name (if given) is the same for all cards, so store it in the global meta dictionary.
if set_name is not None:
    META['set_name'] = set_name

# Parse the raw dump into a dictionary of card data entries.
card_data_entries = parse_ficg_dump_into_card_data_entries(ficg_raw_dump)

# Define the fields (and their ordering) which will be put into the JSON. (Python dictionaries don't have an ordering by
# default, so we have to impose one).
card_properties = [
    'name',
    'image',
    'set',
    'creator',
    'cost',
    'cost2',
    'colorIndicator',
    'supertype',
    'subtype',
    'supertype2',
    'subtype2',
    'text',
    'flavorText',
    'watermark',
    'pt',
    'loyalty',
    'transformsInto',
    'transformsFrom'
]

# Turn the dictionary of card data entries into a Javascript JSON variable, and output it.
sys.stdout.write(mtgJson.encapsulate_dict_list_in_js_variable(card_data_entries, card_properties, js_variable_name))
