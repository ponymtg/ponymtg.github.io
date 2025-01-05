import unittest
from unittest import TestCase
from parse_token_functions import match_grammar, create_tokens_from_card

class test_parse_token_functions(TestCase):
    def test_match_grammar(self):
        string = 'colorless Contraption artifact token'
        grammar = ['COLOR', 'SUBTYPE', 'SUPERTYPE', 'token']
        options = {
            'PT': ['1/1'],
            'COLOR': ['white', 'blue', 'black', 'red', 'green', 'colorless'],
            'SUBTYPE': ['Contraption', 'Bird'],
            'SUPERTYPE': ['artifact', 'creature'],
            'KEYWORD': ['flying'],
        }

        match = match_grammar(string, grammar, options)

        self.assertEqual(4, len(match))
        self.assertEqual('COLOR', match[0][0])
        self.assertEqual('SUBTYPE', match[1][0])
        self.assertEqual('SUPERTYPE', match[2][0])
        self.assertEqual('token', match[3][0])
        self.assertEqual('colorless', match[0][1])
        self.assertEqual('Contraption', match[1][1])
        self.assertEqual('artifact', match[2][1])
        self.assertEqual('token', match[3][1])

        string = "1/1 white and blue Bird creature token with flying"
        grammar = ['PT', 'COLOR', 'and', 'COLOR', 'SUBTYPE', 'SUPERTYPE', 'token', 'with', 'KEYWORD']

        match = match_grammar(string, grammar, options)

        self.assertEqual(9, len(match))
        self.assertEqual('PT', match[0][0])
        self.assertEqual('COLOR', match[1][0])
        self.assertEqual('and', match[2][0])
        self.assertEqual('COLOR', match[3][0])
        self.assertEqual('SUBTYPE', match[4][0])
        self.assertEqual('SUPERTYPE', match[5][0])
        self.assertEqual('token', match[6][0])
        self.assertEqual('with', match[7][0])
        self.assertEqual('KEYWORD', match[8][0])
        self.assertEqual('1/1', match[0][1])
        self.assertEqual('white', match[1][1])
        self.assertEqual('and', match[2][1])
        self.assertEqual('blue', match[3][1])
        self.assertEqual('Bird', match[4][1])
        self.assertEqual('creature', match[5][1])
        self.assertEqual('token', match[6][0])
        self.assertEqual('with', match[7][0])
        self.assertEqual('flying', match[8][1])
        
    def test_create_tokens_from_card(self):
        card = {
            "text": "Assemble 1R (1R: Put a colorless Contraption artifact token onto the battlefield. Assemble only any time you could cast a sorcery.)\n\nContraptions you control have \"T: Target creature gets +1/+0 until end of turn.\"",
        }

        tokens = create_tokens_from_card(card)

        self.assertEqual(1, len(tokens))
        self.assertEqual('Contraption', tokens[0]['name'])
        self.assertNotIn('colorIndicator', tokens[0])
        self.assertEqual('Token Artifact', tokens[0]['supertype'])
        self.assertEqual('Contraption', tokens[0]['subtype'])
        self.assertEqual('token', tokens[0]['cardType'])

unittest.main()

