# coding=utf-8

import json, re, sys
from collections import OrderedDict

################################################################################
# GLOBALS

# Define a long dash, just so we don't have to keep copy-pasting it.
EM_DASH = '—'

# Also define the en dash. This is rarely used - in fact, we believe it's only
# used by mistake, since the official Magic rules appear to use em dashes
# exclusively. For that reason, we automatically replace all occurrences of the
# en dash with the em dash before parsing the card dump.
EN_DASH = '–'

# A list of mappings from Fimfiction emoticons to faction names. These are used
# to correctly apply watermarks on contraptions. The faction list is defined
# here: <https://www.fimfiction.net/blog/859184/fic-or-faction>
FACTIONS = {
    ':twilightsmile:': 'Northstar R&D',
    ':raritystarry:': 'Carousel Innovations',
    ':rainbowdetermined2:': 'Cloudsdale Awesomatics',
    ':yay:': 'Sweetfeather Biotech',
    ':ajsmug:': 'Apple Company',
    ':pinkiehappy:': 'P.O.N.K. (Party Operations Neo-Korp)',
}

# Use a global dictionary to keep track of meta-information about the set. There
# are some things, such as which cards transform into which others, that we can
# only determine by keeping track of previously-seen cards.
META = {}
META['previous_card_data_entry'] = None
META['previous_card_was_a_transformer'] = False
META['previous_card_was_a_mdfc'] = False
META['previous_card_was_reverse_side'] = False

################################################################################
# FUNCTIONS

# Return True if we can identify `line` as being a card's type line.
def is_type_line(line):
    # Replace the en dash with an em dash, if it's in the type line. That way we
    # only have to check for one kind of dash.
    line = re.sub(EN_DASH, EM_DASH, line)

    # An empty line never matches.
    if line.strip() == '':
        return False

    # If the line exactly matches a number of well-known strings that we are
    # sure will always indicate a type line, then we will confirm this as being
    # a type line.
    exact_strings = [
        'Artifact',
        'Artifact — Equipment',
        'Basic Land',
        'Enchantment',
        'Enchantment — Aura',
        'World Enchantment',
        'Instant',
        'Instant — Trap',
        'Land',
        'Phenomenon',
        'Sorcery',
        'Legendary Artifact',
        'Legendary Enchantment',
        'Legendary Instant',
        'Legendary Land',
        'Legendary Sorcery'
    ] 
    if line in exact_strings:
        return True

    # If the line doesn't contain at least one of a small set of strings, then
    # it is not a type line.
    type_words = [
        'Artifact',
        'Basic',
        'Creature',
        'Enchantment',
        'Instant',
        'Land',
        'Legendary',
        'Planeswalker',
        'Sorcery',
        'Scheme',
        'Plane',
        'Conspiracy',
        'Tribal',
        'Snow',
    ]

    contains_type_word = False
    for type_word in type_words:
        if type_word in line:
            contains_type_word = True
            break
    if not contains_type_word:
        return False

    # If the line contains one of the type-relevant words, that's a good
    # indication that this is the type line, but we still want more evidence
    # (it might be card text that happens to begin with the word "Instant", for
    # example). We can now do some more checks to improve our confidence.

    # At this point, we'll check for the presence of a color indicator. A color
    # indicator is a set of mana color symbols (ie. W, U, B, R, G) enclosed in
    #parentheses. If present, we expect this to be at the start of the type
    # line.

    # The presence of a color indicator is a hint that this is the type line,
    # but it is not conclusive enough for us to make that judgement; only the
    # type words can really clue us in. For this reason, we will disregard the
    # color indicator from our deliberations if we find one.

    color_indicator_regex = r'^\([WUBRG]+\) '
    line = re.sub(color_indicator_regex, '', line, 1, re.IGNORECASE)

    # If the first word is "Legendary", then it must be followed by one of a
    # small set of strings. If it doesn't, this is not a type line.

    # If the line contains the word "Legendary", then it must meet one of the
    # following conditions:
    # - "Legendary" is succeeded by one of: Artifact, Creature, Enchantment,
    #   Instant, Land, Planeswalker, Snow, Sorcery.
    if 'Legendary' in line:
        legendary_successors = [
            'Artifact',
            'Creature',
            'Enchantment',
            'Instant',
            'Land',
            'Planeswalker',
            'Snow',
            'Sorcery'
        ]
        
        contains_legendary_successor = False
        for legendary_successor in legendary_successors:
            if 'Legendary ' + legendary_successor in line:
                contains_legendary_successor = True
                break
        if not contains_legendary_successor:
            return False

    # If the line contains the word "Snow", then it must meet one of the
    # following conditions:
    # - "Snow" is succeeded by the word "Creature".
    # - "Snow" is succeeded by the word "Artifact".
    # - "Snow" is succeeded by the word "Enchantment".
    # - "Snow" is succeeded by the word "Land".
    # - "Snow" is succeeded by the word "Sorcery".
    # - "Snow" is succeeded by the word "Instant".
    if 'Snow' in line:
        if (
            'Snow Creature' not in line
            and 'Snow Artifact' not in line
            and 'Snow Enchantment' not in line
            and 'Snow Land' not in line
            and 'Snow Sorcery' not in line
            and 'Snow Instant' not in line
        ):
            return False
            
    # If the line contains the word "Tribal", then it must meet one of the
    # following conditions:
    # - "Tribal" is succeeded by the word "Instant" and a long dash.
    # - "Tribal" is succeeded by the word "Sorcery" and a long dash.
    # - "Tribal" is succeeded by the word "Artifact" and a long dash.
    # - "Tribal" is succeeded by the word "Enchantment" and a long dash.
    if 'Tribal' in line:
        if (
            'Tribal Instant —' not in line
            and 'Tribal Sorcery —' not in line
            and 'Tribal Artifact —' not in line
            and 'Tribal Enchantment —' not in line
        ):
            return False
            
    # If the line contains the word "Creature", then it must meet one of the
    # following conditions:
    # - The word "Creature" must be followed by a long dash. We'll be a little
    #   lenient about this and say that there doesn't have to be a space between
    #   "Creature" and the dash. This is due to the misprinted card "Chrysalis,
    #   Changeling Queen", which has a minor error in its type line.
    # - The word "Creature" must be completely on its own. This is a unique
    #   situation which occurs for the card "Sibling Supreme", which is every
    #   creature type at all times.
    if 'Creature' in line:
        if (
            line != 'Creature'
            and not 'Creature —' in line
            and not 'Creature—' in line
        ):
            return False

    # If the line contains the word "Instant", then it must meet one of the
    # following conditions:
    # - The "." character must not be present in the line. This eliminates some
    #   rules lines that refer to Instant cards.
    # - The line shouldn't end in something that looks like a mana cost.
    # - The line must contain only the word "Instant".
    # - The line must contain only the words "Legendary Instant".
    # - "Instant" must be preceded by "Tribal".
    # - "Instant" must be preceded by "Snow".
    # - "Instant" must be followed by a long dash.
    # - The line must be exactly "Instant — Lesson".
    # - The line must begin with a bracket, which means that it begins with a
    #   color indicator.
    # - The line must contain only the words "Trope Instant". ("Trope" is a
    #   custom supertype created by FanOfMostEverything).
    # - The line must contain a double slash (//), which indicates that this is
    #   a split card for which one of the halves is an Instant.
    # - The word "Instant" must be succeeded by a word boundary; ie. it can't
    #   have letters directly after it. This prevents an issue with cards like
    #   "Insinuate 1(ub)//Instantiate 4UB", where the word "Instant" is in the
    #   name of the card _and_ it looks like a split type line.
    if 'Instant' in line:
        if '.' in line:
            return False
        if re.search(r'^[0-9WUBRGX(/)]+$', line.split()[-1], re.IGNORECASE):
            return False
        if (
            line not in ['Instant', 'Legendary Instant', 'Trope Instant']
            and 'Instant —' not in line
            and 'Tribal Instant' not in line
            and 'Snow Instant' not in line
            and not re.search(r'Instant\b', line)
            and line != 'Instant — Lesson'
        ):
            return False

    # If the line contains the word "Sorcery", then it must meet one of the
    # following conditions:
    # - The line must contain only the word "Sorcery".
    # - The line must contain only the words "Legendary Sorcery".
    # - "Sorcery" must be preceded by "Tribal".
    # - "Sorcery" must be preceded by "Snow".
    # - The line must be exactly "Sorcery — Arcane".
    # - The line must be exactly "Sorcery — Adventure".
    # - The line must be exactly "Sorcery — Lesson".
    # - The line must also contain a double slash (//), which indicates that
    #   this is a split card for which one of the halves is a Sorcery.
    if 'Sorcery' in line:
        if (
            line not in ['Sorcery', 'Legendary Sorcery']
            and 'Tribal Sorcery' not in line
            and 'Snow Sorcery' not in line
            and line != 'Sorcery — Arcane'
            and line != 'Sorcery — Adventure'
            and line != 'Sorcery — Lesson'
            and '//' not in line
        ):
            return False

    # If the line contains the word "Enchantment", then it must meet one of the
    # following conditions:
    # - The line contains only the word "Enchantment" and nothing else.
    # - "Enchantment" is preceded by the word "Legendary".
    # - "Enchantment" is preceded by the word "Snow".
    # - "Enchantment" is succeeded by the word "Creature".
    # - "Enchantment" is succeeded by the word "Artifact".
    # - "Enchantment" is succeeded by a long dash.
    # - The line begins with an open parenthesis ("("). This is to account for
    #   type lines that begin with a color indicator.
    if 'Enchantment' in line:
        if (
            line != 'Enchantment'
            and 'Legendary Enchantment' not in line
            and 'Snow Enchantment' not in line
            and 'Enchantment Creature' not in line
            and 'Enchantment Artifact' not in line
            and 'Enchantment —' not in line
            and line[0] != '('
        ):
            return False
            
    # If the line contains the word "Artifact", then it must meet one of the
    # following conditions:
    # - The line contains only the word "Artifact" and nothing else.
    # - "Artifact" is preceded by the word "Legendary".
    # - "Artifact" is preceded by the word "Snow".
    # - "Artifact" is preceded by the word "Enchantment".
    # - "Artifact" is preceded by the word "World".
    # - "Artifact" is succeeded by a long dash.
    # - "Artifact" is succeeded by the word "Creature".
    # - "Artifact" is succeeded by the word "Land".
    if 'Artifact' in line:
        if (
            line != 'Artifact'
            and 'Legendary Artifact' not in line
            and 'Snow Artifact' not in line
            and 'Artifact Creature' not in line
            and 'Enchantment Artifact' not in line
            and 'World Artifact' not in line
            and 'Artifact Land' not in line
            and 'Artifact —' not in line
        ):
            return False
            
    # If the line contains the word "Conspiracy", then it must meet one of the
    # following conditions:
    # - The line contains only the word "Conspiracy" and nothing else.
    if 'Conspiracy' in line:
        if line != 'Conspiracy':
            return False
            
    # If the line contains the word "Plane", then it must meet one of the
    # following conditions:
    # - "Plane" is succeeded by a long dash.
    if 'Plane' in line:
        if 'Planeswalker' not in line:
            if 'Plane —' not in line:
                return False
            
    # If the line contains the word "Scheme", then it must meet one of the
    # following conditions:
    # - The line contains only the word "Scheme" and nothing else.
    # - The line contains "Ongoing Scheme" and nothing else.
    if 'Scheme' in line:
        if line not in ['Scheme', 'Ongoing Scheme']:
            return False
            
    # If the line contains the word "Land", then it must meet one of the
    # following conditions:
    # - The line contains only the word "Land" and nothing else.
    # - "Land" is preceded by the word "Legendary".
    # - "Land" is preceded by the word "Basic".
    # - "Land" is preceded by the word "Snow".
    # - "Land" is succeeded by a long dash.
    if 'Land' in line:
        if (
            line != 'Land'
            and 'Legendary Land' not in line
            and 'Basic Land' not in line
            and 'Snow Land' not in line
            and 'Land —' not in line
        ):
            return False

    # If the line contains the word "Planeswalker", then it must meet one of the
    # following conditions:
    # - "Planeswalker" is succeeded by a long dash.
    if 'Planeswalker' in line:
        if 'Planeswalker —' not in line:
            return False

    # If the line contains the word "Basic", it must also contain the word
    # "Land".
    if 'Basic' in line:
        if 'Land' not in line:
            return False

    # At this point, we're reasonably sure that we're ruled out a lot of false
    # positives, so we will identify this as a type line.
    return True

# Given a name and cost line string (eg. "Applejack, Element of Honesty 4GG"),
# split it into the name part and the cost part. There are three situations that
# we need to consider:
#
# 1. The name and cost line consists of the card's name followed by the cost.
#
#    Example: "Applejack, Element of Honesty 4GG": the name is "Applejack,
#              Element of Honesty" and the cost is "4GG".
#
# 2. The name and cost line is for a split card, and thus consists of two
#    name-cost pairs, separated by a double-slash.
#
#    Example: "Bait 3G//Switch 5U"
#
# 3. There isn't a cost at all, just the name.
#
# If `use_strict_cost_checking` is True, then this function will apply extra
# scrutiny when attempting to extract the mana cost from the line, which is
# helpful in some certain situations. (Strict cost checking shouldn't be used
# all the time, as it might be _too_ strict in some cases).
def split_name_and_cost_line(
    name_and_cost_line,
    use_strict_cost_checking = False
):
    if '//' in name_and_cost_line:
        # The name and cost line contains a double slash, so we will assume that
        # it is a split card.
        name_and_cost_line_halves = [
            half.strip() for half in name_and_cost_line.split('//')
        ]

        # We should now have two name-and-cost pairs. We can treat these as if
        # they were regular individual name-and-cost lines to extract the names
        # and costs from each.

        name_and_cost_1 = split_name_and_cost_line(
            name_and_cost_line_halves[0]
        )
        name_and_cost_2 = split_name_and_cost_line(
            name_and_cost_line_halves[1]
        )

        # For split cards, the way the database deals with them is to display
        # their name as a combined name (eg. "Bait // Switch"), and to use an
        # extra cost parameter (`cost2`) to hold the second cost.
        name = name_and_cost_1['name']+' // '+name_and_cost_2['name']
        cost = name_and_cost_1['cost']
        cost2 = name_and_cost_2['cost']
        return {'name': name, 'cost': cost, 'cost2': cost2}
    else:
        # This is not a split card, so we assume that it is a regular
        # name-and-cost line. Usually, in this case, the final word of the line
        # is the cost (eg. "2WU"). However, there are rare cases where a card
        # does not have a mana cost (for example, if it's the reverse side of a
        # double-sided card). In such cases, the final word is part of the name.
        #
        # One way to be reasonably sure that the final word is part of the name
        # and not a mana cost, is to check if it contains any characters that
        # wouldn't be expected in mana costs. However, since this is still prone
        # to error, we only perform that check if the calling code requests it.
        # Generally, we'll leave it up to the parser to make the decision based
        # on other things that it knows about the card.

        # By default, use the reasonable assumption that the last word on the
        # line is the mana cost. (eg. "4GG").
        name_and_cost_line_pieces = name_and_cost_line.split()
        name = ' '.join(name_and_cost_line_pieces[0:-1])
        cost = name_and_cost_line_pieces[-1]

        if use_strict_cost_checking:
            # If strict checking was requested, we check the cost we just
            # obtained against a whitelist of characters that we might expect to
            # appear in a mana cost.
            manaCostCharacters = r"WUBRGCXS0123456789(){}\[\]/"
            nonManaCostRegex = "[^"+manaCostCharacters+"]"

            if re.search(nonManaCostRegex, cost, re.IGNORECASE) is not None:
                # If any characters were found in the cost that aren't on the
                # whitelist, we can be reasonably sure that the "cost" we
                # obtained is not really a mana cost, but is actually the last
                # word in the card's name. In that case, we just return the
                # (full) name and don't return a cost.
                if len(name) == 0:
                    name = cost
                else:
                    name = name + ' ' + cost
                return {'name': name}

        return {'name': name, 'cost': cost}

# Given a type line, returns a dictionary containing the component parts of the
# type line. The component parts may be: color indicator, supertype, and
# subtype. Of these, only supertype is guaranteed to be present; not all cards
# have a subtype, and very few have color indicators.
#
# There is also a special case to look out for: split cards. These could have
# _two_ supertype-subtype pairs. For example: "Instant//Enchantment — Aura".
def split_type_line(type_line):
    type_line_parts = {}
    if '//' in type_line:
        # We'll deal with the rare split card situation first. If the type line
        # contains a double slash, we will assume this to be a split card.
        
        type_line_halves = [half.strip() for half in type_line.split('//')]

        # We should now have what are essentially two separate type lines. So
        # we'll split them as if they were each a separate type line.
        type_pieces_1 = split_type_line(type_line_halves[0])
        type_pieces_2 = split_type_line(type_line_halves[1])

        # We now have the individual pieces of both halves of the type line. So
        # for example, we might have two supertype-subtype pairs. Or, we might
        # have a supertype and subtype for the first half, and just a supertype
        # for the second half. Whichever it is, we'll use `supertype2` and
        # `subtype2` for supertypes and subtypes that appear in the second half.
        type_line_parts['supertype'] = type_pieces_1['supertype']
        if 'subtype' in type_pieces_1:
            type_line_parts['subtype'] = type_pieces_1['subtype']

        type_line_parts['supertype2'] = type_pieces_2['supertype']
        if 'subtype' in type_pieces_2:
            type_line_parts['subtype2'] = type_pieces_2['subtype']
    else:
        # This isn't a split type line, so we'll treat it as a normal type line.

        # Search for a color indicator first. This will be a set of mana symbols
        # (ie. W, U, B, R, G) enclosed in parentheses, and will be the first
        # thing on the line if present.
        color_indicator_regex = r'^\([WUBRG]+\) '
        color_indicator_match = re.match(color_indicator_regex, type_line, re.IGNORECASE)

        type_line_remainder = type_line

        if color_indicator_match:
            # If we found a color indicator, store it and remove it from the string.
            type_line_parts['colorIndicator'] = color_indicator_match.group(0)
            # The regex looks for a trailing space at the end, so we need to
            # slice that off.
            type_line_parts['colorIndicator'] = type_line_parts['colorIndicator'][:-1]

            # For the rest of this function, we'll operate on the stuff after
            # the color indicator, which will be the supertype and (if present)
            # the subtype.
            type_line_remainder = type_line[len(type_line_parts['colorIndicator'])+1:]

        # Attempt to split the line on a long dash.
        type_line_remainder_pieces = type_line_remainder.split(EM_DASH)


        if len(type_line_remainder_pieces) == 2:
            # If the line split into two pieces, then the first piece is the
            # supertype, and the second piece is the subtype.
            type_line_parts['supertype'] = type_line_remainder_pieces[0].strip()
            type_line_parts['subtype'] = type_line_remainder_pieces[1].strip()
        else:
            # Otherwise, we'll assume it's just one piece, which must be the
            # supertype.
            type_line_parts['supertype'] = type_line_remainder_pieces[0].strip()

    return type_line_parts

# Given two card data entries, join them together into a single split card.
def join_card_halves(first_card, second_card):
    joined_card = {key:first_card[key] for key in first_card}
    joined_card['name'] = '{} // {}'.format(
        first_card['name'],
        second_card['name']
    )
    joined_card['cost'] = first_card['cost']
    joined_card['cost2'] = second_card['cost']
    joined_card['supertype'] = first_card['supertype']
    joined_card['supertype2'] = second_card['supertype']

    if 'subtype' in first_card:
        joined_card['subtype'] = first_card['subtype']
    if 'subtype' in second_card:
        joined_card['subtype2'] = second_card['subtype']

    if 'text' not in first_card:
        raise Exception(
            'No rules text found on card half "{}" (flavorText = "{}")'.format(
            first_card['name'],
            first_card['flavorText']
        )
    )
    if 'text' not in second_card:
        raise Exception(
            'No rules text found on card half "{}" (flavorText = "{}")'.format(
            second_card['name'],
            second_card['flavorText']
        )
    )

    joined_card['text'] = '{}: {}\n\n'.format(
        first_card['name'],
        first_card['text']
    )
    joined_card['text'] += '{}: {}'.format(
        second_card['name'],
        second_card['text']
    )

    flavor_texts = []
    if 'flavorText' in first_card:
        flavor_texts.append(f'{first_card["flavorText"]}')
    if 'flavorText' in second_card:
        flavor_texts.append(f'{second_card["flavorText"]}')

    if len(flavor_texts) > 0:
        joined_card['flavorText'] = '\n---\n'.join(flavor_texts)

    # Note that as per the convention established by Adventure cards, if the
    # first card has a P/T value, the joined card has that same P/T value.
    if 'pt' in first_card:
        joined_card['pt'] = first_card['pt']

    return joined_card

# Given a dump `dump` of raw FICG data, break it into a list of sub-dumps, each
# of which should represent a single card.
def split_ficg_dump_into_individual_card_dumps(dump):
    # Replace all occurrences of the en dash with the em dash, which is the one
    # that seems to be used officially on Magic cards.
    dump = re.sub(EN_DASH, EM_DASH, dump)

    # Split the dump into lines.
    dump_lines = dump.split('\n')

    # Because text files often end with a newline, this means that `dump_lines`
    # ends up with one empty string as the last element. We don't want that, so
    # we'll get rid of it if it's there.
    if dump_lines[-1] == '':
        dump_lines = dump_lines[0:-1]

    # Go through the lines and identify which of them are type lines.
    type_line_indices = []
    for i in range(len(dump_lines)):
        dump_line = dump_lines[i]
        if is_type_line(dump_line):
            # NOTE: If the parser has failed, this is a good place to look to
            # see where the problem is. Usually it fails because the type line
            # has been misidentified.
            #print(dump_line)
            type_line_indices.append(i)

    # Since the name and cost line is always directly above the type line, we
    # can get the indices of all name-and-cost lines, too.
    name_and_cost_line_indices = []
    for type_line_index in type_line_indices:
        name_and_cost_line_indices.append(type_line_index-1)

    # Since each card always begins with the name-and-cost line, we can use
    # those indices to figure out which ranges of lines represent single,
    # distinct cards.
    card_line_ranges = []

    # This loop just hops through the list of name-and-cost line indices, a pair
    # at a time, to figure out the ranges between each pair of indices. A range
    # is expresses as a tuple (start_line, end_line).
    for i in range(len(name_and_cost_line_indices)-1):
        line_range_start = name_and_cost_line_indices[i]
        line_range_end = name_and_cost_line_indices[i+1]-1
        card_line_range = (line_range_start, line_range_end)
        card_line_ranges.append(card_line_range)

    # There will be one final range on the end that we didn't get (as there
    # isn't an index for the end of the lines). We'll account for that too.
    card_line_ranges.append((name_and_cost_line_indices[-1], len(dump_lines)-1))

    # Having determined the ranges of lines that we need to extract, we can now
    # do so, which will split the dump into sub-dumps that each represent one
    # card.
    sub_dumps = []
    for card_line_range in card_line_ranges:
        line_range_start = card_line_range[0]
        line_range_end = card_line_range[1]
        sub_dump_lines = dump_lines[line_range_start:line_range_end+1]
        sub_dump = '\n'.join(sub_dump_lines)
        sub_dumps.append(sub_dump)

    return sub_dumps

# Given a dump of text which represents a single FICG card, extract and return a
# dictionary of the card's properties.
def parse_individual_card_dump_into_card_data_entry(
    card_dump,
    rules_text_patterns
):
    card_data_entry = {}

    # Before starting, perform a replacement to replace decorative double quotes
    # (”) with regular ones ("). Just to keep things consistent.
    card_dump = card_dump.replace('”', '"')
    card_dump = card_dump.replace('“', '"')

    card_dump = card_dump.replace('’', "'")

    # Split the individual dump into lines.
    card_dump_lines = card_dump.split('\n')

    # Identify the name-and-cost line, and the type line. These, we assume, will
    # always be the first and second lines respectively.
    name_and_cost_line = card_dump_lines[0]
    type_line = card_dump_lines[1]

    # Extract the supertype (and subtype, and color indicator, if present)
    # first. We need this because we want to make a decision about how to
    # interpret the name-and-cost line, and that decision may depend on some of
    # this information.
    type_line_properties = split_type_line(type_line)

    for property_name in type_line_properties:
        card_data_entry[property_name] = type_line_properties[property_name]
    
    # Now that we have the supertype, check what kind of card this is. If it's a
    # land, scheme, conspiracy, phenomenon, or plane, we will assume that the
    # card has no cost for us to extract, and just take the entirety of the
    # name-and-cost line to be the card's name.
    if (
        'Land' in card_data_entry['supertype']
        or 'Scheme' in card_data_entry['supertype']
        or 'Conspiracy' in card_data_entry['supertype']
        or 'Phenomenon' in card_data_entry['supertype']
        or (
            'Plane' in card_data_entry['supertype']
            and 'Planeswalker' not in card_data_entry['supertype']
        )
    ):
        card_data_entry['name'] = name_and_cost_line
    else:
        # Otherwise, if not a land, we will assume that the line contains a name
        # and (probably) a cost, and will split it accordingly.
        name_and_cost_line_properties = split_name_and_cost_line(
            name_and_cost_line
        )
        if 'colorIndicator' in card_data_entry:
            # Special case: If the card has a color indicator, this is often a
            # sign that we are dealing with the reverse side of a double-sided
            # card. These cards tend not to have mana costs, which can confuse
            # our parser.
            # Therefore, in this situation, we'll request strict cost checking
            # on the name and cost line. This will add an extra level of
            # scrutiny which will make it easier for the function to tell
            # whether there is a mana cost or not.
            name_and_cost_line_properties = split_name_and_cost_line(
                name_and_cost_line,
                True
            )
            
        if 'subtype' in card_data_entry and card_data_entry['subtype'] == 'Contraption':
            # Special case: Contraptions don't always have costs, so like with
            # the color indicator, we need to use strict cost checking to
            # prevent the parser from interpreting the last word of the name as
            # a cost.
            name_and_cost_line_properties = split_name_and_cost_line(
                name_and_cost_line,
                True
            )
            
        card_data_entry['name'] = name_and_cost_line_properties['name']
        if 'cost' in name_and_cost_line_properties:
            card_data_entry['cost'] = name_and_cost_line_properties['cost']
        if 'cost2' in name_and_cost_line_properties:
            # If the card was a split card, we should have gotten back a second
            # cost (`cost2`), so we'll include that in the card data.
            card_data_entry['cost2'] = name_and_cost_line_properties['cost2']

    # META CASE: If the card before this one made reference to "transforming"
    # itself, it is possible that this card may be the transformed version of
    # the previous card. If we can confirm that it is, we disregard this card's
    # mana cost, as transformed cards don't have them.
    if META['previous_card_was_a_transformer']:
        # To be sure that this card is the transformed version of the previous
        # card, we need to examine the previous card to see if it transformed
        # from something else. If it did, then this card can't be the
        # transformed version of that card (since cards can only transform into
        # one other card).
        if 'transformsFrom' not in META['previous_card_data_entry']:
            # Since we now know this is the transformed version of the previous
            # card, we don't expect it to have a mana cost. We'll disregard
            # whatever cost we already assumed and take the whole name-and-cost
            # line as the name.
            card_data_entry['name'] = name_and_cost_line
            if 'cost' in card_data_entry:
                del card_data_entry['cost']

            # Record which card this transformed from.
            card_data_entry['transformsFrom'] = META['previous_card_data_entry']['name']

            # Also record that this card is the other side of the previous card,
            # since this is always true for transformers (they are always
            # double-faced).
    
    # META CASE: If the card before this one contained an MDFC marker (`<`), it
    # was a modal double-faced card (MDFC) and that will have been recorded in
    # the meta dictionary. We can now use that information to determine if this
    # card is the other side of that card.
    if META['previous_card_was_a_mdfc']:
        # If the other side of the previous card is already known, then this
        # card can't be the other side.
        if 'otherSideOf' not in META['previous_card_data_entry']:
            card_data_entry['otherSideOf'] = META['previous_card_data_entry']['name']
    
    # We can now use the supertype and subtype to make some further decisions
    # about where the text is on this card, and what the fields below the text
    # are.
    if re.match('^< ', card_dump_lines[-1]):
        # If the last line of the card begins with a `<` character, this
        # indicates a modal double-faced card (MDFC). Modal double-faced cards
        # were introduced in Zendikar Rising - they are similar to split cards
        # in that they can be played as either of their two faces. I asked
        # FanOfMostEverything if he could add an indicator for these cards,
        # since otherwise I can't tell when two consecutive cards in the dump
        # are two faces of the same card.
        #
        # Note that modal double-faced cards are not "transformers".
        # Transformation is an ability. MDFCs do not transform; they simply are
        # whatever side you choose to play them as.
        #
        # Anyway, to deal with MDFCs, we delete the last line if it begins with
        # `<`, and record in the meta dictionary that the previous card is a
        # MDFC.
        card_dump_lines = card_dump_lines[:-1]
        META['previous_card_was_a_mdfc'] = True
    else:
        META['previous_card_was_a_mdfc'] = False
    if 'Creature' in card_data_entry['supertype']:
        # If the card is a creature, we expect that the last line in the dump
        # will be the creature's power/toughness, and everything else will be
        # card text.
        card_data_entry['pt'] = card_dump_lines[-1]
        text_lines = card_dump_lines[2:-1]

        if re.match(r'^Level up', card_dump_lines[2]):
            # Special exception to the above: If the card text begins with
            # "Level up", we will assume this is a Leveler card. Leveler cards
            # don't have a single power/toughness value, so it doesn't make
            # sense to give these a power/toughness property; instead, we
            # simply allow the rules text to state the power/toughness values
            # for the card.
            del card_data_entry['pt']
            text_lines = card_dump_lines[2:]
    elif 'Planeswalker' in card_data_entry['supertype']:
        # If the card is a planeswalker, we expect that the last line in the
        # dump will be the planeswalker's loyalty, and everything else will be
        # card text.
        card_data_entry['loyalty'] = card_dump_lines[-1]
        text_lines = card_dump_lines[2:-1]

        # SPECIAL CASE: "Discord Released" has no loyalty box, due to a quirk
        # of it being the reverse side of a double-sided card. For this card,
        # all lines after the first two are the card text, and we won't set a
        # loyalty.
        if card_data_entry['name'] == 'Discord Released':
            del card_data_entry['loyalty']
            text_lines = card_dump_lines[2:]
    elif (
        'subtype' in card_data_entry
        and 'Contraption' in card_data_entry['subtype']
        and card_dump_lines[-1] in FACTIONS
    ):
        # If this card is a Contraption and the final line is recognized as a
        # faction watermark, we record the watermark on the card.
        #
        # As explained by FoME in
        # <https://www.fimfiction.net/blog/859184/fic-or-faction>, FICG uses
        # Fimfiction emoticons as faction watermarks. Fortunately for us, these
        # emoticon images do get captured in the FICG text dump, as
        # colon-enclosed strings (eg. `:ajsmug:`). So, to record the watermark,
        # we just need to map the emoticon string to the correct watermark
        # name.
        faction_emoticon = card_dump_lines[-1]
        card_data_entry['watermark'] = FACTIONS[faction_emoticon]
        text_lines = card_dump_lines[2:-1]
    elif card_data_entry['name'] == 'Power Converter':
        # SPECIAL CASE: "Power Converter" (from
        # <https://www.fimfiction.net/blog/789008/friendship-is-card-games-2014-annual-power-ponies>)
        # was meant to have an image of the League of Dastardly Doom's faction
        # watermark (I think), but the link is broken; in any case, we probably
        # wouldn't be able to process it anyway. For this card, we add the
        # watermark manually.
        text_lines = card_dump_lines[2:-1]
        card_data_entry['watermark'] = 'League of Dastardly Doom'
    else:
        # In all other cases (ie. enchantments, instants, artifacts), we expect
        # that everything after the first two lines is card text.
        text_lines = card_dump_lines[2:]
        
    # Now that we have determined which part of the card is the text section, we
    # can further split that into rules text and flavor text.
    rules_and_flavor_text = separate_rules_text_and_flavor_text(
        '\n'.join(text_lines),
        rules_text_patterns
    )

    if rules_and_flavor_text[0]:
        card_data_entry['text'] = rules_and_flavor_text[0]
    if rules_and_flavor_text[1]:
        card_data_entry['flavorText'] = rules_and_flavor_text[1]

    # Finally, add the creator attribution; the set and creator will be the
    # same in all cases.
    if 'set_name' in META:
        card_data_entry['set'] = META['set_name']
    card_data_entry['creator'] = 'FanOfMostEverything'

    # Sometimes, the card after this one will need to refer back to it, because
    # it's related to it in some way (usually, by being the transformed version
    # of it). We store any such meta-information in the global `META`
    # dictionary.
    META['previous_card_data_entry'] = card_data_entry

    # If this card referred to "transforming" itself, store that in the meta
    # dictionary. The next card will need to know about that, because it's
    # probably the transformed version of this card (and that will affect how
    # we interpret it).
    #
    # The following condition checks the card text for any of the following: -
    # "transform {FULL NAME OF CARD}" - "transform {FIRST WORD OF CARD NAME}" -
    # "transform it" - "return it to the battlefield transformed"
    first_word_of_card_name = card_data_entry['name'].split(' ')[0]
    
    # Sometimes, the first word will have a trailing comma (eg. "Luna, the
    # Light in the Dark"). This needs to be removed if present.
    if first_word_of_card_name[-1] == ',':
        first_word_of_card_name = first_word_of_card_name[0:-1]

    # Detect if the card is capable of transforming into another card. This is a
    # bit difficult to do reliably, since there are lots # of ways to express
    #the notion of transformation. Just having the word "transform" in its rules
    # text isn't enough to be sure.
    if (
        'text' in card_data_entry
        and (
            'transform '+card_data_entry['name'].lower() in card_data_entry['text'].lower()
            or 'transform '+first_word_of_card_name.lower() in card_data_entry['text'].lower()
            or 'transform it' in card_data_entry['text']
            or re.search(
                r'(put|return)( .+)? to the battlefield( .+)? transformed',
                card_data_entry['text'],
                flags = re.IGNORECASE
            )
        )
    ):
        META['previous_card_was_a_transformer'] = True
    else:
        # If this card didn't make any reference to transformation, then it's
        # not a transformer, and it's not the reverse side of anything.
        META['previous_card_was_a_transformer'] = False

    return card_data_entry

def parse_ficg_dump_into_card_data_entries(ficg_dump, rules_text_patterns):
    # Break up the dump into a number of sub-dumps, each of which (we hope) is
    # a chunk of text that represents a single card.
    individual_card_dumps = split_ficg_dump_into_individual_card_dumps(
        ficg_dump
    )

    card_data_entries = []
    for individual_card_dump in individual_card_dumps:
        card_data_entry = parse_individual_card_dump_into_card_data_entry(
            individual_card_dump,
            rules_text_patterns
        )
        card_data_entries.append(card_data_entry)

    # Before we return it, we can do a second pass on this data; if we
    # identified any "transformsFrom" properties, we
    # can now also add "transformsInto" on the cards that they transform from.
    transformsIntoDict = {}
    for card_data_entry in card_data_entries:
        if 'transformsFrom' in card_data_entry:
            transformsIntoDict[card_data_entry['transformsFrom']] = card_data_entry['name']
    for card_data_entry in card_data_entries:
        if card_data_entry['name'] in transformsIntoDict:
            card_data_entry['transformsInto'] = transformsIntoDict[card_data_entry['name']]

    # A third pass is required to deal with "Aftermath" cards. These are a kind
    # of split card (two cards on the same face). In the raw FICG dump,
    # FanOfMostEverything formats these like this:
    #
    #     Road U
    #     Sorcery
    #     Target creature can’t be blocked this turn.
    #     Ruin 4BB
    #     Sorcery
    #     Aftermath (Cast this spell only from your graveyard. Then exile it.)
    #     Target player loses life equal to the damage already dealt to him or her this turn.
    #
    # Since we need to preserve the connection between the two cards, we must
    # combine them into one card.
    #
    # To do this, we first search through the card data entries for Aftermath
    # cards. For each one that we find, we make the assumption that the card
    # immediately preceding it is the other half of the card. We join the two
    # halves together into a single card, then replace the two cards with the
    # joined version.
    i = 0
    while i < len(card_data_entries):
        card_data_entry = card_data_entries[i]
        if 'text' in card_data_entry and '//' not in card_data_entry['name']:
            # Check to see if the card is an Aftermath card.
            if re.search(r'(^|\n)Aftermath', card_data_entry['text']):
                # This card is an Aftermath card, so join the two halves together.
                first_card_half = card_data_entries[i-1]
                second_card_half = card_data_entries[i]

                joined_card = join_card_halves(first_card_half, second_card_half)

                # Delete this card (the second card half), and replace the
                # preceding card (the first card half) with the
                # joined version.
                del card_data_entries[i]
                card_data_entries[i-1] = joined_card

                # Decrement the index counter by 1 (since we just removed a
                # card).
                i -= 1
        i += 1
        
    # Fourth pass: Adventure cards. These are similar to "Aftermath" cards; they
    # are basically a mini-card bolted on to another one. FanOfMostEverything
    # formats Adventure cards like this:
    # 
    #    Regal Shieldmage 2W
    #    Creature — Unicorn Noble Wizard
    #    Other creatures you control get +0/+1.
    #    “A princess must defend her people.”
    #    2/3
    #    Royal Aegis 1W
    #    Instant — Adventure
    #    Prevent all damage that would be dealt to target creature this turn.
    #
    # As with Aftermath cards, we must combine them into one card, using the
    # same technique.
    i = 0
    while i < len(card_data_entries):
        card_data_entry = card_data_entries[i]
        if 'text' in card_data_entry and '//' not in card_data_entry['name']:
            # Check to see if the card is an Adventure card.
            if (
                'subtype' in card_data_entry
                and 'Adventure' in card_data_entry['subtype']
            ):
                first_card_half = card_data_entries[i-1]
                second_card_half = card_data_entries[i]

                # Join the two cards and replace them with the joined version.
                joined_card = join_card_halves(first_card_half, second_card_half)
                del card_data_entries[i]
                card_data_entries[i-1] = joined_card

                # Decrement the index counter by 1 (since we just removed a
                # card).
                i -= 1
        i += 1
        
    # Fifth pass: If we identified that this card is the other side of a modal
    # double-faced card, we can mark the reciprocal relation on the card's other
    # side.
    otherSideDict = {}
    for card_data_entry in card_data_entries:
        if 'otherSideOf' in card_data_entry:
            otherSideDict[card_data_entry['otherSideOf']] = card_data_entry['name']
    for card_data_entry in card_data_entries:
        if card_data_entry['name'] in otherSideDict:
            card_data_entry['otherSideOf'] = otherSideDict[card_data_entry['name']]

    return card_data_entries

# Given a list of card data entries (dicts), return a JSON encoding for an array
# containing those card data entries as objects.
#
# To produce more consistent output, we go a little further than simply encoding
# the JSON - we also specify the exact ordering of properties in each card data
# entry, and also manually encode the JSON to UTF-8 to make it a little more
# readable (otherwise it encodes non-ASCII characters with escape sequences)
#
# A list of `properties` must be given to define what properties will appear in
# each card data entry (and their ordering).
def convert_card_data_entries_to_json(card_data_entries: list, properties: list) -> str:
    ordered_dicts = []
    for entry in card_data_entries:
        ordered_dict = OrderedDict()
        for prop in properties:
            if prop in entry:
                ordered_dict[prop] = entry[prop]
        ordered_dicts.append(ordered_dict)

    # Convert the set of card data entries to JSON. We need to explicitly
    # suspend ASCII encoding and manually encode it to UTF-8 - this is a bit
    # more human-readable than the default Unicode-escaping behavior.
    card_data_json = json.dumps(ordered_dicts, indent = 4, ensure_ascii = False)
    card_data_json = card_data_json.encode('utf-8')

    return card_data_json.decode()

# Given a piece of card text that may contain a combination of both rules text
# and flavor text, return a 2-tuple containing the rules text and the flavor
# text.
#
# If the text does not contain rules text and/or flavor text, the tuple will
# contain empty strings for whichever is missing.
#
# This function makes several assumptions about the input text:
#
# - that the text consists only of rules text and/or flavor text
# - that flavor text, if present, always comes after rules text, if present
# - that the card text consists of a number of lines separated by line breaks
# - that it is possible to determine whether a given line is rules text or not.
#
# The function works by examining each line of the text, starting with the last
# line and going backward until it encounters a line that it can definitively
# identify as rules text. Once it finds one, it classifies all lines after that
# as flavor text and the rest as rules text.
#
# Because the function for identifying rules text is not 100% reliable, it is
# possible for this function to misidentify one or more line of rules text as
# flavor text.
def separate_rules_text_and_flavor_text(text, rules_text_patterns):
    lines = text.split('\n')

    for i in range(len(lines)-1, -1, -1):
        line = lines[i]
        if is_rules_text(line, rules_text_patterns):
            break

        # If we reach this point and i has reached 0, that means that we never
        # found any rules text in the text at all. That causes an off-by-one
        # issue with the slices we're about to use to extract the rules and
        # flavor text. To fix it, we just decrement the index once more to
        # ensure that we slice off the whole list as flavor text.
        if i == 0:
            i -= 1

    rules_lines = lines[:i+1]
    flavor_lines = lines[i+1:]

    rules_lines = [line for line in rules_lines if len(line) > 0]

    rules_text = '\n\n'.join(rules_lines)
    flavor_text = '\n'.join(flavor_lines)

    # If there happen to be any blank lines between the rules text and flavor
    # text, these will be captured at the start of the flavor text. We usually
    # don't want this, so strip off any that occur.
    flavor_text = flavor_text.strip()

    return (rules_text, flavor_text)

# Return true if a given string can be identified as being a line of Magic: the
# Gathering rules text (as opposed to flavor text).
#
# This function uses a large list of regular expressions designed to match
# phrases that are commonly used in rules text, but not in flavor text. The list
# is not exhaustive and may give false negatives if it is unable to match a
# legitimate piece of rules text.
def is_rules_text(string, rules_text_patterns):
    string = re.sub("’", "'", string)

    for pattern in rules_text_patterns:
        if re.search(pattern, string, re.IGNORECASE):
            return True
    return False
