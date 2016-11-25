/**
 * Generates new cards by analyzing an existing set, deriving frequency data, and using it as the basis for
 * probabalistic text generation.
 */

// Define some convenient references to elements that we'd like to update.
var elementIds = [
    'statusPanel',
    'statusMessage',
    'progressBar',
];

var elements = {};

for (var i=0; i < elementIds.length; i++) {
    var elementId = elementIds[i];
    elements[elementId] = document.querySelector('#'+elementId);
}

// To prevent the browser from hanging while all the intensive frequency analysis is going on, we offload the processing
// onto a web worker, so that it's done in the background. The worker will send back status updates to let us know how
// it's progressing with the analysis, and eventually will return the frequency data so that we can start generating
// cards.

var worker = new Worker('js/roboFoME_worker.js');

// Create a message handler to receive messages from the web worker and act on them appropriately.
worker.addEventListener(
    'message',
    function(e) {
        var message = e.data;
        // All messages from the worker should be wrapped in an object which tells us the context (ie. what the message
        // is for).
        switch(message.context) {
            case 'status':
                // We expect `status` messages to contain a `statusMessage` string and a `progressPercentage` integer.
                // These will allow us to display to the user what's going on and update the progress bar.
                elements.statusMessage.innerHTML = message.content.statusMessage;
                elements.progressBar.style.width = message.content.progressPercentage+'%';
            break;
            case 'frequencyData':
                // Eventually, the worker should send back all the frequency data that we need, which is our cue to
                // generate a card.

                // The status panel isn't needed any longer, so empty it out.
                emptyElement(elements.statusPanel);
                var generateCardButton = document.createElement('button');
                var frequencyData = message.content;
                generateCardButton.id = 'generateCardButton';
                generateCardButton.className = 'btn btn-primary btn-lg';
                generateCardButton.innerHTML = 'Generate a card';
                generateCardButton.style.margin = '16px';
                generateCardButton.onclick = function(e) {
                    emptyElement(elements.generatedCard);
                    generateCard(frequencyData);
                    elements.generateCardButton.innerHTML = 'Generate another card';
                };

                elements.generateCardButton = generateCardButton;
                elements.statusPanel.appendChild(elements.generateCardButton);

                elements.generatedCard = document.createElement('div');
                elements.generatedCard.id = 'generatedCard';
                elements.statusPanel.appendChild(elements.generatedCard);

                // As a visual cue for where the generated card will be displayed, add in an empty proxy.
                var emptyCardData = {
                    'name': '&nbsp;',
                    'supertype': '&nbsp;',
                }
                var emptyProxyElement = generateProxyElement(emptyCardData, global.dimensions.standardCard.px.width);
                elements.generatedCard.appendChild(emptyProxyElement);
                
                // Clear out the innards of the proxy (even an empty one will put in some panels for the name and
                // type lines, which looks ugly; we just want the outline of the card).
                emptyElement(emptyProxyElement);

                emptyProxyText = document.createElement('div');
                emptyProxyText.style.margin = (global.dimensions.standardCard.px.height / 2)+' auto 0 auto';
                emptyProxyText.style.fontSize = (global.dimensions.standardCard.px.width * 0.75)+'px';
                emptyProxyText.innerHTML = '?';

                emptyProxyElement.appendChild(emptyProxyText);

                
            break;
        }
    },
    false
);

// Define the generation settings. We generate each property of the card separately, by collecting frequency data for
// that property from the corpus and applying an appropriate generation algorithm. `depth` is a parameter which controls
// how deep the frequency data collection will go; greater depths are more accurate but take longer to collect. For some
// properties, it's appropriate to go a bit deeper.
var SETTINGS = {
    'cards': FICG_CARDS,
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

// Post the generation settings to the worker, so that it can start collecting and analysing frequency data.
worker.postMessage(SETTINGS);

function generateCard(frequencyDataSuites) {
    console.log(frequencyDataSuites);
    var cardPropertyNames = Object.keys(frequencyDataSuites);

    // Generate a set of properties for a new card, by using frequency data with an appropriate generation function.
    var generatedProperties = {};

    for (var i=0; i < cardPropertyNames.length; i++) {
        var cardPropertyName = cardPropertyNames[i];
        var propertyGenerationSettings = SETTINGS.propertyGeneration[cardPropertyName];
        console.log('Generating '+cardPropertyName+' property');
        generatedProperties[cardPropertyName] = window[propertyGenerationSettings.generator](frequencyDataSuites[cardPropertyName], propertyGenerationSettings.depth);
    }

    // Copy the generated properties onto a new card. At this point, we'll do a few checks to at least make sure the
    // card uses appropriate properties if it's managed to create a meaningful supertype (ie. only Creatures should have
    // a power/toughness, Instants generally shouldn't have a subtype, etc).
    var generatedCard = {};
    var generatedPropertyNames = Object.keys(generatedProperties);
    for (var i=0; i < generatedPropertyNames.length; i++) {
        var generatedPropertyName = generatedPropertyNames[i];
        var generatedProperty = generatedProperties[generatedPropertyName];
        if (generatedPropertyName === 'pt' && generatedProperties['supertype'].indexOf('Creature') === -1) {
            // Only Creatures need to have a power/toughness.
            continue;
        }
        if (generatedPropertyName === 'loyalty' && generatedProperties['supertype'].indexOf('Planeswalker') === -1) {
            // Only Planeswalkers need to have a loyalty.
            continue;
        }
        generatedCard[generatedPropertyName] = generatedProperty;
    }
    if (generatedCard['supertype'].indexOf('Instant') !== -1
        || generatedCard['supertype'].indexOf('Sorcery') !== -1) {
        // If the card has supertype "Instant" or "Sorcery", remove its subtype. Although there are a few rare instances
        // in Magic where an Instant or Sorcery _can_ have a subtype, we won't attempt to account for those.
        delete generatedCard['subtype'];
    }
    console.log(generatedCard);

    // Create a displayable proxy for the generated card.
    var generatedCardContainer = document.querySelector('#generatedCard');
    var generatedCardElement = generateProxyElement(generatedCard, global.dimensions.standardCard.px.width);

    // Display the generated card.
    generatedCardContainer.appendChild(generatedCardElement);
}

/**
 * Card property generation functions. These are all very similar and tend to differ only in the type of block that we
 * consider important for each property; as an example, for card text we're interested in paragraphs, but for card names
 * we're interested in words.
 */
function generateCardName(frequencyDataSuite) {
    return generateCardProperty(frequencyDataSuite, frequencyDataSuite.frequencyTables.word.counts, ' ');
}
function generateCardText(frequencyDataSuite) {
    return generateCardProperty(frequencyDataSuite, frequencyDataSuite.frequencyTables.paragraph.counts, '\n\n');
}
function generateCardFlavorText(frequencyDataSuite) {
    return generateCardProperty(frequencyDataSuite, frequencyDataSuite.frequencyTables.word.counts, ' ');
}
function generateCardSupertype(frequencyDataSuite) {
    return generateCardProperty(frequencyDataSuite, frequencyDataSuite.frequencyTables.word.counts, ' ');
}
function generateCardSubtype(frequencyDataSuite) {
    return generateCardProperty(frequencyDataSuite, frequencyDataSuite.frequencyTables.word.counts, ' ');
}
function generateCardCost(frequencyDataSuite) {
    return generateCardProperty(frequencyDataSuite, frequencyDataSuite.frequencyTables.character.counts);
}
function generateCardPt(frequencyDataSuite) {
    return generateCardProperty(frequencyDataSuite, frequencyDataSuite.frequencyTables.character.counts);
}
function generateCardLoyalty(frequencyDataSuite) {
    return generateCardProperty(frequencyDataSuite, frequencyDataSuite.frequencyTables.character.counts);
}

/**
 * Generates a card property based on supplied frequency data.
 *
 * `frequencyDataSuite`:        A suite of frequency data containing, among other things, the trees which hold symbol
 *                              frequencies.
 *
 * `blockCountsFrequencyTable`: A frequency table which holds frequencies for how many times a certain class of block is
 *                              known to occur in the corpus. "block" in this case is an abstract way to refer to a
 *                              unit of text; we essentially mean something like "word" or "paragraph". We use this
 *                              frequency data to help the algorithm decide how long to make the text.
 *
 * `blockSeparator`:            A string which is known to separate blocks. The algorithm needs to know this in order to
 *                              know what we actually mean by "block". If left undefined, the algorithm will assume that
 *                              each character is a block, and will thus end once it has decided that enough characters
 *                              have been generated.
 */
function generateCardProperty(frequencyDataSuite, blockCountsFrequencyTable, blockSeparator) {
    var maxBlocks = weightedRandomSelect(blockCountsFrequencyTable);
////////
    var blockSeparatorDescription = 'character';
    if (blockSeparator === ' ') {
        blockSeparatorDescription = 'word';
    }
    if (blockSeparator === '\n\n') {
        blockSeparatorDescription = 'paragraph';
    }
    //console.log('Generating '+maxBlocks+' '+blockSeparatorDescription+'s');
////////

    var generatedText = '';
    var characterCount = 0;
    var blockCount = 0;

    // In the event that this algorithm is unable to recommend a likely next character (for example, if it's an unusual
    // sequence that the frequency data doesn't have any record of), it will try shortening the character sequence that
    // it's attempting to predict for, which is more likely to yield results. We'll set a minimum threshold here for how
    // short we'll permit the character sequence to be.
    var minCharacters = 1;

    // Prepare a set of alphabetic characters for situations where we just have to randomly choose a character.
    var alphabet = 'abcdefghjiklmnopqrstuvwxyz';

    // If the `attemptEnding` flag is true, the generation loop will start trying to find ways to smoothly end the text.
    var attemptEnding = false;

    // After a certain number of blocks have been generated (`maxBlocks`), the algorithm will go into "attempt ending"
    // mode, which means that it is now trying to end the text as smoothly as possible (using the frequency data that it
    // has on likely text endings). We give it a certain number of additional blocks in which to attempt to do this,
    // and that number is determined by the `endingThresholdFactor`. A value of 1.5, for example, means that we allow
    // the generation to continue on for half as many blocks as have already been generated (ie. if 10 blocks were
    // generated, we let it continue for an extra 5) in the hopes that it will be able to find a viable ending for the
    // text. If it still can't properly end the text after that, we just have to end the generation there.
    var endingThresholdFactor = 1.5;

    //while (blockCount < maxBlocks || attemptEnding) {
    while (true) {
        // Get the last characters that were generated, up to the depth that the frequency data can cover. Using these,
        // we'll try to make a prediction about what character should come next.
        var lastCharacters = generatedText.substr(0 - frequencyDataSuite.depth);

        var nextCharacterSuggestions = undefined;
        // By default, use the general frequency tree for prediction.
        var frequencyTreeToUse = frequencyDataSuite.frequencyTrees.general;

        if (characterCount < frequencyDataSuite.depth) {
            // For the first few characters generated, we'll take suggestions from our start frequency tree, as that was
            // generated using only characters that are known to occur at the beginning of text.
            nextCharacterSuggestions = getNextCharacterSuggestions(lastCharacters, frequencyDataSuite.frequencyTrees.start);
            frequencyTreeToUse = frequencyDataSuite.frequencyTrees.start;
        }

        if (attemptEnding) {
            // If we've been instructed to try to end the text, do a bit of scanning to see if that is actually
            // possible. To determine this, we check the last few characters against our ending frequency tree to see
            // if there are any character sequences which we know can reasonably end the text. If we find any, then
            // we'll switch onto the ending tree for the last characters generated.

            // Remember that the ending frequency tree enters its characters in reverse order, so we'll have to reverse
            // our characters too to perform this lookup.
            var endFrequencyNode = traverseFrequencyTree(frequencyDataSuite.frequencyTrees.end, reverseString(lastCharacters));
            //console.log('Checking "'+lastCharacters+'" for ending plausibility.');
            if (endFrequencyNode !== undefined) {
                //console.log('Plausible ending detected ("'+lastCharacters+'"). Ending text after '+blockCount+' blocks');
                break;
            }
        }
        // Whichever frequency tree we're using, try to obtain some suggestions for the next character, reducing the
        // character sequence if necessary to obtain results.
        while (nextCharacterSuggestions === undefined && lastCharacters.length >= minCharacters) {
            nextCharacterSuggestions = getNextCharacterSuggestions(lastCharacters, frequencyTreeToUse);

            if (nextCharacterSuggestions === undefined) {
                lastCharacters = lastCharacters.substr(1);
            }
        }

        // If we still haven't managed to obtain any suggestions for the next character, we'll try one emergency
        // measure; try to see if this is a reasonable place to end the text. We can determine this by checking our
        // ending frequencies tree. We want to use as many characters as we can for that search, as we do need to be
        // very sure that the text can end here.
        //
        // This emergency measure helps us out in situations where the corpus contains very short, similar pieces of
        // text, such as the supertype (which is nearly always a short word like "Creature" or "Instant"). In such
        // situations, the generator will find it quite difficult to continue the text after a certain point, as there
        // just isn't a lot of frequency data to work with; but we can give it this out to allow it to end after it's
        // produced something meaningful.
        if (nextCharacterSuggestions === undefined) {
            //console.log('No next character suggestions. Traversing tree for "'+generatedText.substr(0 - frequencyDataSuite.depth)+'"');
            endText = traverseFrequencyTree(
                frequencyDataSuite.frequencyTrees.end,
                reverseString(generatedText.substr(0 - frequencyDataSuite.depth))
            )
            !== undefined;
            //console.log("endText = "+endText);
            break;
        }

        // If we _still_ don't have any suggestions for the next character, we're out of options at this point, so we'll
        // just suggest a random alphabet character and hope for the best.
        if (nextCharacterSuggestions === undefined) {
            var randomAlphabetCharacter = alphabet.substr(rnd(alphabet.length), 1);
            nextCharacterSuggestions = {};
            nextCharacterSuggestions[randomAlphabetCharacter] = 1;
        }

        // Choose the next character from the table of suggestions, and add it to the generated text.
        var suggestedNextCharacter = weightedRandomSelect(nextCharacterSuggestions);
        generatedText += suggestedNextCharacter;

        if (blockSeparator === undefined) {
            // If no block separator was specified, then we assume that each individual character is a block, so we just
            // increment the block count every time.
            blockCount++;
        }
        else {
            // A block separator was specified, so we increase the block count only if we detect that we've just passed
            // such a separator.
            if (generatedText.substr(0 - blockSeparator.length) === blockSeparator) {
                blockCount++;
            }
        }
        characterCount++;

        if (blockCount >= maxBlocks && !attemptEnding) {
            //console.log('The block count has reached '+blockCount+'. Attempting to end the text.');
            attemptEnding = true;
        }

        if (blockCount > maxBlocks * endingThresholdFactor && attemptEnding) {
            //console.log('The block count exceeded '+(maxBlocks * endingThresholdFactor)+'. Forcing end of text.');
            break;
        }
    }

    // We should now have our complete generated text. However, if we specified a particular block separator, then it's
    // likely that the generated text has that separator attached to the end. (This happens because the generation loop
    // is counting these separators as the text is generated to know when to end generation; once the count reaches a
    // certain value, the loop will end, which implies that the last added characters will be the separator that it just
    // counted).
    //
    // In general, we don't want the block separator on the end; it's usually whitespace that we're not interested in.
    // So, at this point, we'll remove the separator if it's there.
    //
    // Note that it is possible for some special situations to terminate the loop _early_, which bypasses the separator
    // count. That's why we can't absolutely guarantee that the generated text ends with a block separator; we have to
    // check to be sure.
    if (blockSeparator !== undefined) {
        if (generatedText.substr(0 - blockSeparator.length) === blockSeparator) {
            // The text does end in the block separator, so remove it.
            generatedText = generatedText.substr(0, generatedText.length - blockSeparator.length);
        }
    }

    // At this point, we have a text that we could return. However, there's one final thing we can do to try to improve
    // it: we can try to give it a more natural ending. The algorithm above simply stops the text after a certain number
    // of blocks, which isn't very "English" if the blocks are words; in all likelihood, the text will stop in the
    // middle of a sentence. To make it feel more natural, we can try to complete the text using the frequency data that
    // we have for the end of the text.


    return generatedText;
}

/**
 * Given a sequence of characters and a tree of character frequency data, offer a reasonable suggestion for the next
 * character in the sequence.
 */
function getNextCharacterSuggestions(characterSequence, frequencyTree) {
    // Traverse the frequency tree to find the node corresponding to the character sequence.
    var frequencyNode = traverseFrequencyTree(frequencyTree, characterSequence);
    var frequencyTable = undefined;

    if (frequencyNode !== undefined) {
        // The node's children essentially form a frequency table of next characters. We can now use that to inform our
        // decision as to what the next character should be. We do this by selecting randomly from the set of possible
        // characters, with the selection weighted by frequency.
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
 * Given a frequency table (an object mapping strings to frequencies), randomly select a string from the table, weighted
 * by its frequency.
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

    // Sum the frequencies again, but this time, stop adding them up when the total surpasses the randomly-selected
    // number.
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
 * Traverses a frequency tree by travelling through the nodes corresponding to the characters of the string `string`.
 * This is also a way to check if the tree contains a particular string or not; if it doesn't, the function will return
 * undefined for that string.
 */
function traverseFrequencyTree(frequencyTree, string) {
    // If string is zero-length, just return the tree itself.
    if (string.length === 0) {
        return frequencyTree;
    }

    // Take the first character of the string.
    var firstCharacter = string.substr(0, 1);

    // If this character isn't even in the tree, there's no prediction that can be made, so return undefined.
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
