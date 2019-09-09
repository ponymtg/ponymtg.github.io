window.onload = test;

var tests = [
    testGetFilteredCards,
    testGetStatistics,
    testGetInformation,
    testGetMatchingCards,
    testGetCardsFilteredByProperties,
    testGetCardsForWhichPropertiesExist,
    testGetCardsFilteredBySet,
    testConvertManaCost,
    testGetCostManaTypes,
    testIsSplitManaSymbol,
    testTokenizeString,
    testGetCardColorSchemeFromManaCost,
];

function test() {
    output('Starting PonyMTG test suite...');
    output('');

    try {
        tests.forEach(
            function(test) {
                output('Running test ' + test.name + '...');
                test();
            }
        );
    } catch (error) {
        outputError(error);
        throw error;
    }

    output('');
    output('<span class="test-success">All tests passed.</span>');
}

function testGetFilteredCards() {
    let cards = [
        { 'name': 'Card 1',  'set': 'Set 1', 'cost': 'W', 'image': 'card4.jpg'},
        { 'name': 'Card 2',  'set': 'Set 1', 'cost': '1U' },
        { 'name': 'Card 3',  'set': 'Set 2', 'cost': '2B' },
        { 'name': 'Card 4',  'set': 'Set 2', 'cost': '3R'},
        { 'name': 'Card 5',  'set': 'Set 3', 'cost': 'XG' },
        { 'name': 'Card 6',  'set': 'Set 3' },
        { 'name': 'Card 7',  'set': 'Set 4', 'cost': '1' },
        { 'name': 'Card 8',  'set': 'Set 4', 'cost': 'C' },
        { 'name': 'Card 9',  'set': 'Set 5', 'cost': '(WU)' },
        { 'name': 'Card 10', 'set': 'Set 5', 'cost': '1XWUBRG' },
    ];
    for (var i=0; i < cards.length; i++) {
        cards[i].derivedProperties = getDerivedCardProperties(cards[i]);
    }

    // Test for white cards in Set 1. Card 1 should match, but not Card 2 (it's
    // blue).
    filteredCards = getFilteredCards(
        cards,
        ['Set 1'],
        ['white'],
        'anyInclusive',
        false
    );
    UTIL.assertEquals(1, filteredCards.length);
    UTIL.assertEquals('Card 1', filteredCards[0].name);
    
    // Test for white, blue, and red cards in Set 1 and Set 2. Cards 1, 2, and
    // 4 should match, but not Card 3 (it's black).
    filteredCards = getFilteredCards(
        cards,
        ['Set 1', 'Set 2'],
        ['white', 'blue', 'red'],
        'anyInclusive',
        false
    );

    // Test for cards with no mana cost in Set 3. Card 6 should match (it has no
    // mana cost), but Card 5 should not (it's green).
    filteredCards = getFilteredCards(
        cards,
        ['Set 3'],
        ['none'],
        'anyInclusive',
        false
    );
    UTIL.assertEquals(1, filteredCards.length);
    UTIL.assertEquals('Card 6', filteredCards[0].name);

    // Test for cards with generic mana in all 5 sets. All cards should match
    // except Card 1 (it only has white mana), Card 6 (it has no mana at all),
    // Card 8 (it's colorless, which is not generic) and Card 9 (it's white and
    // blue).
    filteredCards = getFilteredCards(
        cards,
        ['Set 1', 'Set 2', 'Set 3', 'Set 4', 'Set 5'],
        ['generic'],
        'anyInclusive',
        false
    );
    UTIL.assertEquals(6, filteredCards.length);
    UTIL.assertEquals('Card 2', filteredCards[0].name);
    UTIL.assertEquals('Card 3', filteredCards[1].name);
    UTIL.assertEquals('Card 4', filteredCards[2].name);
    UTIL.assertEquals('Card 5', filteredCards[3].name);
    UTIL.assertEquals('Card 7', filteredCards[4].name);
    UTIL.assertEquals('Card 10', filteredCards[5].name);

    // Test for cards which inclusively contain both white and blue in Set 1 and
    // Set 5. Card 9 and Card 10 should match (they contain white and blue, as
    // well as other colors), but Card 1 and Card 2 should not (they each only
    // contain one of white or blue, but not both colors).
    filteredCards = getFilteredCards(
        cards,
        ['Set 1', 'Set 5'],
        ['white', 'blue'],
        'allInclusive',
        false
    );
    UTIL.assertEquals(2, filteredCards.length);
    UTIL.assertEquals('Card 9', filteredCards[0].name);
    UTIL.assertEquals('Card 10', filteredCards[1].name);

    // Test for cards which exclusively contain either white, blue, or generic
    // in Set 1 and Set 5. Cards 1, 2, and 9 should all match, since they
    // contain either white or blue (or both) and no other colors. Card 10
    // should not match, since although it does contain white and blue, it also
    // contains other colors.
    filteredCards = getFilteredCards(
        cards,
        ['Set 1', 'Set 5'],
        ['white', 'blue', 'generic'],
        'anyExclusive',
        false
    );
    UTIL.assertEquals(3, filteredCards.length);
    UTIL.assertEquals('Card 1', filteredCards[0].name);
    UTIL.assertEquals('Card 2', filteredCards[1].name);
    UTIL.assertEquals('Card 9', filteredCards[2].name);

    // Test for cards which exclusively contain either white, blue, or generic
    // in Set 1 and Set 5. Cards 1, 2, and 9 should all match, since they
    // contain either white or blue (or both) and no other colors. Card 10
    // should not match, since although it does contain white and blue, it also
    // contains other colors.
    filteredCards = getFilteredCards(
        cards,
        ['Set 1', 'Set 5'],
        ['white', 'blue', 'generic'],
        'anyExclusive',
        false
    );
    UTIL.assertEquals(3, filteredCards.length);
    UTIL.assertEquals('Card 1', filteredCards[0].name);
    UTIL.assertEquals('Card 2', filteredCards[1].name);
    UTIL.assertEquals('Card 9', filteredCards[2].name);

    // Test for cards which exclusively contain only white and blue in Set 5.
    // Card 9 should match (it contains white, blue, and nothing else), but
    // Card 10 should not (it contains white, blue, and several other colors).
    filteredCards = getFilteredCards(
        cards,
        ['Set 5'],
        ['white', 'blue'],
        'allExclusive',
        false
    );
    UTIL.assertEquals(1, filteredCards.length);
    UTIL.assertEquals('Card 9', filteredCards[0].name);

    // Test for cards in Set 1 which contain images. Only card 1 should match.
    filteredCards = getFilteredCards(
        cards,
        ['Set 1'],
        ['white', 'blue', 'black', 'red', 'green', 'generic', 'colorless'],
        'anyInclusive',
        true
    );
    UTIL.assertEquals(1, filteredCards.length);
    UTIL.assertEquals('Card 1', filteredCards[0].name);

}

function testGetStatistics() {
    let cards = [
        { 'name': 'Card 1',  'set': 'Set 1', 'creator': 'Creator 1' },
        { 'name': 'Card 2',  'set': 'Set 2', 'creator': 'Creator 1' },
        { 'name': 'Card 3',  'set': 'Set 2', 'creator': 'Creator 1' },
        { 'name': 'Card 4',  'set': 'Set 3', 'creator': 'Creator 1' },
        { 'name': 'Card 5',  'set': 'Set 3', 'creator': 'Creator 1' },
        { 'name': 'Card 6',  'set': 'Set 3', 'creator': 'Creator 2' },
        { 'name': 'Card 7',  'set': 'Set 4', 'creator': 'Creator 2' },
        { 'name': 'Card 8',  'set': 'Set 4', 'creator': 'Creator 2' },
        { 'name': 'Card 9',  'set': 'Set 4', 'creator': 'Creator 2' },
        { 'name': 'Card 10', 'set': 'Set 4', 'creator': 'Creator 2' },
    ];

    let statistics = getStatistics(cards);
    UTIL.assertEquals(10, statistics.counts.numberOfCards);
    UTIL.assertEquals(4, Object.keys(statistics.counts.cardsPerSet).length);
    UTIL.assertEquals(1, statistics.counts.cardsPerSet['Set 1']);
    UTIL.assertEquals(2, statistics.counts.cardsPerSet['Set 2']);
    UTIL.assertEquals(3, statistics.counts.cardsPerSet['Set 3']);
    UTIL.assertEquals(4, statistics.counts.cardsPerSet['Set 4']);
    UTIL.assertEquals(2, Object.keys(statistics.counts.cardsPerCreator).length);
    UTIL.assertEquals(5, statistics.counts.cardsPerCreator['Creator 1']);
    UTIL.assertEquals(5, statistics.counts.cardsPerCreator['Creator 2']);
}

function testGetInformation() {
    let cards = [
        {
            'name': 'Card 1', 
            'set': 'Set 1',
            'creator': 'Creator 1',
            'text': 'a',
        },
        {
            'name': 'Card 2', 
            'set': 'Set 2',
            'creator': 'Creator 1',
            'text': 'aa',
        },
        {
            'name': 'Card 3', 
            'set': 'Set 2',
            'creator': 'Creator 1',
            'text': 'aaa',
        },
        {
            'name': 'Card 4', 
            'set': 'Set 3',
            'creator': 'Creator 2',
            'text': 'aaaa',
        },
        {
            'name': 'Card 5', 
            'set': 'Set 3',
            'creator': 'Creator 2',
            'text': 'aaaaa',
        },
        {
            'name': 'Card 6', 
            'set': 'Set 3',
            'creator': 'Creator 2',
            'text': 'aaaaaa',
        },
        {
            'name': 'Card 7', 
            'creator': 'Creator 3',
        },
    ];

    let info = getInformation(cards);

    UTIL.assertEquals(7, info.overall.numberOfCards);
    UTIL.assertEquals('Card 6', info.cardWithLongestText.name);
    UTIL.assertEquals(6, info.longestCardTextLength);

    UTIL.assertEquals(4, info.sets.length);
    UTIL.assertEquals('Set 1', info.sets[0]);
    UTIL.assertEquals('Set 2', info.sets[1]);
    UTIL.assertEquals('Set 3', info.sets[2]);

    UTIL.assertEquals(4, Object.keys(info.perSet).length);
    UTIL.assertEquals('Set 1', Object.keys(info.perSet)[0]);
    UTIL.assertEquals('Set 2', Object.keys(info.perSet)[1]);
    UTIL.assertEquals('Set 3', Object.keys(info.perSet)[2]);

    UTIL.assertEquals(1, info.perSet['Set 1'].numberOfCards);
    UTIL.assertEquals(2, info.perSet['Set 2'].numberOfCards);
    UTIL.assertEquals(3, info.perSet['Set 3'].numberOfCards);
    UTIL.assertEquals(1, info.perSet[undefined].numberOfCards);

    UTIL.assertEquals(3, Object.keys(info.creators).length);
    UTIL.assertEquals('Creator 1', info.creators[0]);
    UTIL.assertEquals('Creator 2', info.creators[1]);
    UTIL.assertEquals('Creator 3', info.creators[2]);
}


function testGetMatchingCards() {
    let cards = [
        { 'name': 'Applejack', 'set': 'Flutter Sset' },
        { 'name': 'Fluttershy', 'set': 'Apple set' },
        { 'name': 'Pinkie Pie', 'set': 'Flutter Set' },
        { 'name': 'Rainbow Dash', 'set': 'Flutter Set' },
        { 'name': 'Rarity', 'set': 'Flutter Set' },
        { 'name': 'Twilight Sparkle', 'set': 'Flutter Set' },
    ];

    UTIL.assertEquals(6, getMatchingCards(cards, /./, ['name']).length);
    UTIL.assertEquals(4, getMatchingCards(cards, /a/, ['name']).length);
    UTIL.assertEquals(1, getMatchingCards(cards, /^A/, ['name']).length);
    UTIL.assertEquals(2, getMatchingCards(cards, /^R/, ['name']).length);
    UTIL.assertEquals(2, getMatchingCards(cards, /ar/, ['name']).length);
    UTIL.assertEquals(3, getMatchingCards(cards, /\s/, ['name']).length);
    UTIL.assertEquals(
        6,
        getMatchingCards(cards, /Flutter/, ['name', 'set']).length
    );
}

function testGetCardsFilteredByProperties() {
    let cards = [
        { 'name': 'Card 1',  'set': 'Set 1', 'creator': 'Creator 1' },
        { 'name': 'Card 2',  'set': 'Set 2', 'creator': 'Creator 1' },
        { 'name': 'Card 3',  'set': 'Set 2', 'creator': 'Creator 1' },
        { 'name': 'Card 4',  'set': 'Set 3', 'creator': 'Creator 1' },
        { 'name': 'Card 5',  'set': 'Set 3', 'creator': 'Creator 1' },
        { 'name': 'Card 6',  'set': 'Set 3', 'creator': 'Creator 2' },
        { 'name': 'Card 7',  'set': 'Set 4', 'creator': 'Creator 2' },
        { 'name': 'Card 8',  'set': 'Set 4', 'creator': 'Creator 2' },
        { 'name': 'Card 9',  'set': 'Set 4', 'creator': 'Creator 2' },
        { 'name': 'Card 10', 'set': 'Set 4', 'creator': 'Creator 2' },
    ];

    let filteredCards = getCardsFilteredByProperties(
        cards,
        {
            'set': ['Set 3'],
            'creator': ['Creator 1'],
        }
    );
    UTIL.assertEquals(2, filteredCards.length);
    UTIL.assertEquals('Card 4', filteredCards[0].name);
    UTIL.assertEquals('Card 5', filteredCards[1].name);

    filteredCards = getCardsFilteredByProperties(
        cards,
        {
            'set': ['Set 3'],
            'creator': ['Creator 2'],
        }
    );
    UTIL.assertEquals(1, filteredCards.length);
    UTIL.assertEquals('Card 6', filteredCards[0].name);

    filteredCards = getCardsFilteredByProperties(
        cards,
        {
            'set': ['Set 2', 'Set 3'],
            'creator': ['Creator 1'],
        }
    );
    UTIL.assertEquals(4, filteredCards.length);
    UTIL.assertEquals('Card 2', filteredCards[0].name);
    UTIL.assertEquals('Card 3', filteredCards[1].name);
    UTIL.assertEquals('Card 4', filteredCards[2].name);
    UTIL.assertEquals('Card 5', filteredCards[3].name);
}

function testGetCardsForWhichPropertiesExist() {
    let cards = [
        { 'name': 'Card 1' },
        { 'set': 'Set 1' },
        { 'creator': 'Creator 1' },
        { 'name': 'Card 4', 'set': 'Set 2' },
        { 'name': 'Card 5', 'creator': 'Creator 2' },
        { 'set': 'Set 3', 'creator': 'Creator 1' },
        { 'name': 'Card 7', 'set': 'Set 4', 'creator': 'Creator 3' },
    ];

    let filteredCards = getCardsForWhichPropertiesExist( cards, ['name']);
    UTIL.assertEquals(4, filteredCards.length);
    UTIL.assertEquals('Card 1', filteredCards[0].name);
    UTIL.assertEquals('Card 4', filteredCards[1].name);
    UTIL.assertEquals('Card 5', filteredCards[2].name);
    UTIL.assertEquals('Card 7', filteredCards[3].name);

    filteredCards = getCardsForWhichPropertiesExist(cards, ['name', 'set']);
    UTIL.assertEquals(2, filteredCards.length);
    UTIL.assertEquals('Card 4', filteredCards[0].name);
    UTIL.assertEquals('Card 7', filteredCards[1].name);

    filteredCards = getCardsForWhichPropertiesExist(
        cards,
        ['name', 'set', 'creator']
    );
    UTIL.assertEquals(1, filteredCards.length);
    UTIL.assertEquals('Card 7', filteredCards[0].name);
}

function testGetCardsFilteredBySet() {
    let cards = [
        { 'name': 'Card 1',  'set': 'Set 1' },
        { 'name': 'Card 2',  'set': 'Set 2' },
        { 'name': 'Card 3',  'set': 'Set 2' },
        { 'name': 'Card 4',  'set': 'Set 3' },
        { 'name': 'Card 5',  'set': 'Set 3' },
        { 'name': 'Card 6',  'set': 'Set 3' },
        { 'name': 'Card 7',  'set': 'Set 4' },
        { 'name': 'Card 8',  'set': 'Set 4' },
        { 'name': 'Card 9',  'set': 'Set 4' },
        { 'name': 'Card 10', 'set': 'Set 4' },
    ];

    let filteredCards = getCardsFilteredBySet(cards, ['Set 1', 'Set 2']);
    UTIL.assertEquals(3, filteredCards.length);
    UTIL.assertEquals('Card 1', filteredCards[0].name);
    UTIL.assertEquals('Card 2', filteredCards[1].name);
    UTIL.assertEquals('Card 3', filteredCards[2].name);
}

function testConvertManaCost() {
    UTIL.assertEquals(0, convertManaCost('0'));
    UTIL.assertEquals(1, convertManaCost('1'));
    UTIL.assertEquals(2, convertManaCost('2'));
    UTIL.assertEquals(1, convertManaCost('W'));
    UTIL.assertEquals(1, convertManaCost('U'));
    UTIL.assertEquals(1, convertManaCost('B'));
    UTIL.assertEquals(1, convertManaCost('R'));
    UTIL.assertEquals(1, convertManaCost('G'));
    UTIL.assertEquals(2, convertManaCost('WW'));
    UTIL.assertEquals(2, convertManaCost('WU'));
    UTIL.assertEquals(3, convertManaCost('(WU)(BR)G'));
    UTIL.assertEquals(5, convertManaCost('WUBRG'));
    UTIL.assertEquals(6, convertManaCost('1WUBRG'));
    UTIL.assertEquals(7, convertManaCost('2WUBRG'));
    UTIL.assertEquals(0, convertManaCost('X'));
    UTIL.assertEquals(1, convertManaCost('XW'));
    UTIL.assertEquals(1, convertManaCost('C'));
    UTIL.assertEquals(2, convertManaCost('CC'));
}

function testGetCostManaTypes() {
    UTIL.assertEquals('white', getCostManaTypes('W')[0]);

    UTIL.assertEquals('generic', getCostManaTypes('1U')[0]);
    UTIL.assertEquals('blue', getCostManaTypes('1U')[1]);

    UTIL.assertEquals('generic', getCostManaTypes('XB')[0]);
    UTIL.assertEquals('black', getCostManaTypes('XB')[1]);

    UTIL.assertEquals('red', getCostManaTypes('RG')[0]);
    UTIL.assertEquals('green', getCostManaTypes('RG')[1]);

    UTIL.assertEquals('white', getCostManaTypes('(wu)')[0]);
    UTIL.assertEquals('blue', getCostManaTypes('(wu)')[1]);

    UTIL.assertEquals('black', getCostManaTypes('(BR)')[0]);
    UTIL.assertEquals('red', getCostManaTypes('(BR)')[1]);

    UTIL.assertEquals('red', getCostManaTypes('(R/G)')[0]);
    UTIL.assertEquals('green', getCostManaTypes('(R/G)')[1]);

    UTIL.assertEquals('colorless', getCostManaTypes('CC')[0]);

    UTIL.assertEquals('generic', getCostManaTypes('4')[0]);
}

function testIsSplitManaSymbol() {
    UTIL.assertTrue(isSplitManaSymbol('(WU)'));
    UTIL.assertTrue(isSplitManaSymbol('(B/R)'));
    UTIL.assertTrue(isSplitManaSymbol('(BRG)'));
    UTIL.assertTrue(isSplitManaSymbol('(W/U/B)'));
    UTIL.assertFalse(isSplitManaSymbol('W'));
    UTIL.assertFalse(isSplitManaSymbol('(U)'));
    UTIL.assertFalse(isSplitManaSymbol('WUB'));
}

function testTokenizeString() {
    let tokenizedString = tokenizeString(
        'A1BB2CCC3DDDD4EEEEE',
        [/A+/, /b+/, /C+/, /d+/, /E+/]
    );

    UTIL.assertEquals(10, tokenizedString.length);
    UTIL.assertEquals('', tokenizedString[0]);
    UTIL.assertEquals('A', tokenizedString[1]);
    UTIL.assertEquals('1', tokenizedString[2]);
    UTIL.assertEquals('BB', tokenizedString[3]);
    UTIL.assertEquals('2', tokenizedString[4]);
    UTIL.assertEquals('CCC', tokenizedString[5]);
    UTIL.assertEquals('3', tokenizedString[6]);
    UTIL.assertEquals('DDDD', tokenizedString[7]);
    UTIL.assertEquals('4', tokenizedString[8]);
    UTIL.assertEquals('EEEEE', tokenizedString[9]);

    // Try a more standard test. In this test, the expected tokens are `1`
    // (which matches `/\d+/`, and `(wu)` (which matches `/\(WU\)/`).
    //
    // Even though we are also checking for the tokens `/W/` and `/U/`, we
    // expect that these will not be picked up because `/\(WU\)/` would match
    // before either of those.
    tokenizedString = tokenizeString(
        '1(wu)',
        [/\d+/, /W/, /U/, /\(WU\)/]
    );

    UTIL.assertEquals(4, tokenizedString.length);
    UTIL.assertEquals('', tokenizedString[0]);
    UTIL.assertEquals('1', tokenizedString[1]);
    UTIL.assertEquals('', tokenizedString[2]);
    UTIL.assertEquals('(wu)', tokenizedString[3]);

    // Test for token idempotence. This is the idea that if you tokenize
    // something that is already a complete token, you should expect to get that
    // single token back. In this case, we're testing the `(wu)` string with the
    // same regexes as in the previous test. Since we know that `(wu)` was a
    // token, we can expect the result to be precisely `['', '(wu)']`.
    tokenizedString = tokenizeString(
        '(wu)',
        [/\d+/, /W/, /U/, /\(WU\)/]
    );

    UTIL.assertEquals(2, tokenizedString.length);
    UTIL.assertEquals('', tokenizedString[0]);
    UTIL.assertEquals('(wu)', tokenizedString[1]);

    tokenizedString = tokenizeString(
        '(wu)',
        [/\(WU\)/]
    );

    UTIL.assertEquals(2, tokenizedString.length);
    UTIL.assertEquals('', tokenizedString[0]);
    UTIL.assertEquals('(wu)', tokenizedString[1]);
}

function testGetCardColorSchemeFromManaCost() {
    UTIL.assertEquals('colorless', getCardColorSchemeFromManaCost());
    UTIL.assertEquals('colorless', getCardColorSchemeFromManaCost(''));
    UTIL.assertEquals('colorless', getCardColorSchemeFromManaCost('1'));
    UTIL.assertEquals('colorless', getCardColorSchemeFromManaCost('9'));
    UTIL.assertEquals('colorless', getCardColorSchemeFromManaCost('10'));
    UTIL.assertEquals('colorless', getCardColorSchemeFromManaCost('X'));
    UTIL.assertEquals('white', getCardColorSchemeFromManaCost('W'));
    UTIL.assertEquals('white', getCardColorSchemeFromManaCost('W'));
    UTIL.assertEquals('white', getCardColorSchemeFromManaCost('1W'));
    UTIL.assertEquals('white', getCardColorSchemeFromManaCost('5W'));
    UTIL.assertEquals('white', getCardColorSchemeFromManaCost('XW'));
    UTIL.assertEquals('white', getCardColorSchemeFromManaCost('WW'));
    UTIL.assertEquals('white', getCardColorSchemeFromManaCost('1WW'));
    UTIL.assertEquals('blue', getCardColorSchemeFromManaCost('1U'));
    UTIL.assertEquals('black', getCardColorSchemeFromManaCost('1B'));
    UTIL.assertEquals('red', getCardColorSchemeFromManaCost('1R'));
    UTIL.assertEquals('green', getCardColorSchemeFromManaCost('1G'));
    UTIL.assertEquals('multicolored', getCardColorSchemeFromManaCost('WU'));
    UTIL.assertEquals('multicolored', getCardColorSchemeFromManaCost('BRG'));
    UTIL.assertEquals('multicolored', getCardColorSchemeFromManaCost('WUBRG'));
    UTIL.assertEquals(
        'multicolored',
        getCardColorSchemeFromManaCost('1XWUBRG')
    );
    UTIL.assertEquals(
        'multicolored',
        getCardColorSchemeFromManaCost('1XCWUBRG')
    );

    UTIL.assertEquals('whiteBlue',  getCardColorSchemeFromManaCost('(WU)'));
    UTIL.assertEquals('whiteBlack', getCardColorSchemeFromManaCost('(WB)'));
    UTIL.assertEquals('whiteRed',   getCardColorSchemeFromManaCost('(WR)'));
    UTIL.assertEquals('whiteGreen', getCardColorSchemeFromManaCost('(WG)'));
    UTIL.assertEquals('blueBlack',  getCardColorSchemeFromManaCost('(UB)'));
    UTIL.assertEquals('blueRed',    getCardColorSchemeFromManaCost('(UR)'));
    UTIL.assertEquals('blueGreen',  getCardColorSchemeFromManaCost('(UG)'));
    UTIL.assertEquals('blackRed',   getCardColorSchemeFromManaCost('(BR)'));
    UTIL.assertEquals('blackGreen', getCardColorSchemeFromManaCost('(BG)'));
    UTIL.assertEquals('redGreen',   getCardColorSchemeFromManaCost('(RG)'));

    UTIL.assertEquals('whiteBlue',  getCardColorSchemeFromManaCost('(UW)'));
    UTIL.assertEquals('whiteBlack', getCardColorSchemeFromManaCost('(BW)'));
    UTIL.assertEquals('whiteRed',   getCardColorSchemeFromManaCost('(RW)'));
    UTIL.assertEquals('whiteGreen', getCardColorSchemeFromManaCost('(GW)'));
    UTIL.assertEquals('blueBlack',  getCardColorSchemeFromManaCost('(BU)'));
    UTIL.assertEquals('blueRed',    getCardColorSchemeFromManaCost('(RU)'));
    UTIL.assertEquals('blueGreen',  getCardColorSchemeFromManaCost('(GU)'));
    UTIL.assertEquals('blackRed',   getCardColorSchemeFromManaCost('(RB)'));
    UTIL.assertEquals('blackGreen', getCardColorSchemeFromManaCost('(GB)'));
    UTIL.assertEquals('redGreen',   getCardColorSchemeFromManaCost('(GR)'));

    UTIL.assertEquals('whiteBlue',  getCardColorSchemeFromManaCost('(W/U)'));
    UTIL.assertEquals('whiteBlack', getCardColorSchemeFromManaCost('(W/B)'));
    UTIL.assertEquals('whiteRed',   getCardColorSchemeFromManaCost('(W/R)'));
    UTIL.assertEquals('whiteGreen', getCardColorSchemeFromManaCost('(W/G)'));
    UTIL.assertEquals('blueBlack',  getCardColorSchemeFromManaCost('(U/B)'));
    UTIL.assertEquals('blueRed',    getCardColorSchemeFromManaCost('(U/R)'));
    UTIL.assertEquals('blueGreen',  getCardColorSchemeFromManaCost('(U/G)'));
    UTIL.assertEquals('blackRed',   getCardColorSchemeFromManaCost('(B/R)'));
    UTIL.assertEquals('blackGreen', getCardColorSchemeFromManaCost('(B/G)'));
    UTIL.assertEquals('redGreen',   getCardColorSchemeFromManaCost('(R/G)'));

    UTIL.assertEquals('whiteBlue',  getCardColorSchemeFromManaCost('(U/W)'));
    UTIL.assertEquals('whiteBlack', getCardColorSchemeFromManaCost('(B/W)'));
    UTIL.assertEquals('whiteRed',   getCardColorSchemeFromManaCost('(R/W)'));
    UTIL.assertEquals('whiteGreen', getCardColorSchemeFromManaCost('(G/W)'));
    UTIL.assertEquals('blueBlack',  getCardColorSchemeFromManaCost('(B/U)'));
    UTIL.assertEquals('blueRed',    getCardColorSchemeFromManaCost('(R/U)'));
    UTIL.assertEquals('blueGreen',  getCardColorSchemeFromManaCost('(G/U)'));
    UTIL.assertEquals('blackRed',   getCardColorSchemeFromManaCost('(R/B)'));
    UTIL.assertEquals('blackGreen', getCardColorSchemeFromManaCost('(G/B)'));
    UTIL.assertEquals('redGreen',   getCardColorSchemeFromManaCost('(G/R)'));

    UTIL.assertEquals('whiteBlue', getCardColorSchemeFromManaCost('1(WU)'));
    UTIL.assertEquals('redGreen', getCardColorSchemeFromManaCost('1(R/G)'));
}

/**
 * Print a message to the screen.
 *
 * @param {string} string
 */
function output(string) {
    let outputDiv = document.querySelector('#output');
    outputDiv.style.margin = '32px';
    outputDiv.style.fontSize = '1.5em';
    outputDiv.innerHTML += string + '<br />';
}

/**
 * Print a Javascript error (plus its stack trace) to the screen.
 *
 * @param {Error} string
 */
function outputError(error) {
    let errorString = error.toString();
    let stackTrace = error.stack;

    output('<span class="test-failure">***TEST FAILURE***</span>');
    output('<pre class="test failure">' + error + '</pre>');
    output('Stack trace:');
    output('<pre>' + error.stack + '</pre>');
}
