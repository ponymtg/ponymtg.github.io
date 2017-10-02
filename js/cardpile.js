// This script isn't part of PonyMTG proper, and could be used separately if needed. It generates a banner for the
// "Plainswalkers" Fimfiction group, using randomized card selections. It's only here because I originally plugged it
// into PonyMTG's image data before deciding to use actual Magic cards.

window.onload = initialize;

var cardpileGlobal = {
    'numberOfCards': 32,
    'elements': {
        'container': document.querySelector('#container')
    },
    'cardImageBaseUrl': 'https://image.deckbrew.com/mtg/multiverseid',
    'dimensions': {
        'card': {
            'px': {
                'width': 223,
                'height': 311,
            },
        },
        'container': {
            'px': {
                'width': 1000,
                'height': 250,
            }
        }
    },
}

function initialize() {
    var cardImageIds = DECKBREW_IMAGE_IDS;
    var selectedImageIds = [];

    for (var i=0; i < cardpileGlobal.numberOfCards; i++) {
        var randomIndex = rnd(cardImageIds.length);
        selectedImageIds.push(cardImageIds[randomIndex]);
    }

    for (var i=0; i < selectedImageIds.length; i++) {
        var cardImageId = selectedImageIds[i];
        var cardImage = document.createElement('img');
        var cardImageUrl = cardpileGlobal.cardImageBaseUrl+'/'+cardImageId+'.jpg';
        //var cardImageUrl = cardImageUrls[cardImageId];
        cardImage.src = cardImageUrl;
        cardImage.style.position = 'absolute';
        cardImage.style.width = cardpileGlobal.dimensions.card.px.width+'px';
        cardImage.style.left = (0 - (cardpileGlobal.dimensions.card.px.width/2))+'px';
        cardImage.style.top = (0 - (cardpileGlobal.dimensions.card.px.height/2))+(cardpileGlobal.dimensions.container.px.height / 2)+'px';
        var rotationMaxAmount = (i / cardpileGlobal.numberOfCards) * 90;
        var rotateAngle = rnd(360);
        var spinAngle = rnd(360);
        var revolveAngle = rnd(45) - (45/2);
        var overallScale = 0.75;
        var translateXDist = 0;
        translateXDist += rnd(cardpileGlobal.dimensions.container.px.width);
        //var translateYDist = (rnd(cardpileGlobal.dimensions.container.px.height) - (cardpileGlobal.dimensions.container.px.height / 2)) * (translateXDist / cardpileGlobal.dimensions.container.px.width);
        var translateYDist = (rnd(cardpileGlobal.dimensions.container.px.height) - (cardpileGlobal.dimensions.container.px.height / 2));
        var minScaleCoefficient = (1 - (translateXDist / cardpileGlobal.dimensions.container.px.width)) * overallScale;
        var maxScaleCoefficient = (1 - (translateXDist / cardpileGlobal.dimensions.container.px.width)) * overallScale;
        var scaleCoefficient = minScaleCoefficient + (Math.random() * (maxScaleCoefficient - minScaleCoefficient));

        // Simulated depth-of-field; the closer the card is to maximum size (which we interpret to mean "nearer to the
        // camera"), the more blurred it is.
        var maxBlurAmount = 2;
        var blurAmount = maxBlurAmount * (scaleCoefficient / overallScale);

        var maxShadowDepth = 16;
        var shadowDepth = maxShadowDepth * (scaleCoefficient / overallScale);
        cardImage.style.transform = 'rotate('+revolveAngle+'deg) translateX('+translateXDist+'px) translateY('+translateYDist+'px) scale('+scaleCoefficient+') rotate('+spinAngle+'deg)';
        cardImage.style.filter = 'drop-shadow('+shadowDepth+'px '+shadowDepth+'px '+shadowDepth+'px rgba(0,0,0,0.5))'; //blur('+blurAmount+'px)';
        cardImage.style.zIndex = Math.floor(scaleCoefficient * 1000);
        cardpileGlobal.elements.container.appendChild(cardImage);
    }

    var ponyImage = document.createElement('img');
    ponyImage.src = 'images/vectors/twilight_flying.png';
    ponyImage.style.width  = '500px';
    ponyImage.style.left  = '0px';
    ponyImage.style.top  = '0px';
    ponyImage.style.zIndex  = '500';
    ponyImage.style.position = 'absolute';
    ponyImage.style.transform = 'translateY(-30px) translateX(400px) scale(0.75) scaleX(-1)';
    cardpileGlobal.elements.container.appendChild(ponyImage);

    cardpileGlobal.elements.container.style.backgroundImage = 'url("images/backgrounds/blue_starfield_dark.png")';
    cardpileGlobal.elements.container.style.backgroundPosition = 'center';
}

function getCardImageUrls(cards) {
    var cardImageUrls = [];
    for (var i=0; i < cards.length; i++) {
        var card = cards[i];
        if (card.image !== undefined && card.set !== undefined) {
            var cardImageUrl = global.paths.sets+'/'+SETS[card.set].path+'/'+card.image;
            cardImageUrls.push(cardImageUrl);
        }
    }
    return cardImageUrls;
}
