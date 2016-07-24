window.onload = initialize;

/**
 * Application setup.
 */
function initialize() {
    CARDS = CARDS.concat(FICG_CARDS);
    CARDS = CARDS.concat(IPU_CARDS);

    global.information = getInformation(CARDS);
    var container = document.querySelector('#container');
    container.appendChild(getSetsTableElement(global.information.sets));
}

/**
 * Given a list of set names, returns a table populated with information that the application is able to obtain on those
 * sets.
 */
function getSetsTableElement(sets) {
    var tableElement = document.createElement('table');
    tableElement.id = 'setsTable';
    tableElement.className = 'table table-bordered table-hover';
    //tableElement.style.width = '75%';
    //tableElement.style.margin = '2.5% auto';
    //tableElement.style.borderSpacing = '0';

    var tableHeadElement = document.createElement('thead');
    var tableBodyElement = document.createElement('tbody');
    var tableHeaderRowElement = document.createElement('tr');
    var nameTableHeaderCellElement = document.createElement('th');
    var creatorTableHeaderCellElement = document.createElement('th');
    var numberOfCardsTableHeaderCellElement = document.createElement('th');
    var notesTableHeaderCellElement = document.createElement('th');
    var cockatriceTableHeaderCellElement = document.createElement('th');

    nameTableHeaderCellElement.innerHTML = 'Set';
    creatorTableHeaderCellElement.innerHTML = 'Creator';
    numberOfCardsTableHeaderCellElement.innerHTML = 'Number of cards';
    notesTableHeaderCellElement.innerHTML = 'Notes';
    cockatriceTableHeaderCellElement.innerHTML = '';

    tableHeaderRowElement.appendChild(nameTableHeaderCellElement);
    tableHeaderRowElement.appendChild(creatorTableHeaderCellElement);
    tableHeaderRowElement.appendChild(numberOfCardsTableHeaderCellElement);
    tableHeaderRowElement.appendChild(notesTableHeaderCellElement);
    tableHeaderRowElement.appendChild(cockatriceTableHeaderCellElement);
    tableHeadElement.appendChild(tableHeaderRowElement);

    tableElement.appendChild(tableHeadElement);

    for (var i=0; i < sets.length; i++) {
        var setName = sets[i];
        if (global.sets[setName] === undefined) {
            // If we can't find any details for a set by this name in `global.sets`, ignore it and skip to the next one.
            continue;
        }
        var setDetails = global.sets[setName];
        var tableRowElement = document.createElement('tr');

        var nameTableCellElement = document.createElement('td');
        nameTableCellElement.style.width = '20%';

        var creatorTableCellElement = document.createElement('td');
        creatorTableCellElement.style.width = '20%';

        var numberOfCardsTableCellElement = document.createElement('td');
        numberOfCardsTableCellElement.style.width = '5%';
        numberOfCardsTableCellElement.style.textAlign = 'center';

        var notesTableCellElement = document.createElement('td');

        var cockatriceTableCellElement = document.createElement('td');
        cockatriceTableCellElement.style.width = '15%';

        nameTableCellElement.innerHTML = '<em>'+setName+'</em>';
        if (setDetails.url !== undefined) {
            nameTableCellElement.innerHTML = '<em><a href="'+setDetails.url+'" target="_blank">'+setName+'</a></em>';
        }
        if (setDetails.creator !== undefined) {
            creatorTableCellElement.innerHTML = setDetails.creator;
        }
        if (global.information.perSet[setName] !== undefined) {
            numberOfCardsTableCellElement.innerHTML = global.information.perSet[setName].numberOfCards;
        }
        if (setDetails.notes !== undefined) {
            notesTableCellElement.innerHTML = setDetails.notes;
        }

        cockatriceTableCellElement.innerHTML = '<a href="cockatrice2.html?set='+setName+'" target="blank" class="btn btn-default"><span class="glyphicon glyphicon-modal-window"></span> Get Cockatrice File</a>';
        cockatriceTableCellElement.style.textAlign = 'center';

        tableRowElement.appendChild(nameTableCellElement);
        tableRowElement.appendChild(creatorTableCellElement);
        tableRowElement.appendChild(numberOfCardsTableCellElement);
        tableRowElement.appendChild(notesTableCellElement);
        tableRowElement.appendChild(cockatriceTableCellElement);

        tableBodyElement.appendChild(tableRowElement);
        
    }
    tableElement.appendChild(tableBodyElement);
    return tableElement;
}
