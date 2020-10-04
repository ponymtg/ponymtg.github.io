import csv, json, re, sys

def convert_js_card_list_to_json(js):
    js_lines = js.split('\n')
    js_lines[0] = '['
    js_lines[-1] = ']'

    for i in range(len(js_lines)):
        if re.match(r'^\s*},?$', js_lines[i]):
            if i == len(js_lines) - 2:
                js_lines[i] = js_lines[i][:-1]
            if re.search(r',$', js_lines[i-1]):
                js_lines[i-1] = js_lines[i-1][:-1]

    return '\n'.join(js_lines)

js = sys.stdin.read()
cards = json.loads(convert_js_card_list_to_json(js))

card_properties = [
    'name',
    'cost',
    'supertype',
    'subtype',
    'pt',
    'text',
    'flavorText',
    'loyalty',
    'cost2',
    'supertype2',
    'subtype2',
    'transformsInto',
    'transformsFrom',
    'colorIndicator',
    'watermark'
]

cards = [
    {key: card[key] for key in card if key in card_properties}
    for card in cards
]

writer = csv.DictWriter(sys.stdout, fieldnames = card_properties)
writer.writeheader()
writer.writerows(cards)
