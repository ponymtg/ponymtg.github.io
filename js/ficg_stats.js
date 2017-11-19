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
 * - Most verbose cards
 * - Most terse cards
 * - Most used words (word cloud?)
 * - Longest card name
 * - Shortest card name
 * - Average card length
 * - Average strength (also per color)
 * - Average toughness (also per color)
 * - Average CMC (also per color)
 * - Average card color (joke: it's "sort of a murky brown")
 * - For all words that appear in legendary cards, how often do they appear in
 *   FICG overall?
 * - Power "efficiency" (average cost per unit of power)
 * - Toughness "efficiency"
 * - Various interesting regex searches
 * - List of tokens
 * - Sound-alikes? Possibly there could be a word sound library to find rhyming
 *   pairs of card names
 * - Pegasi with/without flying?
 * - Protection from X
 * - Rock-based cards?
 * - Transforming cards
 * - Subtypes by average power/toughness/CMC
 */
window.onload = initialize;

function initialize() {
    CARDS = sortByProperties(FICG_CARDS, ['name']);

    var cardAnalyzer = new CardAnalyzer();

    var categorizedCards = {
        'supertype': cardAnalyzer.categorizeCardsBySupertype(CARDS),
        'possessive': cardAnalyzer.categorizeCardsByPossessive(CARDS),
        'colorType': cardAnalyzer.categorizeCardsByColorType(CARDS),
        'pt': Categorize.byProperty(CARDS, 'pt'),
        'ponyTribe':
            Categorize.by(
                CARDS, cardAnalyzer.getCardPonyTribes
            ),
        'jokeBears': cardAnalyzer.categorizeCardsByBears(CARDS),
    };

    var cardSubsets = {
        'spell': cardAnalyzer.getSpellCards(CARDS),
        'creature': categorizedCards.supertype['Creature'],
        'monocolored': categorizedCards.colorType['monocolored'],
    };

    console.log(categorizedCards);
    console.log(cardSubsets);

    var defaultChartWidth = 900;
    var defaultChartHeight = 600;

    var container = d3.select('#container');

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
/*
    var numberOfCardsByNumberOfWordsInText
        = cardAnalyzer.getNumberOfCardsByNumberOfWordsInText(CARDS);

    container
        .append('h2')
        .text('Cards with most words in text (top 5)');
    container
        .append('div')
        .selectAll('div')
        .data(
            Sort.objectByKey(
                numberOfCardsByNumberOfWordsInText,
                'descending'
            ).slice(0, 5)
        )
        .enter()
        .append('div')
        .style('display', 'inline-block')
        .append(
            function (k) {
                var proxyCard = generateProxyElement(
                    numberOfCardsByNumberOfWordsInText[k],
                    global.dimensions.displayCard.width,
                    global.values.proxyTextGenerosity.display
                );

                proxyCard.style.margin = '4px';

                return proxyCard;
            }
        );

*/

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

    var possessiveCardNamesDiv = container.append('div')
        .style('width', defaultChartWidth + 'px')
        .style('border', '1px solid rgb(0, 0, 0)')
        .style('padding', '32px')
        .style('margin', '16px auto');

    possessiveCardNamesDiv
        .append('div')
        .style('width', '100%')
        .style('text-align', 'center')
        .style('font-size', '150%')
        .style('font-weight', 'bold')
        .text('Number of possessive card names, by subject (top 10)');

    possessiveCardNamesDiv
        .selectAll('p')
        .data(
            Sort.objectByFunction(
                categorizedCards.possessive,
                function(cards) {
                    return cards.length;
                },
                'descending'
            ).slice(0, 10)
        )
        .enter()
        .append('p')
        .style('text-align', 'left')
        .style('margin', '16px');
        
    possessiveCardNamesDiv
        .selectAll('p')
        .append('span')
        .html(
            function (k, i) {
                var cardNames = Sort.alphabetically(
                    categorizedCards.possessive[k].map(
                        function (card) {
                            // Replace the fancy apostrophe (’) as it messes up
                            // the alphabetic sorting
                            return card.name.replace('’', "'");
                        }
                    )
                );

                return (i+1) + '. <strong>' + k + '</strong> ('
                    + cardNames.length + ' cards): '
                    + cardNames.join(', ');
            }
        );

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

    Chart.generateHorizontalBarChart(
        container,
        cardAnalyzer.getNumberOfItemsByCategory(categorizedCards['jokeBears']),
        {
            'width': defaultChartWidth,
            'height': defaultChartHeight,
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
            'title': 'Number of cards, by power and toughness',
            'axisLabels': {
                'x': 'Power',
                'y': 'Toughness',
            },
            'colors': function(index, keys) {
                var lightness = 25 +(50 * (index / keys.length));
                return 'hsl(15, 50%, ' + lightness +'%)';
            },
            'labelRotation': 0,
            'sortBy': 'key',
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
            return cardAnalyzer.getTextWords(card.name);
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
