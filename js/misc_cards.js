const initialize = async function initialize() {
    let miscCards = await loadCards(global.urls.cards.misc);
    global.urlParameters = getUrlParameters();

    if (!global.urlParameters.noSort) {
        // Sort the cards alphabetically by name.
        miscCards = sortByProperties(miscCards, ['name'], true);
    }
    for (var i=0; i < miscCards.length; i++) {
        miscCards[i].derivedProperties = getDerivedCardProperties(miscCards[i]);
        miscCards[i].hash = miscCards[i].derivedProperties.hash;
    }

    var cardsToDisplay = miscCards;

    // If a `hash` parameter is passed in the URL, display only the card that matches that hash.
    if (Object.keys(global.urlParameters).length > 0) {
        if (global.urlParameters.hash !== undefined) {
            cardsToDisplay = getCardsFilteredByProperties(miscCards, { 'hash': global.urlParameters.hash } );
            // Also hide the title and intro.
            document.querySelector('#miscCardsHeader').style.display = 'none';
        }
    }

    var propertiesToDisplay = global.lists.cardPropertiesToDisplay;
    var containerElement = document.querySelector('#container');
    containerElement.appendChild(generateCardTableElement(cardsToDisplay, propertiesToDisplay));
};

window.onload = initialize;
