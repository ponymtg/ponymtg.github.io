const initialize = async function initialize() {
    CARDS = await loadAllCards();

    for (let i=0; i < CARDS.length; i++) {
        // A little trick here: in order to be able to filter these cards by
        // their hashes (which isn't a stored property of the card, but rather,
        // a derived one), we will derive each card's hash and then add it
        // directly to the card properties.
        const derivedCardProperties = getDerivedCardProperties(CARDS[i]);
        CARDS[i].hash = derivedCardProperties.hash;
    }

    global.information = getInformation(CARDS);

    const addSetMenuElement = document.querySelector('#addSetMenu');

    const sets = await loadAllSets();

    for (let i=0; i < global.information.sets.length; i++) {
        const setName = global.information.sets[i];
        if (sets[setName] === undefined) {
            // If we can't find any details for a set by this name, ignore it
            // and skip to the next one.
            continue;
        }
        const setElement = document.createElement('li');
        const setElementLink = document.createElement('a');
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

    const generatePrintSheetButton = document.querySelector('#generatePrintSheet');
    generatePrintSheetButton.onclick = function() {
        const generatePrintSheetUrl = 'generatePrintSheet.html';
        window.open(generatePrintSheetUrl, '_blank');

    };

    const clearPrintSheetButton = document.querySelector('#clearPrintSheet');
    clearPrintSheetButton.onclick = function(e) {
        clearPrintSheet();
        refreshPrintSheetTable();

    };

    global.elements.printSheetCardList = document.querySelector('#printSheetCardList');
    refreshPrintSheetTable();
}

function refreshPrintSheetTable() {
    emptyElement(global.elements.printSheetCardList);
    const printSheetCardHashes = getPrintSheetCards();
    let printSheetCards = getCardsFilteredByProperties(CARDS, {'hash': Object.keys(printSheetCardHashes)});
    printSheetCards = sortByProperties(printSheetCards, ['name', 'set'], true);

    const printSheetCardListTable = document.createElement('table');
    printSheetCardListTable.className = 'table table-bordered'
    const printSheetCardListTableHead = document.createElement('thead');
    const printSheetCardListTableBody = document.createElement('tbody');
    const printSheetCardHeaderRow = document.createElement('tr');
    const printSheetCardNameHeaderCell = document.createElement('th');
    const printSheetCardQuantityHeaderCell = document.createElement('th');
    const printSheetCardSetHeaderCell = document.createElement('th');
    const printSheetCardOptionsHeaderCell = document.createElement('th');

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
        const noCardsMessagePanel = document.createElement('div');
        noCardsMessagePanel.className = 'panel panel-warning';
        noCardsMessagePanel.style.width = '50%';
        noCardsMessagePanel.style.margin = '0 auto';
        const noCardsMessageHeading = document.createElement('div');
        noCardsMessageHeading.className = 'panel-heading';
        noCardsMessageHeading.innerHTML = '<span class="glyphicon glyphicon-warning-sign"></span> You haven\'t added any cards yet';
        const noCardsMessageBody = document.createElement('div');
        noCardsMessageBody.className = 'panel-body';
        noCardsMessageBody.innerHTML = 'To build a print sheet, use the <a href="index.html">search functionality</a> to find cards that you want, and press <strong>"Add to print sheet"</strong>. The cards will be here when you return to this page.<br /><br />Alternatively, if you just want to get a print sheet for every card from a particular set, use the <strong>"Add set"</strong> button above.<br /><br />When you\'ve added all the cards that you want, press <strong>"Create print sheet"</strong> to generate a printable sheet of those cards.<br /><br />Be warned that some sets contain a large number of cards, which may affect the performance of this page and the print sheet generator.';
        noCardsMessagePanel.appendChild(noCardsMessageHeading);
        noCardsMessagePanel.appendChild(noCardsMessageBody);
        global.elements.printSheetCardList.appendChild(noCardsMessagePanel);
    }
    else {
        document.querySelector('#generatePrintSheet').disabled = false;
        document.querySelector('#clearPrintSheet').disabled = false;

        for (let i=0; i < printSheetCards.length; i++) {
            const printSheetCard = printSheetCards[i];
            const quantity = printSheetCardHashes[printSheetCard.hash];

            const printSheetCardRow = document.createElement('tr');
            printSheetCardRow.id = 'row_'+printSheetCard.hash;
            const printSheetCardNameCell = document.createElement('td');
            const printSheetCardSetCell = document.createElement('td');
            const printSheetCardQuantityCell = document.createElement('td');
            const printSheetCardOptionsCell = document.createElement('td');

            const quantityControl = document.createElement('div');
            quantityControl.className = 'btn-group btn-group-xs';

            const decreaseQuantityElement = document.createElement('a');
            decreaseQuantityElement.className = 'btn btn-primary';
            const decreaseQuantityGlyphicon = document.createElement('span');
            decreaseQuantityGlyphicon.className = 'glyphicon glyphicon-minus';
            decreaseQuantityElement.appendChild(decreaseQuantityGlyphicon);
            decreaseQuantityElement.ponymtg = {};
            decreaseQuantityElement.ponymtg.hash = printSheetCard.hash;
            decreaseQuantityElement.onclick = function(e) {
                const targetHash = e.currentTarget.ponymtg.hash;
                const psc = getPrintSheetCards();
                let q = psc[targetHash];
                if (q === 1) {
                    return false;
                }
                const qe = document.querySelector('#quantity_'+targetHash);

                removeCardFromPrintSheet(targetHash);
                psc = getPrintSheetCards();
                q = psc[targetHash];
                qe.innerHTML = 'x'+q;
            };

            const increaseQuantityElement = document.createElement('a');
            increaseQuantityElement.className = 'btn btn-primary';
            const increaseQuantityGlyphicon = document.createElement('span');
            increaseQuantityGlyphicon.className = 'glyphicon glyphicon-plus';
            increaseQuantityElement.appendChild(increaseQuantityGlyphicon);
            increaseQuantityElement.ponymtg = {};
            increaseQuantityElement.ponymtg.hash = printSheetCard.hash;
            increaseQuantityElement.onclick = function(e) {
                const targetHash = e.currentTarget.ponymtg.hash;
                addCardToPrintSheet(targetHash);
                const qe = document.querySelector('#quantity_'+targetHash);
                const psc = getPrintSheetCards();
                const q = psc[targetHash];

                qe.innerHTML = 'x'+q;
            };

            const quantityElement = document.createElement('div');
            quantityElement.className = 'btn btn-default';
            quantityElement.id = 'quantity_'+printSheetCard.hash;
            quantityElement.style.fontWeight = 'bold';
            quantityElement.innerHTML = 'x'+quantity;

            printSheetCardNameCell.innerHTML = printSheetCard.name;
            if (printSheetCard.set !== undefined) {
                printSheetCardSetCell.innerHTML = printSheetCard.set;
            } else {
                printSheetCardSetCell.innerHTML = '<i>(none)</i>';
            }

            quantityControl.appendChild(decreaseQuantityElement);
            quantityControl.appendChild(quantityElement);
            quantityControl.appendChild(increaseQuantityElement);

            printSheetCardQuantityCell.appendChild(quantityControl);

            const removeCardsButton = document.createElement('a');
            removeCardsButton.className = 'btn btn-default';
            removeCardsButton.innerHTML = 'Remove ';
            const removeCardsGlyphicon = document.createElement('span');
            removeCardsGlyphicon.className = 'glyphicon glyphicon-remove';
            removeCardsButton.appendChild(removeCardsGlyphicon);
            removeCardsButton.ponymtg = {};
            removeCardsButton.ponymtg.hash = printSheetCard.hash;
            removeCardsButton.onclick = function(e) {
                const targetHash = e.currentTarget.ponymtg.hash;
                const row = document.querySelector('#row_'+targetHash);
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
    const cards = getCardsFilteredByProperties(CARDS, {'set': [setName]});

    for (let i=0; i < cards.length; i++) {
        const card = cards[i];
        addCardToPrintSheet(card.hash);
    }
}

window.onload = initialize;
