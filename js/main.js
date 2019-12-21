/**
 *
 * The main PonyMTG class. Contains the majority of the functionality, and sets
 *  up all global variables used by the application.
 */

/**
 * Global object that can be used by all functions. Configuration and common
 * definitions are stored here.
 */
var global = {
    'paths': {
        /** Path to the directory containing all the card sets. */
        'sets': 'data/sets',
        /**
         * Path to the miscellany directory containing images for cards that
         * don't have a defined set.
         */
        'misc': 'data/misc'
    },
    /** Various useful and commonly-used mappings. */
    'mappings': {
        /**
         * Maps the various properties of a card to a more human-readable
         * display name.
         */
        'cardPropertiesToDisplayNames': {
            'name': 'Name',
            'set': 'Set',
            'creator': 'Creator',
            'cost': 'Cost',
            'cost2': '2nd Cost',
            'colorIndicator': 'Color indicator',
            'supertype': 'Supertype',
            'subtype': 'Subtype',
            'supertype2': '2nd Supertype',
            'subtype2': '2nd Subtype',
            'text': 'Text',
            'flavorText': 'Flavor text',
            'watermark': 'Watermark',
            'pt': 'Power/Toughness',
            'loyalty': 'Loyalty',
            'rarity': 'Rarity',
            'transformsInto': 'Transforms into',
            'transformsFrom': 'Transforms from',
            'artist': 'Artist',
            'createdAt': 'Date',
            'sourceUrl': 'Source URL',
            'notes': 'Notes',
        },
        /**
         * Maps regular expressions representing parts of a mana cost, to the
         * color scheme that the card would have if that mana cost was the only
         * source of the card's color.
         */
        'manaSymbolRegexesToCardColorSchemes': {
            'W': 'white',
            'U': 'blue',
            'B': 'black',
            'R': 'red',
            'G': 'green',
            '\\(wu\\)': 'whiteBlue',
            '\\(wb\\)': 'whiteBlack',
            '\\(wr\\)': 'whiteRed',
            '\\(wg\\)': 'whiteGreen',
            '\\(ub\\)': 'blueBlack',
            '\\(ur\\)': 'blueRed',
            '\\(ug\\)': 'blueGreen',
            '\\(br\\)': 'blackRed',
            '\\(bg\\)': 'blackGreen',
            '\\(rg\\)': 'redGreen',
            '\\(uw\\)': 'whiteBlue',
            '\\(bw\\)': 'whiteBlack',
            '\\(rw\\)': 'whiteRed',
            '\\(gw\\)': 'whiteGreen',
            '\\(bu\\)': 'blueBlack',
            '\\(ru\\)': 'blueRed',
            '\\(gu\\)': 'blueGreen',
            '\\(rb\\)': 'blackRed',
            '\\(gb\\)': 'blackGreen',
            '\\(gr\\)': 'redGreen',
            '\\(w/u\\)': 'whiteBlue',
            '\\(w/b\\)': 'whiteBlack',
            '\\(w/r\\)': 'whiteRed',
            '\\(w/g\\)': 'whiteGreen',
            '\\(u/b\\)': 'blueBlack',
            '\\(u/r\\)': 'blueRed',
            '\\(u/g\\)': 'blueGreen',
            '\\(b/r\\)': 'blackRed',
            '\\(b/g\\)': 'blackGreen',
            '\\(r/g\\)': 'redGreen',
            '\\(u/w\\)': 'whiteBlue',
            '\\(b/w\\)': 'whiteBlack',
            '\\(r/w\\)': 'whiteRed',
            '\\(g/w\\)': 'whiteGreen',
            '\\(b/u\\)': 'blueBlack',
            '\\(r/u\\)': 'blueRed',
            '\\(g/u\\)': 'blueGreen',
            '\\(r/b\\)': 'blackRed',
            '\\(g/b\\)': 'blackGreen',
            '\\(g/r\\)': 'redGreen',
        },
        /**
         * Maps a regular expression representing a mana symbol (in standard
         * WUBRG form) to a CSS style that emulates the look-and-feel of that
         * symbol as it would appear on a Magic card.
         */
        'manaSymbolsToStyles': {
            'W': 'manaDecorationWhite',
            'U': 'manaDecorationBlue',
            'B': 'manaDecorationBlack',
            'R': 'manaDecorationRed',
            'G': 'manaDecorationGreen',
            'X': 'manaDecorationGeneric',
            '\\d+': 'manaDecorationGeneric',
            '\\(wu\\)': 'manaDecorationHybridWhiteBlue',
            '\\(wb\\)': 'manaDecorationHybridWhiteBlack',
            '\\(wr\\)': 'manaDecorationHybridWhiteRed',
            '\\(wg\\)': 'manaDecorationHybridWhiteGreen',
            '\\(ub\\)': 'manaDecorationHybridBlueBlack',
            '\\(ur\\)': 'manaDecorationHybridBlueRed',
            '\\(ug\\)': 'manaDecorationHybridBlueGreen',
            '\\(br\\)': 'manaDecorationHybridBlackRed',
            '\\(bg\\)': 'manaDecorationHybridBlackGreen',
            '\\(rg\\)': 'manaDecorationHybridRedGreen',
            '\\(uw\\)': 'manaDecorationHybridWhiteBlue',
            '\\(bw\\)': 'manaDecorationHybridWhiteBlack',
            '\\(rw\\)': 'manaDecorationHybridWhiteRed',
            '\\(gw\\)': 'manaDecorationHybridWhiteGreen',
            '\\(bu\\)': 'manaDecorationHybridBlueBlack',
            '\\(ru\\)': 'manaDecorationHybridBlueRed',
            '\\(gu\\)': 'manaDecorationHybridBlueGreen',
            '\\(rb\\)': 'manaDecorationHybridBlackRed',
            '\\(gb\\)': 'manaDecorationHybridBlackGreen',
            '\\(gr\\)': 'manaDecorationHybridRedGreen',
            '\\(w/u\\)': 'manaDecorationHybridWhiteBlue',
            '\\(w/b\\)': 'manaDecorationHybridWhiteBlack',
            '\\(w/r\\)': 'manaDecorationHybridWhiteRed',
            '\\(w/g\\)': 'manaDecorationHybridWhiteGreen',
            '\\(u/b\\)': 'manaDecorationHybridBlueBlack',
            '\\(u/r\\)': 'manaDecorationHybridBlueRed',
            '\\(u/g\\)': 'manaDecorationHybridBlueGreen',
            '\\(b/r\\)': 'manaDecorationHybridBlackRed',
            '\\(b/g\\)': 'manaDecorationHybridBlackGreen',
            '\\(r/g\\)': 'manaDecorationHybridRedGreen',
            '\\(u/w\\)': 'manaDecorationHybridWhiteBlue',
            '\\(b/w\\)': 'manaDecorationHybridWhiteBlack',
            '\\(r/w\\)': 'manaDecorationHybridWhiteRed',
            '\\(g/w\\)': 'manaDecorationHybridWhiteGreen',
            '\\(b/u\\)': 'manaDecorationHybridBlueBlack',
            '\\(r/u\\)': 'manaDecorationHybridBlueRed',
            '\\(g/u\\)': 'manaDecorationHybridBlueGreen',
            '\\(r/b\\)': 'manaDecorationHybridBlackRed',
            '\\(g/b\\)': 'manaDecorationHybridBlackGreen',
            '\\(g/r\\)': 'manaDecorationHybridRedGreen',
            'C': 'manaDecorationColorless',
        },
        'colorIndicatorsToCardColorSchemes': {
            '(W)': 'white',
            '(U)': 'blue',
            '(B)': 'black',
            '(R)': 'red',
            '(G)': 'green',
            '(WU)': 'whiteBlue',
            '(WB)': 'whiteBlack',
            '(WR)': 'whiteRed',
            '(WG)': 'whiteGreen',
            '(UB)': 'blueBlack',
            '(UR)': 'blueRed',
            '(UG)': 'blueGreen',
            '(BR)': 'blackRed',
            '(BG)': 'blackGreen',
            '(RG)': 'redGreen',
            '(UW)': 'whiteBlue',
            '(BW)': 'whiteBlack',
            '(RW)': 'whiteRed',
            '(GW)': 'whiteGreen',
            '(BU)': 'blueBlack',
            '(RU)': 'blueRed',
            '(GU)': 'blueGreen',
            '(RB)': 'blackRed',
            '(GB)': 'blackGreen',
            '(GR)': 'redGreen',
        },
        /**
         * Maps the name of a card color scheme to the CSS style that defines
         * that color scheme for the browser.
         */
        'cardColorSchemesToCssClasses': {
            'black': 'cardColorBlack',
            'blue': 'cardColorBlue',
            'colorless': 'cardColorColorless',
            'green': 'cardColorGreen',
            'multicolored': 'cardColorMulticolored',
            'red': 'cardColorRed',
            'white': 'cardColorWhite',
            'whiteBlue': 'cardColorHybridWhiteBlue',
            'whiteBlack': 'cardColorHybridWhiteBlack',
            'whiteRed': 'cardColorHybridWhiteRed',
            'whiteGreen': 'cardColorHybridWhiteGreen',
            'blueBlack': 'cardColorHybridBlueBlack',
            'blueRed': 'cardColorHybridBlueRed',
            'blueGreen': 'cardColorHybridBlueGreen',
            'blackRed': 'cardColorHybridBlackRed',
            'blackGreen': 'cardColorHybridBlackGreen',
            'redGreen': 'cardColorHybridRedGreen',
            'undefined': 'cardColorUndefined',
        },
        'manaColorSymbolsToColorNames': {
            'W': 'white',
            'U': 'blue',
            'B': 'black',
            'R': 'red',
            'G': 'green'
        },
        'manaSymbolsToManaTypes': {
            'W': ['white'],
            'U': ['blue'],
            'B': ['black'],
            'R': ['red'],
            'G': ['green'],
            'X': ['generic'],
            '\\d+': ['generic'],
            '\\(wu\\)': ['white', 'blue'],
            '\\(wb\\)': ['white', 'black'],
            '\\(wr\\)': ['white', 'red'],
            '\\(wg\\)': ['white', 'green'],
            '\\(ub\\)': ['blue',  'black'],
            '\\(ur\\)': ['blue',  'red'],
            '\\(ug\\)': ['blue',  'green'],
            '\\(br\\)': ['black', 'red'],
            '\\(bg\\)': ['black', 'green'],
            '\\(rg\\)': ['red',   'green'],
            '\\(uw\\)': ['blue' , 'white'],
            '\\(bw\\)': ['black', 'white'],
            '\\(rw\\)': ['red',   'white'],
            '\\(gw\\)': ['green', 'white'],
            '\\(bu\\)': ['black', 'blue'],
            '\\(ru\\)': ['red',   'blue'],
            '\\(gu\\)': ['green', 'blue'],
            '\\(rb\\)': ['red',   'black'],
            '\\(gb\\)': ['green', 'black'],
            '\\(gr\\)': ['green', 'red'],
            '\\(w/u\\)': ['white', 'blue'],
            '\\(w/b\\)': ['white', 'black'],
            '\\(w/r\\)': ['white', 'red'],
            '\\(w/g\\)': ['white', 'green'],
            '\\(u/b\\)': ['blue',  'black'],
            '\\(u/r\\)': ['blue',  'red'],
            '\\(u/g\\)': ['blue',  'green'],
            '\\(b/r\\)': ['black', 'red'],
            '\\(b/g\\)': ['black', 'green'],
            '\\(r/g\\)': ['red',   'green'],
            '\\(u/w\\)': ['blue' , 'white'],
            '\\(b/w\\)': ['black', 'white'],
            '\\(r/w\\)': ['red',   'white'],
            '\\(g/w\\)': ['green', 'white'],
            '\\(b/u\\)': ['black', 'blue'],
            '\\(r/u\\)': ['red',   'blue'],
            '\\(g/u\\)': ['green', 'blue'],
            '\\(r/b\\)': ['red',   'black'],
            '\\(g/b\\)': ['green', 'black'],
            '\\(g/r\\)': ['green', 'red'],
            'C': ['colorless'],
        },
        'manaTypesToRepresentativeSymbols': {
            'white': 'W',
            'blue': 'U',
            'black': 'B',
            'red': 'R',
            'green': 'G',
            'generic': 'X',
            'colorless': 'C',
            'none': 'None'
        },
        'manaRepresentativeSymbolsToDescriptions': {
            'W': 'White mana',
            'U': 'Blue mana',
            'B': 'Black mana',
            'R': 'Red mana',
            'G': 'Green mana',
            'X': 'Generic mana',
            'C': 'Colorless mana',
            'None': 'No mana',
        },
    },
    /** DOM elements that can be cached globally, and used in any function. */
    'elements': {
        'results': undefined,
        'searchField': undefined,
        'searchButton': undefined,
        'advancedSearch': undefined,
        'title': undefined,
        'tagline': undefined,
        'titleReference': undefined,
    },
    'lists': {
        /**
         * A list of card properties that the application will display in search
         * results (if the card has them).
         */
        'cardPropertiesToDisplay':[
            'name',
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
            'rarity',
            'transformsInto',
            'transformsFrom',
            'artist',
            'notes',
            'sourceUrl',
        ],
        /**
         * A list of card properties that we will allow the user to search for
         * text matches in (ie. the options for the "Search by" functionality).
         */
        'searchableCardProperties':[
            'name',
            'set',
            'creator',
            'cost',
            'colorIndicator',
            'supertype',
            'subtype',
            'text',
            'flavorText',
            'watermark',
            'pt',
            'loyalty',
            'rarity',
            'transformsInto',
            'transformsFrom',
            'artist',
        ],
        /**
         * A list of metacharacters used in regular expressions. We need to
         * escape these when searching.
         */
        'regexMetacharacters': [
            '\\', '.','^','$','*','+','?','(',')','[',']','{','}','|'
        ],
        /** A list of regexes that represent hybrid mana symbols. */
        'hybridManaSymbolRegexes': [
            '\\(wu\\)',
            '\\(wb\\)',
            '\\(wr\\)',
            '\\(wg\\)',
            '\\(ub\\)',
            '\\(ur\\)',
            '\\(ug\\)',
            '\\(br\\)',
            '\\(bg\\)',
            '\\(rg\\)',
            '\\(uw\\)',
            '\\(bw\\)',
            '\\(rw\\)',
            '\\(gw\\)',
            '\\(bu\\)',
            '\\(ru\\)',
            '\\(gu\\)',
            '\\(rb\\)',
            '\\(gb\\)',
            '\\(gr\\)',
        ],
        /** A list of the five color symbols for mana. */
        'manaColorSymbols': ['W', 'U', 'B', 'R', 'G'],
    },
    'advancedSearchIdPrefix': 'advancedSearch',
    'dimensions': {
        /**
         * Dimensions for a standard Magic card as produced by Magic Set Editor.
         */
        'standardCard': {
            'px': {
                'width': 375,
                'height': 523,
                'borderThickness': 17
            },
            'mm': {
                'width': 63,
                'height': 88,
                'borderThickness': 3
            },
        },
        /** The desired width for card images in search results. */
        'displayCard': {
          'width': 265  
        },
        'proxy': {
            /**
             * The font size, in pixels, of proxy card text. In order to ensure
             * consistent rendering of proxy cards across all browsers, it is
             * necessary to use absolute font dimensions.
             */
            'fontSize': 16,
            /**
             * The amount of padding between the border and the interior of a
             * proxy card. We're defining it here rather than in the stylesheet,
             * because we need to know the value in order to correctly calculate
             * dimensions when rendering a proxy card.
             */
            'padding': 4
        },
        'printSheet': {
            'cardSpacing': 8
        }
    },
    /** Various pieces of predefined text. */
    'text': {
        'tagline': {
            'dynamic': 'Explore a database of {NUMBER_OF_CARDS} fan-made <i>Magic: the Gathering</i> cards based on <i>My Little Pony: Friendship is Magic</i>.',
            'static': 'Explore a database of fan-made <i>Magic: the Gathering</i> cards based on <i>My Little Pony: Friendship is Magic</i>.'
        },
        'references': {
            'title': 'It\'s a working title.'
        },
        'search': {
            'placeholder': 'Search for something',
            /**
             * A list of search terms that the search field will randomly offer
             * as suggestions in its placeholder text.
             */
            'suggestions': [
                'Applejack',
                'Cadance',
                'Canterlot',
                'Celestia',
                'Chrysalis',
                'Cloudsdale',
                'Derpy',
                'Discord',
                'Fluttershy',
                'Maud',
                'Luna',
                'Octavia',
                'Pinkie',
                'Ponyville',
                'Princess',
                'Rainbow',
                'Rarity',
                'Spike',
                'Trixie',
                'Twilight',
                'Vinyl',
                'Zecora'
            ],
            'foundResults': 'Found {NUMBER_OF_RESULTS} cards',
            'noResults': 'No cards found',
        },
        'tips': [
            'Searching on an empty string (ie. don\'t type anything in) will return everything. You can combine this with the "Search in sets" option to view all cards in a particular set.',
        ],
    },
    /** Various useful values. */
    'values': {
        /**
         * How often tips should be displayed on the main page. A value of 5
         * means "every 5 visits".
         */
        'tipFrequency': 5,
        'proxyTextGenerosity': {
            'display': 0.65,
            'printSheet': 0.65,
        },
    },
    /**
     * Information about how to paginate the results set, including the current
     * page that the user is viewing.
     */
    'pagination': {
        'currentPage': 0,
        'cardsPerPage': 10,
        'numberOfPages': 1
    },
    /** The results returned by the current search. */
    'search': {
        'results': []
    },
    /**
     * Statistics that have been gathered about the current card collection,
     * filled in upon initialization of the app.
     */
    'statistics': {
        'perSet': {},
        'overall': {},
        'counts': {
            'numberOfCards': undefined,
            'cardsPerSet': {},
            'cardsPerCreator': {}
        }
    },
    /**
     * Information about the card collection (eg. which sets are in it), filled
     * in upon initialization.
     */
    'information': {},
    /** Any URL parameters passed to the application. */
    'urlParameters': {}
};

/**
 * Initiate a search and display the results. This function is called when you
 * press Enter in the search field, or click the "Search" button.
 */
function initiateSearch(isExactSearch) {
    var searchString = global.elements.searchField.value;
    // We do actually want to do a string search and not a regex search, so we
    // need to escape any regex characters that the user may have entered.
    searchString = escapeRegex(searchString);

    if (isExactSearch === true) {
        // If an exact search has been requested, add the appropriate regex for
        // a whole string match.
        searchString = '^'+searchString+'$';
    }
    var searchRegex = new RegExp(searchString, 'i');
    global.search.results = getSearchResults(searchRegex, CARDS);
    global.pagination.currentPage = 0;
    global.pagination.numberOfPages = Math.ceil(global.search.results.length/global.pagination.cardsPerPage);
    displayResults(global.search.results);
}

/**
 * Given an array of card data entries, return some statistics about the cards,
 * such as total number of cards, how many cards there are per set, per creator,
 * etc.
 *
 * @param {Object[]} cards
 * @return {Object}
 */
function getStatistics(cards) {
    var statistics = {};
    statistics.counts = {};

    // Count the total number of cards.
    statistics.counts.numberOfCards = cards.length;

    // Count the number of cards in each card set (we mean "set" in the
    // "fan-made set" sense).
    statistics.counts.cardsPerSet = {};
    for (var i=0; i < cards.length; i++) {
        var set = cards[i].set;
        if (statistics.counts.cardsPerSet[set] === undefined) {
            statistics.counts.cardsPerSet[set] = 0;
        }
        statistics.counts.cardsPerSet[set]++;
    }

    // Similarly, count the number of cards per creator.
    statistics.counts.cardsPerCreator = {};
    for (var i=0; i < cards.length; i++) {
        var creator = cards[i].creator;
        if (statistics.counts.cardsPerCreator[creator] === undefined) {
            statistics.counts.cardsPerCreator[creator] = 0;
        }
        statistics.counts.cardsPerCreator[creator]++;
    }

    return statistics;
}

/**
 * Given an array of cards, return an object containing certain information
 * about the cards in it (eg. a list of all sets that are represented in those
 * cards).
 *
 * @param {Object[]} cards
 * @return {Object}
 */
function getInformation(cards) {
    var information = {};

    // Collect some overall information about the card collection.
    information.overall = {};
    information.overall.numberOfCards = cards.length; 

    var cardWithLongestText = undefined;
    var longestCardTextLength = 0;
    for (var i=0; i < cards.length; i++) {
        var card = cards[i];
        if (card.text !== undefined) {
            if (card.text.length > longestCardTextLength) {
                longestCardTextLength = card.text.length;
                cardWithLongestText = card;
            }
        }
    }
    information.cardWithLongestText = cardWithLongestText;
    information.longestCardTextLength = longestCardTextLength;

    // Get a list of all distinct sets that the supplied cards belong to.
    information.sets = [];
    for (var i=0; i < cards.length; i++) {
        var card = cards[i];
        if (information.sets.indexOf(card.set) === -1) {
            information.sets.push(card.set);
        }
    };

    // Sort the sets in alphabetical order.
    information.sets.sort();

    // Collect statistics about each set.
    // Create a per-set entry for each set, to hold information gathered about
    // each specific set.
    information.perSet = {};
    for (var i=0; i < information.sets.length; i++) {
        var set = information.sets[i];
        information.perSet[set] = {};
    }

    // Count up the number of cards in each set.
    for (var i=0; i < cards.length; i++) {
        var set = cards[i].set;

        // If the card has no set recorded, we considered this to be in a
        // special "undefined" set, and will add to the count of that set.
        if (set === undefined) {
            information.perSet[undefined] = {};
        }
        if (information.perSet[set].numberOfCards === undefined) {
            information.perSet[set].numberOfCards = 0;
        }
        information.perSet[set].numberOfCards++;
    }

    // Get a list of all distinct card set creators that the supplied cards were
    // made by.
    information.creators = [];
    for (var i=0; i < cards.length; i++) {
        var card = cards[i];
        if (information.creators.indexOf(card.creator) === -1) {
            information.creators.push(card.creator);
        }
    };

    return information;
}

/**
 * Perform a full search, using the entered search term and applying all
 * filters, and return the resulting cards.
 *
 * @param {string} regex
 * @param {Object[]} cards
 * @return {Object[]}
 */
function getSearchResults(regex, cards) {
    let setChoices = getFilterBySetChoices();
    let manaTypeChoices = getFilterByManaTypeChoices();
    let manaTypeSearchType = document.querySelector(
        '#filterByManaTypeSearchType'
    ).value;
    let onlyShowCardsWithImages = document.querySelector(
        '#' + global.advancedSearchIdPrefix
        + '_generalOptions_onlyShowCardsWithImages'
    ).checked;

    let filteredCards = getFilteredCards(
        cards,
        setChoices,
        manaTypeChoices,
        manaTypeSearchType,
        onlyShowCardsWithImages
    );

    let cardPropertiesToSearchIn = getSearchByChoices();

    return getMatchingCards(filteredCards, regex, cardPropertiesToSearchIn);
}

/**
 * From the set of card data objects in `cards`, return an array containing only
 * those card data objects which have a property that matches the regular
 * expression `regex`.
 *
 * @param {Object[]} cards
 * @param {RegExp} regex
 * @param {string[]} properties
 * @return {Object[]}
 */
function getMatchingCards(cards, regex, properties) {
    let matchingCards = [];

    for (let i=0; i < cards.length; i++) {
        let card = cards[i];
        let cardPropertyNames = Object.keys(card);

        for (let j=0; j < cardPropertyNames.length; j++) {
            let cardPropertyName = cardPropertyNames[j];

            // If the card property isn't one that the user has opted to search
            // in, don't bother and skip to the next property.
            if (properties.indexOf(cardPropertyName) === -1) {
                continue;
            }

            let cardPropertyValue = card[cardPropertyName];

            if (regex.test(cardPropertyValue)) {
                matchingCards.push(card);
                break;
            }
        }
    }

    return matchingCards; 
}

/**
 * Run a set of cards `cards` through the filters defined in the advanced
 * search options (eg. filter by set) and return the subset of cards that the
 * filters will allow.
 *
 * @param {Object[]} cards
 * @param {string[]} setChoices
 * @param {string[]} manaTypeChoices
 * @param {string} manaTypeSearchType
 * @param {boolean} onlyShowCardsWithImages
 * @return {Object[]}
 */
function getFilteredCards(
    cards,
    setChoices,
    manaTypeChoices,
    manaTypeSearchType,
    onlyShowCardsWithImages
) {
    var filteredCards = cards;

    if (onlyShowCardsWithImages) {
        filteredCards = getCardsForWhichPropertiesExist(
            cards,
            ['image']
        );    
    }
    filteredCards = getCardsFilteredBySet(
        filteredCards,
        setChoices
    );

    filteredCards = getCardsFilteredByManaType(
        filteredCards,
        manaTypeChoices,
        manaTypeSearchType
    );

    return filteredCards;
}

/**
 * Given an array of cards, and an object containing arrays of property values
 * keyed to property names, filter and return the subset of cards which have
 * those specified properties.
 *
 * For example:
 *
 *     getCardsFilteredByProperties(
 *         cards,
 *         {
 *             'name': ['Applejack', 'Rarity'],
 *             'set': ['A Warm Welcome', 'Friendship is Card Games']
 *         }
 *     );
 *
 * would return all cards named exactly "Applejack" or "Rarity" in either the
 * "A Warm Welcome" set or the "Friendship is Card Games" set (if such cards
 * exist).
 *
 * @param {Object[]} cards
 * @param {Object} properties
 * @return {Object[]}
 */
function getCardsFilteredByProperties(cards, properties) {
    var filteredCards = [];

    for (var i=0; i < cards.length; i++) {
        var card = cards[i];
        var propertyNames = Object.keys(properties);
        var cardMatchedAllProperties = true;

        // Go through each property that we're interested in for each card.
        for (var j=0; j < propertyNames.length; j++) {
            var propertyName = propertyNames[j];
            var propertyValues = properties[propertyName];

            // Check to see if the card matches any of the specified property
            // values.
            if (propertyValues.indexOf(card[propertyName]) === -1) {
                cardMatchedAllProperties = false;
                break;
            }

            if (!cardMatchedAllProperties) {
                // If the card failed to match a property, we won't consider it
                // for inclusion in our filtered set.  (It isn't enough for a
                // card to match one property, because that's quite easy; it
                // has to match everything that we're looking for).
                break;
            }
        }

        if (!cardMatchedAllProperties) {
            continue;
        }
        filteredCards.push(card);
    }
    return filteredCards;
}

/**
 * Given an array of cards, filter and return all cards which have values set
 * for all of the given properties.
 *
 * @param {Object[]} cards
 * @param {string[]} propertyNames
 */
function getCardsForWhichPropertiesExist(cards, propertyNames) {
    var filteredCards = [];
    for (var i=0; i < cards.length; i++) {
        var card = cards[i];
        var cardHasAllProperties = true;
        for (var j=0; j < propertyNames.length; j++) {
            var propertyName = propertyNames[j];
            if (card[propertyName] === undefined) {
                cardHasAllProperties = false;
                continue;
            }
        }
        if (cardHasAllProperties) {
            filteredCards.push(card);
        }
    }

    return filteredCards;
}

/**
 * Given an array of cards and an array of set names, return only those cards
 * that are in any of the given sets.
 *
 * @param {Object[]} cards
 * @param {string[]} sets
 * @return {Object[]}
 */
function getCardsFilteredBySet(cards, sets) {
    var filteredCards = [];
    for (var i=0; i < cards.length; i++) {
        var card = cards[i];

        // If this card isn't in a set that the user has opted to search in,
        // then skip to the next.
        if (sets.indexOf(card.set) === -1) {
            continue;
        }

        filteredCards.push(card);
    }
    return filteredCards;
}

/**
 * Given an array of cards and an array of supertypes, return only those cards
 * that have at least one of those supertypes.
 *
 * @param {Object[]} cards
 * @param {string[]} supertypes
 * @return {Object[]}
 */
function getCardsFilteredBySupertype(cards, supertypes) {
    var filteredCards = [];
    for (var i=0; i < cards.length; i++) {
        var card = cards[i];

        // Check that the card has at least one of the specified supertypes.
        var cardIncludesSupertype = false;
        for (var j=0; j < supertypes.length; j++) {
            var supertype = supertypes[j];
            if (card.supertype.includes(supertype)) {
                cardIncludesSupertype = true;
                break;
            }
        }

        if (cardIncludesSupertype) {
            filteredCards.push(card);
        }
    }
    return filteredCards;
}

/**
 * Given an array of cards, return an array which contains only those cards that
 * match the given mana type.
 *
 * There are 4 different ways to search for mana types:
 *
 * - anyInclusive: match cards that contain any of the given mana types, even if
 *   they contain other mana types too
 * - allInclusive: match cards that contain all of the given mana types, even if
 *   they contain other mana types too
 * - anyExclusive: match cards that contain any of the given mana types but no
 *   others
 * - allExclusive: match cards that contain all of the given mana types and no
 *   others
 *
 * Note that "generic", "colorless", and "none" are all considered types of
 * mana. That means that if you do an "anyExclusive" search for white and blue,
 * it will not find a card with cost "1WU" because that has generic mana in (and
 * the search is exclusive, meaning it excludes anything that isn't exactly
 * white or blue).
 *
 * @param {object[]} cards
 * @param {string[]} manaTypes
 * @param {string} manaType
 * @return {object[]}
 */
function getCardsFilteredByManaType(cards, manaTypes, manaTypeSearchType) {
    var filteredCards = [];
    for (var i=0; i < cards.length; i++) {
        var card = cards[i];
        cardSatisfiesFilterByManaTypeSearch = false;

        var cardManaTypes = card.derivedProperties.manaTypes;

        // There are three facts about the card that will help us decide whether
        // the card satisfies the mana type search:
        //
        // - whether it contains at least one of the selected mana types
        // - whether it contains only the selected mana types (and no others)
        // - whether it contains all of the selected mana types
        //
        // We'll analyze the card to learn those facts first.
        var cardContainsAtLeastOneSelectedManaType = false;
        var cardContainsOnlySelectedManaTypes = true;
        var cardContainsAllSelectedManaTypes = true;

        for (var j=0; j < cardManaTypes.length; j++) {
            var cardManaType = cardManaTypes[j];
            if (manaTypes.indexOf(cardManaType) !== -1) {
                // One of the card's mana types does match one that was selected
                // by the user.
                cardContainsAtLeastOneSelectedManaType = true;
                break;
            }
        }
        for (var j=0; j < cardManaTypes.length; j++) {
            var cardManaType = cardManaTypes[j];
            if (manaTypes.indexOf(cardManaType) === -1) {
                // The card contains a mana type that wasn't selected by the
                // user.
                cardContainsOnlySelectedManaTypes = false;
                break;
            }
        }
        for (var j=0; j < manaTypes.length; j++) {
            var manaType = manaTypes[j];
            if (cardManaTypes.indexOf(manaType) === -1) {
                // The card did not contain one of the mana types selected by
                // the user.
                cardContainsAllSelectedManaTypes = false;
                break;
            }
        }

        // Now that we know those facts, we can see if the card satisfies the
        // user's mana type search conditions.
        switch (manaTypeSearchType) {
            // "All Exclusive": The least permissive search. Searches for all
            // cards which contain all of the selected mana type, and no others.
            // For example, a search for white and blue would be satisfied by
            // "1WU", "2WUU" (these contain both white and blue), but not "3W"
            // (this does not contain blue), "4UU" (this does not contain
            // white), "5WUB" (this contains white and blue, but also black).
            case 'allExclusive':
                if (cardContainsOnlySelectedManaTypes && cardContainsAllSelectedManaTypes) {
                    cardSatisfiesFilterByManaTypeSearch = true;
                }
                break;
            // "Any Exclusive": Searches for all cards which contain any of the
            // selected mana types, but no others. For example, a search for
            // white and blue would be satisfied by "1W" (it contains white),
            // "2UU" (it contains blue), "3WU" (it contains white and blue),
            // but not "4WUG" (it contains white and blue, but also green).
            case 'anyExclusive':
                if (cardContainsOnlySelectedManaTypes) {
                    cardSatisfiesFilterByManaTypeSearch = true;
                }
                
                break;
            // "All Inclusive ": Searches for all cards which contain all of
            // the selected mana types. For example, a search for white and
            // blue would be satisfied by "1WU" (it contains white and blue),
            // "2WUR" (it contains white and blue, as well as red), but not
            // "3WG" (it contains white, but not blue).
            case 'allInclusive':
                if (cardContainsAllSelectedManaTypes) {
                    cardSatisfiesFilterByManaTypeSearch = true;
                }
                break;
            // "Any Inclusive": The most permissive search type. This searches
            // for all cards which contain any of the selected mana types. For
            // example, a search for white and blue would be satisfied by "1WG"
            // (it contains white), "2UR" (it contains blue), "3WUB" (it
            // contains white and blue), and many others. The only way for a
            // card not to appear in this search is if it contains none of the
            // selected mana types.
            case 'anyInclusive':
            default:
                if (cardContainsAtLeastOneSelectedManaType) {
                    cardSatisfiesFilterByManaTypeSearch = true;
                }
                break;
        }

        if (!cardSatisfiesFilterByManaTypeSearch) {
            // The card didn't satisfy the mana type search, so we won't
            // consider it any further, and skip to the next card.
            continue;
        }

        filteredCards.push(card);
    }

    return filteredCards;
}

/**
 * Generate and display a table of the card data objects in `cards`, in the
 * "results" section of the application.
 *
 * @param {Object[]} cards
 */
function displayResults(cards) {
    // Normally, if we were about to refresh the contents of a container
    // element, we would empty it out first by deleting all its child nodes.
    // However, our application happens to utilize a particular behavior that
    // will prevent this approach from working correctly.
    //
    // The problem we have is that when we generate proxy cards (the imageless
    // placeholder cards that we construct ourselves), we make use of the
    // `offsetHeight` function as part of a clever hack to ensure that their
    // text is correctly sized.
    //
    // `offsetHeight` just happens to be one of a number of commands that
    // forces _browser reflow_; that is, when called, it will force the browser
    // to recalculate its layout.
    //
    // This causes an unexpected issue. If we empty the results container
    // first, then call `offsetHeight`, the page actually jumps to a different
    // position! This is because the browser recalculated its layout,
    // discovered that the results container was empty, and therefore scrolled
    // up (because the page now ends earlier).
    //
    // So, when the results container is refilled, it looks like the page jumps
    // up, which is unacceptable from a UI point of view.
    //
    // What this means is that we cannot empty out the results container first.
    // So here is the solution; we don't. Instead, what we do is, we store a
    // list of every child node in the results container at the time that we
    // want to clear it. Then, we perform whatever actions are needed to add
    // the new result set in. Then, because we made a record of every node we
    // wanted to clear, we remove them one-by-one. Because the container was
    // never emptied while `offsetHeight` was being called, the page does not
    // jump.
    //
    // In essence, we are deferring the emptying of the div to the end of this
    // function, instead of doing it at the beginning.

    // Store a list of all child nodes in the results element. We specifically
    // build an array of those elements; we can't just use `childNodes`,
    // because that is a live collection, which changes when we change the DOM.
    // We want a static record of the result element's contents at this very
    // specific time.
    var resultsChildNodes = [];
    for (var i=0; i < global.elements.results.childNodes.length; i++) {
        var resultsChildNode = global.elements.results.childNodes[i];
        resultsChildNodes.push(resultsChildNode);
    }
    
    // Remove the title and tagline, they're only needed on the home screen.
    //global.elements.title.parentNode.removeChild(global.elements.title);
    //global.elements.tagline.parentNode.removeChild(global.elements.tagline);

    // Display the new results.
    // Before the results table, add a quick message to say how many results were found.
    var foundCardsMessageElement = document.createElement('span');
    foundCardsMessageElement.id = 'foundCardsMessagePanel';
    foundCardsMessageElement.style.display = 'inline-block';
    foundCardsMessageElement.className = 'alert alert-warning';
    var foundCardsMessage = global.text.search.noResults+'.';
    if (cards.length > 0) {
        foundCardsMessageElement.className = 'alert alert-success';
        foundCardsMessage = global.text.search.foundResults.replace(
            '{NUMBER_OF_RESULTS}',
            '<strong>' + cards.length + '</strong>'
        ) + '.';

        if (cards.length === 1) {
            foundCardsMessage = foundCardsMessage.replace('cards.', 'card.');
        }
    }

    foundCardsMessageElement.innerHTML = foundCardsMessage;

    // We only want to display a page of results, not all of them. The
    // application is keeping track of which page the user is on, so we just
    // need to figure out what subset of the results should be on the current
    // page, generate a table for those only, and display it.
    var indexOfFirstCardOnPage = global.pagination.currentPage * global.pagination.cardsPerPage;
    var indexOfLastCardOnPage = indexOfFirstCardOnPage + global.pagination.cardsPerPage;
    var currentPageOfCards = cards.slice(
        indexOfFirstCardOnPage,
        indexOfLastCardOnPage
    );

    global.elements.results.appendChild(foundCardsMessageElement);
    if (cards.length > 0) {
        if (global.pagination.numberOfPages > 1) {
            global.elements.results.appendChild(
                generatePaginationControlElement('paginationControlTop')
            );
        }

        global.elements.results.appendChild(
            generateCardTableElement(currentPageOfCards)
        );

        if (global.pagination.numberOfPages > 1) {
            // For the pagination control at the bottom of the page, make it
            // scroll the page back to the top when the user changes pages.
            global.elements.results.appendChild(
                generatePaginationControlElement(
                    'paginationControlBottom',
                    'paginationControlTop'
                )
            );
        }
    }

    // Now that we have added the new result set, we can get rid of the old one.
    for (var i=0; i < resultsChildNodes.length; i++) {
        global.elements.results.removeChild(resultsChildNodes[i]);
    }
}

/**
 * Given an object containing the properties of a single card, analyze them to
 * see if there are any additional properties we can derive from them. An
 * example would be a card's colors: these are usually not explicitly defined,
 * but can be derived from the card's mana cost.
 *
 * @param {Object}
 * @return {Object}
 */
function getDerivedCardProperties(card) {
    var derivedProperties = {};
    derivedProperties.hash = getCardHash(card);
    derivedProperties.colors = getCardColors(card);
    derivedProperties.manaTypes = getCardManaTypes(card);
    derivedProperties.cmc = getCardConvertedManaCost(card);
    derivedProperties.monocolor = getCardMonocolor(card);
    return derivedProperties;
}

/**
 * Return a unique hash value for the given card.
 *
 * @param {Object}
 * @return {string}
 */
function getCardHash(card) {
    var hashString = card.name + card.set;
    if (card.image !== undefined) {
        hashString += card.image;
    }
    return md5(hashString);
}

/**
 * Given an object containing the properties of a single card, attempt to
 * determine the card's colors. A card's colors are typically determined by the
 * mana symbols that appear in the card's mana cost. If a card has any hybrid
 * mana then it has all of the colors that appear in those symbols (ie. a card
 * with hybrid white-blue mana symbols is both white and blue).
 *
 * Card color may also be defined by fiat (ie. the card's rules text explicitly
 * says that the card is a certain color or colors). In these cases, there may
 * be a color identifier on the card that would indicate what colors it has.
 *
 * Note that a card's colors is not the same thing as its "color identity".
 * Color identity is a concept used in Commander games, and it means "all
 * colors in a card's mana cost, plus any that appear in its rules text, not
 * including reminder text".
 *
 * @param Object card
 * @return string[]
 */
function getCardColors(card) {
    var cardColors = [];

    // Before doing anything, check to see if the card has a color indicator.
    // If it does, we consider this to be the definitive source of the card's
    // color, overriding the mana cost.
    if (card.colorIndicator !== undefined) {
        for (var i=0; i < global.lists.manaColorSymbols.length; i++) {
            var manaColorSymbol = global.lists.manaColorSymbols[i];
            if (card.colorIndicator.toUpperCase().includes(manaColorSymbol)) {
                cardColors.push(manaColorSymbol);
            }
        }
        return cardColors;
    }

    // If a card has no cost, we'll consider it colorless.
    if (!card.cost) {
        return cardColors;
    }
    
    // We're doing this very straightforwardly; for each of the five colors of
    // mana, check the mana cost to see if it contains a symbol for that color
    // of mana. If it does, this card is that color.
    for (var i=0; i < global.lists.manaColorSymbols.length; i++) {
        var manaColorSymbol = global.lists.manaColorSymbols[i];
        if (card.cost.toUpperCase().includes(manaColorSymbol)) {
            cardColors.push(manaColorSymbol);
        }
    }

    return cardColors;
}

/**
 * Calculate and return a card's converted mana cost.
 *
 * @param {Object} card
 * @return {number}
 */
function getCardConvertedManaCost(card) {
    if (card.cost === undefined) {
        return 0;
    }
    return convertManaCost(card.cost);
}

/**
 * Given a mana cost (eg. "1UUB"), return its converted mana cost.
 *
 * @param {string} cost
 * @return {number}
 */
function convertManaCost(cost) {
    let convertedManaCost = 0;
    // Get a list of mana symbol regex strings (strings).
    let manaSymbolRegexStrings = Object.keys(
        global.mappings.manaSymbolsToManaTypes
    );

    let manaSymbolRegexes = []
    for (let i=0; i < manaSymbolRegexStrings.length; i++) {
        let manaSymbolRegex = new RegExp(manaSymbolRegexStrings[i]);
        manaSymbolRegexes.push(manaSymbolRegex);
    }

    // Tokenize the cost into a sequence containing token pieces and non-token
    // pieces (in order).
    let tokenizedCost = tokenizeString(cost, manaSymbolRegexes);
    // Go through the tokenized cost pieces, and for each one, if it's a mana
    // symbol, add the appropriate amount of mana to the converted mana cost.
    for (let i=1; i < tokenizedCost.length; i += 2) {
        let costToken = tokenizedCost[i];

        // Special case: If this cost token is one of the "split" costs (eg.
        // "(WU)", "(B/R)"), it's only worth 1 mana.
        if (isSplitManaSymbol(costToken)) {
            convertedManaCost += 1;
            continue;
        }

        for (let j=0; j < manaSymbolRegexStrings.length; j++) {
            // If this string piece is a token (ie. something that we identified
            // to be a mana symbol), we now need to figure out which mana symbol
            // it is.
            let manaSymbolRegexString = manaSymbolRegexStrings[j];
            let manaSymbolRegex = manaSymbolRegexes[j];
            if (manaSymbolRegex.test(costToken)) {
                // This is a mana symbol. Now we can figure out how much that
                // adds to the converted mana cost.

                // If it is a generic mana symbol, then it is worth the amount
                // of mana corresponding to the number on the symbol.
                let manaTypeArray = global.mappings.manaSymbolsToManaTypes[
                    manaSymbolRegexString
                ]; 
                if (manaTypeArray[0] == 'generic') {
                    if (costToken === 'X') {
                        // Special case: "X" is considered generic mana, but is
                        // worth zero, so disregard it.
                        continue;
                    }
                    convertedManaCost += parseInt(costToken);
                } else {
                    // All other occurrences of a mana symbol are worth 1 mana
                    // each.
                    convertedManaCost += 1;
                }
            }
        }
    }
    return convertedManaCost;    
}

/**
 * Given an object containing the properties of a single card, attempt to
 * determine the types of mana that are part of this card's identity.
 *
 * @param {Object} card
 * @return {string[]}
 */
function getCardManaTypes(card) {
    // Check for a color indicator first. If the card has one, this will be
    // considered the source of the card's mana types.
    if (card.colorIndicator !== undefined) {
        return getCostManaTypes(card.colorIndicator);
    }
    // Otherwise, analyze its mana cost to see what kinds of mana it contains.
    if (card.cost !== undefined) {
        return getCostManaTypes(card.cost);
    }

    // If it has neither color indicator nor cost, return "none", indicating
    // that this card does not have any mana types at all. Even though "none"
    // is not really any type of mana, we would still like to know when a card
    // has this property, as we would like to be able to filter by it.
    return ['none'];
}

/**
 * Given an mana cost, attempt to determine the types of mana in that cost (ie.
 * "white", "generic", "colorless", etc.)
 *
 * @param {string} cost
 * @return {string[]}
 */
function getCostManaTypes(cost) {
    var cardManaTypes = [];

    if (cost === undefined) {
        return cardManaTypes;
    }

    // Get a list of mana symbol regex strings (strings).
    var manaSymbolRegexStrings = Object.keys(
        global.mappings.manaSymbolsToManaTypes
    );

    var manaSymbolRegexes = []
    for (var i=0; i < manaSymbolRegexStrings.length; i++) {
        var manaSymbolRegex = new RegExp(manaSymbolRegexStrings[i]);
        manaSymbolRegexes.push(manaSymbolRegex);
    }

    // Tokenize the cost into a sequence containing token pieces and non-token
    // pieces (in order).
    var tokenizedCost = tokenizeString(cost, manaSymbolRegexes);

    // Go through the tokenized cost pieces, and for each one, if it's a mana
    // symbol, figure out what kind of mana that symbol represents, then add it
    // to our list of mana types (if we don't already have it).
    for (var i=0; i < tokenizedCost.length; i++) {
        for (var j=0; j < manaSymbolRegexStrings.length; j++) {
            // If this string piece is a token (ie. something that we
            // identified to be a mana symbol), we now need to figure out which
            // mana symbol it is. To do this, we just run through our list of
            // mana symbol regexes until we find the one that matches.
            var manaSymbolRegexString = manaSymbolRegexStrings[j];
            var manaSymbolRegex = manaSymbolRegexes[j];

            if (manaSymbolRegex.test(tokenizedCost[i])) {
                // We've found the mana symbol that corresponds to this token.
                // Now, figure out what type of mana this is. Some symbols
                // represent more than one kind of mana (eg. hybrid mana
                // symbols).
                var manaTypeArray = global.mappings.manaSymbolsToManaTypes[
                    manaSymbolRegexString
                ];
                for (var k=0; k < manaTypeArray.length; k++) {
                    var manaType = manaTypeArray[k];
                    // If this isn't in our list of mana types, add it.
                    if (cardManaTypes.indexOf(manaType) === -1) {
                        cardManaTypes.push(manaType);
                    }
                }
            }
        }
    }

    return cardManaTypes;
}

/**
 * Return true if the given symbol (in text form) is a "split" symbol, eg.
 * "(WU)", "(R/B)", "(B/R/G)"
 *
 * @param {string} symbol
 * return {boolean}
 */
function isSplitManaSymbol(symbol) {
    let splitSymbolRegex = new RegExp('^\\([1-9WUBRGC/]{2,}\\)$', 'i');
    return splitSymbolRegex.test(symbol);
}

/**
 * Given an object containing card properties for a single card, return the
 * card's monocolor. This is a single word which describes the color of a
 * monocolored card. For example, if the card has a mana cost of "1W", this
 * will return "white", because the card is mono-white.
 *
 * If the supplied card has no color, or multiple colors, this function returns
 * `undefined`.
 *
 * @param {Object} card
 * @return string
 */
function getCardMonocolor(card) {
    var cardColors = getCardColors(card);
    if (cardColors.length !== 1) {
        return undefined;
    }
    
    return global.mappings.manaColorSymbolsToColorNames[cardColors[0]];
}

/**
 * Examine the choices made by the user in the "Search by" section of the advanced options, and return an array of card
 * property names.
 */
function getSearchByChoices() {
    var choices = [];

    for (var i=0; i < global.lists.searchableCardProperties.length; i++) {
        var cardPropertyName = global.lists.searchableCardProperties[i]; 
        var checkboxId = global.advancedSearchIdPrefix+'_searchByCardProperty_'+cardPropertyName;
        var checkbox = document.querySelector('#'+checkboxId);
        if (checkbox.checked) {
            choices.push(cardPropertyName);
        }
    }

    return choices;

}

/**
 * Read the DOM and get a list of names of all sets checked in the "Search by
 * sets" box.
 *
 * @return {string[]}
 */
function getFilterBySetChoices() {
    var choices = [];

    for (var i=0; i < global.information.sets.length; i++) {
        var set = global.information.sets[i]; 
        var checkboxId = global.advancedSearchIdPrefix+'_filterBySet_'+i;
        var checkbox = document.querySelector('#'+checkboxId);
        if (checkbox.checked) {
            choices.push(set);
        }
    }

    return choices;
}

/**
 * Read the "filter by mana type" checkboxes in the advanced search, and return
 * an array of all colors of mana selected. (eg. ["white", "blue"]), 
 *
 * @return {string[]}
 */
function getFilterByManaTypeChoices() {
    var choices = [];

    var manaTypes = Object.keys(
        global.mappings.manaTypesToRepresentativeSymbols
    );
    for (var i=0; i < manaTypes.length; i++) {
        var color = manaTypes[i]; 
        var checkboxId = global.advancedSearchIdPrefix + '_filterByManaType_'
            + color;
        var checkbox = document.querySelector('#' + checkboxId);

        if (checkbox.checked) {
            choices.push(color);
        }
    }

    return choices;
}

/**
 * Generate and return a DOM element that the user can use to move between pages
 * of the current result set.
 *
 * If specified, `scrollToElementId` is the id of an element that the page
 * should scroll to after the previous or next page button is pressed. This can
 * be used to return the user to the top of the page after changing pages, for
 * example.
 *
 * @param {string} id
 * @param {string} scrollToElementId
 * @return {Element}
 */
function generatePaginationControlElement(id, scrollToElementId) {
    var navElement = document.createElement('nav');
    var navListElement = document.createElement('ul');
    navListElement.className = 'panel panel-default pager';
    navListElement.style.padding = '4px';
    var prevElement = document.createElement('li');
    prevElement.className = 'previous';
    var pageNumberTableCellElement = document.createElement('li');
    var nextElement = document.createElement('li');
    nextElement.className = 'next';

    navElement.id = id;

    prevElement.innerHTML = '<a>&larr; Previous page</a>';
    if (global.pagination.currentPage == 0) {
        prevElement.className += ' disabled';
    }

    prevElement.onclick = function() {
        global.pagination.currentPage--;
        if (global.pagination.currentPage < 0) {
            global.pagination.currentPage = 0;
        }
            
        displayResults(global.search.results);
        if (scrollToElementId !== undefined) {
            var scrollToElement = document.querySelector('#'+scrollToElementId);
            scrollToElement.scrollIntoView(true);
        }
    };

    pageNumberTableCellElement.innerHTML = '<span style="border:0">'
        + 'Page <strong>' + (global.pagination.currentPage + 1)
        + '</strong> of <strong>' + global.pagination.numberOfPages
        + '</strong></span>';

    nextElement.innerHTML = '<a>Next page &rarr;</a>';
    if (global.pagination.currentPage == global.pagination.numberOfPages - 1) {
        nextElement.className += ' disabled';
    }

    nextElement.onclick = function() {
        global.pagination.currentPage++;
        if (global.pagination.currentPage >= global.pagination.numberOfPages) {
            global.pagination.currentPage = global.pagination.numberOfPages - 1;
        }
        displayResults(global.search.results);
        if (scrollToElementId !== undefined) {
            var scrollToElement = document.querySelector('#'+scrollToElementId);
            scrollToElement.scrollIntoView(true);
        }
    };

    navListElement.appendChild(prevElement);
    navListElement.appendChild(pageNumberTableCellElement);
    navListElement.appendChild(nextElement);
    navElement.appendChild(navListElement);
    return navElement;
}

/**
 * Generate and return a DOM element containing advanced search controls.
 *
 * @return {Element}
 */
function generateAdvancedSearchElement() {
    var advancedSearchPanelElement = document.createElement('div');
    advancedSearchPanelElement.id = global.advancedSearchIdPrefix+'_table';
    advancedSearchPanelElement.style.display = 'none';

    // Display a warning that PonyMTG's search functions won't be useful for
    // cards which don't have all their properties set.
    var advancedSearchInformationAlert = document.createElement('div');
    advancedSearchInformationAlert.className = 'alert alert-warning';
    advancedSearchInformationAlert.innerHTML = '<strong>NOTE:</strong>'
    + ' PonyMTG does not yet have full property listings for all cards'
    + ' (many cards, for example, only have a name, set, and image).'
    + ' This means that advanced filters won\'t be useful on cards which have'
    + ' incomplete listings.';

    // First, do the "Search by card property" section. This will be a list of
    // all card properties that we want to allow the user to search by.
    var searchByCardPropertyPanelElement = document.createElement('div');
    searchByCardPropertyPanelElement.className = 'panel panel-default';
    var searchByCardPropertyHeaderElement = document.createElement('div');
    searchByCardPropertyHeaderElement.className = 'panel-heading';
    var searchByCardPropertyBodyElement = document.createElement('div');
    searchByCardPropertyBodyElement.className = 'panel-body';
    searchByCardPropertyBodyElement.style.textAlign = 'left';

    // Generate checkboxes for all properties that we'll allow the user to
    // search by.
    var data = [];
    for (var i=0; i < global.lists.searchableCardProperties.length; i++) {
        var datum = {};
        var cardPropertyName = global.lists.searchableCardProperties[i]; 
        var cardPropertyDisplayName
            = global.mappings.cardPropertiesToDisplayNames[cardPropertyName];
        datum.idSuffix = '_' + cardPropertyName;
        datum.label = cardPropertyDisplayName;

        data.push(datum);
    }

    searchByCardPropertyHeaderElement.innerHTML = 'Search by';
    searchByCardPropertyBodyElement.appendChild(
        generateCheckboxListElement(
            global.advancedSearchIdPrefix + '_searchByCardProperty',
            data,
            '20%',
            true
        )
    );

    // First section: General options.
    var generalOptionsPanel = document.createElement('div');
    generalOptionsPanel.className = 'panel panel-default';
    var generalOptionsHeading = document.createElement('div');
    generalOptionsHeading.className = 'panel-heading';
    generalOptionsHeading.innerHTML = 'General options';
    var generalOptionsBody = document.createElement('div');
    generalOptionsBody.className = 'panel-body';
    generalOptionsBody.style.textAlign = 'left';

    var generalOptionsCheckboxListData = [
        {
            'idSuffix': '_onlyShowCardsWithImages',
            'label': 'Only show cards that have images',
        },
    ];

    generalOptionsBody.appendChild(
        generateCheckboxListElement(
            global.advancedSearchIdPrefix+'_generalOptions',
            generalOptionsCheckboxListData,
            '20%',
            false
        )
    );

    // Second section: Filter the results by a specific set or sets.
    var filterBySetPanelElement = document.createElement('div');
    filterBySetPanelElement.className = 'panel panel-default';
    var filterBySetHeaderElement = document.createElement('div');
    filterBySetHeaderElement.className = 'panel-heading';
    var filterBySetBodyElement = document.createElement('div');
    filterBySetBodyElement.className = 'panel-body';
    filterBySetBodyElement.style.textAlign = 'left';

    // Generate checkboxes for all known sets.
    var data = [];
    for (var i=0; i < global.information.sets.length; i++) {
        var datum = {};
        var set = global.information.sets[i]; 
        // We can't use the set name in the id, as it may contain spaces or
        // unsuitable characters; instead, we're using the index of the array
        // that the set appears at.
        datum.idSuffix = '_'+i;
        if (set !== undefined) {
            datum.label = set;
        } else {
            datum.label = '<i>(no set)</i>';
        }

        data.push(datum);
    }

    filterBySetHeaderElement.innerHTML = 'Search in sets';
    filterBySetBodyElement.appendChild(
        generateCheckboxListElement(
            global.advancedSearchIdPrefix+'_filterBySet',
            data,
            '33%',
            true
        )
    );

    // Third section: Filter the results by color.
    var filterByManaTypePanelElement = document.createElement('div');
    filterByManaTypePanelElement.className = 'panel panel-default';
    var filterByManaTypeHeaderElement = document.createElement('div');
    filterByManaTypeHeaderElement.className = 'panel-heading';
    var filterByManaTypeBodyElement = document.createElement('div');
    filterByManaTypeBodyElement.className = 'panel-body';

    // This section contains a drop-down list prompting the user to select how,
    // exactly, they would like to search by color (as there are a few
    // different ways that that can be interpreted).
    var filterByManaTypeSearchTypeLabelElement = document.createElement(
        'label'
    );
    filterByManaTypeSearchTypeLabelElement.innerHTML
        = 'Search for cards that: ';
    filterByManaTypeSearchTypeLabelElement.style.margin = '4px';
    filterByManaTypeSearchTypeLabelElement.style.fontSize = '0.8em';

    var filterByManaTypeSearchTypeSelectElement = document.createElement(
        'select'
    );
    filterByManaTypeSearchTypeSelectElement.id = 'filterByManaTypeSearchType';
    filterByManaTypeSearchTypeSelectElement.style.display = 'inline-block';
    var filterByManaTypeSearchTypeOptions = {
        'anyInclusive': 'contain any of the selected mana types',
        'allInclusive': 'contain all of the selected mana types',
        'anyExclusive': 'contain any of the selected mana types, and no others',
        'allExclusive': 'contain all of the selected mana types, and no others',
    };

    var filterByManaTypeSearchTypeOptionValues = Object.keys(
        filterByManaTypeSearchTypeOptions
    );
    for (var i=0; i < filterByManaTypeSearchTypeOptionValues.length; i++) {
        var optionValue = filterByManaTypeSearchTypeOptionValues[i];
        var optionText = filterByManaTypeSearchTypeOptions[optionValue];
        var filterByManaTypeSearchTypeOptionElement = document.createElement(
            'option'
        );
        filterByManaTypeSearchTypeOptionElement.value = optionValue;
        filterByManaTypeSearchTypeOptionElement.innerHTML = optionText;
        filterByManaTypeSearchTypeSelectElement.appendChild(
            filterByManaTypeSearchTypeOptionElement
        );
    }

    // Generate checkboxes for the seven types of mana.
    var data = [];
    var manaTypes = Object.keys(
        global.mappings.manaTypesToRepresentativeSymbols
    );
    for (var i=0; i < manaTypes.length; i++) {
        var datum = {};
        var manaType = manaTypes[i]; 
        var representativeSymbol
            = global.mappings.manaTypesToRepresentativeSymbols[manaType];
        datum.idSuffix = '_'+manaType;
        datum.label = applyManaStyling(representativeSymbol);
        datum.title = global.mappings.manaRepresentativeSymbolsToDescriptions[
            representativeSymbol
        ];

        data.push(datum);
    }

    filterByManaTypeCheckboxListElement = generateCheckboxListElement(
        global.advancedSearchIdPrefix + '_filterByManaType',
        data,
        '10%'
    );
    filterByManaTypeHeaderElement.innerHTML = 'Search by mana type';
    filterByManaTypeBodyElement.appendChild(
        filterByManaTypeSearchTypeLabelElement
    );
    filterByManaTypeBodyElement.appendChild(
        filterByManaTypeSearchTypeSelectElement
    );
    filterByManaTypeBodyElement.appendChild(
        filterByManaTypeCheckboxListElement
    );

    // Finally, add all sections to the advanced search table.
    advancedSearchPanelElement.appendChild(advancedSearchInformationAlert);

    searchByCardPropertyPanelElement.appendChild(
        searchByCardPropertyHeaderElement
    );
    searchByCardPropertyPanelElement.appendChild(
        searchByCardPropertyBodyElement
    );
    advancedSearchPanelElement.appendChild(
        searchByCardPropertyPanelElement
    );

    generalOptionsPanel.appendChild(generalOptionsHeading);
    generalOptionsPanel.appendChild(generalOptionsBody);
    advancedSearchPanelElement.appendChild(generalOptionsPanel);

    filterBySetPanelElement.appendChild(filterBySetHeaderElement);
    filterBySetPanelElement.appendChild(filterBySetBodyElement);
    advancedSearchPanelElement.appendChild(filterBySetPanelElement);

    filterByManaTypePanelElement.appendChild(filterByManaTypeHeaderElement);
    filterByManaTypePanelElement.appendChild(filterByManaTypeBodyElement);
    advancedSearchPanelElement.appendChild(filterByManaTypePanelElement);

    return advancedSearchPanelElement;
}

/**
 * Returns an element containing a list of checkboxes. `data` must be an array
 * of objects representing the checkboxes that should be created, each of which
 * must have an `idSuffix` property and a `label` property, and may optionally
 * contain a `title` property for title (mouseover) text. Checkboxes will be
 * created with an id of `idPrefix`+`idSuffix`.
 *
 * `optionWidth` is how wide you want each checkbox+label block to be. It's
 * best to set this to a percentage. For example, `25%` will mean that every
 * checkbox takes up 25% of the list, so you should get rows of four.
 *
 * If `addSelectAll` is true, a "Select all" checkbox will be created at the
 * beginning of the list, with an id of `idPrefix`+`selectAll`; when clicked,
 * this will toggle all other checkboxes in the list to its value.
 *
 * @param {string} idPrefix
 * @param {Object[]} data
 * @param {string} optionWidth
 * @param {boolean} addSelectAll
 */
function generateCheckboxListElement(idPrefix, data, optionWidth, addSelectAll) {
    var checkboxListContainer = document.createElement('div');
    
    if (addSelectAll === true) {
        // If requested, add a "Select all" checkbox which will check all the
        // others when clicked.
        var selectAllCheckboxElementContainer = document.createElement('div');
        selectAllCheckboxElementContainer.style.display = 'inline-block';
        selectAllCheckboxElementContainer.style.width = optionWidth;
        selectAllCheckboxElementContainer.style.textAlign = 'left';
        
        var selectAllCheckboxElement = document.createElement('input');
        selectAllCheckboxElement.id = idPrefix+'_selectAll';
        selectAllCheckboxElement.type = 'checkbox';
        selectAllCheckboxElement.onclick = function(e) {
            for (var i=0; i < data.length; i++) {
                var datum = data[i];
                var otherCheckbox = document.querySelector(
                    '#' + idPrefix + datum['idSuffix']
                );
                otherCheckbox.checked = selectAllCheckboxElement.checked;
            }
        };
        var selectAllCheckboxLabelElement = document.createElement('label');
        selectAllCheckboxLabelElement.htmlFor = selectAllCheckboxElement.id;
        selectAllCheckboxLabelElement.style.fontSize = '0.9em';
        selectAllCheckboxLabelElement.style.fontWeight = 'bold';
        selectAllCheckboxLabelElement.style.margin = '2px';
        selectAllCheckboxLabelElement.innerHTML = 'Select all';

        selectAllCheckboxElementContainer.appendChild(selectAllCheckboxElement);
        selectAllCheckboxElementContainer.appendChild(
            selectAllCheckboxLabelElement
        );
        checkboxListContainer.appendChild(selectAllCheckboxElementContainer);
    }

    // Add a checkbox for each supplied datum.
    for (var i=0; i < data.length; i++) {
        var datum = data[i];
        var checkboxElementContainer = document.createElement('div');
        checkboxElementContainer.style.display = 'inline-block';
        checkboxElementContainer.style.width = optionWidth;
        checkboxElementContainer.style.textAlign = 'left';
        var checkboxElement = document.createElement('input');
        checkboxElement.type = 'checkbox';
        checkboxElement.id = idPrefix+datum['idSuffix'];

        var checkboxLabelElement = document.createElement('label');
        checkboxLabelElement.htmlFor = checkboxElement.id;
        checkboxLabelElement.style.fontSize = '0.9em';
        checkboxLabelElement.style.fontWeight = 'normal';
        checkboxLabelElement.style.margin = '2px';
        checkboxLabelElement.innerHTML = datum['label'];

        if (datum['title'] !== undefined) {
            checkboxElementContainer.title = datum['title'];
        }

        checkboxElementContainer.appendChild(checkboxElement);
        checkboxElementContainer.appendChild(checkboxLabelElement);
        checkboxListContainer.appendChild(checkboxElementContainer);
    }

    return checkboxListContainer;
}

/**
 * Given a set of card data objects `cards`, generate a table of those cards,
 * which displays an image (if available) and known, relevant properties of the
 * card. If `propertiesToDisplay` is given, only those properties will be
 * shown; otherwise, it will use the global defaults.
 *
 * @param {Object[]} cards
 * @param {string[]} propertiesToDisplay
 */
function generateCardTableElement(cards, propertiesToDisplay) {
    if (propertiesToDisplay === undefined) {
        propertiesToDisplay = global.lists.cardPropertiesToDisplay;
    }

    var cardPanel = document.createElement('div');
    cardPanel.className = 'container-fluid';

    for (var i=0; i < cards.length; i++) {
        var card = cards[i];

        // Create a row for this card result. Card image on the left, card
        // information on the right.
        var cardPanelRow = document.createElement('div');
        cardPanelRow.className = 'row';

        var cardImagePanel = document.createElement('div');
        cardImagePanel.className = 'col-md-5';

        var cardInfoPanelContainer = document.createElement('div');
        cardInfoPanelContainer.className = 'col-md-7';
        cardInfoPanelContainer.style.minHeight = getCardHeightFromCardWidth(
            global.dimensions.displayCard.width
        ) + 'px';
        cardInfoPanelContainer.style.marginBottom = '4px';

        var cardInfoPanel = document.createElement('div');
        cardInfoPanel.className = 'panel panel-default';
        cardInfoPanel.style.boxShadow = '2px 2px 4px rgba(0,0,0,0.25)';

        // Check to see if we have an image for this card.
        var cardImageLinkElement = undefined;
        var cardImageElement = undefined;
        var cardProxyElement = undefined;
        var isCardImageLocatable = card.image !== undefined;
        if (isCardImageLocatable) {
            // If a card image is available, create the card image element and
            // set its source to the appropriate image URL.
            var cardImageLinkElement = document.createElement('a');
            var cardImageElement = document.createElement('img');
            var cardImageUrl = getCardImageUrl(card);

            cardImageElement.src = cardImageUrl;
            cardImageLinkElement.href = cardImageUrl;
            cardImageLinkElement.target = '_blank';

            // Make all card images the same width (it looks better in results).
            cardImageElement.style.width = global.dimensions.displayCard.width
                + 'px';
            cardImageLinkElement.appendChild(cardImageElement);
        } else {
            // If a card image is not available, generate a "proxy" image from
            // the available card information. This will be a div, but should
            // have the same dimensions as a card image.
            cardProxyElement = generateProxyElement(
                card,
                global.dimensions.displayCard.width
            );
        }

        // Assemble relevant properties of the card into an information table.
        var cardInfoPanelHeading = document.createElement('div');
        cardInfoPanelHeading.className = 'panel-heading';
        cardInfoPanelHeading.innerHTML = card.name;

        var cardInfoPanelBody = document.createElement('div');
        cardInfoPanelBody.className = 'panel-body';

        // Create a description list for this property.
        var cardPropertiesDescriptionList = document.createElement('dl');

        // Use the Bootstrap `dl-horizontal` class to make it a two-column
        // list, with titles on the left and descriptions on the right. This is
        // a quick and easy way to list out property names and their values in
        // a nice-looking format.
        cardPropertiesDescriptionList.className = 'dl-horizontal';
        
        for (var j=0; j < propertiesToDisplay.length; j++) {
            var cardPropertyName = propertiesToDisplay[j];
            var cardPropertyValue = card[cardPropertyName];

            // If the card doesn't have a value defined for this property, skip
            // this property.
            if (cardPropertyValue === undefined) {
                // One exception to this is sets; if the card has no set, we
                // will display that (as "(no set)").
                if (cardPropertyName !== 'set') {
                    continue;
                }
            }

            // Check to see if this card property is one that we want to
            // display. If it isn't, skip this property.
            if (propertiesToDisplay.indexOf(cardPropertyName) === -1) {
                continue;
            }

            // Attempt to get a more human-readable display name for this
            // property, if one is available.
            var cardPropertyDisplayName = cardPropertyName;
            if (global.mappings.cardPropertiesToDisplayNames[cardPropertyName]
                !== undefined) {
                cardPropertyDisplayName
                    = global.mappings.cardPropertiesToDisplayNames[
                        cardPropertyName
                    ];
            }

            var cardPropertyNameElement = document.createElement('dt');
            var cardPropertyValueElement = document.createElement('dd');

            cardPropertyNameElement.innerHTML = cardPropertyDisplayName+':';
            if (cardPropertyValue) {
                cardPropertyValue = cardPropertyValue.replace(/\n/g, '<br />');
            }
            cardPropertyValueElement.style.textAlign = 'left';
            cardPropertyValueElement.innerHTML = cardPropertyValue;
            if (cardPropertyName === 'set') {
                if (cardPropertyValue === undefined) {
                    cardPropertyValueElement.innerHTML = '<i>(no set)</i>';
                }
                // Special case for "set" property: We do have descriptions for
                // some sets, which we can add as a title property, allowing
                // the user to mouse over to find out information about the
                // set.
                if (SETS[cardPropertyValue] !== undefined
                    && SETS[cardPropertyValue].notes !== undefined) {
                    cardPropertyValueElement.title = SETS[
                        cardPropertyValue
                    ].notes;
                }
            }
            // Special case for "flavorText" property: We'd like that to be
            // italicized.
            if (cardPropertyName === 'flavorText') {
                cardPropertyValueElement.style.fontStyle = 'italic';
            }
            // Special case for "sourceUrl" property: This is a URL, so we
            // hyperlink it.
            if (cardPropertyName === 'sourceUrl') {
                cardPropertyValueElement.innerHTML = '';
                cardSourceHyperlink = document.createElement('a');
                cardSourceHyperlink.href = cardPropertyValue;
                cardSourceHyperlink.target = '_blank';
                cardSourceHyperlink.style.textAlign = 'left';
                cardSourceHyperlink.innerHTML = cardPropertyValue;
                cardPropertyValueElement.appendChild(cardSourceHyperlink);
            }

            cardPropertiesDescriptionList.appendChild(cardPropertyNameElement);
            cardPropertiesDescriptionList.appendChild(cardPropertyValueElement);
        }
        cardInfoPanelBody.appendChild(cardPropertiesDescriptionList);

        var cardInfoPanelFooter = document.createElement('div');

        var cardHyperlinkUrl = window.location.pathname + '?hash= '
            + card.derivedProperties.hash;
        cardInfoPanelFooter.className = 'panel-footer';
        cardInfoPanelFooter.style.textAlign = 'right';

        // Create the "Add to print sheet" button. For this button, we would
        // like to include some indication of whether or not the user has
        // already added the card to the print sheet (and how many they have
        // added). Therefore, we will obtain the print sheet object from local
        // storage and check to see if this card is on it.
        var printSheetCardsObject = getPrintSheetCards();
        var printSheetCardQuantity = printSheetCardsObject[
            card.derivedProperties.hash
        ];
        if (printSheetCardQuantity === undefined) {
            printSheetCardQuantity = 0;
        }

        var addToPrintSheetButton = document.createElement('button');
        addToPrintSheetButton.className = 'btn btn-default';
        var addToPrintSheetButtonText = '<span' +
            ' class="glyphicon glyphicon-file"></span> Add to print sheet'; 
        addToPrintSheetButton.innerHTML = addToPrintSheetButtonText;
        if (printSheetCardQuantity > 0) {
            addToPrintSheetButton.innerHTML += ' <span class="badge">'
                + printSheetCardQuantity + '</span>'; 
        }
        addToPrintSheetButton.ponymtg = {};
        addToPrintSheetButton.ponymtg.hash = card.derivedProperties.hash;
        addToPrintSheetButton.ponymtg.quantity = printSheetCardQuantity;
        addToPrintSheetButton.onclick = function(e) {
            // Add the card to the print sheet and increment the number on the
            // button's badge.
            //
            // NOTE: Use `currentTarget`, not `target`! `target` identifies the
            // element that was clicked on; however, this is not _necessarily_
            // the button itself. Buttons can contain child elements such as
            // images and icons; if you happened to click on the 'icon' part of
            // a button, then `target` will be set to that, not the button
            // itself!
            //
            // Instead, use `currentTarget`, which identifies the element that
            // actually has the event on it (in this case, `onclick`).
            addCardToPrintSheet(e.currentTarget.ponymtg.hash);
            e.currentTarget.ponymtg.quantity++;
            e.currentTarget.innerHTML = addToPrintSheetButtonText
                + ' <span class="badge">' + e.currentTarget.ponymtg.quantity
                + '</span>';

            // Also increment the number on the main print sheets button in the
            // navbar (if the navbar is on the page).
            var printSheetCountBadge = document.querySelector(
                '#printSheetCountBadge'
            );
            if (printSheetCountBadge !== null) {
                printSheetCountBadge.innerHTML = getNumberOfCardsInPrintSheet();
            }
        };

        var cardImageLink = document.createElement('a');
        cardImageLink.className = 'btn btn-default';
        if (isCardImageLocatable) {
            cardImageLink.href = getCardImageUrl(card); 
            cardImageLink.target = '_blank'; 
            cardImageLink.innerHTML = '<span'
                + ' class="glyphicon glyphicon-picture"></span>'
                + ' View card image'; 
        }

        var cardLink = document.createElement('a');
        cardLink.className = 'btn btn-default';
        cardLink.href = cardHyperlinkUrl; 
        cardLink.target = '_blank'; 
        cardLink.innerHTML = '<span class="glyphicon glyphicon-link"></span>'
            + ' Link'; 

        cardInfoPanelFooter.appendChild(addToPrintSheetButton);
        if (isCardImageLocatable) {
            cardInfoPanelFooter.appendChild(cardImageLink);
        }
        cardInfoPanelFooter.appendChild(cardLink);

        if (cardImageLinkElement !== undefined) {
            cardImagePanel.appendChild(cardImageLinkElement);
        }
        else if (cardProxyElement !== undefined) {
            cardImagePanel.appendChild(cardProxyElement);
        }
        cardPanelRow.appendChild(cardImagePanel);
        cardInfoPanel.appendChild(cardInfoPanelHeading);
        cardInfoPanel.appendChild(cardInfoPanelBody);
        cardInfoPanel.appendChild(cardInfoPanelFooter);
        cardInfoPanelContainer.appendChild(cardInfoPanel);
        cardPanelRow.appendChild(cardInfoPanelContainer);
        cardPanel.appendChild(cardPanelRow);
    }

    return cardPanel;
}

/**
 * Return the (relative) path to the directory containing the specified card. For cards that have a defined `set`, this
 * should be the set path defined in the global config. For cards that don't have a set, this is the miscellany path,
 * also defined in the global config.
 */
function getCardImageDirPath(card) {
    if (card.set !== undefined) {
        return global.paths.sets + '/' + SETS[card.set].path;
    }

    return global.paths.misc;
}

/**
 * Quick function to construct the (relative) path to a card's image, if needed. This assumes that the card actually has
 *an `image` property defined.
 */
function getCardImageUrl(card) {
    return getCardImageDirPath(card) + '/' +card.image;
}

/**
 * Reads the `printSheetCards` local storage variable and parses it into an object. If the variable doesn't exist in
 * local storage (perhaps the user hasn't started a print sheet yet, for example), an empty object is returned.
 */
function getPrintSheetCards() {
    var printSheetCardsString = localStorage.getItem('printSheetCards');
    var printSheetCardsObject = {};
    if (printSheetCardsString !== null) {
        printSheetCardsObject = JSON.parse(printSheetCardsString);
    }
    return printSheetCardsObject;
}

function clearPrintSheet() {
    localStorage.removeItem('printSheetCards');
}

/**
 * Stringifies `object` and stores it in the local storage variable `printSheetCards`. `object` should be an object
 * containing card hashes associated to quantities; that is, it stores how many of each card should be on the print
 * sheet.
 */
function putPrintSheetCards(printSheetCardsObject) {
    localStorage.setItem('printSheetCards', JSON.stringify(printSheetCardsObject));
}

/**
 */
function addCardToPrintSheet(hash) {
    var printSheetCardsObject = getPrintSheetCards();
    if (printSheetCardsObject[hash] === undefined) {
        printSheetCardsObject[hash] = 0;
    }

    printSheetCardsObject[hash]++;
    putPrintSheetCards(printSheetCardsObject);
}

/**
 */
function removeCardFromPrintSheet(hash) {
    var printSheetCardsObject = getPrintSheetCards();
    if (printSheetCardsObject[hash] !== undefined) {
        printSheetCardsObject[hash]--;
        if (printSheetCardsObject[hash] <= 0) {
            delete printSheetCardsObject[hash];
        }
    }

    putPrintSheetCards(printSheetCardsObject);
}

function removeAllCardsWithHashFromPrintSheet(hash) {
    var printSheetCardsObject = getPrintSheetCards();
    if (printSheetCardsObject[hash] !== undefined) {
        delete printSheetCardsObject[hash];
    }

    putPrintSheetCards(printSheetCardsObject);
}

function getNumberOfCardsInPrintSheet() {
    var printSheetCards = getPrintSheetCards();
    var printSheetCardHashes = Object.keys(printSheetCards);

    var numberOfCardsInPrintSheet = 0;
    for (var i=0; i < printSheetCardHashes.length; i++) {
        var printSheetCardHash = printSheetCardHashes[i];
        numberOfCardsInPrintSheet += printSheetCards[printSheetCardHash];    
    }
    return numberOfCardsInPrintSheet;
}
/**
 * Using the global standard card dimensions defined in the config, determine the aspect ratio of a standard Magic card,
 * and use it to calculate the height of a card of width `cardWidth`
 */
function getCardHeightFromCardWidth(cardWidth) {
    // Use the global standard card dimensions to determine the card's aspect ratio, and thus the height of the proxy.
    var cardAspectRatio = global.dimensions.standardCard.px.height/global.dimensions.standardCard.px.width;
    return cardWidth*cardAspectRatio;

}
/**
 * Using the properties listed in `cardProperties`, generate a "proxy card": a DOM object representing a Magic card. The
 * resulting element will be `cardWidth` pixels in width.
 *
 * `textGenerosity` is an optional parameter which is used to decide how "generous" to make the font size estimation for
 * the card text. It takes a value between 0 and 1. This value is intended to represent the proportion of vertical space
 * on the card that we are allowing for the card text. If not given, it defaults to the value set in
 * `global.values.proxyTextGenerosity.display`.
 */
function generateProxyElement(
    cardProperties,
    cardWidth,
    textGenerosity
) {
    if (textGenerosity === undefined) {
        textGenerosity = global.values.proxyTextGenerosity.display;
    }

    var proxyElement = document.createElement('div');
    proxyElement.className = 'proxy';
    proxyElement.style.fontSize = global.dimensions.proxy.fontSize+'px';

    // Determine the card's height.
    var cardHeight = getCardHeightFromCardWidth(cardWidth);

    // Although we now have the width and height of the proxy, (ie. the desired dimensions of the fully-assembled,
    // displayed proxy card), this is not the width and height of the proxy _element_ which we're about to create (ie.
    // the container of the card text, details, etc). That will be slightly smaller. The reason for this is that we have
    // to add a border, padding, etc., and in HTML, these are not considered part of a div's width and height.
    // Therefore, we have to account for those separately, and ensure that the total combined dimensions of all those
    // things adds up to the desired card width and height.

    // We'll account for the border first. Borders on Magic cards are usually black, and of uniform thickness. We know
    // the border thickness of the global standard card, so we can work out how big the border needs to be for our
    // proxy.

    var proxyBorderThickness = calculateCardBorderThickness(cardWidth);

    // We also need to take padding into account. This is simply a small gap between the contents of the proxy container
    // (ie. the card name, text, etc.) and the border. There is no Magic standard for this; we're just adding it to make
    // the proxy look a little better. The padding is uniform thickness all the way round.

    var proxyPadding = global.dimensions.proxy.padding;

    // Now we can determine the width and height of the proxy element, by subtracting the border and padding from the
    // desired card width and height. We have to subtract two lots of border and padding, as the card is bordered and
    // padded on all four sides.

    var proxyElementWidth = (cardWidth - (2 * proxyBorderThickness)) - (2 * proxyPadding);
    var proxyElementHeight = (cardHeight - (2 * proxyBorderThickness)) - (2 * proxyPadding);

    proxyElement.style.width = proxyElementWidth+'px';
    proxyElement.style.height = proxyElementHeight+'px';
    proxyElement.style.borderWidth = proxyBorderThickness+'px';
    proxyElement.style.padding = proxyPadding+'px';

    // Determine the proxy's color scheme. Generally, this is determined by its mana cost.
    var proxyColorScheme = undefined;
    if (cardProperties.colorIndicator !== undefined) {
        // If the card has a color indicator, then the color indicator is the authoritative determinant of the card's
        // color identity, overriding all other sources of color such as mana cost.

        // In card data, color indicators are represented by a string of mana symbols (ie. W, U, B, R, G) enclosed in
        // parentheses. Although a color indicator is not the same thing as a mana cost, we can treat it as such for the
        // purposes of determining a color scheme.

        // Remove any parentheses from the color indicator.
        var colorIndicatorManaSymbols = cardProperties.colorIndicator.replace(/\(/g, '').replace(/\)/g, '');
        proxyColorScheme = getCardColorSchemeFromManaCost(colorIndicatorManaSymbols);
    }
    else {
        // If there's no color indicator (which is the norm), derive a color scheme from the card's mana cost.
        proxyColorScheme = getCardColorSchemeFromManaCost(cardProperties.cost);
    }

    // Special case: if this card is a token, we use slightly different mappings to get the color scheme (which favors
    // hybrid color schemes if it's a two-colored card).
    if (cardProperties.cardType === 'token') {
        if (cardProperties.colorIndicator !== undefined && global.mappings.colorIndicatorsToCardColorSchemes[cardProperties.colorIndicator] !== undefined) {
            proxyColorScheme = global.mappings.colorIndicatorsToCardColorSchemes[cardProperties.colorIndicator];
        }
    }
        
    // Apply an appropriate color scheme class to the proxy element, in accordance with its color scheme. (This will
    // change the proxy's background color).
    if (proxyColorScheme !== undefined) {
        proxyElement.className += ' '+global.mappings.cardColorSchemesToCssClasses[proxyColorScheme];
    }
    
    // If the card is marked as being a foil card, give the proxy a `foil`
    // class, which adds a rainbow effect to it.
    if (cardProperties.foil) {
        proxyElement.className += ' foil';
    }

    // Create the elements that will contain the various sections of the card.
    var proxyNameElement = document.createElement('p');
    var proxyNameAndCostLineElement = document.createElement('div');
    var proxyNameElement = document.createElement('div');
    var proxyCostElement = document.createElement('div');
    var proxyTypeLineElement = document.createElement('div');
    var proxyTextElement = document.createElement('div');

    var typeLineHtml = cardProperties.supertype;

    if (cardProperties.subtype !== undefined) {
        typeLineHtml += ' &mdash; '+cardProperties.subtype;
    }

    if (cardProperties.supertype2 !== undefined) {
        // If this card has a second supertype, then we'll concatenate it (and the subtype, if it has one) to the type
        // line HTML.
        typeLineHtml += ' // ';
        typeLineHtml += cardProperties.supertype2;

        if (cardProperties.subtype2 !== undefined) {
            typeLineHtml += ' &mdash; '+cardProperties.subtype2;
        }
    }

    proxyNameAndCostLineElement.className = 'card-name-cost-line';
    proxyNameElement.className = 'card-name';
    proxyCostElement.className = 'card-cost';

    // Get the card text.
    var cardText = cardProperties.text;

    if (cardText) { 
        // If we've got flavor text as well, add it in, italicizing it appropriately.
        if (cardProperties.flavorText !== undefined) {
            cardText += '\n\n<i>' + cardProperties.flavorText + '</i>';
        }

        // Since this is HTML, we need to replace line break characters with HTML breaks.
        cardText = cardText.replace(/\n/g, '<br />');

        // Process the text to apply Magic-like styling to any recognized Magic card markup (eg. "T" for the tap symbol).
        cardText = applyMagicStylingToText(cardText);

        proxyTextElement.className = 'card-text';
        // If this is a planeswalker card, add a secondary style to the card text box to make it look more interesting.
        if (cardProperties.supertype.toLowerCase().indexOf('planeswalker') !== -1) {
            proxyTextElement.className += ' card-text-planeswalker';
        }
        proxyTextElement.innerHTML = cardText;

        proxyTextElement.style.fontSize = estimateProxyCardTextFontSize(cardText, cardWidth, textGenerosity)+'px';
    }

    proxyTypeLineElement.className = 'card-type-line';
    proxyTypeLineElement.innerHTML = typeLineHtml;

    if (cardProperties.cost !== undefined) {
        if (cardProperties.cost2 !== undefined) {
            // If the cost has two costs, we assume this is a split card. We render these a little differently.
            // First, split the name up into two names.
            var cardNames = cardProperties.name.split('//')
            cardNames[0] = cardNames[0].trim()
            cardNames[1] = cardNames[1].trim()

            // Instead of just one name and one cost on the name-and-cost line, it'll be like this:
            //
            //     name cost // name2 cost2
            proxyNameElement.innerHTML = cardNames[0]; 
            proxyCostElement.innerHTML = applyManaStyling(cardProperties.cost);
            proxyCostElement.style.cssFloat = 'left';
            proxyCostElement.style.margin = '0 8px';
            var proxySplitElement = document.createElement('div');
            proxySplitElement.innerHTML = '//';
            proxySplitElement.className = 'card-name';
            proxySplitElement.style.margin = '0 8px';
            var proxyName2Element = document.createElement('div');
            proxyName2Element.className = 'card-name';
            proxyName2Element.innerHTML = cardNames[1]
            var proxyCost2Element = document.createElement('div');
            proxyCost2Element.className = 'card-cost';
            proxyCost2Element.style.cssFloat = 'left';
            proxyCost2Element.style.margin = '0 8px';
            proxyCost2Element.innerHTML = applyManaStyling(cardProperties.cost2);

            proxyNameAndCostLineElement.appendChild(proxyNameElement);
            proxyNameAndCostLineElement.appendChild(proxyCostElement);
            //proxyNameAndCostLineElement.appendChild(proxySplitElement);
            proxyNameAndCostLineElement.appendChild(proxyName2Element);
            proxyNameAndCostLineElement.appendChild(proxyCost2Element);
            
        }
        else { 
            // This is not a split card, so just add the name and cost as normal.
            proxyNameElement.innerHTML = cardProperties.name;
            proxyNameAndCostLineElement.appendChild(proxyNameElement);
            proxyCostElement.innerHTML = applyManaStyling(cardProperties.cost);
            proxyNameAndCostLineElement.appendChild(proxyCostElement);
        }
    }
    else {
        // If the card has no cost, just add the name.
            proxyNameElement.innerHTML = cardProperties.name;
            proxyNameAndCostLineElement.appendChild(proxyNameElement);
    }
    
    if (['token', 'emblem'].indexOf(cardProperties.cardType) !== -1) {
        // If the card is a token or emblem, we use a more fancy-looking style for the card name.
        proxyNameAndCostLineElement.className = 'card-name-token';
        proxyNameElement.className = '';
    }

    if (cardProperties.cardType === 'emblem') {
        // For emblems, even if they've been given a name, we just display "Emblem" as the card name.
        proxyNameElement.innerHTML = cardProperties.supertype;
    }

    // Add a `<div style="clear:both">` inside the name-and-cost line, so that it expands to fit its contents even when
    // those contents are floated. I hate this fix, but that's just how things go with CSS floats.
    var clearDiv = document.createElement('div');
    clearDiv.style.clear = "both";

    proxyNameAndCostLineElement.appendChild(clearDiv);

    // Assemble all the card parts into the main card container. We use a simple table layout to ensure the proportions
    // of the card parts stay roughly constant. Note that this table layout is dependent on the Bootstrap CSS; it
    // doesn't look quite right without it.

    var proxyTable = document.createElement('table');
    var proxyNameAndCostRow = document.createElement('tr');
    var proxyNameAndCostCell = document.createElement('td');
    var proxyTypeRow = document.createElement('tr');
    var proxyTypeCell = document.createElement('td');
    var proxyTextRow = document.createElement('tr');
    var proxyTextCell = document.createElement('td');
    var proxyPowerAndToughnessRow = document.createElement('tr');
    var proxyPowerAndToughnessCell = document.createElement('td');

    proxyTable.style.width = '100%';
    proxyTable.style.height = '100%';
    proxyTextCell.style.height = '100%';

    proxyNameAndCostCell.appendChild(proxyNameAndCostLineElement);
    proxyTypeCell.appendChild(proxyTypeLineElement);
    if (cardText) { 
        proxyTextCell.appendChild(proxyTextElement);
    }

    if (cardProperties.pt !== undefined) {
        var proxyPowerAndToughnessElement = document.createElement('div');
        var powerAndToughnessHtml = cardProperties.pt;
        proxyPowerAndToughnessElement.className = 'card-power-toughness';
        proxyPowerAndToughnessElement.innerHTML = powerAndToughnessHtml;
        proxyPowerAndToughnessCell.appendChild(proxyPowerAndToughnessElement);
    }
    else if (cardProperties.loyalty !== undefined) {
        var proxyLoyaltyElement = document.createElement('div');
        var loyaltyHtml = cardProperties.loyalty;
        proxyLoyaltyElement.className = 'card-loyalty';
        proxyLoyaltyElement.innerHTML = loyaltyHtml;
        proxyPowerAndToughnessCell.appendChild(proxyLoyaltyElement);
    }
    else {
        var emptyDiv = document.createElement('div');
        emptyDiv.innerHTML = '&nbsp;';
        proxyPowerAndToughnessCell.appendChild(emptyDiv);
    }

    proxyNameAndCostRow.appendChild(proxyNameAndCostCell);
    proxyTypeRow.appendChild(proxyTypeCell);
    proxyTextRow.appendChild(proxyTextCell);
    proxyPowerAndToughnessRow.appendChild(proxyPowerAndToughnessCell);

    proxyTable.appendChild(proxyNameAndCostRow);
    proxyTable.appendChild(proxyTypeRow);
    proxyTable.appendChild(proxyTextRow);
    proxyTable.appendChild(proxyPowerAndToughnessRow);

    proxyElement.appendChild(proxyTable);

    return proxyElement;
}

/**
 * Idea borrowed from StackOverflow. In HTML, there is no direct way to determine whether text is overflowing its
 * container or not, but there is a really clever trick we can use.
 *
 * The trick works by creating an invisible dummy container with similar properties to the one we're interested in, but
 * we make it so that it will expand with the more text we put into it.
 *
 * Then, we pick a really small font size, put our text into the container with that font size, and measure the
 * container's size. If the container is still at an acceptable size, we try again with a larger font size, and we keep
 * trying until the container goes beyond our desired size. At that point, we will know which font size is just right
 * for the container.
 *
 * `generosity` is the proportion of the card's height that we expect the card text box to take up. For example, a
 * generosity value of 0.5 means that we expect the card text to take up half of the card's height (in most cases, a
 * pessimistic estimate for these proxies, but not always).
 */
function estimateProxyCardTextFontSize(html, cardWidth, generosity) {
    var dummyElement = document.createElement('div');
    var attachmentSelector = 'body';
    document.querySelector(attachmentSelector).appendChild(dummyElement);
    
    dummyElement.style.position = 'absolute';
    //dummyElement.style.visibility = 'hidden';
    dummyElement.style.whitespace = 'nowrap';
    dummyElement.style.overflow = 'visible';
    dummyElement.style.fontFamily = 'proxyFont';

    var cardHeight = getCardHeightFromCardWidth(cardWidth);

    // Estimate the dimensions of the dummy element.

    // It is very important that we try to make the dummy element's width as close as possible to the usable width of
    // the card text box. Height doesn't matter so much because we are "choosing" how much height we allow for the text,
    // but the width needs to be precise because it affects how the text wraps (and therefore, how many lines the text
    // will take up). Even a few pixels of difference can throw off the estimation here.

    // Account for the padding on the card text box. (This is usually defined in the CSS for the `card-text` class;
    // since there's no easy way to get that information, we're hardcoding it here).
    var textBoxPadding = 8;
    var dummyElementWidth = cardWidth - (2 * calculateCardBorderThickness(cardWidth)) - (2 * global.dimensions.proxy.padding) - (2 * textBoxPadding);
    var dummyElementHeight = cardHeight * generosity;
    dummyElement.style.width = dummyElementWidth+'px';
    dummyElement.innerHTML = html;
    
    var minFontSize = 1;
    var maxFontSize = 16;
    var fontSizeIncrement = 0.5;
    
    var bestFontSize = minFontSize;
    for (var i=minFontSize; i <= maxFontSize; i += fontSizeIncrement) {
        dummyElement.style.fontSize = i+'px';
        bestFontSize = i;
        if (dummyElement.offsetHeight > dummyElementHeight) {
            break;
        }
    }

    document.querySelector(attachmentSelector).removeChild(dummyElement);
    return bestFontSize;
}

function calculateCardBorderThickness(cardWidth) {
    var relativeBorderThickness = global.dimensions.standardCard.px.borderThickness/global.dimensions.standardCard.px.width;
    var proxyBorderThickness = cardWidth * relativeBorderThickness;
    return proxyBorderThickness;
}

/**
 * Shortcut function to clear out a container element.
 */
function emptyElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Given a string `string`, add styling to mana characters in that string, such
 * that the mana characters will be appropriately decorated when rendered on
 * the page.
 *
 * The mana characters are W, U, B, R, and G.
 *
 * @param {string} string
 * @return {string}
 */
function applyManaStyling(string) {
    // Get a list of mana symbols (strings) for which we know how to apply
    // styling.
    var manaSymbolRegexStrings = Object.keys(
        global.mappings.manaSymbolsToStyles
    );

    // For each mana symbol that we know about, produce a regex that will match
    // that symbol. (For single colors of mana, this is generally
    // straightforward: the mana symbol string will be a single letter (eg.
    // "W"), and the regex will be the same (eg. /W/).
    var manaSymbolRegexes = []
    for (var i=0; i < manaSymbolRegexStrings.length; i++) {
        var manaSymbolRegex = new RegExp(manaSymbolRegexStrings[i]);
        manaSymbolRegexes.push(manaSymbolRegex);
    }

    // Use the collection of regexes that we have to tokenize the string,
    // breaking it down into an alternating sequence of non-tokens and tokens.
    // The token parts should all be mana symbol strings, for which we know how
    // to apply stylings.
    var tokenizedString = tokenizeString(string, manaSymbolRegexes);

    // Go through the tokenized string pieces, and figure out how to style each
    // piece. If it's a non-token piece, we can safely ignore it. If it's a
    // token piece, we need to figure out which token it is, and apply the
    // appropriate styling to it.
    for (var i=0; i < tokenizedString.length; i++) {
        for (var j=0; j < manaSymbolRegexStrings.length; j++) {
            // If this string piece is a token (ie. something that we
            // identified to be a mana symbol), we now need to figure out which
            // mana symbol it is.
            //
            // To do this, we exploit the idempotence property of tokenization,
            // which says that if we tokenize something that is already a token
            // we should expect that same token back. Therefore, we can tokenize
            // our candidate token against every mana symbol regex until we find
            // an exact match. (This is more reliable than just testing against
            // regexes, as some mana regexes could partially match in situations
            // where we don't want them to - for example, inside hybrid mana).
            var manaSymbolRegexString = manaSymbolRegexStrings[j];
            var manaSymbolRegex = manaSymbolRegexes[j];
            let candidateToken = tokenizedString[i];
            let tokenizedCandidate = tokenizeString(
                candidateToken,
                [manaSymbolRegex]
            );

            if (tokenizedCandidate.length === 2
                && tokenizedCandidate[1] === candidateToken) {
                // If tokenizing the candidate token yields an array like
                // `['', candidateToken]`, then this is the correct mana regex,
                // so we can now use the mapping to apply the correct style to
                // this token.

                // Special case: If the mana symbol is a hybrid mana symbol,
                // we'll remove the string (it will be something like "(wu)",
                // which is too cumbersome for the small space available on the
                // card) and replace it with a non-breaking space; we then style
                // the "space" to look like a hybrid mana symbol.
                if (global.lists.hybridManaSymbolRegexes.indexOf(
                    manaSymbolRegexString
                    ) !== -1) {
                    tokenizedString[i] = tokenizedString[i].replace(
                        manaSymbolRegex,
                        '<span class="manaDecoration '
                            + global.mappings.manaSymbolsToStyles[
                                manaSymbolRegexString
                            ] + '">&nbsp;&nbsp;</span>'
                    );
                } else {
                    // Otherwise, just apply a style to the mana symbol so that
                    // it looks vaguely like a Magic mana symbol.
                    tokenizedString[i] = tokenizedString[i].replace(
                        manaSymbolRegex,
                        '<span class="manaDecoration '
                        + global.mappings.manaSymbolsToStyles[
                            manaSymbolRegexString
                        ] + '">$&</span>'
                    );
                }

                // Having applied the styling, the string piece has now been
                // altered, so we cannot perform any further modifications to
                // it (it's no longer a pure mana symbol string). Skip to the
                // next string piece.
                break;
            }
        }
    }

    // After the above processing has completed, we should have an alternating
    // sequence of non-tokens, and tokens which now have appropriate styling
    // applied to them. We can join them back together into a string again, and
    // this will be the final result.
    return tokenizedString.join('');
}

/**
 * Process a piece of card text to apply Magic styling to it (for example,
 * replacing mana letters with styled mana symbols).
 *
 * @param {string} text
 * @return {string}
 */
function applyMagicStylingToText(text) {
    // Search for certain strings that we know will generally contain some
    // Magic markup. For example, if we find the string "T: ", it is safe to
    // say that that T represents the tap symbol and should therefore be styled
    // accordingly.

    return text;
}

/**
 * Given a string `string`, and an array of token regexes `tokens`, break up the
 * string into an array of substrings, where each substring is either a match
 * for a token, or a non-token.
 *
 * The tokenization algorithm works as follows:
 * 
 * 1. Find the index of the first appearance of a token in the string.
 * 2. By definition, everything up to that index must be a non-token. (It could
 *    be the empty string, if the string happens to start with a token).
 * 3. Slice off the non-token, and the found token, and store them.
 * 4. Repeat steps 1-3 on the resulting shorter string, until no more tokens can
 *    be found.
 * 5. Store the remainder of the string (which, by definition, must also be a
 *    non-token, and may be the empty string).
 *
 * @param {string} string
 * @param {RegExp[]} tokenRegexes
 * @return {string[]}
 */
function tokenizeString(string, tokenRegexes) {
    var decomposableString = string;
    var stringPieces = [];

    // Force all the token regexes to be case-insensitive.
    for (var i=0; i < tokenRegexes.length; i++) {
        tokenRegexes[i] = new RegExp(tokenRegexes[i], 'i');
    }
    
    while (decomposableString.length > 0) {
        // Go through all tokens to find out which one has the earliest match in
        // the string.
        var earliestTokenMatch = undefined;
        var earliestMatchIndex = undefined;
        for (var i=0; i < tokenRegexes.length; i++) {
            var tokenRegex = tokenRegexes[i];
            var result = tokenRegex.exec(decomposableString);
            if (result === null) {
                // If the token has no match in the string at all, try the next
                // one.
                continue;
            }
            var matchedString = result[0];
            var tokenMatchIndex = result.index;

            if (earliestMatchIndex === undefined
                || tokenMatchIndex < earliestMatchIndex
            ) {
                earliestMatchIndex = tokenMatchIndex;
                earliestTokenMatch = matchedString;
            }
        }

        if (earliestTokenMatch === undefined) {
            // If no token was found at all, at any position, then the entire
            // string must be non-token (and it must also be the last piece of
            // string that we'll need to deal with, as there can be no more
            // tokens after this).  We just need to add this final piece of
            // string to our collection of string pieces, and we're done.
            stringPieces.push(decomposableString);

            // Slice the entire string down to nothing (empty string).
            decomposableString = decomposableString.slice(
                decomposableString.length
            );
        } else {
            // We've found which token matches earliest in the string.
            // Everything prior to this match must be a non-token, so we'll
            // collect that first.
            var nonToken = decomposableString.slice(0, earliestMatchIndex);

            // Now collect the bit that matched the token.
            var tokenMatch = earliestTokenMatch;

            // Add them to our collection of string pieces.
            stringPieces.push(nonToken);
            stringPieces.push(tokenMatch);

            // With these pieces now accounted for, we can slice them off the
            // string, and repeat the process if needed.
            decomposableString = decomposableString.slice(
                nonToken.length + tokenMatch.length
            );
        }
    }

    // The entire string has been consumed, so we should now have an array of
    // non-tokens and tokens which, when joined together, will recreate the
    // string.
    return stringPieces;
}

/**
 * Given a string representing a mana cost, determine the most appropriate
 * background color for a card that has that cost.
 *
 * Examples:
 *
 * - `getCardColorSchemeFromManaCost("2UU")` should return "blue", because the
 *   only colored mana in that cost is blue.
 *
 * - `getCardColorSchemeFromManaCost("1BG")` should return "multicolored",
 *   because the mana cost contains two colors: "B" (black) and "G" (green). In
 *   Magic, cards with more than one color of mana in their cost have a gold
 *   background.
 *
 * Note that a card's color scheme is _not_ the same as the card's color, which
 * is a game mechanic. For example, it is possible for a card to have colored
 * mana in its cost, but to be colorless (this is the case for "Devoid" cards,
 * which define themselves as having no color). Although the two do usually
 * coincide, it's important to maintain the distinction.
 */
function getCardColorSchemeFromManaCost(cost) {
    // If `cost` isn't even defined, just say that it's colorless.
    if (cost === undefined) {
        return 'colorless';
    }

    var manaSymbolRegexStrings = Object.keys(
        global.mappings.manaSymbolRegexesToCardColorSchemes
    );

    // For each mana symbol that we know about, produce a regex that will match
    // that symbol. (For single colors of mana, this is generally
    // straightforward: the mana symbol string will be a single letter (eg.
    // "W"), and the regex will be the same (eg. /W/)).
    var manaSymbolRegexes = []
    for (var i=0; i < manaSymbolRegexStrings.length; i++) {
        var manaSymbolRegex = new RegExp(manaSymbolRegexStrings[i]);
        manaSymbolRegexes.push(manaSymbolRegex);
    }

    // Use the collection of regexes that we have to tokenize the cost,
    // breaking it down into an alternating sequence of non-tokens and tokens.
    var tokenizedCost = tokenizeString(cost, manaSymbolRegexes);

    // Go through the tokenized cost pieces and count up all the distinct mana
    // symbols that are present in the cost.
    var distinctManaSymbolRegexStringsInCost = [];
    for (var i=0; i < tokenizedCost.length; i++) {
        for (var j=0; j < manaSymbolRegexStrings.length; j++) {
            // If this cost piece is a token (ie. something that we identified
            // to be a mana symbol), we now need to figure out which mana
            // symbol it is.
            var manaSymbolRegex = manaSymbolRegexes[j];
            var manaSymbolRegexString = manaSymbolRegexStrings[j];
            let candidateToken = tokenizedCost[i];
            let tokenizedCandidate = tokenizeString(
                candidateToken,
                [manaSymbolRegex]
            );

            if (tokenizedCandidate.length === 2
                && tokenizedCandidate[1] === candidateToken) {
                // We've identified the mana symbol (or at least, the regex
                // string that corresponds to it). We'll add that regex string
                // to our collection and keep going.
                if (distinctManaSymbolRegexStringsInCost.indexOf(
                        manaSymbolRegexString
                    ) === -1) {
                    // If we've already recorded an occurrence of this mana
                    // symbol regex string, we don't need to record it again.
                    // We're only interested in how many distinct mana symbols
                    // there are in the cost.
                    distinctManaSymbolRegexStringsInCost.push(
                        manaSymbolRegexString
                    );
                }
                // Having identified the mana symbol for this part of the cost,
                // we can move on to the next.
                break;
            }
        }
    }

    // We should now have a list of all distinct mana symbols in the cost (that
    // we know how to produce color schemes for, at least). With this
    // information, we can now make our decision about what color scheme to use
    // for this card.
    //
    // If there is one and only one type of mana symbol in the cost, we use the
    // color scheme that is defined for that mana symbol. (A hybrid mana
    // symbol, for example "(wu)" (white/blue) is still just one mana symbol,
    // and it does have its own color scheme if it's the only type of colored
    // mana present).
    if (distinctManaSymbolRegexStringsInCost.length === 1) {
        return global.mappings.manaSymbolRegexesToCardColorSchemes[
            distinctManaSymbolRegexStringsInCost[0]
        ];
    }

    // If there is more than one type of mana symbol in the cost, we use the
    // multicolored scheme.
    if (distinctManaSymbolRegexStringsInCost.length > 1) {
        return 'multicolored';
    }

    // Otherwise, the cost is colorless.
    return 'colorless';
}

/**
 * Determines the "mass" of html `html`. By "mass", we mean "how much of it there is", according to a custom metric.
 * This is relevant for proxy cards; the amount of text that can appear on them is variable, and if there's too much,
 * the text will spill off the bottom of the card. We can't resize the card to fix the text, because all cards need to
 * be the same size. Therefore, we'll use the mass of the html to figure out if there's too much of it, and shrink the
 * text if we fear that it would otherwise be too much for the card.
 */
function calculateHtmlMass(html) {
    // Count the number of characters in the html.
    var numberOfCharacters = html.length;
    // Count the number of newlines. Nice trick for this: split the string on newlines, and count the number of pieces
    // that result.

    var numberOfNewlines = html.split('<br />').length - 1;

    // Might as well be precise about what we're counting.
    var numberOfCharactersNotIncludingNewlines = numberOfCharacters - numberOfNewlines;

    // Add up the combined masses of the characters and newlines. (Newlines have greater mass. The masses are defined in
    // the global configuration).
    return (numberOfCharactersNotIncludingNewlines*global.values.textMasses.character) + (numberOfNewlines*global.values.textMasses.newline);
}

function generateSetCode(setName) {
    var setNameWords = setName.split(' ');
    if (setNameWords.length >= 3) {
        // If the set name has three or more words in it, take the first letters of the first three words.
        setCode = setNameWords[0].substring(0, 1) + setNameWords[1].substring(0, 1) + setNameWords[2].substring(0, 1); 
    }
    else if (setNameWords.length === 2) {
        // Otherwise, if the set name has two words, take the first letter of the first word, and the first two letters
        // of the second word.
        setCode = setNameWords[0].substring(0, 1) + setNameWords[1].substring(0, 2);
    }
    else {
        // Otherwise, if it's just one word, take the first 3 letters of that word.
        setCode = setNameWords[0].substring(0, 3);
    }

    // If the set code we obtained is still too short (perhaps there weren't enough for even three letters), pad it out
    // with '0's.
    if (setCode.length === 2) {
        setCode = '0'+setcode;
    }
    if (setCode.length === 1) {
        setCode = '00'+setcode;
    }

    // Make the set code uppercase and return it.
    setCode = setCode.toUpperCase();
    return setCode;
}

function generateUniqueSetCodes(sets) {
    var setCodes = [];
    for (var i=0; i < sets.length; i++) {
        // It's possible that the set name may be `undefined` (this is a special set used for miscellany cards that
        // otherwise don't belong to a defined set). We can't deal with those, so we'll ignore them.
        if (sets[i] === undefined) {
            continue;
        }

        // Some sets have pre-set codes, but if they don't, we'll generate one based on the set's name.
        var setName = sets[i];
        var setCode = SETS[setName].code;
        if (!setCode) {
            var setCode = generateSetCode(setName);
            // Perform some checking to ensure that the set code is unique. If it isn't, we'll append a number to the
            // end of the code, and keep incrementing it until it is unique.
            var incrementedSetCode = setCode;
            var trailingNumber = 1;
            while (setCodes.indexOf(incrementedSetCode) !== -1) {
                trailingNumber++;
                incrementedSetCode = setCode + trailingNumber;
            }
            setCode = incrementedSetCode;
        }
        setCodes.push(setCode);
    }
    return setCodes;
}
/**
 * Given a list of set names `sets`, return an object containing lists of card names for each set in which each card
 * name has been modified to make it unique in both its set, and the collection of cards as a whole.
 *
 * For example, suppose we have a set "AAA" containing cards named "Card 1", "Card 2", and a set "BBB" containing cards
 * named "Card 2", "Card 2". We would like all cards to have distinct names. "Card 1" is fine (there is only one
 * instance of "Card 1" in all sets under consideration), but "Card 2" is not (there are 3 cards named "Card 2", and two
 * of them occur in the same set). Therefore, if this function was supplied a list of sets ["AAA", "BBB"], it would
 * return the following:
 *
 *  {
 *      "AAA": {
 *          "Card 1",
 *          "Card 2"
 *      },
 *      "BBB": {
 *          "Card 2 (BBB)",
 *          "Card 2 (BBB) (2)"
 *      }
 *  }
 *
 * The reason for this function is because the Cockatrice MtG client does not appear to be able to handle images for
 * cards that have the same name, even if they are clearly in different sets and are different cards. Since pony sets
 * are very likely to contain cards with the same name (as they're all based on the same source material), the only way
 * around this is to give the cards unique names.
 */
function getUniqueCardNames(sets) {
    var sets = information.sets;

    // Now obtain a list of unique set codes for these sets. (Some will be defined, others generated).
    var setCodes = generateUniqueSetCodes(sets);

    // Create a set-to-set-code mapping.
    var setsToSetCodes = {};
    for (var i=0; i < sets.length; i++) {
        setsToSetCodes[sets[i]] = setCodes[i];
    }

    // Initialize a collection of cards categorized by set.
    var uniqueCardNamesBySet = {};
    for (var i=0; i < sets.length; i++) {
        uniqueCardNamesBySet[sets[i]] = [];
    }

    // Go through all cards and collect a list of unique card names, performing modifications as appropriate to ensure
    // the list stays unique.
    var uniqueCardNames = [];
    for (var i=0; i < sets.length; i++) {
        var cards = getCardsFilteredBySet(CARDS, [sets[i]]);
        for (var j=0; j < cards.length; j++) {
            var card = cards[j];
            var uniqueCardName = card.name;
            while (uniqueCardNames.indexOf(uniqueCardName) !== -1) {
                // If we already recorded a card with this name, we'll have to rename it so that it's unique.
                // First, find out if the card is currently unique within its own set (at least, among all the cards we've
                // recorded so far).
                if (uniqueCardNamesBySet[card.set].indexOf(uniqueCardName) === -1) {
                    // If the card is currently unique within its own set, that means that there must be a card with this
                    // name in a different set. To distinguish it from that card, we append this card with the code of the
                    // set to which it belongs.
                    var setCode = setsToSetCodes[card.set];
                    if (setCode) {
                        uniqueCardName += ' ('+setCode+')';
                    }
                }
                else {
                    // If the card is _not_ unique within its own set, then obviously, this set contains more than one card
                    // with the same name. In this situation, we eppend a digit to the end of the card's name, and increment
                    // it until the card's name is unique.
                    var incrementedName = uniqueCardName;
                    var trailingNumber = 1;
                    while (uniqueCardNamesBySet[card.set].indexOf(incrementedName) !== -1) {
                        trailingNumber++;
                        incrementedName = uniqueCardName + ' ('+trailingNumber+')';
                    }
                    uniqueCardName = incrementedName;
                }
            }
            // Add the name to our list of unique names.
            uniqueCardNames.push(uniqueCardName);
            // Also add the name to a collection that's categorized by set. As you can see above, we use this information to
            // decide if a card is unique within its own set or not.
            uniqueCardNamesBySet[card.set].push(uniqueCardName);
        }
    }
    return uniqueCardNamesBySet;
}

function generateTipPanel(text) {
    var tipPanel = document.createElement('div');
    tipPanel.className = 'panel panel-info';
    tipPanel.style.width = '50%';
    tipPanel.style.margin = '0 auto';

    var tipPanelHeading = document.createElement('div');
    tipPanelHeading.className = 'panel-heading';
    tipPanelHeading.innerHTML = ' Tip';

    var infoGlyphicon = document.createElement('span');
    infoGlyphicon.className = 'glyphicon glyphicon-info-sign';

    var tipPanelBody = document.createElement('div');
    tipPanelBody.className = 'panel-body';
    tipPanelBody.innerHTML = text;

    tipPanelHeading.insertBefore(infoGlyphicon, tipPanelHeading.firstChild);
    tipPanel.appendChild(tipPanelHeading);
    tipPanel.appendChild(tipPanelBody);
    
    return tipPanel;
}

/**
 * Return a random integer from 0 to `max`-1.
 */
function rnd(max) {
    return Math.floor(Math.random() * max);
}

/**
 * Given a string `string`, return its reverse.
 */
function reverseString(string) {
    var reversedString = '';
    for (var i=string.length-1; i >= 0; i--) {
        reversedString += string.substr(i, 1);
    }
    return reversedString;
}

/**
 * Escape any regex metacharacters in `string`.
 */
function escapeRegex(string) {
    var escapedString = string;
    for (var i=0; i < global.lists.regexMetacharacters.length; i++) {
        var metacharacter = global.lists.regexMetacharacters[i];
        // Here's a fun bit of code: in order to replace all regex metacharacters in string with escaped versions, we
        // need to locate them - and to locate all occurrences of a character in a string, we need to use regex!
        var metacharacterRegex = new RegExp('\\'+metacharacter, 'g');
        escapedString = escapedString.replace(metacharacterRegex, '\\'+metacharacter);
    }
    return escapedString;
}

function getUrlParameters() {
    var parametersString = window.location.search.substr(1);
    return transformToAssociativeArray(parametersString);
}

function transformToAssociativeArray(parametersString) {
    if (!parametersString)
        return {};
    
    var parameters = {};
    var parameterKeyValueStrings = parametersString.split("&");

    for (var i=0; i < parameterKeyValueStrings.length; i++) {
        var parameterKeyValueString = parameterKeyValueStrings[i];
        var keyValue = parameterKeyValueString.split("=");
    
        parameters[decodeURIComponent(keyValue[0])] = decodeURIComponent(keyValue[1]);
    }
    return parameters;
}

/**
 * Given a collection of objects `objects`, returns the collection sorted alphabetically by the values of the specified
 * object properties.
 *
 * Example: Suppose we have a collection of objects `cards`, in which each object is known to have a `name` property and
 * a * `set` property. We could sort the collection by name and secondarily by set by calling:
 *
 *    sortByProperties(cards, ['name', 'set']);
 *
 * If `ignoreCase` is true, the function will treat all property values as if they were lowercase.
 */
function sortByProperties(objects, properties, ignoreCase) {
    return objects.sort(
        function(objectA, objectB) {
            for (var i=0; i < properties.length; i++) {
                // Go through each of the listed properties, and attempt to compare objectA and objectB by each
                // property. If any property comparison yields a definite "this is smaller" or "this is larger" answer,
                // then we return that. If it determines that the two properties are the same, it moves on and tries to
                // compare the next property.
                var property = properties[i];
                var comparisonResult = undefined;

                // If the object does not have the specified property, assume the value of that property to be the empty
                // string.
                var objectPropertyA = '';
                var objectPropertyB = '';

                if (objectA[property] !== undefined) {
                    objectPropertyA = objectA[property];
                }
                if (objectB[property] !== undefined) {
                    objectPropertyB = objectB[property];
                }

                if (ignoreCase) {
                    // If set to ignore case, treat both object properties as if they were lowercase.
                    objectPropertyA = objectPropertyA.toLowerCase();
                    objectPropertyB = objectPropertyB.toLowerCase();
                }

                if (objectPropertyA < objectPropertyB) {
                    comparisonResult = -1;
                }
                else if (objectPropertyA > objectPropertyB) {
                    comparisonResult = 1;
                }
                
                if (comparisonResult !== undefined) {
                    // If we determined that the two properties are definitely different, we return the comparison
                    // result (smaller or larger). 
                    return comparisonResult;
                }

                // Otherwise, we move on to try comparing the next property in the list.
            }

            // If after comparing every property, we still couldn't definitely determine an ordering, the two objects
            // must have exactly the same values for all properties that we're interested in, so return 0.
            return 0;
        }
    );
}
