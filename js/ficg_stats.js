/**
 * Stats to add:
 *
 * <https://mtg.gamepedia.com/Magic:_The_Gathering/statistics_and_trivia> is a
 * stats page for real MtG cards, a good place for ideas on what to collect
 * stats on.
 *
 * - Most common second word in two-word names
 * - Cards called "X of Y"
 * - Pony vs Human
 * - Cards by subtype, for each supertype
 * - Cards by subtype, for ponies
 * - Cards by subtype, for humans
 * - Cards by keyword
 *   - Flying vs non-flying, etc
 * - Snow vs non-snow
 * - Cards by supertype, per color
 * - Legendaries vs nonlegendaries
 * - Most used words (word cloud?)
 * - Average strength (also per color)
 * - Average toughness (also per color)
 * - Average CMC (also per color)
 * - Power "efficiency" (average cost per unit of power)
 * - Toughness "efficiency"
 * - Various interesting regex searches
 * - List of tokens
 * - Sound-alikes? Possibly there could be a word sound library to find rhyming
 *   Pairs of reused card names
 * - Protection from X
 * - Rock-based cards?
 * - Transforming cards
 * - Subtypes by average power/toughness/CMC
 * - Cards with the same name (there are some!)
 * - Whitest, bluest, etc. cards
 * - Average power efficiency plot by subtype
 * - Most expensive cards, by supertype
 * - "-er" words
 * - "X-ing Y-er" names
 *
 * - 5000 cards end-to-end
 *   = 88mm * 5000 = 440m
 *   Height of Empire State Building to tip = 443m
 * - 5000 cards stacked
 *   = 0.305mm * 5000 = 1.525m
 *   This happens to be almost exactly 5 feet.
 *   Average (US) human male height is 1.77m
 *
 * Exact duplicate cards ("reprints"?):
 *
 * - Training Montage ("Hurricane Fluttershy", "Flight To The Finish")
 * - Talent Show ("The Show Stoppers", "Flight To The Finish")
 * - Stare Mastery ("Stare Master", "Bats!")
 * - Pony of Pop ("A Dog And Pony Show", "For Whom The Sweetie Belle Toils")
 * - Overtaxing Workload ("Suited For Success", "For Whom The Sweetie Belle Toils")
 * - Harsh Judge ("Games Ponies Play", "Flight To The Finish")
 * - Downtown Manehattan ("The Cutie Mark Chronicles", "Rarity Takes Manehattan")
 * - Doctor Caballeron ("Daring Don't", "Stranger Than Fan Fiction")
 * - Daring Do, Ruin Raider ("Read It And Weep", "Stranger Than Fan Fiction")
 * - Daredevil's Scooter ("The Show Stoppers", "Flight to the Finish")
 * - Commemorative Window ("Return Of Harmony", "Princess Twilight Sparkle")
 * - Caballeron's Thugs ("Daring Don't", "Stranger Than Fan Fiction")
 * - Attention Horse ("Sweet And Elite", "Twilight Time")
 * - Ahuizotl, Dread Despot ("Read It And Weep", "Daring Don't")
 * - Adventurer's Pith Helmet ("Read It And Weep", "Daring Don't")
 */
window.onload = initialize;

function initialize() {
    var CARDS = FICG_CARDS;

    // A little cultivation step to "unfancy" some punctuation, which makes
    // word analysis easier.
    for (var i=0; i < CARDS.length; i++) {
        var card = CARDS[i];

        card.name = card.name
            .replace('’', "'")
            .replace(/[“”]/g, '"');
    }

    var cardAnalyzer = new CardAnalyzer();
    // Before we do anything, filter out reprinted cards. We only want to
    // consider unique cards in these statistics.
    var reprintedOriginals = cardAnalyzer.getReprints(CARDS).originals;
    var reprints = cardAnalyzer.getReprints(CARDS).reprints;
    CARDS = CARDS.filter(
        function(card) {
            if (reprints.indexOf(card) !== -1) {
                return false;
            }
            return true;
        }
    );

    CARDS = sortByProperties(CARDS, ['name']);

    var categorizedCards = {
        'supertype': cardAnalyzer.categorizeCardsBySupertype(CARDS),
        'subtype': cardAnalyzer.categorizeCardsBySubtype(CARDS),
        'eponymous': cardAnalyzer.categorizeCardsByPossessive(CARDS),
        'color': cardAnalyzer.categorizeCardsByColor(CARDS),
        'colorType': cardAnalyzer.categorizeCardsByColorType(CARDS),
        'numberOfColors': cardAnalyzer.categorizeCardsByNumberOfColors(CARDS),
        'pt': Categorize.byProperty(CARDS, 'pt'),
        'jokeBears': cardAnalyzer.categorizeCardsByBears(CARDS),
        'numberOfWordsInName':
            cardAnalyzer.categorizeCardsByNumberOfWordsInName(CARDS),
        'numberOfWordsInText':
            cardAnalyzer.categorizeCardsByNumberOfWordsInText(CARDS),
        'name': Categorize.byProperty(CARDS, 'name'),
        'doubleSided': CARDS.filter(
            function(card) {
                return card.transformsInto !== undefined;
            }
        ),
    };

    var cardSubsets = {
        'spell': cardAnalyzer.getSpellCards(CARDS),
        'creature': categorizedCards.supertype['Creature'],
        'monocolored': categorizedCards.colorType['monocolored'],
        'twoWordName': categorizedCards.numberOfWordsInName[2],
    };

    categorizedCards['ponyTribe'] = Categorize.by(
        cardSubsets.creature,
        cardAnalyzer.getCardPonyTribes
    ),
    console.log(categorizedCards);
    console.log(cardSubsets);

    var defaultChartWidth = 900;
    var defaultChartHeight = 600;

    var container = d3.select('#container');

    /***************************************************************************
     * Overall statistics
     **************************************************************************/
    var overallStatsDiv = container.append('div')
        .style('width', defaultChartWidth + 'px')
        .style('border', '1px solid rgb(0, 0, 0)')
        .style('padding', '32px')
        .style('margin', '16px auto');

    overallStatsDiv
        .append('div')
        .style('width', '100%')
        .style('text-align', 'center')
        .style('font-size', '150%')
        .style('font-weight', 'bold')
        .text('Overall statistics');

    overallStatsDiv
        .append('p')
        .html('<b>Number of cards:</b> '+(CARDS.length + reprints.length));

    overallStatsDiv
        .append('p')
        .html('<b>Number of unique cards:</b> '+CARDS.length);


    // My Little Dashie: 12,524
    // Oversaturation: 38,282
    // Mendacity: 74,794
    // Group Precipitation (to date): 120,148
    // Anthropology: 130,415
    // The Mare Who Once Lived On The Moon: 148,692
    // Past Sins: 201,810
    // Through the Well of Pirene: 358,933
    // Equestrian Fanfiction (to date): 372,116
    // Fallout: Equestria: 620,295
    var totalNumberOfCardTextWords = CARDS.reduce(
        function(accumulator, card) {
            var numberOfWords = 0;
            if (card.text !== undefined) {
                numberOfWords += cardAnalyzer.splitStringIntoWords(
                    card.text
                ).length;
            }
            if (card.flavorText !== undefined) {
                numberOfWords += cardAnalyzer.splitStringIntoWords(
                    card.flavorText
                ).length;
            }
            return accumulator + numberOfWords;
        },
        0
    );
    overallStatsDiv
        .append('p')
        .html(
            '<b>Total number of card text words:</b> '
            + totalNumberOfCardTextWords
        );

    /***************************************************************************
     * Reprinted cards
     **************************************************************************/
    var reprintedCardsDiv = container.append('div').style('text-align', 'left');

    Chart.generateList(
        container,
        Sort.by(
            Categorize.by(
                reprints,
                function(card) {
                    return card.name;
                }
            ),
            function(card) {
                return card.name;
            }
        ),
        function(k, i) {
            var html
                = '<div style="width:100%;border-bottom:1px solid #e0e0e0;'
                    + 'border-top:1px solid #e0e0e0;padding:2px 0;">'
            html += k[0];

            html += '</div>';
                
            return html;
        },
        {
            'width': defaultChartWidth / 2,
            'title': 'Reprinted cards',
        }
    );

    /***************************************************************************
     * Number of spell cards, by color
     **************************************************************************/
    Chart.generatePieChart(
        container,
        cardAnalyzer.getNumberOfCardsByColor(cardSubsets.spell),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of spell cards, by color',
            'colors': {
                'white': 'rgb(248, 248, 240)',
                'blue': 'rgb(96, 168, 240)',
                'black': 'rgb(56, 56, 56)',
                'red': 'rgb(224, 72, 64)',
                'green': 'rgb(144, 192, 148)',
                'colorless': 'rgb(192, 192, 192)',
            },
            'order': 'descending',
        }
    );

    /***************************************************************************
     * Number of monocolored cards, by color
     **************************************************************************/
    Chart.generatePieChart(
        container,
        cardAnalyzer.getNumberOfCardsByColor(cardSubsets.monocolored),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of monocolored cards, by color',
            'colors': {
                'white': 'rgb(248, 248, 240)',
                'blue': 'rgb(96, 168, 240)',
                'black': 'rgb(56, 56, 56)',
                'red': 'rgb(224, 72, 64)',
                'green': 'rgb(144, 192, 148)',
            },
            'order': 'descending',
        }
    );

    /***************************************************************************
     * Number of 2-color cards, by color combination
     **************************************************************************/
    Chart.generatePieChart(
        container,
        cardAnalyzer.getNumberOfItemsByCategory(
            cardAnalyzer.categorizeCardsByColorCombinations(CARDS, 2)
        ),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of 2-color cards, by color combination',
            'strokeWidth': 4,
            'colors': {
                'WU': [
                    'rgb(248, 248, 240)',
                    'rgb(96, 168, 240)',
                ],
                'WB': [
                    'rgb(248, 248, 240)',
                    'rgb(56, 56, 56)',
                ],
                'WR': [
                    'rgb(248, 248, 240)',
                    'rgb(224, 72, 64)',
                ],
                'WG': [
                    'rgb(248, 248, 240)',
                    'rgb(144, 192, 148)',
                ],
                'UB': [
                    'rgb(96, 168, 240)',
                    'rgb(56, 56, 56)',
                ],
                'UR': [
                    'rgb(96, 168, 240)',
                    'rgb(224, 72, 64)',
                ],
                'UG': [
                    'rgb(96, 168, 240)',
                    'rgb(144, 192, 148)',
                ],
                'BR': [
                    'rgb(56, 56, 56)',
                    'rgb(224, 72, 64)',
                ],
                'BG': [
                    'rgb(56, 56, 56)',
                    'rgb(144, 192, 148)',
                ],
                'RG': [
                    'rgb(224, 72, 64)',
                    'rgb(144, 192, 148)',
                ],
            },
            'sortBy': 'value',
            'order': 'descending',
        }
    );

    /***************************************************************************
     * Number of 3-color cards, by color combination
     **************************************************************************/
    Chart.generatePieChart(
        container,
        cardAnalyzer.getNumberOfItemsByCategory(
            cardAnalyzer.categorizeCardsByColorCombinations(CARDS, 3)
        ),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of 3-color cards, by color combination',
            'strokeWidth': 4,
            'colors': {
                'WUB': [
                    'rgb(248, 248, 240)',
                    'rgb(96, 168, 240)',
                    'rgb(56, 56, 56)',
                ],
                'WUR': [
                    'rgb(248, 248, 240)',
                    'rgb(96, 168, 240)',
                    'rgb(224, 72, 64)',
                ],
                'WUG': [
                    'rgb(248, 248, 240)',
                    'rgb(96, 168, 240)',
                    'rgb(144, 192, 148)',
                ],
                'WBR': [
                    'rgb(248, 248, 240)',
                    'rgb(56, 56, 56)',
                    'rgb(224, 72, 64)',
                ],
                'WBG': [
                    'rgb(248, 248, 240)',
                    'rgb(56, 56, 56)',
                    'rgb(144, 192, 148)',
                ],
                'WRG': [
                    'rgb(248, 248, 240)',
                    'rgb(224, 72, 64)',
                    'rgb(144, 192, 148)',
                ],
                'UBR': [
                    'rgb(96, 168, 240)',
                    'rgb(56, 56, 56)',
                    'rgb(224, 72, 64)',
                ],
                'UBG': [
                    'rgb(96, 168, 240)',
                    'rgb(56, 56, 56)',
                    'rgb(144, 192, 148)',
                ],
                'URG': [
                    'rgb(96, 168, 240)',
                    'rgb(224, 72, 64)',
                    'rgb(144, 192, 148)',
                ],
                'BRG': [
                    'rgb(56, 56, 56)',
                    'rgb(224, 72, 64)',
                    'rgb(144, 192, 148)',
                ],
            },
            'sortBy': 'value',
            'order': 'descending',
        }
    );

    /***************************************************************************
     * Number of spell cards, by color type
     **************************************************************************/
    Chart.generatePieChart(
        container,
        cardAnalyzer.getNumberOfCardsByColorType(cardSubsets.spell),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of spell cards, by color type',
            'colors': {
                'monocolored': 'rgb(224, 72, 64)',
                'multicolored': 'rgb(255, 192, 64)',
                'colorless': 'rgb(192, 192, 192)'
            },
            'sortBy': 'value',
            'order': 'descending',
        }
    );

    /***************************************************************************
     * Number of spell cards, by number of colors
     **************************************************************************/
    Chart.generateBarChart(
        container,
        cardAnalyzer.getNumberOfCardsByNumberOfColors(cardSubsets.spell),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of spell cards, by number of colors',
            'axisLabels': {
                'x': 'Number of colors',
                'y': 'Number of cards',
            },
            'colors': function(index, keys) {
                var saturation = (100 * (index / keys.length));
                return 'hsl(330, ' + saturation + '%, 50%)';
            },
            'sortBy': 'key',
            'order': 'ascending',
        }
    );

    var fourColorCardsDiv = document.createElement('div');
    for (var i=0; i < categorizedCards.numberOfColors[4].length; i++) {
        appendCardProxy(
            categorizedCards.numberOfColors[4][i],
            fourColorCardsDiv
        );
    }

    document.querySelector('#container').appendChild(fourColorCardsDiv);

    /***************************************************************************
     * Number of cards, by supertype
     **************************************************************************/
    Chart.generateHorizontalBarChart(
        container,
        cardAnalyzer.getNumberOfCardsBySupertype(CARDS),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of cards, by supertype',
            'colors': generateHslColor,
            'order': 'descending',
        }
    );

    /***************************************************************************
     * Planeswalker cards
     **************************************************************************/

    container
        .append('div')
        .style('width', '100%')
        .style('text-align', 'center')
        .style('font-size', '150%')
        .style('font-weight', 'bold')
        .text('Planeswalker cards');

    var planeswalkerCards = categorizedCards['supertype']['Planeswalker'];
    var planeswalkerCardsDiv = document.createElement('div');
    planeswalkerCardsDiv.style.width = defaultChartWidth + 'px';
    planeswalkerCardsDiv.style.margin = '0 auto';

    for (var i=0; i < planeswalkerCards.length; i++) {
        var planeswalkerCard = planeswalkerCards[i];
        var planeswalkerCardProxy = generateProxyElement(
            planeswalkerCard,
            250,
            global.values.proxyTextGenerosity.display
        );
        planeswalkerCardProxy.style.margin = '8px';
        planeswalkerCardProxy.style.display = 'inline-block';
        planeswalkerCardsDiv.appendChild(planeswalkerCardProxy);
    }

    document.querySelector('#container').appendChild(planeswalkerCardsDiv);

    /***************************************************************************
     * Number of Creature cards, by subtype (top 20)
     **************************************************************************/
    Chart.generateHorizontalBarChart(
        container,
        cardAnalyzer.getNumberOfCardsBySubtype(cardSubsets.creature),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of Creature cards, by subtype (top 20)',
            'colors': 'rgb(224, 112, 112)',
            'order': 'descending',
            'limit': 20,
        }
    );

    /***************************************************************************
     * Number of monocolored Creature cards, by color and subtype (top 20)
     **************************************************************************/
    
    var monocoloredCreatureCards = cardAnalyzer.categorizeCardsBySupertype(
        cardSubsets['monocolored']
    )['Creature'];

    var monocoloredCreatureCardsByColor = cardAnalyzer.categorizeCardsByColor(
        monocoloredCreatureCards
    );

    // This will contain the top 20 creature subtypes for each color.
    var monocoloredCreatureCardsByColorAndSubtype = {
        'white': undefined,
        'blue': undefined,
        'red': undefined,
        'green': undefined,
        'black': undefined,
    };

    var numberOfCardsToList = 20;
    for (var color in monocoloredCreatureCardsByColorAndSubtype) {
        monocoloredCreatureCardsByColorAndSubtype[color]
            = Sort.by(
                Categorize.by(
                    monocoloredCreatureCardsByColor[color],
                    function(card) {
                        if (card.subtype !== undefined) {
                            return card.subtype.split(/\s+/);
                        }
                        return [];
                    }
                ),
                function(cards) {
                    return cards.length;
                }
            ).reverse().slice(0, numberOfCardsToList);
    }

    var div = container.append('div')
        .style('width', defaultChartWidth+'px')
        .style('border', '1px solid rgb(0, 0, 0)')
        .style('padding', '16px')
        .style('margin', '16px auto');

    div
        .append('div')
        .style('width', '100%')
        .style('text-align', 'center')
        .style('font-size', '150%')
        .style('font-weight', 'bold')
        .style('margin-bottom', '16px')
        .text(
            'Number of monocolored Creature cards,'
                + ' by color and subtype (top 20)'
        );

    var colors = {
        'white': 'rgb(248, 248, 240, 0.25)',
        'blue': 'rgb(96, 168, 240, 0.25)',
        'black': 'rgb(56, 56, 56, 0.25)',
        'red': 'rgb(224, 72, 64, 0.25)',
        'green': 'rgb(144, 192, 148, 0.25)',
    }; 

    var table = div.append('table')
        .style('width', '100%');

    var headingRow = table.append('tr')
        .style('border', '1px solid rgb(128, 128, 128)')
        .style('height', '32px');

    for (var color in monocoloredCreatureCardsByColorAndSubtype) {
        headingRow.append('td')
            .text(color)
            .style('background-color', colors[color])
            .style('font-weight', 'bold')
            .style('width', '20%')
            .style('border', '1px solid rgb(128, 128, 128)');
    }

    for (var i=0; i < numberOfCardsToList; i++) {
        var tr = table.append('tr')
            .style('border', '1px solid rgb(128, 128, 128)')
            .style('height', '24px');

        for (var color in monocoloredCreatureCardsByColorAndSubtype) {
            var k = monocoloredCreatureCardsByColorAndSubtype[color][i];
            tr.append('td')
                .html((i+1) + '. <strong>' + k[0] + '</strong> (' + k[1].length + ')')
                .style('background-color', colors[color])
                .style('border', '1px solid rgb(128, 128, 128)')
                .style('padding', '0 8px')
                .style('text-align', 'left');
        }
    }
            
    /***************************************************************************
     * Number of spell cards, by converted mana cost
     **************************************************************************/
    Chart.generateBarChart(
        container,
        cardAnalyzer.getNumberOfCardsByCmc(cardSubsets.spell),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of spell cards, by converted mana cost',
            'axisLabels': {
                'x': 'Converted mana cost',
                'y': 'Number of cards',
            },
            'colors': function(index, keys) {
                var saturation = (100 * (index / keys.length));
                return 'hsl(300, ' + saturation + '%, 50%)';
            },
            'labelRotation': 0,
            'sortBy': 'key',
        }
    );

    /***************************************************************************
     * Number of Creature cards, by converted mana cost
     **************************************************************************/
    Chart.generateBarChart(
        container,
        cardAnalyzer.getNumberOfCardsByCmc(cardSubsets.creature),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of Creature cards, by converted mana cost',
            'axisLabels': {
                'x': 'Converted mana cost',
                'y': 'Number of cards',
            },
            'colors': function(index, keys) {
                var saturation = (100 * (index / keys.length));
                return 'hsl(300, ' + saturation + '%, 50%)';
            },
            'labelRotation': 0,
            'sortBy': 'key',
        }
    );

    /***************************************************************************
     * Most expensive Creature card
     **************************************************************************/
    var mostExpensiveCreatureCard = Sort.by(
        cardSubsets.creature,
        function (card) {
            if (card.cost !== undefined) {
                return getCardConvertedManaCost(card);
            }
            return 0;
        }
    ).reverse()[0][1];

    var mostExpensiveCreatureCardDiv = document.createElement('div');
    mostExpensiveCreatureCardDiv.style.width = defaultChartWidth + 'px';
    mostExpensiveCreatureCardDiv.style.margin = '0 auto';

    var cardProxy = generateProxyElement(
        mostExpensiveCreatureCard,
        250,
        global.values.proxyTextGenerosity.display
    );
    cardProxy.style.margin = '8px';
    cardProxy.style.display = 'inline-block';
    mostExpensiveCreatureCardDiv.appendChild(cardProxy);

    document.querySelector('#container').appendChild(
        mostExpensiveCreatureCardDiv
    );

    /***************************************************************************
     * Number of Creature cards, by power
     **************************************************************************/
    Chart.generateBarChart(
        container,
        cardAnalyzer.getNumberOfCardsByPt(cardSubsets.creature).p,
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of Creature cards, by power',
            'axisLabels': {
                'x': 'Power',
                'y': 'Number of cards',
            },
            'colors': function(index, keys) {
                var lightness = 25 +(50 * (index / keys.length));
                return 'hsl(0, 75%, ' + lightness +'%)';
            },
            'labelRotation': 0,
            'sortBy': 'key',
        }
    );

    /***************************************************************************
     * Number of Creature cards, by toughness
     **************************************************************************/
    Chart.generateBarChart(
        container,
        cardAnalyzer.getNumberOfCardsByPt(cardSubsets.creature).t,
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of Creature cards, by toughness',
            'axisLabels': {
                'x': 'Toughness',
                'y': 'Number of cards',
            },
            'colors': function(index, keys) {
                var lightness = 25 +(50 * (index / keys.length));
                return 'hsl(240, 75%, ' + lightness +'%)';
            },
            'labelRotation': 0,
            'sortBy': 'key',
        }
    );

    /***************************************************************************
     * Most powerful cards, top 2
     **************************************************************************/
    var mostPowerfulCards = Sort.by(
        cardSubsets.creature,
        function (card) {
            if (card.pt !== undefined) {
                var power = card.pt.split('/')[0].trim();

                if (/^\d+$/.test(power)) {
                    return power;
                }
            }
            return 0;
        }
    ).reverse().slice(0, 2).map(
        function (tuple) {
            return tuple[1];
        }
    );

    var mostPowerfulCardsDiv = document.createElement('div');
    mostPowerfulCardsDiv.style.width = defaultChartWidth + 'px';
    mostPowerfulCardsDiv.style.margin = '0 auto';

    for (var i=0; i < mostPowerfulCards.length; i++) {
        var card = mostPowerfulCards[i];
        var cardProxy = generateProxyElement(
            card,
            250,
            global.values.proxyTextGenerosity.display
        );
        cardProxy.style.margin = '8px';
        cardProxy.style.display = 'inline-block';
        mostPowerfulCardsDiv.appendChild(cardProxy);
    }

    document.querySelector('#container').appendChild(mostPowerfulCardsDiv);

    /***************************************************************************
     * Toughest cards, top 2
     **************************************************************************/
    var toughestCards = Sort.by(
        cardSubsets.creature,
        function (card) {
            if (card.pt !== undefined) {
                var toughness = card.pt.split('/')[1].trim();

                if (/^\d+$/.test(toughness)) {
                    return toughness;
                }
            }
            return 0;
        }
    ).reverse().slice(0, 2).map(
        function (tuple) {
            return tuple[1];
        }
    );

    var toughestCardsDiv = document.createElement('div');
    toughestCardsDiv.style.width = defaultChartWidth + 'px';
    toughestCardsDiv.style.margin = '0 auto';

    for (var i=0; i < toughestCards.length; i++) {
        var card = toughestCards[i];
        var cardProxy = generateProxyElement(
            card,
            250,
            global.values.proxyTextGenerosity.display
        );
        cardProxy.style.margin = '8px';
        cardProxy.style.display = 'inline-block';
        toughestCardsDiv.appendChild(cardProxy);
    }

    document.querySelector('#container').appendChild(toughestCardsDiv);

    /***************************************************************************
     * Number of Creature cards, by power and toughness
     **************************************************************************/
    Chart.generateBubbleChart(
        container,
        categorizedCards['pt'],
        function(cardsByPt) {
            var tuples = [];
            for (var pt in cardsByPt) {
                var power = pt.split('/')[0].trim();
                var toughness = pt.split('/')[1].trim();
                var number = cardsByPt[pt].length;

                if (/^\d+$/.test(power)
                    && /^\d+$/.test(toughness)) {
                    tuples.push([parseInt(power), parseInt(toughness), number]);
                }
            }
            return tuples;
        },
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of Creature cards, by power and toughness',
            'axisLabels': {
                'x': 'Power',
                'y': 'Toughness',
            },
        }
    );

    /***************************************************************************
     * Creature subtypes, by average power and average toughness
     **************************************************************************/
    var averagePowerBySubtype = cardAnalyzer.getAverageValueByCategory(
        cardAnalyzer.categorizeCardsBySubtype(cardSubsets.creature),
        function (card) {
            if (card.pt !== undefined) {
                var pt = card.pt.split('/');
                if (pt.length == 2) {
                    var power = pt[0];
                    if (/^\d+$/.test(power.trim())) {
                        return parseInt(power);
                    }
                }
            }
            return 0;
        }
    );
            
    var averageToughnessBySubtype = cardAnalyzer.getAverageValueByCategory(
        cardAnalyzer.categorizeCardsBySubtype(cardSubsets.creature),
        function (card) {
            if (card.pt !== undefined) {
                var pt = card.pt.split('/');
                if (pt.length == 2) {
                    var toughness = pt[1];
                    if (/^\d+$/.test(toughness.trim())) {
                        return parseInt(toughness);
                    }
                }
            }
            return 0;
        }
    );

    var data = [];

    for (var subtype in averagePowerBySubtype) {
        data.push(
            [
                averagePowerBySubtype[subtype],
                averageToughnessBySubtype[subtype],
                subtype,
            ]
        );
    }
            
    Chart.generateScatterPlot(
        container,
        data,
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title':'Creature subtypes, by average power and average toughness',
            'axisLabels': {
                'x': 'Average power',
                'y': 'Average toughness',
            },
            'crossSize': 5,
            'labelOnly': [
                'Avatar',
                'Barbarian',
                'Bear',
                'Berserker',
                'Cake',
                'Cockatrice',
                'Demon',
                'Dinosaur',
                'Dryad',
                'Faerie',
                'Frog',
                'Golem',
                'Goblin',
                'Gorgon',
                'Imp',
                'Jellyfish',
                'Minotaur',
                'Muffin',
                'Reflection',
                'Satyr',
                'Serpent',
                'Troll',
                'Wall',
                'Whale',
                'Zombie',
            ],
        }
    );

    /***************************************************************************
     * Number of cards, by number of words in name
     **************************************************************************/
    Chart.generateBarChart(
        container,
        cardAnalyzer.getNumberOfCardsByNumberOfWordsInName(CARDS),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of cards, by number of words in name',
            'axisLabels': {
                'x': 'Number of words in name',
                'y': 'Number of cards',
            },
            'colors': function(index, keys) {
                var lightness = 25 +(50 * (index / keys.length));
                return 'hsl(15, 50%, ' + lightness +'%)';
            },
            'labelRotation': 0,
            'sortBy': 'key',
        }
    );

    /***************************************************************************
     * Longest single-word name
     **************************************************************************/

    container
        .append('div')
        .style('width', '100%')
        .style('text-align', 'center')
        .style('font-size', '150%')
        .style('font-weight', 'bold')
        .text('Cards with longest single-word name');

    var cardsWithLongestOneWordName = Sort.by(
        categorizedCards['numberOfWordsInName'][1],
        function (card) {
            var alphabetizedWord = card.name.replace(/[^a-z]/gi, '');
            return alphabetizedWord.length;
        }
    ).reverse().slice(0, 5).map(
        function (tuple) {
            return tuple[1];
        }
    );

    var cardsWithLongestOneWordNameDiv = document.createElement('div');
    for (var i=0; i < cardsWithLongestOneWordName.length; i++) {
        appendCardProxy(
            cardsWithLongestOneWordName[i],
            cardsWithLongestOneWordNameDiv
        );
    }

    document.querySelector('#container').appendChild(
        cardsWithLongestOneWordNameDiv
    );

    /***************************************************************************
     * Longest name
     **************************************************************************/

    container
        .append('div')
        .style('width', '100%')
        .style('text-align', 'center')
        .style('font-size', '150%')
        .style('font-weight', 'bold')
        .text('Cards with longest name');

    var cardsWithLongestName = Sort.by(
        CARDS,
        function (card) {
            return card.name.length;
        }
    ).reverse().slice(0, 10).map(
        function (tuple) {
            return tuple[1];
        }
    );
//Mineighmo, School at the Horizon
//Fluttershy, Death of the Party

//SunburstImperialCrystaller
//MidnightSparklePlaneripper
    var cardsWithLongestNameDiv = document.createElement('div');
    for (var i=0; i < cardsWithLongestName.length; i++) {
        appendCardProxy(
            cardsWithLongestName[i],
            cardsWithLongestNameDiv
        );
    }

    document.querySelector('#container').appendChild(
        cardsWithLongestNameDiv
    );

    /***************************************************************************
     * Number of 2-word-name cards, by first word in name (top 15)
     **************************************************************************/

    var twoWordNamesDiv = container.append('div').style('text-align', 'left');

    Chart.generateList(
        twoWordNamesDiv,
        Sort.by(
            Categorize.by(
                cardSubsets['twoWordName'],
                function(card) {
                    return cardAnalyzer.splitStringIntoWords(card.name)[0];
                }
            ),
            function(cards) {
                return cards.length;
            },
        ).reverse().slice(0, 15),
        function(k, i) {
            var html
                = '<div style="width:100%;border-bottom:1px solid #e0e0e0;'
                    + 'border-top:1px solid #e0e0e0;padding:2px 0;">'
                    + '<div style="width:20%;display:inline-block;'
                    + 'vertical-align:top">' + (i+1) + '. <strong>' + k[0]
                    + '</strong> (' + k[1].length + ' cards):</div> '

            html += '<div style="width:75%;display:inline-block">';
            html += k[1].map(
                function(card) {
                    return cardAnalyzer
                        .splitStringIntoWords(card.name)[1];
                }
            ).join(' • ');
            html += '</div>';
                
            return html;
        },
        {
            'width': defaultChartWidth,
            'title':
                'Number of 2-word-name cards, by first word in name (top 15)',
        }
    );

    /***************************************************************************
     * Number of 2-word-name cards, by second word in name (top 15)
     **************************************************************************/
    Chart.generateList(
        twoWordNamesDiv,
        Sort.by(
            Categorize.by(
                cardSubsets['twoWordName'],
                function(card) {
                    return cardAnalyzer.splitStringIntoWords(card.name)[1];
                }
            ),
            function(cards) {
                return cards.length;
            },
        ).reverse().slice(0, 15),
        function(k, i) {
            var html
                = '<div style="width:100%;border-bottom:1px solid #e0e0e0;'
                    + 'border-top:1px solid #e0e0e0;padding:2px 0;">'
                    + '<div style="width:20%;display:inline-block;'
                    + 'vertical-align:top">' + (i+1) + '. <strong>' + k[0]
                    + '</strong> (' + k[1].length + ' cards):</div> '

            html += '<div style="width:75%;display:inline-block">';
            html += k[1].map(
                function(card) {
                    return cardAnalyzer
                        .splitStringIntoWords(card.name)[0];
                }
            ).join(' • ');
            html += '</div>';
                
            return html;
        },
        {
            'width': defaultChartWidth,
            'title':
                'Number of 2-word-name cards, by second word in name (top 15)',
        }
    );

    /***************************************************************************
     * "-ing" words in card names (top 10)
     **************************************************************************/
    var div = container.append('div')
        .style('width', defaultChartWidth + 'px')
        .style('border', '1px solid rgb(0, 0, 0)')
        .style('padding', '32px')
        .style('margin', '16px auto');

    Chart.generateList(
        div,
        Sort.by(
            Categorize.by(
                cardSubsets.twoWordName,
                function(card) {
                    var words = cardAnalyzer.splitStringIntoWords(card.name);
                    if (/ing$/.test(words[0])) {
                        return words[0];
                    }
                    return null;
                }
            ),
            function(cards) {
                return cards.length;
            },
        ).reverse().slice(0, 10),
        function(k, i) {
            var html
                = '<div style="width:100%;border-bottom:1px solid #e0e0e0;'
                    + 'border-top:1px solid #e0e0e0;padding:2px 0;">'
                    + (i+1) + '. <strong>' + k[0] + '</strong> ('
                    + k[1].length + ' cards)</div> ';

            return html;
        },
        {
            'width': defaultChartWidth * 0.4,
            'title':'"-ing" words in card names (top 10)',
            'display': 'inline-block',
            'margin': '16px',
        }
    );
    
    /***************************************************************************
     * "-ed" words in card names (top 10)
     **************************************************************************/
    Chart.generateList(
        div,
        Sort.by(
            Categorize.by(
                cardSubsets.twoWordName,
                function(card) {
                    var words = cardAnalyzer.splitStringIntoWords(card.name);
                    if (/ed$/.test(words[0])) {
                        return words[0];
                    }
                    return null;
                }
            ),
            function(cards) {
                return cards.length;
            },
        ).reverse().slice(0, 10),
        function(k, i) {
            var html
                = '<div style="width:100%;border-bottom:1px solid #e0e0e0;'
                    + 'border-top:1px solid #e0e0e0;padding:2px 0;">'
                    + (i+1) + '. <strong>' + k[0] + '</strong> ('
                    + k[1].length + ' cards)</div> ';
                
            return html;
        },
        {
            'width': defaultChartWidth * 0.4,
            'title':'"-ed" words in card names (top 10)',
            'display': 'inline-block',
            'margin': '16px',
        }
    );
    
    /***************************************************************************
     * Wordiest card
     **************************************************************************/

    container
        .append('div')
        .style('width', '100%')
        .style('text-align', 'center')
        .style('font-size', '150%')
        .style('font-weight', 'bold')
        .text('Wordiest card');

    var wordiestCard = Sort.by(
        CARDS,
        function (card) {
            var numberOfWords = 0;
            if (card.text !== undefined) {
                numberOfWords
                    += cardAnalyzer.splitStringIntoWords(card.text).length;
            }
            if (card.flavorText !== undefined) {
                numberOfWords
                    +=cardAnalyzer.splitStringIntoWords(card.flavorText).length;
            }
            return numberOfWords;
        }
    ).reverse()[0][1];

    var wordiestCardProxy = generateProxyElement(
        wordiestCard,
        global.dimensions.displayCard.width,
        global.values.proxyTextGenerosity.display
    );
    wordiestCardProxy.style.margin = '16px auto';

    document.querySelector('#container').appendChild(wordiestCardProxy);

    /***************************************************************************
     * Most verbose card
     **************************************************************************/

    container
        .append('div')
        .style('width', '100%')
        .style('text-align', 'center')
        .style('font-size', '150%')
        .style('font-weight', 'bold')
        .text('Most verbose card');

    var cardWithLongestText = Sort.by(
        CARDS,
        function (card) {
            var textLength = 0;
            if (card.text !== undefined) {
                textLength += card.text.length;
            }
            if (card.flavorText !== undefined) {
                textLength += card.flavorText.length;
            }
            return textLength;
        }
    ).reverse()[0][1];

    var cardWithLongestTextProxy = generateProxyElement(
        cardWithLongestText,
        global.dimensions.displayCard.width,
        global.values.proxyTextGenerosity.display
    );
    cardWithLongestTextProxy.style.margin = '16px auto';

    document.querySelector('#container').appendChild(cardWithLongestTextProxy);

    /***************************************************************************
     * Most concise card
     **************************************************************************/

    container
        .append('div')
        .style('width', '100%')
        .style('text-align', 'center')
        .style('font-size', '150%')
        .style('font-weight', 'bold')
        .text('Most concise card');

    var cardWithShortestText = Sort.by(
        CARDS,
        function (card) {
            var textLength = 0;
            if (card.text !== undefined) {
                textLength += card.text.length;
            }
            if (card.flavorText !== undefined) {
                textLength += card.flavorText.length;
            }
            return textLength;
        }
    )[0][1];

    var cardWithShortestTextProxy = generateProxyElement(
        cardWithShortestText,
        global.dimensions.displayCard.width,
        global.values.proxyTextGenerosity.display
    );
    cardWithShortestTextProxy.style.margin = '16px auto';

    document.querySelector('#container').appendChild(cardWithShortestTextProxy);

    /***************************************************************************
     * Most common word in name, by supertype
     **************************************************************************/

    var mostCommonWordInNameBySupertypeDiv
        = container.append('div')
            .style('text-align', 'left');

    var supertypes = Object.keys(categorizedCards.supertype)

    var commonWords = ['of', 'the', 'to', 'your', 'you', 'in', 'for', 'from', 'and', 'a', '//'];

    var mostCommonWordInNameBySupertype = [];
    for (var i=0; i < supertypes.length; i++) {
        var supertype = supertypes[i];

        if (categorizedCards.supertype[supertype].length < 30) {
            continue;
        }

        var wordFrequencies = {};
        for (var j=0; j < categorizedCards.supertype[supertype].length; j++) {
            var card = categorizedCards.supertype[supertype][j];
            var cardNameWords = cardAnalyzer.splitStringIntoWords(card.name);
            for (var k=0; k < cardNameWords.length; k++) {
                var word = cardNameWords[k];
                if (commonWords.indexOf(word.toLowerCase()) !== -1) {
                    continue;
                }
                if (wordFrequencies[word] === undefined) {
                    wordFrequencies[word] = 0;
                }
                wordFrequencies[word]++;
            }
        }
        mostCommonWordInNameBySupertype.push(
            [
                supertype,
                Sort.by(
                    wordFrequencies,
                    function (frequency) { return frequency; }
                ).reverse().slice(0, 5)
            ]
        );
    }


    Chart.generateList(
        mostCommonWordInNameBySupertypeDiv,
        mostCommonWordInNameBySupertype,
        function(k, i) {
            var html
                = '<div style="width:100%;border-bottom:1px solid #e0e0e0;'
                    + 'border-top:1px solid #e0e0e0;padding:2px 0;">'
                    + '<div style="width:25%;display:inline-block;'
                    + 'vertical-align:top"><strong>' + k[0]
                    + ': </strong></div>';

            html += '<div style="width:75%;display:inline-block">';
            html += '<ol>';

            var occurrences = k[1];
            for (var i=0; i < occurrences.length; i++) {
                html += '<li>' + occurrences[i][0] + ' (' + occurrences[i][1]
                    + ' occurrences)</li>';
            }

            html += '</ol>';

            return html;
        },
        {
            'width': defaultChartWidth / 2,
            'title':
                'Most common words in name, by supertype (top 5, excluding common words)',
        }
    );


    /***************************************************************************
     * Number of flavor text quotations, by attribution (top 25)
     **************************************************************************/
    Chart.generateHorizontalBarChart(
        container,
        cardAnalyzer.getNumberOfQuotationsByAttribution(
            cardAnalyzer.getQuotations(CARDS)
        ),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title':
                'Number of flavor text quotations, by attribution (top 25)',
            'margin': {
                'x': 220,
                'y': 50,
            },
            'colors': generateHslColor,
            'order': 'descending',
            'limit': 25,
        }
    );

    /***************************************************************************
     * Number of eponymous card names, by name (top 10)
     **************************************************************************/
    var eponymousNamesDiv = container.append('div').style('text-align', 'left');
    Chart.generateList(
        eponymousNamesDiv,
        Sort.by(
            categorizedCards.eponymous,
            function(cards) {
                return cards.length;
            }
        ).reverse().slice(0, 10),
        function(k, i) {
            var html
                = '<div style="width:100%;border-bottom:1px solid #e0e0e0;'
                    + 'border-top:1px solid #e0e0e0;padding:2px 0;">'
                    + '<div style="width:20%;display:inline-block;'
                    + 'vertical-align:top">' + (i+1) + '. <strong>' + k[0]
                    + '</strong> (' + k[1].length + ' cards):</div> '

            html += '<div style="width:75%;display:inline-block">';
            html += k[1].map(
                function(card) {
                    return cardAnalyzer
                        .splitStringIntoWords(card.name)
                        .slice(1).join(' ');
                }
            ).join(' • ');
            html += '</div>';
                
            return html;
        },
        {
            'width': defaultChartWidth,
            'title':
                'Number of eponymous card names, by name (top 10)',
        }
    );

    /***************************************************************************
     * Number of cards, by pony tribe
     **************************************************************************/
    Chart.generatePieChart(
        container,
        cardAnalyzer.getNumberOfItemsByCategory(categorizedCards['ponyTribe']),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Number of cards, by pony tribe',
            'colors': {
                'Pony': 'rgb(237, 227, 151)',
                'Pegasus': 'rgb(239, 170, 122)',
                'Unicorn': 'rgb(244, 235, 244)',
                'Alicorn': 'rgb(215, 157, 224)',
            },
            'sortBy': 'value',
            'order': 'descending',
        }
    );

    /***************************************************************************
     * Average power, by pony tribe
     **************************************************************************/
    var averagePowerByPonyTribe = cardAnalyzer.getAverageValueByCategory(
        categorizedCards['ponyTribe'],
        function(card) {
            if (card.pt !== undefined) {
                var pt = card.pt.split('/');
                if (pt.length == 2) {
                    var power = pt[0];
                    if (/^\d+$/.test(power.trim())) {
                        return parseInt(power);
                    }
                }
            }
            return 0;
        },
        2
    );

    Chart.generateHorizontalBarChart(
        container,
        averagePowerByPonyTribe,
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight / 2,
            'title': 'Average power, by pony tribe',
            'axisLabels': {
                'x': 'Power (average)',
            },
            'margin': {
                'x': 100,
                'y': 40,
            },
            'colors': {
                'Pony': 'rgb(237, 227, 151)',
                'Pegasus': 'rgb(239, 170, 122)',
                'Unicorn': 'rgb(244, 235, 244)',
                'Alicorn': 'rgb(215, 157, 224)',
            },
            'order': 'descending',
        }
    );

    /***************************************************************************
     * Average toughness, by pony tribe
     **************************************************************************/
    var averageToughnessByPonyTribe = cardAnalyzer.getAverageValueByCategory(
        categorizedCards['ponyTribe'],
        function(card) {
            if (card.pt !== undefined) {
                var pt = card.pt.split('/');
                if (pt.length == 2) {
                    var toughness = pt[1];
                    if (/^\d+$/.test(toughness.trim())) {
                        return parseInt(toughness);
                    }
                }
            }
            return 0;
        },
        2
    );

    Chart.generateHorizontalBarChart(
        container,
        averageToughnessByPonyTribe,
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight / 2,
            'title': 'Average toughness, by pony tribe',
            'axisLabels': {
                'x': 'Toughness (average)',
            },
            'margin': {
                'x': 100,
                'y': 40,
            },
            'colors': {
                'Pony': 'rgb(237, 227, 151)',
                'Pegasus': 'rgb(239, 170, 122)',
                'Unicorn': 'rgb(244, 235, 244)',
                'Alicorn': 'rgb(215, 157, 224)',
            },
            'order': 'descending',
        }
    );

    /***************************************************************************
     * Number of bears
     **************************************************************************/
    Chart.generateHorizontalBarChart(
        container,
        cardAnalyzer.getNumberOfItemsByCategory(categorizedCards['jokeBears']),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight / 2,
            'title': 'Number of bears',
            'margin': {
                'x': 180,
                'y': 60,
            },
            'colors': {
                'Bears': 'rgb(30, 208, 51)',
                'Actual bears': 'rgb(157, 108, 51)',
                'Actual bears that are bears': 'rgb(237, 158, 51)',
            },
        }
    );

    /***************************************************************************
     * Total combined card text length, compared to selected fics
     **************************************************************************/
    var textLengths = {
        'My Little Dashie': 12524,
        'Oversaturation': 38282,
        'Mendacity': 74794,
        'Group Precipitation (to date)': 122285,
        'Anthropology': 130415,
        'The Mare Who Once Lived On The Moon': 148692,
        'The Irony of Applejack': 175745,
        'Past Sins': 201810,
        'Project: Sunflower': 243094,
        'Through the Well of Pirene': 358933,
        'Fallout: Equestria': 620295,
        'The Austraeoh series': 620296,
        'Friendship is Card Games': totalNumberOfCardTextWords,
    };

    Chart.generateHorizontalBarChart(
        container,
        textLengths,
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': 'Total combined card text wordcount,'
                + ' compared to selected fics',
            'margin': {
                'x': 250,
                'y': 60,
            },
            'colors': generateHslColor,
            'sortBy': 'value',
            'order': 'ascending',
        }
    );

    /***************************************************************************
     * Alliterative card names
     **************************************************************************/
    var alliterativeCardNamesDiv = container.append('div').style('text-align', 'left');

    Chart.generateList(
        container,
        CARDS.filter(
            function (card) {
                var cardNameWords
                    = cardAnalyzer.splitStringIntoWords(card.name);
                if (cardNameWords.length < 2) {
                    return false;
                }
                if (card.name.indexOf('-') !== -1) {
                    return false;
                }
                var firstLetter = cardNameWords[0].charAt(0);
                for (var i=1; i < cardNameWords.length; i++) {
                    if (cardNameWords[i].charAt(0) != firstLetter) {
                        return false;
                    }
                }
                return true;
            }
        ),
        function(k, i) {
            var html
                = '<div style="width:100%;border-bottom:1px solid #e0e0e0;'
                    + 'border-top:1px solid #e0e0e0;padding:2px 0;">'
            html += k.name;

            html += '</div>';
                
            return html;
        },
        {
            'width': defaultChartWidth / 2,
            'title': 'Alliterative card names',
        }
    );

    /***************************************************************************
     * Number of Creature cards by power, per color
     **************************************************************************/
        cardAnalyzer.getNumberOfCardsByPt(cardSubsets.creature).p,
    Chart.generateLineChart(
        container,
        [],
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
            'title': '',
            'padding': {
                'n': 30,
                'e': 125,
                's': 30,
                'w': 125,
            },
            'colors': generateHslColor,
        }
    );
        
/*
    var cardTextWordFrequencies = {};
    cardTextWordFrequencies = cardAnalyzer.getCardPropertyWordFrequencies(
        CARDS,
        'name'
    );
    var legendaryNameWords = categorizedCards['supertype']['Legendary'].map(
        function(card) {
            return cardAnalyzer.splitStringIntoWords(card.name);
        }
    ).reduce(
        function(accumulator, words) {
            return accumulator.concat(words);
        },
        []
    );

    var cardTextWordFrequenciesForLegendaryNameWords = {};
    for (var i=0; i < legendaryNameWords.length; i++) {
        var word = legendaryNameWords[i].toLowerCase();

        if (cardTextWordFrequencies[word] !== undefined) {
            cardTextWordFrequenciesForLegendaryNameWords[word]
                = cardTextWordFrequencies[word];
        }
    }

    var legendaryWordsByFrequencyInCardText = Sort.objectByValue(
        cardTextWordFrequenciesForLegendaryNameWords,
        'descending'
    );
    console.log(legendaryWordsByFrequencyInCardText);
    //var wordsByFrequency = Sort.objectByValue(wordFrequencies, 'descending');
    //console.log(wordsByFrequency);
*/
}

/*******************************************************************************
 * General functions
 ******************************************************************************/

/**
 * Return an array of HSL color strings.
 *
 * @param int amount The number of HSL color strings to return.
 * @return string[]
 */
function generateHslColor(index, keys) {
    var h = Math.floor((index / keys.length) * 360);
    var s = 70 + Math.floor(30 * ((index % 4) / 3));
    var l = 50 + Math.floor(25 * ((index % 3) / 2));
    return 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
}

function appendCardProxy(card, container) {
    var cardProxy = generateProxyElement(
        card,
        250,
        global.values.proxyTextGenerosity.display
    );
    cardProxy.style.margin = '8px';
    cardProxy.style.display = 'inline-block';
    container.appendChild(cardProxy);
}
