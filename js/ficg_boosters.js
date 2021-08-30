const initialize = async function initialize() {
    CARDS = await loadCards(global.urls.cards.ficg);
    FICG_BASIC_LAND_CARDS = await loadCards('data/json/ficg_basic_land_cards.json');
    FICG_TOKENS = await loadCards('data/json/ficg_tokens.json');
    FICG_EMBLEMS = await loadCards('data/json/ficg_emblems.json');
        

    const boosterImageContainer = document.querySelector(
        '#boosterPackImageContainer'
    );

    const container = document.querySelector('#container');
    global.elements.boosterPackCards = document.querySelector(
        '#boosterPackCards'
    );

    const boosterImage = document.createElement('img');
    boosterImage.id = 'boosterPackImage';
    boosterImage.style.width = global.dimensions.displayCard.width*1.25 + 'px';
    boosterImage.src = pickFicgBoosterPackImageSrc();
    boosterImage.onclick = function() {
        const ficgCards = getCardsFilteredBySet(
            CARDS,
            ['Friendship is Card Games']
        );

        const filteredCards = []
        for (let i=0; i < ficgCards.length; i++) {
            // Filter out a few things that we either don't want in a booster
            // pack, or can't yet deal with.
            if (
                 ficgCards[i].supertype.includes('Conspiracy')
                || ficgCards[i].supertype.includes('Scheme')
                || ficgCards[i].supertype.includes('Plane')
                || ficgCards[i].transformsInto !== undefined
                || ficgCards[i].transformsFrom !== undefined) {
                continue;
            }
            filteredCards.push(ficgCards[i]);
        }
        
        const boosterPackCards = pickFicgBoosterPackCards(filteredCards);
        const promptText = document.querySelector('#promptText');
        promptText.innerHTML = 'Here\'s what was inside...';
        boosterImageContainer.parentNode.removeChild(
            boosterImageContainer
        );

        displayBoosterPackCards(boosterPackCards);

        const giveAnotherBoosterPackLink = document.createElement('a');
        giveAnotherBoosterPackLink.innerHTML = 'Get another free booster pack';
        giveAnotherBoosterPackLink.style.fontSize = '2em';
        giveAnotherBoosterPackLink.style.textAlign = 'center';
        giveAnotherBoosterPackLink.style.margin = '32px';
        giveAnotherBoosterPackLink.style.padding = '32px';
        giveAnotherBoosterPackLink.href = window.location.href;
        giveAnotherBoosterPackLink.target = '_blank';

        container.appendChild(giveAnotherBoosterPackLink);
    }

    boosterImageContainer.appendChild(boosterImage);
};

/**
 * Select a random booster pack image to display.
 */
function pickFicgBoosterPackImageSrc() {
    var boosterPackImagePath = 'images/booster_packs/ficg';

    var boosterPackImages = [
        'ficg_booster_pack_ditzy_doo.png',
        'ficg_booster_pack_pinkie_pie.png',
        'ficg_booster_pack_starlight_glimmer.png',
        'ficg_booster_pack_sunset_seraph.png',
        'ficg_booster_pack_twilight_sparkle.png',
        'ficg_booster_pack_discord.png',
        'ficg_booster_pack_filly_rainbow_dash.png',
        'ficg_booster_pack_daybreaker.png',
    ];

    return boosterPackImagePath + '/'
        + boosterPackImages[rnd(boosterPackImages.length)];
}

/**
 * Display a set of cards as proxies on screen.
 *
 * @param {Object[]} cards
 */
function displayBoosterPackCards(cards) {
    // Clear any existing cards from the screen.
    emptyElement(global.elements.boosterPackCards);
    
    // Display the new cards as proxies.
    for (var i=0; i < cards.length; i++) {
        const proxyElement = generateProxyElement(
            cards[i],
            global.dimensions.displayCard.width
        );
        proxyElement.style.display = 'inline-block';
        proxyElement.style.margin = '4px';
        proxyElement.style.boxShadow = '4px 4px 4px rgba(0,0,0,0.1)';
        global.elements.boosterPackCards.appendChild(proxyElement);
    }
}

/**
 * Given a set of card data objects, select a subset of them for a virtual
 * booster pack, taking rarity and color distribution into account. This is
 * only intended for use with the Friendship is Card Games set.
 *
 * @param {Object[]} cards
 */
function pickFicgBoosterPackCards(cards) {
    // Since FICG doesn't have card rarities, we'll impose our own criteria to
    // get a real booster pack kind of feel. Our FICG booster packs will have
    // the following composition:
    //
    // - 1 legendary or planeswalker card
    // - 13 other cards (adjusted to balance the uneven color distribution in
    //   FICG)
    // - 1 basic land
    // - 1 token or emblem
    //
    // There is no check for repeated cards; it's possible (but very unlikely)
    // to get the same card more than once in a booster pack. It's also possible
    // to get more than one legendary or planeswalker, but only one is
    // guaranteed.

    let boosterPackCards = [];

    // To balance the color distribution for the 13 "normal" cards, we'll first
    // categories the cards by color.
    const cardsByColor = {};
    cards.forEach(
        function(card) {
            let cardMonocolor = getCardMonocolor(card);
            if (cardMonocolor === undefined) {
                if (getCardColors(card).length === 0) {
                    cardMonocolor = 'colorless';
                } else {
                    return;
                }
            }

            if (cardsByColor[cardMonocolor] === undefined) {
                cardsByColor[cardMonocolor] = [];
            }
            cardsByColor[cardMonocolor].push(card);
        }
    );

    // To ensure that all colors have some representation in a booster pack,
    // we'll simply force 5 of the cards to be a specific color (and one to be
    // colorless).
    const colors = ['white', 'blue', 'black', 'red', 'green', 'colorless'];

    colors.forEach(
        function(color) {
            const colorCards = cardsByColor[color];
            boosterPackCards.push(colorCards[rnd(colorCards.length)]);
        }
    );

    // Randomly select 7 other cards and add them to the booster. These can be
    // any color.
    for (var i=0; i < 7; i++) {
        boosterPackCards.push(cards[rnd(cards.length)]);
    }

    boosterPackCards = UTIL.shuffle(boosterPackCards);

    // Add one legendary or planeswalker card.
    boosterPackCards.push(pickLegendaryOrPlaneswalkerCard(cards));

    // Add one basic land.
    boosterPackCards.push(FICG_BASIC_LAND_CARDS[rnd(FICG_BASIC_LAND_CARDS.length)]);

    // Add one token or emblem.
    const tokensAndEmblems = FICG_TOKENS.concat(FICG_EMBLEMS);
    boosterPackCards.push(tokensAndEmblems[rnd(tokensAndEmblems.length)]);

    // 1:45 is apparently the real-life foil rarity as of the 2020 MtG Core Set.
    let foilProbability = 1/45;

    // Give each card a small chance of being a foil (except tokens and emblems)
    boosterPackCards.forEach(
        function(card) {
            if (card.cardType === 'emblem') {
                return;
            }

            if (card.supertype
                && card.supertype.toLowerCase().indexOf('token') !== -1) {
                return;
            }

            if (UTIL.probability(foilProbability)) {
                card.foil = true;
            }
        }
    );

    return boosterPackCards;
}

function pickLegendaryOrPlaneswalkerCard(cards) {
    var legendaryOrPlaneswalkerCards = getCardsFilteredBySupertype(cards, ['Legendary', 'Planeswalker']);
    return legendaryOrPlaneswalkerCards[rnd(legendaryOrPlaneswalkerCards.length)];
}

window.onload = initialize;
