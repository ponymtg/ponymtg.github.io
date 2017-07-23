# Parses the Cockatrice XML file supplied by Sorden for his "IPU" set into JSON for our database.
# coding=utf-8
import xml.etree.ElementTree as et, mtgJson, sys

SET_NAME = 'Friendship is Magic the Gathering (IPU)'
CREATOR = 'Sorden'
COCKATRICE_FILE_PATH = 'data/cockatrice/cockatrice_database_for_mlp_fimtg_v1_4_2_by_sorden-d5k49mg.xml'

# Some of Sorden's cards are double-sided, but the XML file doesn't include that information; therefore, we'll hardcode
# it so that the `transformsFrom` and `transformsInto` properties can be included in the JSON output.
TRANSFORM_MAPPINGS = {
    'Fluttershy': 'Fluttershy Scorned',
    'Pinkie Pie': 'Pinkie Pie Forsaken',
    'Twilight Sparkle': 'Twilight Sparkle Unhinged',
    'Caramel': 'Toffee',
    'The Queen of the Changelings': 'Chrysalis Unmasked',
    'Nightmare Moon': 'Princess Luna',
    'Spike': 'Spike Insatiable',
    'Ursa Minor': 'Ursa Major',
    'Philomena': 'Philomena Reborn',
}

INVERTED_TRANSFORM_MAPPINGS = {value: key for key, value in TRANSFORM_MAPPINGS.items()}

tree = et.parse(COCKATRICE_FILE_PATH)
root = tree.getroot()

# Underneath the root, we're assuming that there is a single element, `<cards>`, which contains all card definitions.
cardsElement = root.find('cards')

# Get all `<card>` elements inside `<cards>`.
cardElements = cardsElement.findall('card')

# Iterate over all card elements to obtain the relevant information for our database.
card_data_entries = []
for cardElement in cardElements:
    card_data_entry = {}

    # Extract all the relevant elements for this card.
    nameElement = cardElement.find('name')
    manacostElement = cardElement.find('manacost')
    typeElement = cardElement.find('type')
    ptElement = cardElement.find('pt')
    textElement = cardElement.find('text')
    setElement = cardElement.find('set')
    colorElements = cardElement.findall('color')

    # Obtain the image URL for this card, which is stored in an attribute of of the `<set>` element.
    imageUrl = setElement.attrib['picURL']

    # Since we only care about the filename (which we expect to appear at the end of the URL, after the last forward
    # slash), we'll break it out of the string.
    imageFileName = imageUrl.split('/')[-1]

    # Obtain the supertype and subtype from the `<type>` element. Cockatrice stores both supertype and subtype (if
    # present) in a single string, separated by a hyphen if necessary (eg: "Creature - Earth Pony").

    supertype = None
    subtype = None

    typeString = typeElement.text
    typeStringPieces = typeString.split('-')
    if len(typeStringPieces) == 2:
        supertype = typeStringPieces[0].strip()
        subtype = typeStringPieces[1].strip()
    elif len(typeStringPieces) == 1:
        supertype = typeStringPieces[0].strip()

    card_data_entry['name'] = nameElement.text
    card_data_entry['image'] = imageFileName

    if manacostElement is not None and manacostElement.text is not None:
        card_data_entry['cost'] = manacostElement.text

    card_data_entry['supertype'] = supertype

    if subtype is not None:
        card_data_entry['subtype'] = subtype

    # The text contains line breaks, which we don't want in our JSON strings, so we'll turn these into "\n". (Actually,
    # we'll turn them into "\n\n", because that usually looks better).
    text = textElement.text
    text_lines = text.split('\n')
    condensed_text = '\\n\\n'.join(text_lines)
    card_data_entry['text'] = condensed_text

    if 'Creature' in supertype:
        card_data_entry['pt'] = ptElement.text

    # Although Cockatrice's XML scheme does have a `<loyalty>` tag, Sorden appears to use the `<pt>` (power and
    # toughness) tag to store loyalty numbers for planeswalkers.
    if supertype == 'Planeswalker':
        # It's possible that the `<pt>` tag won't exist for a Planeswalker, if they happen to be the reverse side of a
        # double-sided card.
        if ptElement is not None:
            card_data_entry['loyalty'] = ptElement.text

    # If we know that this card transforms, include the name of the card that it transforms to (or from).
    if card_data_entry['name'] in TRANSFORM_MAPPINGS:
        card_data_entry['transformsInto'] = TRANSFORM_MAPPINGS[card_data_entry['name']]
    if card_data_entry['name'] in INVERTED_TRANSFORM_MAPPINGS:
        card_data_entry['transformsFrom'] = INVERTED_TRANSFORM_MAPPINGS[card_data_entry['name']]

    card_data_entry['set'] = SET_NAME
    card_data_entry['creator'] = CREATOR

    card_data_entries.append(card_data_entry)

card_properties = ['name', 'image', 'set', 'creator', 'cost', 'supertype', 'subtype', 'text', 'flavorText', 'pt', 'transformsInto', 'transformsFrom', 'loyalty']

cards_js_variable = mtgJson.encapsulate_dict_list_in_js_variable(card_data_entries, card_properties, 'IPU_CARDS')
print(cards_js_variable)
