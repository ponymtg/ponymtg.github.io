window.onload = initialize;
function initialize() {
    CARDS = CARDS.concat(FICG_CARDS);
    CARDS = CARDS.concat(IPU_CARDS);

    var boosterPackImageContainerElement = document.querySelector('#boosterPackImageContainer');
    var promptContainerElement = document.querySelector('#promptContainer');
    var containerElement = document.querySelector('#container');
    global.elements.boosterPackCards = document.querySelector('#boosterPackCards');

    var boosterPackImageElement = document.createElement('img');
    boosterPackImageElement.id = 'boosterPackImage';
    boosterPackImageElement.style.width = global.dimensions.displayCard.width*1.25+'px';
    boosterPackImageElement.src = pickBoosterPackImageSrc();
    boosterPackImageElement.onclick = function() {
        var ficgCards = getCardsFilteredBySet(CARDS, ['Friendship is Card Games']);
        var filteredCards = []
        for (var i=0; i < ficgCards.length; i++) {
            // Filter out a few things that we either don't want in a booster pack, or can't yet deal with.
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
        
        var boosterPackCards = pickBoosterPackCards(filteredCards);
        setTimeout(
            function() {
                var promptTextElement = document.querySelector('#promptText');
                promptTextElement.innerHTML = 'Here\'s what was inside...';
                boosterPackImageContainerElement.parentNode.removeChild(boosterPackImageContainerElement);
                displayBoosterPackCards(boosterPackCards);

                var giveAnotherBoosterPackLink = document.createElement('a');
                giveAnotherBoosterPackLink.innerHTML = 'Get another free booster pack';
                giveAnotherBoosterPackLink.style.fontSize = '2em';
                giveAnotherBoosterPackLink.style.textAlign = 'center';
                giveAnotherBoosterPackLink.style.margin = '32px';
                giveAnotherBoosterPackLink.style.padding = '32px';
                giveAnotherBoosterPackLink.href = window.location.href;
                giveAnotherBoosterPackLink.target = '_blank';
                containerElement.appendChild(giveAnotherBoosterPackLink);
            },
            50
        );
    }
    boosterPackImageContainerElement.appendChild(boosterPackImageElement);

}

function pickBoosterPackImageSrc() {
    var boosterPackImagePath = 'images/booster_packs/ficg';

    var boosterPackImages = [
        'ficg_booster_pack_ditzy_doo.png',
        'ficg_booster_pack_pinkie_pie.png',
        'ficg_booster_pack_starlight_glimmer.png',
        'ficg_booster_pack_sunset_seraph.png',
        'ficg_booster_pack_twilight_sparkle.png',
        'ficg_booster_pack_discord.png',
        'ficg_booster_pack_filly_rainbow_dash.png',
    ];

    return boosterPackImagePath+'/'+boosterPackImages[rnd(boosterPackImages.length)];
}

/**
 */
function displayBoosterPackCards(cards) {
    // Clear existing results.
    emptyElement(global.elements.boosterPackCards);
    
    // Display the new results.

    for (var i=0; i < cards.length; i++) {
        var proxyElement = generateProxyElement(cards[i], global.dimensions.displayCard.width);
        proxyElement.style.display = 'inline-block';
        proxyElement.style.margin = '4px';
        proxyElement.style.boxShadow = '4px 4px 4px rgba(0,0,0,0.1)';
        global.elements.boosterPackCards.appendChild(proxyElement);
    }
}

function pickBoosterPackCards(cards) {
    // Since FICG doesn't have card rarities, we'll impose our own criteria to get a real booster pack kind of feel. Our
    // FICG booster packs will have the following composition:
    //
    // - 1 legendary or planeswalker card
    // - 13 random cards
    // - 1 basic land
    // - 1 token or emblem
    //
    // There is no check for repeated cards; it's possible (but unlikely) to get the same card more than once in a
    // booster pack. It's also possible to get more than one legendary or planeswalker, but only one is guaranteed.
    var boosterPackCards = [];

    for (var i=0; i < 13; i++) {
        boosterPackCards.push(cards[rnd(cards.length)]);
    }

    boosterPackCards.push(pickLegendaryOrPlaneswalkerCard(cards));

    boosterPackCards.push(FICG_BASIC_LAND_CARDS[rnd(FICG_BASIC_LAND_CARDS.length)]);

    var tokensAndEmblems = FICG_TOKENS.concat(FICG_EMBLEMS);
    boosterPackCards.push(tokensAndEmblems[rnd(tokensAndEmblems.length)]);
    return boosterPackCards;
}

function pickLegendaryOrPlaneswalkerCard(cards) {
    var legendaryOrPlaneswalkerCards = getCardsFilteredBySupertype(cards, ['Legendary', 'Planeswalker']);
    return legendaryOrPlaneswalkerCards[rnd(legendaryOrPlaneswalkerCards.length)];
}
