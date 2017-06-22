window.onload = initialize;
function initialize() {
    global.urlParameters = getUrlParameters();

    if (!global.urlParameters.noSort) {
        // Sort the cards alphabetically by name.
        MISC_CARDS = sortByProperties(MISC_CARDS, ['name'], true);
    }
    for (var i=0; i < MISC_CARDS.length; i++) {
        MISC_CARDS[i].derivedProperties = getDerivedCardProperties(MISC_CARDS[i]);
        MISC_CARDS[i].hash = MISC_CARDS[i].derivedProperties.hash;
    }

    var cardsToDisplay = MISC_CARDS;

    // If a `hash` parameter is passed in the URL, display only the card that matches that hash.
    if (Object.keys(global.urlParameters).length > 0) {
        if (global.urlParameters.hash !== undefined) {
            cardsToDisplay = getCardsFilteredByProperties(MISC_CARDS, { 'hash': global.urlParameters.hash } );
            // Also hide the title and intro.
            document.querySelector('#miscCardsHeader').style.display = 'none';
        }
    }

    var propertiesToDisplay = global.lists.cardPropertiesToDisplay;
    propertiesToDisplay = propertiesToDisplay.concat(
        [
            'notes',
            'sourceUrl',
            'createdAt',
        ]
    );
    var containerElement = document.querySelector('#container');
    containerElement.appendChild(generateCardTableElement(cardsToDisplay, propertiesToDisplay));
}
