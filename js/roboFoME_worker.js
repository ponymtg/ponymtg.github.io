var SETTINGS = undefined;

self.addEventListener(
    'message',
    function(e) {
        // The first message posted to this worker should be an object
        // containing configuration settings. Upon receipt, the worker will
        // initialize itself and start sending back status updates, and
        // eventually, a large object containing all the frequency data that
        // the main script needs to generate cards.
        SETTINGS = e.data;
        initialize();
    },
    false
);

/**
 * To help the main script understand the context of what we post back, this
 * function wraps the message in an object and adds a `context` property so
 * that the receiver can distinguish between different types of responses and
 * take appropriate action.
 */
function postBack(messageContext, message) {
    self.postMessage(
        {
            'context': messageContext,
            'content': message,
        }
    );
}

/**
 * Posts back a status update to the main script (using the `postBack` wrapper
 * to provide context).
 */
function postBackStatus(statusString, progressPercentage) {
    postBack(
        'status',
        {
            'statusMessage': statusString,
            'progressPercentage': progressPercentage,
        }
    );
}

function initialize() {
    var cardPropertyNames = Object.keys(SETTINGS.propertyGeneration);

    // We'll be sending back reports on our status to the main script,
    // including a percentage of how far we think we are through the
    // initialization process. To estimate that, we'll divide the
    // initialization into distinct stages:
    // - compilation of the corpuses
    // - rule/flavor text detection and separation
    // - analysis of the frequency data
    var expectedNumberOfInitializationStages = 2;
    var currentInitializationStage = 0;

    // Generate the set of corpuses (the collections of text data that we'll be
    // extracting frequency data from).
    var corpuses = {};

    for (var i=0; i < cardPropertyNames.length; i++) {
        var cardPropertyName = cardPropertyNames[i];

        // Calculate how far (as a percentage) we currently are through this
        // stage of the initialization.
        var stageProgressPercentage = ((i+1) / cardPropertyNames.length) * 100;

        // Calculate how far we currently are through the overall
        // initialization process (by taking into account the progress already
        // made by previously-completed stages, if any).
        var overallProgressPercentage = Math.floor(
            (currentInitializationStage * (100 / expectedNumberOfInitializationStages))
            + (stageProgressPercentage / expectedNumberOfInitializationStages)
        );
        postBackStatus('Compiling '+cardPropertyName+' corpus', overallProgressPercentage);
        corpuses[cardPropertyName] = generateCardPropertyCorpus(SETTINGS.cards, cardPropertyName);
    }

    // With all the corpuses obtained, now produce frequency data for each one.
    var frequencyDataSuites = {};

    currentInitializationStage++;
    for (var i=0; i < cardPropertyNames.length; i++) {
        var cardPropertyName = cardPropertyNames[i];
        var propertyGenerationSettings = SETTINGS.propertyGeneration[cardPropertyName];

        var stageProgressPercentage = ((i+1) / cardPropertyNames.length) * 100;

        var overallProgressPercentage = Math.floor(
            (currentInitializationStage * (100 / expectedNumberOfInitializationStages))
            + (stageProgressPercentage / expectedNumberOfInitializationStages)
        );

        postBackStatus('Analyzing card '+cardPropertyName+' frequency data', overallProgressPercentage);
        frequencyDataSuites[cardPropertyName] = produceFrequencyDataSuite(corpuses[cardPropertyName], propertyGenerationSettings.depth);
    }

    // Having obtained all of the frequency data suites for all properties, post them back to the main script.
    postBack('frequencyData', frequencyDataSuites);
}

function generateCardPropertyCorpus(cards, propertyName) {
    var corpus = [];
    for (var i=0; i < cards.length; i++) {
        var card = cards[i];
        if (card[propertyName] !== undefined) {
            corpus.push(card[propertyName]);
        }
    }
    return corpus;
}

/**
 * Given a corpus of text, analyze it and return a collection of frequency data
 * about it. We use "corpus" in this sense to mean an array of text strings,
 * all of which may contribute to the overall frequency data. `depth` controls
 * how deep the frequency analysis will go (basically, the maximum length of
 * character runs on which we will collect frequency data).
 */
function produceFrequencyDataSuite(corpus, depth) {
    var dataSuite = {
        'depth': depth,
        'frequencyTrees': {
            'general': createFrequencyNode(),
            'start': createFrequencyNode(),
            'end': createFrequencyNode(),
            'endReversed': createFrequencyNode(),
        },
        'frequencyTables': {
            'counts': {
                'paragraph': {},
                'word': {},
                'character': {},
            },
        },
    };

    for (var i=0; i < corpus.length; i++) {
        var text = corpus[i];

        // As part of our data analysis, we'd like to break texts into
        // paragraphs and record some statistics about paragraph structure.
        var paragraphs = text.split('\n\n');

        // Record the paragraph count in a frequency table. This will allow us
        // to see what the typical length of a text is (in terms of number of
        // paragraphs).

        var paragraphCount = paragraphs.length;

        if (dataSuite.frequencyTables.counts.paragraph[paragraphCount] === undefined) {
            dataSuite.frequencyTables.counts.paragraph[paragraphCount] = 0;
        }

        dataSuite.frequencyTables.counts.paragraph[paragraphCount]++;

        // Similarly to the paragraph counts, we'd also like to record the
        // counts of how many total words there are in each text, as this will
        // allow us to decide what a reasonable length of text is.
        var words = text.split(/\s+/);
        var wordCount = words.length;

        if (dataSuite.frequencyTables.counts.word[wordCount] === undefined) {
            dataSuite.frequencyTables.counts.word[wordCount] = 0;
        }

        dataSuite.frequencyTables.counts.word[wordCount]++;

        // Also record the character counts.
        var characterCount = text.length;

        if (dataSuite.frequencyTables.counts.character[characterCount] === undefined) {
            dataSuite.frequencyTables.counts.character[characterCount] = 0;
        }

        dataSuite.frequencyTables.counts.character[characterCount]++;

        // Update the frequency trees with frequency data from this text.
        scanTextIntoFrequencyTree(text, dataSuite.frequencyTrees.general, 1, depth);

        // For the start frequency tree (the frequencies of character sequences
        // that only occur at the start of text), we specify that the scan
        // should be clamped to the start. Any character sequences that occur
        // after the start of the text will be ignored.
        scanTextIntoFrequencyTree(text, dataSuite.frequencyTrees.start, 1, depth, 'start');

        // The endings frequency tree is very similar to the start frequency
        // tree, but we do something slightly unusual: we _reverse_ the text
        // first, then clamp the scan to the start.
        //
        // This guarantees that we'll collect character sequences only from the
        // end of the text, but in reverse order (ie. ".ynop" instead of
        // "pony.". Although that seems weird, that's actually beneficial to
        // us. Remember that the tree is only storing the frequencies of
        // character sequences, so those frequencies would be the same whether
        // the sequence is forward or backward. By collecting sequences in
        // reverse like this, we can scan _backward_ from the end of text and
        // be able to confirm with complete certainty whether or not the
        // sequence we're looking at is a viable ending.
        scanTextIntoFrequencyTree(reverseString(text), dataSuite.frequencyTrees.endReversed, 1, depth, 'start');

        // For our final frequency tree, we clamp the scan to the end of the
        // text (but collect the characters in their normal forward sequence).
        // While this seems like it's ultimately the same as the "reversed
        // ending" tree we just collected, it is subtly different. Remember
        // that the reason we are building up these trees is so that we can use
        // them to predict the next character in the text that we're
        // generating. We can't do that with the "reversed" tree above (because
        // the characters are reversed; it can only predict the _previous_
        // character, which although useful in some cases, isn't really what we
        // need). So, we need to collect frequencies for character sequences
        // that we know occur at the end of the text, and which also allow us
        // to make predictions for the next character.
        scanTextIntoFrequencyTree(text.substr(0 - depth, depth), dataSuite.frequencyTrees.end, 1, depth);
    }

    return dataSuite;
}

/**
 * Given a text `text`, this function scans the range from `startIndex` to
 * `endIndex` for character runs of length at least `minRunLength` and at most
 * `maxRunLength`, and inserts them into the frequency tree `frequencyTree`.
 *
 * If `clampTo` is "start", the scan will not move along the text, but will
 * remain at the start; that is, it will only collect character runs that occur
 * at the start of the text.
 *
 * If `clampTo` is "end", then similarly the scan will not move, but will only
 * collect character runs that occur at the end of the text. Note that these
 * character sequences will be entered into the frequency tree in _reverse
 * order_ (ie.  ".pony" instead of "pony.").
 */
function scanTextIntoFrequencyTree(
    text,
    frequencyTree,
    minRunLength,
    maxRunLength,
    clampTo
) {
    for (var windowSize=maxRunLength; windowSize >= minRunLength; windowSize--) {
        // Define the index at which the window will stop sliding (ie. the
        // index where the window will have reached the end of the string and
        // can't go any further).
        for (var i=0; i <= text.length - windowSize; i++) {
            // To collect the frequency of runs of characters in the text, we
            // conceptualize a sliding "window" of characters that moves across
            // the string. The length of that window can range between
            // `minRunLength` and `maxRunLength`.
            //
            // For example, suppose we have a window of length 6, and the
            // string "Maud is best pony". As we slide the window across the
            // string, we expect to capture the following strings (surrounded
            // here in | characters for clarity):
            //
            //     |Maud i|
            //     |aud is|
            //     |ud is |
            //     |d is b|
            //     | is be|
            //     ... and so on
            //
            // In fact, we're not just sliding one window over the string;
            // we're sliding several windows of different sizes, and storing
            // the frequencies of all character sequences captured this way.
            // This will allow our predictor to be more adaptive; if it can't
            // find any frequency data for a particular character sequence, it
            // can try shorter and shorter sequences until it hopefully finds
            // one that does have some data.

            // Determine the index of the window's starting character.
            var windowStartIndex = i;
            
            // Determine the index of the window's end character.
            var windowEndIndex = (windowStartIndex + windowSize) - 1;

            if (clampTo === "end") {
                // If clamping to the end of the string was requested, then we
                // only need to capture characters from the end of the string.
                // That means that we can skip ahead if the window isn't yet at
                // the end.
                if (windowEndIndex < text.length - 1) {
                    continue;
                }
            }

            // Extract the character sequence contained inside the window.
            var characterSequence = text.substr(windowStartIndex, (windowEndIndex - windowStartIndex) + 1);

            // Insert the character sequence into the frequency tree.
            addToFrequencyTree(frequencyTree, characterSequence);

            if (clampTo === "start") {
                // If the scan is being clamped to the start, we can stop right
                // here, as we've already collected the starting character run.
                break;
            }
        }
    }
}

/**
 * Add a sequence of characters to a frequency tree. If the sequence of
 * characters has never been added before, a new node will be created;
 * otherwise, the existing node will have its frequency value incremented by
 * one.
 */
function addToFrequencyTree(tree, characterSequence) {
    if (characterSequence.length === 0) {
        // As a sanity check, don't bother taking any action if the string is zero-length.
        return;
    }

    // Take the first character of the character sequence.
    var firstCharacter = characterSequence.substr(0, 1);

    // If the root of this tree doesn't have a child node for the first character, create one.
    if (tree.children[firstCharacter] === undefined) {
        var frequencyNode = createFrequencyNode(firstCharacter);
        tree.children[firstCharacter] = frequencyNode;
    }
    
    // If the first character is the _only_ character, then there's nothing to
    // do except increase the frequency count for the relevant node.
    if (characterSequence.length === 1) {
        tree.children[firstCharacter].value++;
        return;
    }

    // If there are more characters in the sequence still to process, we can
    // now do so recursively, as the first character's node can be considered
    // to be the root of a smaller frequency tree.
    var remainingCharacters = characterSequence.substr(1);
    addToFrequencyTree(tree.children[firstCharacter], remainingCharacters);
}

/**
 * Creates and returns an object that represents a node in a frequency tree. A
 * node consists of:
 *
 * - a symbol
 * - a frequency value
 * - an array of child frequency nodes
 *
 * Assuming that the frequency tree is being generated from a single text
 * corpus, the frequency value of any given node is the number of times that
 * the string it represents appears in the corpus. The string represented by a
 * node is the string that would be obtained by tracing a path from the root
 * node, via all intervening child nodes, to that node, collecting symbols from
 * each node along the way.
 *
 * For example, if the text contains 3 instances of the character sequence
 * "pony", then the frequency tree should contain a chain of children from the
 * root like:
 *
 *     (root) -> "p" -> "o" -> "n" -> "y"
 *
 * and the node holding the "y" symbol should have a value of 3.
 */
function createFrequencyNode(symbol, value, children) {
    if (value === undefined) {
        value = 0;
    }
    if (children === undefined) {
        children = {};
    }

    return {
        'symbol': symbol,
        'value': value,
        'children': children,
    };
}

function reverseString(string) {
    var reversedString = '';
    for (var i=string.length-1; i >= 0; i--) {
        reversedString += string.substr(i, 1);
    }
    return reversedString;
}

