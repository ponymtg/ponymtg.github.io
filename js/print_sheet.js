window.onload = initialize;

function initialize() {
    // Prepare the cards database, which should have been loaded into a variable already in a separate script.
    // For the moment, we're keeping the Friendship is Card Games set in a separate variable for ease of updating, and
    // appending it to the main database.
    CARDS = CARDS.concat(FICG_CARDS);
    CARDS = CARDS.concat(IPU_CARDS);

    for (var i=0; i < CARDS.length; i++) {
        // A little trick here: in order to be able to filter these cards by their hashes (which isn't a stored property
        // of the card, but rather, a derived one), we will derive each card's hash and then add it directly to the card
        // properties.
        var derivedCardProperties = getDerivedCardProperties(CARDS[i]);
        CARDS[i].hash = derivedCardProperties.hash;
    }

    global.information = getInformation(CARDS);

    var addSetMenuElement = document.querySelector('#addSetMenu');
    for (var i=0; i < global.information.sets.length; i++) {
        var setName = global.information.sets[i];
        if (global.sets[setName] === undefined) {
            // If we can't find any details for a set by this name in `global.sets`, ignore it and skip to the next one.
            continue;
        }
        var setElement = document.createElement('li');
        var setElementLink = document.createElement('a');
        setElementLink.innerHTML = setName;
        setElementLink.ponymtg = {};
        setElementLink.ponymtg.setName = setName;
        setElementLink.onclick = function(e) {
            addSetToPrintSheet(e.target.ponymtg.setName);
            refreshPrintSheetTable();
        };
        setElement.appendChild(setElementLink);
        addSetMenuElement.appendChild(setElement);
    }

    var generatePrintSheetButton = document.querySelector('#generatePrintSheet');
    generatePrintSheetButton.onclick = function() {
        var generatePrintSheetUrl = 'generatePrintSheet.html';
        window.open(generatePrintSheetUrl, '_blank');

    };

    var clearPrintSheetButton = document.querySelector('#clearPrintSheet');
    clearPrintSheetButton.onclick = function(e) {
        clearPrintSheet();
        refreshPrintSheetTable();

    };

    global.elements.printSheetCardList = document.querySelector('#printSheetCardList');
    refreshPrintSheetTable();
}

function refreshPrintSheetTable() {
    emptyElement(global.elements.printSheetCardList);
    var printSheetCardHashes = getPrintSheetCards();
    var printSheetCards = getCardsFilteredByProperties(CARDS, {'hash': Object.keys(printSheetCardHashes)});
    printSheetCards = sortByProperties(printSheetCards, ['name', 'set'], true);

    var printSheetCardListTable = document.createElement('table');
    printSheetCardListTable.className = 'table table-bordered'
    var printSheetCardListTableHead = document.createElement('thead');
    var printSheetCardListTableBody = document.createElement('tbody');
    var printSheetCardHeaderRow = document.createElement('tr');
    var printSheetCardNameHeaderCell = document.createElement('th');
    var printSheetCardQuantityHeaderCell = document.createElement('th');
    var printSheetCardSetHeaderCell = document.createElement('th');
    var printSheetCardOptionsHeaderCell = document.createElement('th');

    printSheetCardNameHeaderCell.innerHTML = 'Card';
    printSheetCardQuantityHeaderCell.innerHTML = 'Quantity';
    printSheetCardSetHeaderCell.innerHTML = 'Set';
    printSheetCardOptionsHeaderCell.innerHTML = 'Options';
    printSheetCardHeaderRow.appendChild(printSheetCardNameHeaderCell);
    printSheetCardHeaderRow.appendChild(printSheetCardSetHeaderCell);
    printSheetCardHeaderRow.appendChild(printSheetCardQuantityHeaderCell);
    printSheetCardHeaderRow.appendChild(printSheetCardOptionsHeaderCell);

    printSheetCardListTableHead.appendChild(printSheetCardHeaderRow);
    printSheetCardListTable.appendChild(printSheetCardListTableHead);
    if (printSheetCards.length === 0) {
        document.querySelector('#generatePrintSheet').disabled = true;
        document.querySelector('#clearPrintSheet').disabled = true;
        var noCardsMessagePanel = document.createElement('div');
        noCardsMessagePanel.className = 'panel panel-warning';
        noCardsMessagePanel.style.width = '50%';
        noCardsMessagePanel.style.margin = '0 auto';
        var noCardsMessageHeading = document.createElement('div');
        noCardsMessageHeading.className = 'panel-heading';
        noCardsMessageHeading.innerHTML = '<span class="glyphicon glyphicon-warning-sign"></span> You haven\'t added any cards yet';
        var noCardsMessageBody = document.createElement('div');
        noCardsMessageBody.className = 'panel-body';
        noCardsMessageBody.innerHTML = 'To build a print sheet, use the <a href="index.html">search functionality</a> to find cards that you want, and press <strong>"Add to print sheet"</strong>. The cards will be here when you return to this page.<br /><br />Alternatively, if you just want to get a print sheet for every card from a particular set, use the <strong>"Add set"</strong> button above.<br /><br />When you\'ve added all the cards that you want, press <strong>"Create print sheet"</strong> to generate a printable sheet of those cards.<br /><br />Be warned that some sets contain a large number of cards, which may affect the performance of this page and the print sheet generator.';
        noCardsMessagePanel.appendChild(noCardsMessageHeading);
        noCardsMessagePanel.appendChild(noCardsMessageBody);
        global.elements.printSheetCardList.appendChild(noCardsMessagePanel);
    }
    else {
        document.querySelector('#generatePrintSheet').disabled = false;
        document.querySelector('#clearPrintSheet').disabled = false;

        for (var i=0; i < printSheetCards.length; i++) {
            var printSheetCard = printSheetCards[i];
            var quantity = printSheetCardHashes[printSheetCard.hash];

            var printSheetCardRow = document.createElement('tr');
            printSheetCardRow.id = 'row_'+printSheetCard.hash;
            var printSheetCardNameCell = document.createElement('td');
            var printSheetCardSetCell = document.createElement('td');
            var printSheetCardQuantityCell = document.createElement('td');
            var printSheetCardOptionsCell = document.createElement('td');

            var quantityControl = document.createElement('div');
            quantityControl.className = 'btn-group btn-group-xs';

            var decreaseQuantityElement = document.createElement('a');
            decreaseQuantityElement.className = 'btn btn-primary';
            var decreaseQuantityGlyphicon = document.createElement('span');
            decreaseQuantityGlyphicon.className = 'glyphicon glyphicon-minus';
            decreaseQuantityElement.appendChild(decreaseQuantityGlyphicon);
            decreaseQuantityElement.ponymtg = {};
            decreaseQuantityElement.ponymtg.hash = printSheetCard.hash;
            decreaseQuantityElement.onclick = function(e) {
                var targetHash = e.currentTarget.ponymtg.hash;
                var psc = getPrintSheetCards();
                var q = psc[targetHash];
                if (q === 1) {
                    return false;
                }
                var qe = document.querySelector('#quantity_'+targetHash);

                removeCardFromPrintSheet(targetHash);
                psc = getPrintSheetCards();
                q = psc[targetHash];
                qe.innerHTML = 'x'+q;
            };

            var increaseQuantityElement = document.createElement('a');
            increaseQuantityElement.className = 'btn btn-primary';
            var increaseQuantityGlyphicon = document.createElement('span');
            increaseQuantityGlyphicon.className = 'glyphicon glyphicon-plus';
            increaseQuantityElement.appendChild(increaseQuantityGlyphicon);
            increaseQuantityElement.ponymtg = {};
            increaseQuantityElement.ponymtg.hash = printSheetCard.hash;
            increaseQuantityElement.onclick = function(e) {
                var targetHash = e.currentTarget.ponymtg.hash;
                addCardToPrintSheet(targetHash);
                var qe = document.querySelector('#quantity_'+targetHash);
                var psc = getPrintSheetCards();
                var q = psc[targetHash];

                qe.innerHTML = 'x'+q;
            };

            var quantityElement = document.createElement('div');
            quantityElement.className = 'btn btn-default';
            quantityElement.id = 'quantity_'+printSheetCard.hash;
            quantityElement.style.fontWeight = 'bold';
            quantityElement.innerHTML = 'x'+quantity;

            printSheetCardNameCell.innerHTML = printSheetCard.name;
            printSheetCardSetCell.innerHTML = printSheetCard.set;

            quantityControl.appendChild(decreaseQuantityElement);
            quantityControl.appendChild(quantityElement);
            quantityControl.appendChild(increaseQuantityElement);

            printSheetCardQuantityCell.appendChild(quantityControl);

            var removeCardsButton = document.createElement('a');
            removeCardsButton.className = 'btn btn-default';
            removeCardsButton.innerHTML = 'Remove ';
            var removeCardsGlyphicon = document.createElement('span');
            removeCardsGlyphicon.className = 'glyphicon glyphicon-remove';
            removeCardsButton.appendChild(removeCardsGlyphicon);
            removeCardsButton.ponymtg = {};
            removeCardsButton.ponymtg.hash = printSheetCard.hash;
            removeCardsButton.onclick = function(e) {
                var targetHash = e.currentTarget.ponymtg.hash;
                var row = document.querySelector('#row_'+targetHash);
                removeAllCardsWithHashFromPrintSheet(targetHash);
                row.parentNode.removeChild(row);
            };
            
            printSheetCardOptionsCell.appendChild(removeCardsButton);

            printSheetCardNameCell.style.width = '40%';
            printSheetCardSetCell.style.width = '30%';
            printSheetCardQuantityCell.style.width = '10%';
            printSheetCardOptionsCell.style.width = '10%';

            printSheetCardNameCell.style.textAlign = 'center';
            printSheetCardQuantityCell.style.textAlign = 'center';
            printSheetCardSetCell.style.textAlign = 'center';
            printSheetCardOptionsCell.style.textAlign = 'center';

            printSheetCardRow.appendChild(printSheetCardNameCell);
            printSheetCardRow.appendChild(printSheetCardSetCell);
            printSheetCardRow.appendChild(printSheetCardQuantityCell);
            printSheetCardRow.appendChild(printSheetCardOptionsCell);

            printSheetCardListTableBody.appendChild(printSheetCardRow);
        }
        printSheetCardListTable.appendChild(printSheetCardListTableBody);
        global.elements.printSheetCardList.appendChild(printSheetCardListTable);
    }
}

function addSetToPrintSheet(setName) {
    // Get all cards from the set.
    var cards = getCardsFilteredByProperties(CARDS, {'set': [setName]});

    for (var i=0; i < cards.length; i++) {
        var card = cards[i];
        addCardToPrintSheet(card.hash);
    }
}
