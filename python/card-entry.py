import json, sys

VERSION = '1.0.0'

PROPERTIES = [
    'name',
    'set',
    'creator',
    'cost',
    'supertype',
    'subtype',
    'text',
    'flavorText',
    'pt',
    'loyalty',
    'rarity',
    'sourceUrl',
    'notes',
]

# Redirect a print to standard error instead of standard output.
def print_stderr(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

presets = {}

if len(sys.argv) >= 2:
    output_file_path = sys.argv[1]
else:
    print_stderr('python {} OUTPUT_FILE_PATH [PRESETS]'.format(sys.argv[0]))
    print_stderr('''
Create Magic: the Gathering card JSON data by entering card properties when
prompted.

If PRESETS is supplied, it must be a JSON object which supplies preset values
for card properties (eg. `{"set": "Example Set"}`). This is a way to pre-fill
values that you know will be the same for every card.
''')
    sys.exit()

if len(sys.argv) >= 3:
    presets_json = sys.argv[2]
    try:
        presets = json.loads(presets_json)
    except json.decoder.JSONDecodeError:
        print_stderr('Error when setting preset PROPERTIES; invalid JSON')
        sys.exit()
try:
    open(output_file_path, 'w')
except Exception:
    print_stderr(
        'Could not open "{}" for writing. Aborting.'.format(output_file_path)
    )

print_stderr('MAGIC CARD ENTRY v{}'.format(VERSION))
print_stderr('=' * 80)

cards = []
while True:
    card = {}
    print_stderr()
    print_stderr(
        'Enter card PROPERTIES. If the property has no value, leave it blank.'
    )
    print_stderr('-' * 80)
    for prop in PROPERTIES:
        if prop in presets:
            print_stderr('{}: {}'.format(prop, presets[prop]))
            if presets[prop] is not None:
                card[prop] = presets[prop]
            continue

        value = input('{}: '.format(prop))
        if value:
            card[prop] = value

    if len(card) > 0:
        cards.append(card)
    else:
        print_stderr('Ignoring empty card entry.')

    repeat = None
    while repeat is None:
        option = input('Add another card [a], or quit [q]?')

        if option == 'a':
            repeat = True
        elif option == 'q':
            repeat = False

    if not repeat:
        break

with open(output_file_path, 'w') as output_file:
    json.dump(cards, output_file)
