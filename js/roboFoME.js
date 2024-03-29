/**
 * RoboFoME: Generates new cards by analyzing an existing set, deriving
 * frequency data, and using it as the basis for probabalistic text generation.
 */

// TODO: RoboFoME relies on a global variable `FICG_CARDS` which it expects to
// contain the entire Friendship is Card Games set. However, with the recent
// card loader upgrade, this is no longer available - instead, cards are now
// loaded directly from JSON files.
//
// We could fudge in some backwards compatibility by loading the cards here
// first and setting the `FICG_CARDS` global manually.

// If true, `log` messages will be shown in the console.
const showLogMessages = true;

// Define some convenient references to elements that we'd like to update.
const elementIds = [
    'statusPanel',
    'statusMessage',
    'progressBar',
];

var elements = {};

for (let i=0; i < elementIds.length; i++) {
    const elementId = elementIds[i];
    elements[elementId] = document.querySelector('#'+elementId);
}

// Define a set of generation settings. These will be sent to the worker process
// which actually does all of the number crunching to collect the frequency data
// which we'll then use to generate each property of the card.
//
// `depth` is a parameter which controls how deep the
// frequency data collection will go; greater depths are more accurate but take
// longer to collect. For some properties, it's appropriate to go a bit deeper.
//
// The settings also include the cards from which the frequency data will be
// obtained, although this is initially undefined as we haven't yet loaded the
// cards at this point. That will be done by the `initialize` function once the
// page has fully loaded.
const SETTINGS = {
    'cards': undefined,
    'propertyGeneration': {
        'name': {
            'depth': 6,
            'generator': 'generateCardName',
        },
        'cost': {
            'depth': 6,
            'generator': 'generateCardCost',
        },
        'supertype': {
            'depth': 8,
            'generator': 'generateCardSupertype',
        },
        'subtype': {
            'depth': 8,
            'generator': 'generateCardSubtype',
        },
        'text': {
            'depth': 6,
            'generator': 'generateCardText',
        },
        'flavorText': {
            'depth': 6,
            'generator': 'generateCardFlavorText',
        },
        'pt': {
            'depth': 6,
            'generator': 'generateCardPt',
        },
        'loyalty': {
            'depth': 6,
            'generator': 'generateCardLoyalty',
        },
    },
};

/**
 * Given a set of frequency data, create the card generation interface. This
 * method is called by the worker process when it has finished analyzing FICG's
 * frequency data.
 *
 * @param {Object} frequencyData
 */
const createCardGenerationInterface = function createCardGenerationInterface(frequencyData) {
    // Add the "Generate another card" button.
    const generateCardButton = document.createElement('button');

    generateCardButton.id = 'generateCardButton';
    generateCardButton.className = 'btn btn-primary btn-lg';
    generateCardButton.innerHTML = 'Generate a card';
    generateCardButton.style.margin = '16px';

    // Add a button which, when clicked, generates a new card from the frequency
    // data.
    generateCardButton.onclick = (clickEvent) => {
        emptyElement(elements.generatedCard);
        generateCard(frequencyData);
        elements.generateCardButton.innerHTML = 'Generate another card';
    };

    elements.generateCardButton = generateCardButton;
    elements.statusPanel.appendChild(elements.generateCardButton);

    // Add the "Copy card to clipboard" button.
    // Disabled for now since this functionality doesn't work properly yet.
    const copyCardButton = document.createElement('button');

    copyCardButton.id = 'generateCardButton';
    copyCardButton.className = 'btn btn-primary btn-lg';
    copyCardButton.innerHTML = 'Copy card to clipboard';
    copyCardButton.style.margin = '16px';

    copyCardButton.onclick = (clickEvent) => {
        const generatedCardContainer = document.querySelector(
            '#generatedCard'
        );
        const cardHtml = generatedCardContainer.innerHTML;
        navigator.clipboard.writeText(cardHtml).then(
            () => {},
            (err) => {
                console.error(
                    `Could not copy card to clipboard; ${err}`
                );
            }
        );
    };

    elements.copyCardButton = copyCardButton;
    //elements.statusPanel.appendChild(elements.copyCardButton);

    elements.generatedCard = document.createElement('div');
    elements.generatedCard.id = 'generatedCard';
    elements.statusPanel.appendChild(elements.generatedCard);

    // As a visual cue for where the generated card will be displayed,
    // add in an empty proxy.
    const emptyCardData = {
        'name': '&nbsp;',
        'supertype': '&nbsp;',
    }
    const emptyProxyElement = generateProxyElement(
        emptyCardData,
        global.dimensions.standardCard.px.width
    );
    elements.generatedCard.appendChild(emptyProxyElement);
    
    // Clear out the innards of the proxy (even an empty one will put
    // in some panels for the name and type lines, which looks ugly; we
    // just want the outline of the card).
    emptyElement(emptyProxyElement);

    // Stick a big "?" on the empty card.
    emptyProxyText = document.createElement('div');
    emptyProxyText.style.margin = (global.dimensions.standardCard.px.height / 2)
        + ' auto 0 auto';
    emptyProxyText.style.fontSize = (global.dimensions.standardCard.px.width * 0.75)
        + 'px';
    emptyProxyText.innerHTML = '?';

    emptyProxyElement.appendChild(emptyProxyText);
};

/**
 * Handle a message received (as an event) from the worker.
 *
 * @param {Event} messageEvent
 */
const handleWorkerMessage = function handleWorkerMessage(messageEvent) {
    const message = messageEvent.data;

    // All messages from the worker should be wrapped in an object which tells
    // us the context (ie. what the message is for).
    switch(message.context) {
        case 'status':
            // We expect `status` messages to contain a `statusMessage` string
            // and a `progressPercentage` integer.  These will allow us to
            // display to the user what's going on and update the progress bar.
            elements.statusMessage.innerHTML = message.content.statusMessage;
            elements.progressBar.style.width = message.content.progressPercentage
                + '%';
        break;
        case 'frequencyData':
            // Eventually, the worker should send back all the frequency data
            // that we need, which is our cue to generate a card.

            // The status panel isn't needed any longer, so empty it out.
            emptyElement(elements.statusPanel);
            const frequencyData = message.content;
            log(frequencyData);
            createCardGenerationInterface(frequencyData);
        break;
    }
};

/**
 *
 * @param {ClipboardEvent} copyEvent
 */
function copyHandler(copyEvent) {
    const selection = document.getSelection();
    console.log(selection);
    console.log(selection.getRangeAt(0));
    copyEvent.clipboardData.setData('text/html', selection.toString());
    copyEvent.preventDefault();
}

/**
 * Generate a new random card from a set of supplied frequency data suites, and
 * display it in the DOM (in the `#generatedCard` div).
 *
 * @param {Object} frequencyDataSuites
 */
const generateCard = function generateCard(frequencyDataSuites) {
    log(frequencyDataSuites);
    const cardPropertyNames = Object.keys(frequencyDataSuites);

    // Generate a set of properties for a new card, by using frequency data with
    // an appropriate generation function.
    let generatedProperties = {};

    cardPropertyNames.forEach(
        propertyName => {
            const propGenerationSettings = SETTINGS.propertyGeneration[propertyName];

            log('----------------');
            log(`Generating ${propertyName} property`);
            log('----------------');

            const dataSuite = frequencyDataSuites[propertyName];
            const depth = propGenerationSettings.depth;

            generatedProperties[propertyName] = window[propGenerationSettings.generator](
                dataSuite,
                depth
            );
        }
    );

    // Copy the generated properties onto a new card. At this point, we'll do a
    // few checks to at least make sure the card uses appropriate properties if
    // it's managed to create a meaningful supertype (ie. only Creatures should
    // have a power/toughness, Instants generally shouldn't have a subtype,
    // etc).
    const generatedCard = {};
    const generatedPropertyNames = Object.keys(generatedProperties);

    generatedPropertyNames.forEach(
        propertyName => {
            const generatedProperty = generatedProperties[propertyName];
            if (propertyName === 'pt'
                && generatedProperties['supertype'].indexOf('Creature') === -1) {
                // Only Creatures need to have a power/toughness.
                return;
            }

            if (propertyName === 'loyalty'
                && generatedProperties['supertype'].indexOf('Planeswalker') === -1) {
                // Only Planeswalkers need to have a loyalty.
                return;
            }
            generatedCard[propertyName] = generatedProperty;
        }
    );

    if (generatedCard['supertype'].indexOf('Instant') !== -1
        || generatedCard['supertype'].indexOf('Sorcery') !== -1) {
        // If the card has supertype "Instant" or "Sorcery", remove its
        // subtype. Although there are a few rare instances in Magic where an
        // Instant or Sorcery _can_ have a subtype, we won't attempt to account
        // for those.
        delete generatedCard['subtype'];
    }
    log(generatedCard);

    // Create a displayable proxy for the generated card.
    const generatedCardContainer = document.querySelector('#generatedCard');
    const generatedCardElement = generateProxyElement(
        generatedCard,
        global.dimensions.standardCard.px.width
    );

    // Display the generated card.
    generatedCardContainer.appendChild(generatedCardElement);
}

// Card property generation functions.

/**
 * Generate a card name. We apply a special check to this: It's possible (and
 * surprisingly likely) for RoboFoME to generate a name that is exactly the
 * same as an existing card, which is unsatisfying. To prevent this, we just
 * keep generating card names and checking them until we've made one that
 * doesn't already exist.
 *
 * @param object frequencyDataSuite
 * @return string
 */
function generateCardName(frequencyDataSuite) {
    var cardNames = [];
    for (var i=0; i < FICG_CARDS.length; i++) {
        var card = FICG_CARDS[i];
        if (card.name !== undefined) {
            cardNames.push(card.name);
        }
    }

    var cardName = undefined;
    do {
        cardName = generateCardProperty(
            frequencyDataSuite,
            frequencyDataSuite.frequencyTables.counts.word,
            ' ',
            1.5,
            {
                'general': 1,
                'end': 3,
                'endReversed': 3,
            }
        );
    } while (cardName === undefined || cardNames.indexOf(cardName) !== -1);

    return cardName;
}
function generateCardText(frequencyDataSuite) {
    return generateCardProperty(
        frequencyDataSuite,
        frequencyDataSuite.frequencyTables.counts.word,
        ' ',
        1.5,
        {
            'general': 3,
            'end': 3,
            'endReversed': 5,
        }
    );
    //return generateCardProperty(frequencyDataSuite, frequencyDataSuite.frequencyTables.counts.paragraph, '\n\n', 1.5);
}
function generateCardFlavorText(frequencyDataSuite) {
    return generateCardProperty(
        frequencyDataSuite,
        frequencyDataSuite.frequencyTables.counts.word,
        ' ',
        1.5,
        {
            'general': 3,
            'end': 3,
            'endReversed': 5,
        }
    );
}
function generateCardSupertype(frequencyDataSuite) {
    // We make the supertype (and subtype) generation very generous, allowing
    // it to make predictions even from a single character if it has to. We
    // don't want to make things too difficult for the supertype and subtype
    // generation because it already has to deal with a much-reduced frequency
    // set (supertypes, for example, follow simple patterns from which they
    // rarely deviate) and thus we want to avoid the kind of situation where it
    // has to wildly guess.
    return generateCardProperty(
        frequencyDataSuite,
        frequencyDataSuite.frequencyTables.counts.word,
        ' ',
        1.5,
        {
            'general': 1,
            'end': 1,
            'endReversed': 1,
        }
    );
}
function generateCardSubtype(frequencyDataSuite) {
    return generateCardProperty(
        frequencyDataSuite,
        frequencyDataSuite.frequencyTables.counts.word,
        ' ',
        1.5,
        {
            'general': 1,
            'end': 1,
            'endReversed': 1,
        }
    );
}
function generateCardCost(frequencyDataSuite) {
    return generateCardProperty(
        frequencyDataSuite,
        frequencyDataSuite.frequencyTables.counts.character,
        undefined,
        1.5,
        {
            'general': 1,
            'end': 1,
            'endReversed': 1,
        }
    );
}
function generateCardPt(frequencyDataSuite) {
    return generateCardProperty(
        frequencyDataSuite,
        frequencyDataSuite.frequencyTables.counts.character,
        undefined,
        1.5,
        {
            'general': 1,
            'end': 1,
            'endReversed': 1,
        }
    );
}
function generateCardLoyalty(frequencyDataSuite) {
    return generateCardProperty(
        frequencyDataSuite,
        frequencyDataSuite.frequencyTables.counts.character,
        undefined,
        1.5,
        {
            'general': 1,
            'end': 1,
            'endReversed': 1,
        }
    );
}

/**
 * Generates a card property based on supplied frequency data.
 *
 * `frequencyDataSuite`: A suite of frequency data containing, among other
 * things, the trees which hold symbol frequencies.
 *
 * `blockCountsFrequencyTable`: A frequency table which holds frequencies for
 * how many times a certain class of block is known to occur in the corpus.
 * "block" in this case is an abstract way to refer to a unit of text; we
 * essentially mean something like "word" or "paragraph". We use this frequency
 * data to help the algorithm decide how long to make the text.
 *
 * `blockSeparator`: A string which is known to separate blocks. The algorithm
 * needs to know this in order to know what we actually mean by "block". If
 * left undefined, the algorithm will assume that each character is a block,
 * and will thus end once it has decided that enough characters have been
 * generated.
 *
 * `endingThresholdFactor`: After a certain number of blocks have been
 * generated (`maxBlocks`), the algorithm will go into "attempt ending" mode,
 * which means that it is now trying to end the text as smoothly as possible
 * (using the frequency data that it has on likely text endings). We give it a
 * certain number of additional blocks in which to attempt to do this, and that
 * number is determined by the `endingThresholdFactor`. A value of 1.5, for
 * example, means that we allow the generation to continue on for half as many
 * blocks as have already been generated (ie. if 10 blocks were generated, we
 * let it continue for an extra 5) in the hopes that it will be able to find a
 * viable ending for the text. If it still can't properly end the text after
 * that, we just have to end the generation there.
 *
 * `lookbackThresholds`: In the event that this algorithm is unable to
 * recommend a likely next character (for example, if it's an unusual sequence
 * that the frequency data doesn't have any record of), it will try shortening
 * the character sequence that it's attempting to predict for, which is more
 * likely to yield results. We want to set limits on how short the sequence
 * will go, though; too short, and the algorithm won't be using enough data to
 * make a reasonable prediction (that is, it won't be looking back far enough).
 * The amount that we want to look back will generally depend on where in the
 * sequence the generated character is, so we need to provide a set of
 * thresholds for start characters, general characters, and end characters.
 */
function generateCardProperty(
    frequencyDataSuite,
    blockCountsFrequencyTable,
    blockSeparator,
    endingThresholdFactor,
    lookbackThresholds
) {
    var maxBlocks = weightedRandomSelect(blockCountsFrequencyTable);
////////
    var blockSeparatorDescription = 'character';
    if (blockSeparator === ' ') {
        blockSeparatorDescription = 'word';
    }
    if (blockSeparator === '\n\n') {
        blockSeparatorDescription = 'paragraph';
    }
    log('Generating '+maxBlocks+' '+blockSeparatorDescription+'s');
////////

    var generatedText = '';
    var characterCount = 0;
    var blockCount = 0;

    // Prepare a set of alphabetic characters for situations where we just have
    // to randomly choose a character.
    var alphabet = 'abcdefghjiklmnopqrstuvwxyz';

    // If the `attemptEnding` flag is true, the generation loop will start
    // trying to find ways to smoothly end the text.
    var attemptEnding = false;

    if (endingThresholdFactor === undefined) {
        // If an ending threshold wasn't given, set it to 1 (ie. the algorithm
        // won't give any leeway for finding an ending; it will just stop dead
        // as soon as we exceed the block limit).
        endingThresholdFactor = 1;
    }

    // MAIN GENERATION LOOP
    while (true) {
        // Get the last characters that were generated, up to the depth that
        // the frequency data can cover. Using these,
        // we'll try to make a prediction about what character should come next.
        var lastCharacters = generatedText.substr(0 - frequencyDataSuite.depth);

        var nextCharacterSuggestions = undefined;
        // By default, use the general frequency tree for prediction.
        var frequencyTreeToUse = 'general';

        if (characterCount < frequencyDataSuite.depth) {
            // For the first few characters generated, we'll take suggestions
            // from our start frequency tree, as that was generated using only
            // characters that are known to occur at the beginning of text.
            frequencyTreeToUse = 'start';
        }

        if (attemptEnding) {
            // If we've been instructed to try to end the text, we enter a new
            // mode where we scan the end of the current text for character
            // sequences that we know can appear at the end. If we find one,
            // then we know it's safe to end the text here. We do this check
            // first, before we try any actual prediction, since it's possible
            // we may already be able to end the text at this point.

            // Remember that the ending frequency tree enters its characters in
            // reverse order, so we'll have to reverse our characters too to
            // perform this lookup.

            var attemptEndingCharacters = reverseString(lastCharacters);

            var endFrequencyNode = undefined;

            while (endFrequencyNode === undefined && attemptEndingCharacters.length >= lookbackThresholds.endReversed) {
                log('Checking "'+reverseString(attemptEndingCharacters)+'" for ending plausibility.');
                var endFrequencyNode = traverseFrequencyTree(
                    frequencyDataSuite.frequencyTrees.endReversed,
                    attemptEndingCharacters
                );
                if (endFrequencyNode !== undefined) {
                    break;
                }

                // If the ending characters didn't look like a plausible
                // ending, try shortening the scan (eg. instead of the last 6
                // characters, try the last 5). Don't forget that the
                // `attemptEndingCharacters` sequence is reversed (so we
                // subtract one character from the end, not the start).
                attemptEndingCharacters = attemptEndingCharacters.substr(0, attemptEndingCharacters.length - 1);
            }
    
            if (endFrequencyNode !== undefined) {
                log('Plausible ending detected ("'+reverseString(attemptEndingCharacters)+'"). Ending text after '+blockCount+' blocks');
                break;
            }
            log('No plausible ending found for "'+lastCharacters+'"');
            // If our scan determined that this isn't a suitable place to end
            // the text, we'll switch on to using the ending frequencies free
            // (for forward prediction) so that the generator can at least try
            // to make reasonable guesses as to what characters might end the
            // text.
            frequencyTreeToUse = 'end';
        }

        // Whichever frequency tree we're using, try to obtain some suggestions
        // for the next character, reducing the character sequence if necessary
        // to obtain results. We change our approach slightly depending on
        // where in the generated text the character is (start, general, end).

        lookbackThreshold = lookbackThresholds[frequencyTreeToUse];

        switch (frequencyTreeToUse) {
            case 'start':
                // We don't use any lookback scanning for characters at the
                // start; after all, when the algorithm starts, there aren't
                // any characters to look back _through_. We'll just take the
                // first suggestion that the start frequency tree gives us.
                nextCharacterSuggestions = getNextCharacterSuggestions(
                    lastCharacters,
                    frequencyDataSuite.frequencyTrees[frequencyTreeToUse]
                );
                break;
            case 'general':
                // In the general case (ie. just a regular character that could
                // occur anywhere in the body of the text), we just take
                // suggestions from the tree, shortening the character sequence
                // as needed if we can't find a match for a longer sequence.
                while (nextCharacterSuggestions === undefined && lastCharacters.length >= lookbackThreshold) {
                    nextCharacterSuggestions = getNextCharacterSuggestions(
                        lastCharacters,
                        frequencyDataSuite.frequencyTrees[frequencyTreeToUse]
                    );

                    if (nextCharacterSuggestions === undefined) {
                        lastCharacters = lastCharacters.substr(1);
                    }
                }
                break;
            case 'end':
                // The ending case (a character that we think should appear
                // toward the end of text) is similar to the general case. We
                // use the ending frequency tree (the forward predicting one),
                // shorten our sequence if needed to try to yield a prediction;
                // but, if that doesn't work and no prediction is forthcoming,
                // we fall back to the general frequencies tree and allow it to
                // have another try at predicting. That way, at least we get a
                // plausible next character, even if it doesn't help us to end
                // the text.
                while (nextCharacterSuggestions === undefined && lastCharacters.length >= lookbackThreshold) {
                    nextCharacterSuggestions = getNextCharacterSuggestions(
                        lastCharacters,
                        frequencyDataSuite.frequencyTrees[frequencyTreeToUse]
                    );

                    if (nextCharacterSuggestions === undefined) {
                        lastCharacters = lastCharacters.substr(1);
                    }

                    if (frequencyTreeToUse === 'end' && nextCharacterSuggestions === undefined && lastCharacters.length < lookbackThreshold) {
                        // Fall back to the general frequency tree, and have
                        // another try at predicting the next character.
                        frequencyTreeToUse = 'general';
                        lookbackThreshold = lookbackThresholds['general'];
                        lastCharacters = generatedText.substr(0 - frequencyDataSuite.depth);
                        log('Unable to end the text, and unable to predict a reasonable ending character. Falling back to '+frequencyTreeToUse+' frequency tree.');
                    }
                }
                break;
        }

        // If we still haven't managed to obtain any suggestions for the next
        // character, we'll try one emergency measure; try to see if this is a
        // reasonable place to end the text (even if we're not in attemptEnding
        // mode.  We can determine this by checking our ending frequencies
        // tree. We want to use as many characters as we can for that search,
        // as we do need to be absolutely sure that the text can end here.
        //
        // This emergency measure helps us out in situations where the corpus
        // contains very short, similar pieces of text, such as the supertype
        // (which is nearly always a short word like "Creature" or "Instant").
        // In such situations, the generator will find it quite difficult to
        // continue the text after a certain point, as there just isn't a lot
        // of frequency data to work with; but we can give it this out to allow
        // it to end after it's produced something meaningful.
        if (nextCharacterSuggestions === undefined) {
            log('No next character suggestions. Traversing tree for "'+generatedText.substr(0 - frequencyDataSuite.depth)+'"');
            if (
                traverseFrequencyTree(
                    frequencyDataSuite.frequencyTrees.endReversed,
                    reverseString(generatedText.substr(0 - frequencyDataSuite.depth))
                ) !== undefined
            ) {
                log('Unable to predict next character, but it is possible to end the text here. Ending text generation.');
                break;
            }
        }

        // If we _still_ don't have any suggestions for the next character,
        // we're out of options at this point, so we'll just suggest a random
        // alphabet character and hope for the best.
        if (nextCharacterSuggestions === undefined) {
            var randomAlphabetCharacter = alphabet.substr(rnd(alphabet.length), 1);
            log('Unable to predict next character. Randomly selecting "'+randomAlphabetCharacter+'".');
            nextCharacterSuggestions = {};
            nextCharacterSuggestions[randomAlphabetCharacter] = 1;
        }

        // Choose the next character from the table of suggestions, and add it
        // to the generated text.
        var suggestedNextCharacter = weightedRandomSelect(nextCharacterSuggestions);

        generatedText += suggestedNextCharacter;

        // Increase the block count (so that we can keep track of how much text
        // we've generated so far, and thus make decisions on when it's
        // appropriate to stop generating).
        if (blockSeparator === undefined) {
            // If no block separator was specified, then we assume that each
            // individual character is a block, so we just increment the block
            // count every time.
            blockCount++;
        }
        else {
            // A block separator was specified, so we increase the block count
            // only if we detect that we've just passed such a separator.
            if (generatedText.substr(0 - blockSeparator.length) === blockSeparator) {
                blockCount++;
            }
        }

        characterCount++;

        if (blockCount >= maxBlocks && !attemptEnding) {
            // The block count has exceeded the limit, so we instruct the
            // algorithm to start trying to end this as quickly as possible.
            log('The block count has reached '+blockCount+'. Attempting to end the text.');
            attemptEnding = true;

            // Since we've only just passed the limit, that means that the last
            // characters in the generated text so far must be the block
            // separator (if there is one). We'll actually backtrack a bit by
            // removing that separator.  The reason for this is that if we
            // retain the separator, the algorithm will almost certainly have
            // to generate at least one whole extra block after this, whereas
            // if we remove it, it might be possible for the algorithm to end
            // the text immediately, which is the most desirable outcome. This
            // makes a difference for text that consists of just a few
            // well-defined words, like the supertype or subtype.
            if (blockSeparator) {
                generatedText = generatedText.substr(0, generatedText.length-blockSeparator.length);
            }
        }

        if (blockCount > maxBlocks * endingThresholdFactor && attemptEnding) {
            log('The block count exceeded '+(maxBlocks * endingThresholdFactor)+'. Forcing end of text.');
            break;
        }
    } // END OF MAIN GENERATION LOOP

    // We should now have our complete generated text. However, if we specified
    // a particular block separator, then it's likely that the generated text
    // has that separator attached to the end. (This happens because the
    // generation loop is counting these separators as the text is generated to
    // know when to end generation; once the count reaches a certain value, the
    // loop will end, which implies that the last added characters will be the
    // separator that it just counted).
    //
    // In general, we don't want the block separator on the end; it's usually
    // whitespace that we're not interested in.  So, at this point, we'll
    // remove the separator if it's there.
    //
    // Note that it is possible for some special situations to terminate the
    // loop _early_, which bypasses the separator count. That's why we can't
    // absolutely guarantee that the generated text ends with a block
    // separator; we have to check to be sure.
    if (blockSeparator !== undefined) {
        if (generatedText.substr(0 - blockSeparator.length) === blockSeparator) {
            // The text does end in the block separator, so remove it.
            generatedText = generatedText.substr(0, generatedText.length - blockSeparator.length);
        }
    }

    return generatedText;
}

/**
 * Given a sequence of characters and a tree of character frequency data, offer
 * a reasonable suggestion for the next character in the sequence.
 */
function getNextCharacterSuggestions(characterSequence, frequencyTree) {
    // Traverse the frequency tree to find the node corresponding to the character sequence.
    var frequencyNode = traverseFrequencyTree(frequencyTree, characterSequence);
    var frequencyTable = undefined;

    if (frequencyNode !== undefined) {
        // The node's children essentially form a frequency table of next
        // characters. We can now use that to inform our decision as to what
        // the next character should be. We do this by selecting randomly from
        // the set of possible characters, with the selection weighted by
        // frequency.
        var nextCharacters = Object.keys(frequencyNode.children);
        if (nextCharacters.length > 0) {
            frequencyTable = {};
            for (var i=0; i < nextCharacters.length; i++) {
                var nextCharacter = nextCharacters[i];
                var childNode = frequencyNode.children[nextCharacter];
                frequencyTable[childNode.symbol] = childNode.value;
            
            }
        }
    }
    return frequencyTable;
}

/**
 * Given a frequency table (an object mapping strings to frequencies), randomly
 * select a string from the table, weighted by its frequency.
 */
function weightedRandomSelect(frequencyTable) {
    var symbols = Object.keys(frequencyTable);
    // Sum all the frequencies.
    var frequencySum = 0;
    for (var i=0; i < symbols.length; i++) {
        var symbol = symbols[i];
        frequencySum += frequencyTable[symbol];
    }

    // Randomly select a point within the sum of frequencies.
    var randomNumber = rnd(frequencySum);

    // Sum the frequencies again, but this time, stop adding them up when the
    // total surpasses the randomly-selected number.
    var cumulativeSum = 0;
    for (var i=0; i < symbols.length; i++) {
        var symbol = symbols[i];
        cumulativeSum += frequencyTable[symbol];
        if (cumulativeSum > randomNumber) {
            // Whichever symbol caused that to happen, return it.
            return symbol;
        }
    }
    return undefined;
}

/**
 * Traverses a frequency tree by travelling through the nodes corresponding to
 * the characters of the string `string`.  This is also a way to check if the
 * tree contains a particular string or not; if it doesn't, the function will
 * return undefined for that string.
 */
function traverseFrequencyTree(frequencyTree, string) {
    // If string is zero-length, just return the tree itself.
    if (string.length === 0) {
        return frequencyTree;
    }

    // Take the first character of the string.
    var firstCharacter = string.substr(0, 1);

    // If this character isn't even in the tree, there's no prediction that can
    // be made, so return undefined.
    if (frequencyTree.children[firstCharacter] === undefined) {
        return undefined;
    }

    // Otherwise, recursively traverse the tree to that character's node.
    remainingCharacters = string.substr(1);
    return traverseFrequencyTree(frequencyTree.children[firstCharacter], remainingCharacters);
}

function rnd(max) {
    return Math.floor(Math.random() * max);
}

/**
 * A wrapper around `log` so that we can switch off the output with a single
 * boolean if needed.
 */
function log(object) {
    if (showLogMessages) {
        console.log(object);
    }
}

// To prevent the browser from hanging while all the intensive frequency
// analysis is going on, we offload the processing onto a web worker, so that
// it's done in the background. The worker will send back status updates to let
// us know how it's progressing with the analysis, and eventually will return
// the frequency data so that we can start generating cards.
const worker = new Worker('js/roboFoME_worker.js');

// Create a message handler to receive messages from the web worker and act on
// them appropriately.
worker.addEventListener('message', handleWorkerMessage, false);

/**
 * Conveniently, since we already have a progress bar for the frequency data
 * analysis, we can hijack it for the initial card loading as well, just to
 * indicate that something is happening.
 */
const cardsLoadProgress = function cardsLoadProgress(bytesRead, contentLength) {
    const progressPercentage = Math.floor((bytesRead / contentLength) * 100);
    elements.progressBar.style.width = progressPercentage + '%';
    elements.statusMessage.innerHTML = `Loading FICG cards (${progressPercentage}%)...`;
};

const initialize = async function initialize() {
    FICG_CARDS = await loadCards('/data/json/ficg_cards.json', cardsLoadProgress);

    // Now that the cards have been loaded, include these in the generation
    // settings so that the worker has some data to process.
    SETTINGS.cards = FICG_CARDS;

    // Post the generation settings to the worker, so that it can start
    // collecting and analysing frequency data.
    worker.postMessage(SETTINGS);

    // Overwrite what is being copied to the clipboard.
    const html = document.querySelector('html');
    html.addEventListener('copy', copyHandler);
};

window.onload = initialize;
