const initialize = async function initialize()
{
    const cards = await loadAllCards();

    // Load sets. We're not actually using this variable, but loading the sets has the side-effect of setting `global.loaded.sets`, which is used by the `getCardImageDirPath` function to find the image path for each card.
    const sets = await loadAllSets();

    global.elements.printSheetCardsContainer = document.querySelector('#printSheetCardsContainer');

    for (let i = 0; i < cards.length; i++) {
        // A little trick here: in order to be able to filter these cards by
        // their hashes (which isn't a stored property of the card, but rather,
        // a derived one), we will derive each card's hash and then add it
        // directly to the card properties.
        var derivedCardProperties = getDerivedCardProperties(cards[i]);
        cards[i].hash = derivedCardProperties.hash;
    }

    const printSheetCardHashes = getPrintSheetCards();
    let printSheetCards = getCardsFilteredByProperties(cards, {'hash': Object.keys(printSheetCardHashes)});
    printSheetCards = sortByProperties(printSheetCards, ['name', 'set'], true);
    generatePrintSheetForCards(printSheetCards, printSheetCardHashes);

}

/**
 * Generates a print sheet for the given set of cards in the print sheet cards
 * container. `hashes` is an object which maps card hashes to quantities. We
 * use this to decide how many of each card should be included in the print
 * sheet.
 */
const generatePrintSheetForCards = function generatePrintSheetForCards(cards, hashes)
{
    // Clear existing results.
    emptyElement(global.elements.printSheetCardsContainer);

    // Compute the pixel width of the card. This is where we have to be careful
    // with dimensions. We want to display these cards in standard Magic the
    // Gathering card dimensions; in real units, these are 63 x 88 millimeters.

    // Therefore, to display them, we will need to calculate how many pixels
    // that equates to. This will depend entirely on the browser or device.

    // First, obtain the pixel-to-millimeter ratio using a clever hack.
    const pxToMmRatio = getPxToMmRatio();

    // Then, use this to calculate the pixel dimensions from the known real dimensions.
    const standardCardDimensionsInPx = {
        'width': global.dimensions.standardCard.mm.width / pxToMmRatio,
        'height': global.dimensions.standardCard.mm.height / pxToMmRatio,
    };

    // Display the new results.
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const quantity = hashes[card.hash];
        if (quantity === undefined) {
            // If the card's hash isn't in our hash collection, then skip it
            // (although this shouldn't be possible).
            continue;
        }

        for (let j = 0; j < quantity; j++) {
            let cardElement = undefined;
            if (card.image !== undefined) {
                cardElement = document.createElement('img');
                cardElement.src = getCardImageUrl(card);
                cardElement.style.width = standardCardDimensionsInPx.width+'px';
            }
            else {
                cardElement = generateProxyElement(
                    cards[i],
                    standardCardDimensionsInPx.width,
                    global.values.proxyTextGenerosity.printSheet
                );
            }
            cardElement.style.display = 'inline-block';
            cardElement.style.margin = (global.dimensions.printSheet.cardSpacing / 2) + 'px';

            // The Bootstrap CSS aligns images to the middle by default, but
            // that will mess up our alignment on the print sheet (we want a
            // regular grid formation), so we align everything to the top
            // instead.
            cardElement.style.verticalAlign = 'top';
            global.elements.printSheetCardsContainer.appendChild(cardElement);
        }
    }
}

/**
 * Here's a marvellous little hack that I found on StackOverflow. We would like
 * to know how the browser or device will convert millimeters to pixels, which
 * doesn't seem to be information that's readily obtainable.
 *
 * However, we can do the following trick:
 *
 * - Create a dummy element.
 * - Give it a large dimensions in mm; say, 1000mm.
 * - Add the dummy element to the page.
 * - Ask the browser to return the pixel dimensions of the dummy element.
 * - Remove the dummy element.
 * - Divide the dimension in millimeters by the dimension in pixels.
 * - You now have the pixel-to-millimeter ratio!
 */
const getPxToMmRatio = function getPxToMmRatio()
{
    const dummyElement = document.createElement('div')
    const dummyElementHeightInMm = 1000;
    dummyElement.style.height = dummyElementHeightInMm+'mm';
    document.querySelector('body').appendChild(dummyElement);
    const dummyElementHeightInPx = dummyElement.offsetHeight;
    document.querySelector('body').removeChild(dummyElement);
    const pxToMmRatio = dummyElementHeightInMm / dummyElementHeightInPx;
    return pxToMmRatio;
}

window.onload = initialize;
