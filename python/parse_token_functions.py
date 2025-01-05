from collections import OrderedDict

# Grammars describe how tokens may be specified in card text. Uppercase strings
# are placeholders that can take a number of predefined values (specified in
# `GRAMMAR_OPTIONS`). Non-uppercase strings are literals.
GRAMMARS = [
    ['COLOR', 'SUBTYPE', 'SUPERTYPE', 'token'],
    ['PT', 'COLOR', 'and', 'COLOR', 'SUBTYPE', 'SUPERTYPE', 'token', 'with', 'KEYWORD'],
    ['PT', 'COLOR', 'SUBTYPE', 'SUBTYPE', 'SUPERTYPE', 'token', 'with', 'KEYWORD'],
    ['PT', 'COLOR', 'SUBTYPE', 'SUPERTYPE', 'token'],
]

# Grammar options list, for each grammar term, the expected values they may
# have.
GRAMMAR_OPTIONS = {
    'PT': ['1/1', '2/X'],
    'COLOR': ['white', 'blue', 'black', 'red', 'green', 'colorless'],
    'SUBTYPE': [
        'Bat',
        'Bird',
        'Cat',
        'Clue',
        'Contraption',
        'Crocodile',
        'Dragon',
        'Elemental',
        'Equipment',
        'Insect',
        'Nightmare',
        'Pegasus',
        'Plant',
        'Pony',
        'Ox',
        'Rabbit',
        'Shade',
        'Skeleton',
        'Spider',
        'Squirrel',
        'Unicorn',
        'Zombie',
    ],
    'SUPERTYPE': ['artifact', 'creature'],
    'KEYWORD': ['flying'],
}

# Grammar exclusions list, for each grammar term, the values they're NOT
# expected to ever have. This is important for eliminating values that would
# otherwise show up as partial matches. For example, the following two strings
# both match the grammar `['PT', 'COLOR', 'SUBTYPE', 'SUPERTYPE', 'token']`:
#
#     a colorless Contraption artifact token
#     2/X white Unicorn soldier token
GRAMMAR_EXCLUSIONS = {
    "PT": ["a", "and"],
    "COLOR": ["and"],
}

# Token property order defines the ordering of fields in a created token.
TOKEN_PROPERTY_ORDER = [
    'name',
    'cost',
    'colorIndicator',
    'supertype',
    'subtype',
    'text',
    'flavorText',
    'pt',
    'loyalty',
    'cardType',
]


def match_grammar(string: str, grammar: list[str], grammar_options: dict, grammar_exclusions: dict=None) -> list(tuple[str, str]):
    """Given a string, a grammar consisting of a list of terms, and a dictionary
    which provides options for each grammar term, attempt to match the string to
    the grammar.

    Return a list of tuples `(grammar_term, matched_string)`, one for each
    grammar term in the grammar. If a string did not match the grammar term,
    `matched_string` is None.

    If the string does not have the same number of words as the grammar, all
    instances of `matched_string` are None.

    Example: with the following arguments:

        string = "7/7 black and green Rabbit creature token"
        grammar = ["PT", "COLOR", "and", "COLOR", "SUBTYPE", "SUPERTYPE", "token"]
        grammar_options = {
            "PT": ["7/7"],
            "COLOR": ["black", "green"],
            "SUBTYPE": ["Rabbit"],
            "SUPERTYPE": ["Creature"],
        }

    we should expect the following result:

        [
            ("PT": "7/7"),
            ("COLOR": "black"),
            ("and": "and"),
            ("COLOR": "green"),
            ("SUBTYPE": "Rabbit"),
            ("SUPERTYPE": "creature"),
            ("token": "token"),
        ]

    Note that literal terms always match their string exactly."""
    if grammar_exclusions is None:
        grammar_exclusions = {}

    words = string.split()

    # If the number of words in the string doesn't match the number of terms in
    # the grammar, they can't match.
    if len(words) != len(grammar):
        return None

    matches = []

    # Compare each grammar term to each word in the string.
    for i, term in enumerate(grammar):
        # Get the word that should correspond to this grammar term. This assumes
        # that the number of words in the provided string matches the number of
        # terms in the grammar; if it doesn't, the user is trying to compare two
        # things that can't possibly match. To handle this situation, we'll
        # still continue the matching process even if there's no matching word
        # at the given index, but we'll report no match.
        try:
            word = words[i]
        except KeyError:
            matches.append((term, None))
            continue

        # Get all excluded words for this grammar term. If the word is excluded,
        # the entire string is rejected, no matter how many other terms match.
        # This allows us to avoid suggesting near matches that aren't really
        # matches.
        excluded_words = grammar_exclusions.get(term)
        if excluded_words is not None and word in excluded_words:
            return [(t, None) for t in grammar]
        

        # Get all possible words for this grammar term. The given word needs to
        # match one of these words.
        possible_words = None
        if term == term.upper():
            # Grammar terms in uppercase signify something that must match one
            # of a set of options (for example, "COLOR" may need to match one of
            # the card # colors in Magic: the Gathering).
            try:
                possible_words = grammar_options[term]
            except KeyError:
                raise Exception(f'No options defined for grammar term "{term}"')
        else:
            # Non-uppercase terms are simply literal; the given word has to
            # match these exactly.
            possible_words = [term]

        if word in possible_words:
            # If the word matched one of the possible words, add it to the
            # matches for this grammar term.
            matches.append((term, word))
        else:
            # Otherwise, add no match.
            matches.append((term, None))
        continue

    return matches


def get_grammar_matches(string: str, grammar: list[str], grammar_options: dict, grammar_exclusions: dict=None, match_strength_threshold: float=1) -> list[tuple[str, str]]:
    """Given a string, scan through all substrings of the same length as the
    given grammar, and return all grammar matches.

    It's possible for the same grammar to match multiple substrings. Some of
    these matches may be imperfect, in which case we can ignore them but we
    should flag them up as possibilities.
"""
    words = string.split()

    matches = []
    for i in range(len(words) - len(grammar) + 1):
        substring_words = words[i:i+len(grammar)]
        assert(len(substring_words) == len(grammar))

        substring = ' '.join(substring_words)
        matches.append(match_grammar(substring, grammar, grammar_options, grammar_exclusions))

    # We can sort the substring matches into 3 groups: perfect matches, near
    # matches (those that matched most, but not all, terms in the grammar), and
    # failed matches.

    def rate_grammar_match(match: list[tuple[str, str]]) -> float:
        matched_terms = [t[0] for t in match if t[1] is not None]

        return len(matched_terms) / len(match)
        

    perfect_matches = [m for m in matches if rate_grammar_match(m) == 1]
    near_matches = [m for m in matches if (rating := rate_grammar_match(m)) < 1 and rating > match_strength_threshold]
    failed_matches = [m for m in matches if rate_grammar_match(m) < match_strength_threshold]

    for near_match in near_matches:
        near_match_desc = "\n".join([f'    * {t[0]}: {t[1]}' for t in near_match])
        raise Exception(f'Near match for the following string:\n\n    {string}\n\nThe match was:\n\n{near_match_desc}')

    return perfect_matches


def create_tokens_from_card(card: dict, match_strength_threshold: float=1) -> list[OrderedDict]:
    """Given a card, find token specifications in its text and create those
    tokens."""
    tokens = []

    if 'text' not in card:
        return tokens

    term_to_prop_mappings = {
        'PT': 'pt',
        'SUBTYPE': 'subtype',
        'SUPERTYPE': 'supertype',
    }

    # For each defined grammar, get any matches within the card text.
    for grammar in GRAMMARS:
        matches = get_grammar_matches(card['text'], grammar, GRAMMAR_OPTIONS, GRAMMAR_EXCLUSIONS, match_strength_threshold)
        for match in matches:
            # The match is a list of 2-tuples `(term, word)`. To make it easier
            # to index, turn it into a dictionary. Note that for some terms (eg.
            # COLOR) there might be multiple tuples in the match, so each term
            # maps to a list of matching words.
            indexed_match = {}
            for term, word in match:
                if term not in indexed_match:
                    indexed_match[term] = []
                indexed_match[term].append(word)

            token = {
                'cardType': 'token',
            }

            if 'PT' in indexed_match:
                token['pt'] = indexed_match['PT'][0]

            if 'SUBTYPE' in indexed_match:
                token['subtype'] = indexed_match['SUBTYPE'][0]

            if 'SUPERTYPE' in indexed_match:
                token['supertype'] = 'Token ' + indexed_match['SUPERTYPE'][0].capitalize()

            token['name'] = token['subtype']

            ordered_token = OrderedDict()
            for prop in TOKEN_PROPERTY_ORDER:
                if prop in token:
                    ordered_token[prop] = token[prop]

            tokens.append(ordered_token)

    return tokens
