function CardAnalyzer() {
    /***************************************************************************
     * Card filters
     **************************************************************************/

    this.getSpellCards = function(cards) {
        // Get only spell cards (cards with either a cost or a color indicator).
        return cards.filter(
            function(card) {
                return card.cost !== undefined
                    || card.colorIndicator !== undefined;
            }
        );
    }

    /***************************************************************************
     * Categorize cards by...
     **************************************************************************/

    /**
     * Group cards by their color (including "generic", "colorless", and
     * "none").
     */
    this.categorizeCardsByColor = function(cards) {
        return Categorize.by(cards, getCardManaTypes);
    }

    /**
     * Group cards according to the n-color combination that they fall into.
     * This disregards any cards that don't have exactly n colors, allowing you
     * to get all 2-color combinations, or all 3-color combinations, etc.)
     */
    this.categorizeCardsByColorCombinations = function(
        cards,
        numberOfColors
    ) {
        return Categorize.byComposite(
            CARDS,
            function (card) {
                var cardColors = getCardColors(card);
                if (cardColors.length == numberOfColors) {
                    return cardColors;
                }
                return [];
            },
            function (colorA, colorB) {
                return 'WUBRG'.indexOf(colorA) - 'WUBRG'.indexOf(colorB);
            }
        );
    }

    /**
     * Group cards by their color type. We define "color type" to mean one of
     * the following: monocolored, multicolored, colorless.
     */
    this.categorizeCardsByColorType = function(cards) {
        return Categorize.by(
            cards,
            function(card) {
                var cardColors = getCardColors(card);
                switch (cardColors.length) {
                    case 0:
                        return 'colorless';
                        break;
                    case 1:
                        return 'monocolored';
                        break;
                }
                return 'multicolored';
            }
        );
    }

    /**
     * Categorize cards by how many colors they have. This includes cards which
     * don't have a cost.
     */
    this.categorizeCardsByNumberOfColors = function(cards) {
        return Categorize.by(
            cards,
            function(card) {
                return getCardColors(card).length;
            }
        );
    }

    /**
     * Group cards into supertype categories. Note that a card can have multiple
     * supertypes and therefore be in multiple categories.
     */
    this.categorizeCardsBySupertype = function(cards) {
        return Categorize.byProperty(cards, 'supertype', true);
    }

    /**
     * Group cards by subtype.
     */
    this.categorizeCardsBySubtype = function(cards) {
        return Categorize.byProperty(cards, 'subtype', true);
    }

    /**
     * Group cards by converted mana cost.
     */
    this.categorizeCardsByCmc = function(cards) {
        var categorizedCards = {};

        for (var i=0; i < cards.length; i++) {
            var card = cards[i];
            // Disregard cards that don't have a cost (ie. non-spell cards)
            if (card.cost === undefined) {
                continue;
            }

            var cardCmc = getCardConvertedManaCost(card);
            if (categorizedCards[cardCmc] === undefined) {
                categorizedCards[cardCmc] = [];
            }
            categorizedCards[cardCmc].push(card);
        }

        return categorizedCards;
    }

    /**
     * Return an object containing two arrays; one grouping cards by power, the
     * other grouping cards by toughness.
     */
    this.categorizeCardsByPt = function(cards) {
        var categorizedCards = {
            'p': [],
            't': [],
        };

        for (var i=0; i < cards.length; i++) {
            var card = cards[i];
            if (card.pt === undefined) {
                continue;
            }

            var pt = card.pt.split('/');
            if (pt.length !== 2) {
                continue;
            }

            var power = pt[0];
            var toughness = pt[1];
            if (categorizedCards.p[power] === undefined) {
                categorizedCards.p[power] = [];
            }
            categorizedCards.p[power].push(card);

            if (categorizedCards.t[toughness] === undefined) {
                categorizedCards.t[toughness] = [];
            }
            categorizedCards.t[toughness].push(card);
        }

        return categorizedCards;
    }

    this.categorizeCardsByNumberOfWordsInName = function(cards) {
        return Categorize.by(
            cards,
            function(card) {
                return card.name.split(/\s+/).length;
            }
        );
    }

    this.categorizeCardsByNumberOfWordsInText = function(cards) {
        return Categorize.by(
            cards,
            function(card) {
                var texts = [];
                if (card.text !== undefined) {
                    texts.push(card.text);
                }
                if (card.flavorText !== undefined) {
                    texts.push(card.flavorText);
                }

                var text = texts.join(' ');
                var numberOfWords = text.split(/\s+/).length;
                return numberOfWords;
            }
        );
    }

    /**
     * Group cards into categories according to the "possessive word" that they
     * begin with (eg. "Pinkie's Insight" would be categorized under "Pinkie").
     */
    this.categorizeCardsByPossessive = function(cards) {
        return Categorize.by(
            cards,
            function(card) {
                // Lenient regex to allow for generic and fancy punctuation.
                var possessiveRegex = /^"?(.+)['’]s(.+)$"?/;

                var matches = card.name.match(possessiveRegex);
                if (matches === null) {
                    return null;
                }
                return matches[1];
            }
        );
    }

    /**
     * A joke category, conflating the prototypal "bear" (a 2/2 creature which
     * costs 1M) with creatures that have the subtype "Bear".
     */
    this.categorizeCardsByBears = function(cards) {
        var categorizedCards = {};
        categorizedCards['Bears'] = cards.filter(
            function(card) {
                // Reject if it doesn't have all of the fields relevant to
                // being a bear.
                if (card.cost === undefined
                    || card.pt === undefined
                    || card.supertype === undefined
                    || card.subtype === undefined
                ) {
                    return false;
                }
                    
                // Reject if it's not a Creature.
                if (card.supertype.split(/\s+/).indexOf('Creature') === -1) {
                    return false;
                }
                    
                // Reject if it doesn't have a 1M mana cost. 
                if (!/^1[WUBRG]$/i.test(card.cost)) {
                    return false;
                }

                // Reject if its power and toughness are not 2/2. 
                if (card.pt.trim() != '2/2') {
                    return false;
                }

                return true;
            }
        );

        categorizedCards['Actual bears']
            = this.categorizeCardsBySubtype(cards)['Bear'];

        categorizedCards['Actual bears that are bears'] = Categorize.union(
            categorizedCards['Bears'],
            categorizedCards['Actual bears']
        );

        return categorizedCards;
    }

    /***************************************************************************
     * Get numbers of
     **************************************************************************/
    /**
     * Given an object containing a number of arrays, return a corresponding
     * object that contains the length of each array.
     */
    this.getNumberOfItemsByCategory = function(categorizedItems) {
        var numberOfItemsByCategory = {};
        for (var category in categorizedItems) {
            numberOfItemsByCategory[category]
                = categorizedItems[category].length;
        }

        return numberOfItemsByCategory;
    }

    this.getNumberOfCardsByColor = function(cards) {
        var categorizedCards = this.categorizeCardsByColor(cards);
        var numberOfCardsByColor = {};
        for (var cardColor in categorizedCards) {
            numberOfCardsByColor[cardColor]
                = categorizedCards[cardColor].length;
        }

        // While the above gives us the numbers of cards that contain each type
        // of mana, one thing it doesn't do is give us the total number of
        // _colorless_ cards. Colorless cards are cards that don't have any
        // color of mana in their cost. While we do have counts of generic and
        // colorless manas above, this doesn't help us because most cards have
        // generic mana mixed in with colored mana, which we're not interested
        // in (we want _exclusively_ generic cards).
        //
        // To find such cards, we'll search through all the cards and exclude
        // any that contain colored mana symbols.
        var colorlessCards = [];
        for (var i=0; i < cards.length; i++) {
            var card = cards[i];
            // Ignore cards that don't have a cost (we consider these to have
            // color "none", ie. color doesn't apply to them at all).

            if (card.cost === undefined && card.colorIndicator === undefined) {
                continue;
            }

            // Ignore any cards that have colored mana in their cost.
            if (card.cost !== undefined && /[WUBRG]/i.test(card.cost)) {
                continue;
            }

            // If the card doesn't have any colored mana in its cost (or doesn't
            // have a cost at all), it's probably okay to say that it's
            // colorless; however we should make an extra check to be sure the
            // color hasn't been defined explicitly via a color indicator.
            if (card.colorIndicator !== undefined
                && /[WUBRG]/i.test(card.colorIndicator)) {
                continue;
            }
            colorlessCards.push(card);
        }

        if (colorlessCards.length > 0) {
            numberOfCardsByColor['colorless'] = colorlessCards.length;
        }

        // Delete the "generic" count, since this isn't of interest.
        delete numberOfCardsByColor.generic;

        return numberOfCardsByColor;
    }

    this.getNumberOfCardsByColorType = function(cards) {
        return this.getNumberOfItemsByCategory(
            this.categorizeCardsByColorType(cards)
        );
    }

    this.getNumberOfCardsByNumberOfColors = function(cards) {
        return this.getNumberOfItemsByCategory(
            this.categorizeCardsByNumberOfColors(cards)
        );
    }

    /**
     * Return an object mapping each card supertype to the number of cards that
     * have that supertype. Cards can have multiple supertypes; for example, an
     * Artifact Creature will count toward both the Artifact total and the
     * Creature total.
     */
    this.getNumberOfCardsBySupertype = function(cards) {
        return this.getNumberOfItemsByCategory(
            this.categorizeCardsBySupertype(cards)
        );
    }

    /**
     * Return an object mapping each card subtype to the number of cards that
     * have that subtype. Cards can have multiple subtypes; for example, a
     * Unicorn Wizard will count toward both the Unicorn total and the Wizard
     * total.
     */
    this.getNumberOfCardsBySubtype = function(cards) {
        return this.getNumberOfItemsByCategory(
            this.categorizeCardsBySubtype(cards)
        );    
    }

    this.getNumberOfCardsByCmc = function(cards) {
        return this.getNumberOfItemsByCategory(
            this.categorizeCardsByCmc(cards)
        );    
    }

    this.getNumberOfCardsByPt = function(cards) {
        var categorizedCards = this.categorizeCardsByPt(cards);
        var numberOfCardsByPt = {
            'p': {},
            't': {},
        };

        for (var power in categorizedCards.p) {
            numberOfCardsByPt.p[power] = categorizedCards.p[power].length;
        }
        for (var toughness in categorizedCards.t) {
            numberOfCardsByPt.t[toughness]
                = categorizedCards.t[toughness].length;
        }

        return numberOfCardsByPt;
        
    }

    this.getNumberOfCardsByNumberOfWordsInName = function(cards) {
        return this.getNumberOfItemsByCategory(
            this.categorizeCardsByNumberOfWordsInName(cards)
        );
    }

    this.getNumberOfCardsByNumberOfWordsInText = function(cards) {
        return this.getNumberOfItemsByCategory(
            this.categorizeCardsByNumberOfWordsInText(cards)
        );
    }

    /***************************************************************************
     * Averages by category
     **************************************************************************/
    this.getAverageValueByCategory = function(
        categorizedItems,
        valueFunction,
        numberOfDecimalPlaces
    ) {
        var averageValueByCategory = {};
        for (var category in categorizedItems) {
            var itemsInCategory = categorizedItems[category];
            var totalValue = itemsInCategory.map(valueFunction).reduce(
                function(accumulator, value) {
                    return accumulator + value;
                }
            );

            var averageValue = totalValue / itemsInCategory.length;
            if (numberOfDecimalPlaces !== undefined) {
                averageValue = averageValue.toFixed(numberOfDecimalPlaces);
            }
            averageValueByCategory[category] = averageValue;
        }

        return averageValueByCategory;
    }


    /***************************************************************************
     * Other data collection functions
     **************************************************************************/

    this.getQuotations = function(cards) {
        return cards.map(
            function(card) {
                if (card.flavorText === undefined) {
                    return undefined;
                }

                // Lenient regex to allow for generic and fancy punctuation.
                var quotationRegex = /^["“”](.*)["“”]\s*[-—](.+)$/;

                var matches = card.flavorText.match(quotationRegex);
                if (matches === null) {
                    return undefined;
                }
                return {
                    'quotation': matches[1],
                    'character': matches[2],
                }
            }
        ).filter(
            function(quotation) {
                if (quotation !== undefined) {
                    return true;
                }
                return false;
            }
        );
    }

    this.getNumberOfQuotationsByAttribution = function(quotations) {
        return this.getNumberOfItemsByCategory(
            Categorize.byProperty(quotations, 'character')
        );
    }
                
    this.getPossessiveCardNames = function(cards) {
        return cards.map(
            function(card) {

                // Lenient regex to allow for generic and fancy punctuation.
                var possessiveRegex = /^(.+)['’]s(.+)$/;

                var matches = card.name.match(possessiveRegex);
                if (matches === null) {
                    return undefined;
                }
                return {
                    'subject': matches[1],
                    'object': matches[2],
                }
            }
        ).filter(
            function(quotation) {
                if (quotation !== undefined) {
                    return true;
                }
                return false;
            }
        );
    };

    this.getNumberOfPossessedObjectsBySubject = function(possessives) {
        return this.getNumberOfItemsByCategory(
            Categorize.byProperty(possessives, 'subject')
        );
    };

    this.getTextWords = function(text) {
        return text.split(/\s+/).map(
            function(word) {
                // Remove any common non-word punctuation from the beginning and
                // end of the word.
                word = word.replace(/^["“'‘(\[{]*/, '');
                word = word.replace(/["”'’)\]).,!?:;]*$/, '');

                return word;
            }
        );
    };

    /**
     * Return an object mapping each word in the given text to its frequency of
     * occurrence.
     */
    this.getTextWordFrequencies = function(text) {
        var wordFrequencies = {};

        var words = this.getTextWords(text.toLowerCase());

        for (var i=0; i < words.length; i++) {
            var word = words[i];
            wordFrequencies[word] = words.reduce(
                function(accumulator, checkedWord) {
                    return accumulator + (checkedWord == word ? 1 : 0);
                },
                0
            );
        }

        return wordFrequencies;
    };

    this.getCardPropertyWordFrequencies = function(cards, property) {
        var propertyWordFrequenciesByCard = cards.map(
            function(card) {
                if (card[property] !== undefined) {
                    return this.getTextWordFrequencies(card[property]);
                }
                return [];
            }.bind(this)
        );

        var wordFrequencies = {};
        // Really weird bug! The `watch` property is automatically set on
        // Javascript objects as a native function, even if the object is
        // newly-created. This causes issues with the counting below, and causes
        // even more issues when trying to sort it. To prevent the issue, we
        // force the `watch` property to undefined.
        wordFrequencies.watch = undefined;

        for (var i=0; i < propertyWordFrequenciesByCard.length; i++) {
            for (var word in propertyWordFrequenciesByCard[i]) {
                var frequency = propertyWordFrequenciesByCard[i][word];
                if (wordFrequencies[word] === undefined) {
                    wordFrequencies[word] = 0;
                }
                wordFrequencies[word] += frequency;
            }
        }

        return wordFrequencies;
    }

    this.getCardsToNumberOfWordsInText = function(cards) {
        return cards.map(
            function(card) {
                var texts = [];
                if (card.text !== undefined) {
                    texts.push(card.text);
                }
                if (card.flavorText !== undefined) {
                    texts.push(card.flavorText);
                }

                var text = texts.join(' ');
                var numberOfWords = text.split(/\s+/).length;
                return numberOfWords;
            }
        );
    }

    /**
     * Return all cards that have the subtype Pony, Pegasus, or Unicorn, or
     * which have the Alicorn keyword.
     */
    this.getCardPonyTribes = function(card) {
        var ponyTribes = [];

        if (card.subtype !== undefined) {
            var cardSubtypes = card.subtype.split(/\s+/);

            ponyTribes = ponyTribes.concat(
                cardSubtypes.filter(
                    function(subtype) {
                        return ['Pony', 'Pegasus', 'Unicorn'].indexOf(subtype)
                            !== -1;
                    }
                )
            );
        }

        var alicornRegex = /(^|\n)Alicorn( \(.+\.\))?(\n|$)/;
        if (alicornRegex.test(card.text)) {
            ponyTribes.push('Alicorn');
        }

        return ponyTribes;
    }

    /**
     * Given an array of strings, return an array of all possible combinations
     * of those strings of the given number.
     *
     * Example:
     *
     *     this.getCombinations(['W', 'U', 'B', 'R', 'G']);
     *
     *     returns
     *         ['W', U'],
     *         ['W', B'],
     *         ['W', R'],
     *         ['W', G'],
     *         ['U', B'],
     *         ['U', R'],
     *         ['U', G'],
     *         ['B', R'],
     *         ['B', G'],
     *         ['R', G']
     */
    this.getCombinations = function(strings, number) {
        if (number === 1) {
            // Base case: just return an array of arrays containing single
            // strings (ie. combinations of size 1)
            return strings.map(
                function(item) {
                    return [item];
                }
            );
        }

        // If we're looking for combinations of a greater number, first get the
        // previous set of combinations.
        var smallerCombinations = getCombinations(strings, number - 1);
        var combinations = [];
        for (var i=0; i < smallerCombinations.length; i++) {
            var smallerCombination = smallerCombinations[i];
            for (var j=0; j < strings.length; j++) {
                // For each of the previous set of combinations (one size
                // smaller), try appending a string to the end of it to make a
                // new, hopefully valid combination.
                //
                // There are 2 rules to follow:
                // 1. Combinations can't have repeated elements
                // 2. Combinations can't have exactly the same elements as a
                //    previously-added combination (even if in a different
                //    order)
                var item = strings[j];
                
                if (smallerCombination.indexOf(item) !== -1) {
                    // If the previous combination already contains the item
                    // we're trying to add, disregard it (repeated strings
                    // aren't allowed)
                    continue;
                }

                // Check the already-added combinations to make sure that we
                // haven't already added a combination that contains the same
                // elements (even if they're in a different order).
                var combinationToAdd = smallerCombination.concat(item).sort();
                var combinationAlreadyAdded = false;
                for (var k=0; k < combinations.length; k++) {
                    var addedCombination = combinations[k].slice(0).sort();

                    // Nice trick: if we sort the combination strings and join
                    // them into a single string, we can use string comparison
                    // to compare two combinations, even if their strings are in
                    // a different order.
                    if (combinationToAdd.join('')
                        == addedCombination.join('')) {
                        combinationAlreadyAdded = true;
                        continue;
                    }
                }

                if (!combinationAlreadyAdded) {
                    // If the combination hasn't already been added, this one's
                    // okay to include, so add it to the list.
                    combinations.push(smallerCombination.concat(item));
                }
            }
        }
        return combinations;
    }
}
