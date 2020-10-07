import unittest
from parse_ficg_functions import *

class test_parse_ficg_functions(unittest.TestCase):
    # Test the `is_type_line` function to ensure it correctly identifies type
    # lines. The type line is the primary signature that the parser looks for
    # when figuring out which parts of the raw data are distinct cards. If the
    # parser has produced a garbled card, it's probably a good idea to test the
    # problematic type line here; most likely, the parser didn't recognize it as
    # a real type line.
    def test_is_type_line(self):
        self.assertTrue(is_type_line('Tribal Enchantment — Hellion'))
        self.assertTrue(is_type_line('Creature — Rabbit'))
        self.assertTrue(is_type_line('Creature — Rabbit Warrior'))
        self.assertTrue(is_type_line('Creature— Rabbit'))
        self.assertTrue(is_type_line('Creature – Rabbit')) # contains en dash
        self.assertTrue(is_type_line('Creature'))
        self.assertTrue(is_type_line('Instant'))
        self.assertTrue(is_type_line('Instant — Trap'))
        self.assertTrue(is_type_line('(WUBRG) Instant'))
        self.assertTrue(is_type_line('Legendary Instant'))
        self.assertTrue(is_type_line('Snow Instant'))
        self.assertTrue(is_type_line('Tribal Instant — Rabbit'))
        self.assertTrue(is_type_line('Trope Instant'))
        self.assertTrue(is_type_line('Instant // Instant'))
        self.assertTrue(is_type_line('Instant // Sorcery'))
        self.assertTrue(is_type_line('Sorcery // Instant'))
        self.assertTrue(is_type_line('Instant//Instant'))
        self.assertTrue(is_type_line('Sorcery'))
        self.assertTrue(is_type_line('Sorcery — Adventure'))
        self.assertTrue(is_type_line('Legendary Sorcery'))
        self.assertTrue(is_type_line('Snow Sorcery'))
        self.assertTrue(is_type_line('Tribal Sorcery — Hydra'))
        self.assertTrue(is_type_line('Sorcery // Sorcery'))
        self.assertTrue(is_type_line('Sorcery//Sorcery'))
        self.assertTrue(is_type_line('Enchantment'))
        self.assertTrue(is_type_line('Legendary Enchantment'))
        self.assertTrue(is_type_line('Snow Enchantment'))
        self.assertTrue(is_type_line('World Enchantment'))
        self.assertTrue(is_type_line('(WUBRG) Enchantment'))
        self.assertTrue(is_type_line('Enchantment Creature — Rabbit Avatar'))
        self.assertTrue(is_type_line('Enchantment Artifact'))
        self.assertTrue(is_type_line('Legendary Enchantment Creature — Rabbit'))
        self.assertTrue(is_type_line('Enchantment — Aura'))
        self.assertTrue(is_type_line('Artifact'))
        self.assertTrue(is_type_line('Artifact — Equipment'))
        self.assertTrue(is_type_line('Legendary Artifact'))
        self.assertTrue(is_type_line('Snow Artifact'))
        self.assertTrue(is_type_line('Artifact Creature — Rabbit Golem'))
        self.assertTrue(is_type_line('Legendary Artifact Creature — Rabbit'))
        self.assertTrue(is_type_line('Legendary Enchantment Artifact'))
        self.assertTrue(is_type_line('Enchantment Artifact'))
        self.assertTrue(is_type_line('World Artifact'))
        self.assertTrue(is_type_line('Tribal Artifact — Elf'))
        self.assertTrue(is_type_line('Conspiracy'))
        self.assertTrue(is_type_line('Plane — Example'))
        self.assertTrue(is_type_line('Scheme'))
        self.assertTrue(is_type_line('Ongoing Scheme'))
        self.assertTrue(is_type_line('Basic Land'))
        self.assertTrue(is_type_line('Land'))
        self.assertTrue(is_type_line('Land — Example'))
        self.assertTrue(is_type_line('Legendary Land'))
        self.assertTrue(is_type_line('Snow Land'))
        self.assertTrue(is_type_line('Planeswalker — Example'))
        self.assertTrue(is_type_line('Legendary Snow Creature — Spirit'))
        self.assertTrue(is_type_line('Phenomenon'))
        self.assertTrue(is_type_line('Sorcery — Arcane'))

        self.assertFalse(is_type_line('Legendary'))
        self.assertFalse(is_type_line('Legendary Example'))
        self.assertFalse(is_type_line('Snow'))
        self.assertFalse(is_type_line('Snow Example'))
        self.assertFalse(is_type_line('Tribal'))
        self.assertFalse(is_type_line('Tribal Instant'))
        self.assertFalse(is_type_line('Instant 0'))
        self.assertFalse(is_type_line('Instant 1'))
        self.assertFalse(is_type_line('Instant 10'))
        self.assertFalse(is_type_line('Instant 1W'))
        self.assertFalse(is_type_line('Instant XX'))
        self.assertFalse(is_type_line('Instant (ub)'))
        self.assertFalse(is_type_line('Instant 1WUBRG'))
        self.assertFalse(is_type_line('Instant.'))
        self.assertFalse(is_type_line('Instantiate'))
        self.assertFalse(is_type_line('Example Sorcery'))
        self.assertFalse(is_type_line('Example Enchantment'))
        self.assertFalse(is_type_line('Enchantment Example'))
        self.assertFalse(is_type_line('Example Artifact'))
        self.assertFalse(is_type_line('Artifact Example'))
        self.assertFalse(is_type_line('Example Conspiracy'))
        self.assertFalse(is_type_line('Plane'))
        self.assertFalse(is_type_line('Example Scheme'))
        self.assertFalse(is_type_line('Example Land'))
        self.assertFalse(is_type_line('Planeswalker'))
        self.assertFalse(is_type_line('Example Phenomenon'))
        self.assertFalse(is_type_line('Phenomenon Example'))

    def test_parse_individual_card_dump_into_card_data_entry(self):
        with open('data/rules-text-patterns.txt') as rules_text_patterns_file:
            rules_text_patterns = [
                line.strip('\n') for line in rules_text_patterns_file
            ]

        dump_side_a = """Frosted Familiar 4BB
Creature — Horror
Flash
When Frosted Familiar enters the battlefield, create a Food token for each creature that died this turn. (They’re artifacts with “T, Sacrifice this artifact: You gain 3 life.”)
“I miss my brother.”
—Pinkie Pie, Bearer of Laughter
4/4
< Land T: Add B."""

        dump_side_b = """Frosted Cottage
Land
Frosted Cottage enters the battlefield tapped.
T: Add B.
“I told him those peppermint accents spelled trouble, but did he listen to me?”
—Pinkie Pie, Bearer of Laughter
< Horror 4BB"""

        card_side_a = parse_individual_card_dump_into_card_data_entry(
            dump_side_a,
            rules_text_patterns
        )

        self.assertIn('name', card_side_a)
        self.assertIn('cost', card_side_a)
        self.assertIn('supertype', card_side_a)
        self.assertIn('subtype', card_side_a)
        self.assertIn('text', card_side_a)
        self.assertIn('flavorText', card_side_a)
        self.assertIn('pt', card_side_a)

        self.assertEqual('Frosted Familiar', card_side_a['name'])
        self.assertEqual('4BB', card_side_a['cost'])
        self.assertEqual('Creature', card_side_a['supertype'])
        self.assertEqual('Horror', card_side_a['subtype'])
        self.assertEqual('Flash\n\nWhen Frosted Familiar enters the battlefield, create a Food token for each creature that died this turn. (They’re artifacts with "T, Sacrifice this artifact: You gain 3 life.")', card_side_a['text'])
        self.assertEqual('"I miss my brother."\n—Pinkie Pie, Bearer of Laughter', card_side_a['flavorText'])
        self.assertEqual('4/4', card_side_a['pt'])

        card_side_b = parse_individual_card_dump_into_card_data_entry(
            dump_side_b,
            rules_text_patterns
        )

        self.assertIn('name', card_side_b)
        self.assertNotIn('cost', card_side_b)
        self.assertIn('supertype', card_side_b)
        self.assertNotIn('subtype', card_side_b)
        self.assertIn('text', card_side_b)
        self.assertIn('flavorText', card_side_b)
        self.assertNotIn('pt', card_side_b)
        self.assertIn('otherSideOf', card_side_b)

        self.assertEqual('Frosted Cottage', card_side_b['name'])
        self.assertEqual('Land', card_side_b['supertype'])
        self.assertEqual('Frosted Cottage enters the battlefield tapped.\n\nT: Add B.', card_side_b['text'])
        self.assertEqual('"I told him those peppermint accents spelled trouble, but did he listen to me?"\n—Pinkie Pie, Bearer of Laughter', card_side_b['flavorText'])
        self.assertEqual('Frosted Familiar', card_side_b['otherSideOf'])

    def test_separate_rules_text_and_flavor_text(self):
        with open('data/rules-text-patterns.txt') as rules_text_patterns_file:
            rules_text_patterns = [
                line.strip('\n') for line in rules_text_patterns_file
            ]

        # Test that both rules text and flavor text are separated correctly.
        self.assertEqual(
            (
                "Trample\n\nLimestone Pie can't block.",
                "Limestone Pie is best pony."
            ),
            separate_rules_text_and_flavor_text(
                "Trample\n\nLimestone Pie can't block.\n\nLimestone Pie is best pony.",
                rules_text_patterns
            )
        )

        # Test that text containing only rules text is separated correctly.
        self.assertEqual(
            (
                "Haste\n\nDevour 1\n\nProvoke",
                ''
            ),
            separate_rules_text_and_flavor_text(
                "Haste\n\nDevour 1\n\nProvoke",
                rules_text_patterns
            )
        )

        # Test that text containing only flavor text is separated correctly.
        self.assertEqual(
            (
                '',
                "This card only contains flavor text.\n\nAnd nothing else."
            ),
            separate_rules_text_and_flavor_text(
                "This card only contains flavor text.\n\nAnd nothing else.",
                rules_text_patterns
            )
        )

        # Test that empty text is separated correctly.
        self.assertEqual(
            ('', ''),
            separate_rules_text_and_flavor_text(
                '',
                rules_text_patterns
            )
        )

    # Test a set of real samples of rules text against the list of patterns used
    # by the parser, to ensure that it recognizes valid rules text.
    def test_is_rules_text(self):
        with open('data/rules-text-patterns.txt') as rules_text_patterns_file:
            rules_text_patterns = [
                line.strip('\n') for line in rules_text_patterns_file
            ]

        with open('data/rules-text-samples.txt') as rules_text_samples_file:
            rules_text_samples = [
                line.strip('\n') for line in rules_text_samples_file
            ]

        for sample in rules_text_samples:
            self.assertTrue(is_rules_text(sample, rules_text_patterns), sample)

unittest.main()
