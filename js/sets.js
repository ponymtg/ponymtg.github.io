const initialize = async function initialize()
{
    const allCards = await loadAllCards();

    global.information = getInformation(allCards);

    const container = document.querySelector('#container');
    const setsTable = await getSetsTableElement(global.information.sets);
    container.appendChild(setsTable);
};

/**
 * Given a list of set names, returns a table populated with information that the application is able to obtain on those
 * sets.
 *
 * @param {string[]} setNames
 */
const getSetsTableElement = async function getSetsTableElement(setNames)
{
    const tableElement = document.createElement('table');
    tableElement.id = 'setsTable';
    tableElement.className = 'table table-bordered table-hover';
    //tableElement.style.width = '75%';
    //tableElement.style.margin = '2.5% auto';
    //tableElement.style.borderSpacing = '0';

    const tableHeadElement = document.createElement('thead');
    const tableBodyElement = document.createElement('tbody');
    const tableHeaderRowElement = document.createElement('tr');
    const nameTableHeaderCellElement = document.createElement('th');
    const creatorTableHeaderCellElement = document.createElement('th');
    const numberOfCardsTableHeaderCellElement = document.createElement('th');
    const notesTableHeaderCellElement = document.createElement('th');
    const cockatriceTableHeaderCellElement = document.createElement('th');

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

    const sets = await loadSets(global.urls.sets)

    for (let i=0; i < setNames.length; i++) {
        const setName = setNames[i];
        const setDetails = sets[setName];
        if (setDetails === undefined) {
            // If we can't find any details for a set by this name in `SETS`, ignore it and skip to the next one.
            continue;
        }
        const tableRowElement = document.createElement('tr');

        const nameTableCellElement = document.createElement('td');
        nameTableCellElement.style.width = '20%';

        const creatorTableCellElement = document.createElement('td');
        creatorTableCellElement.style.width = '20%';

        const numberOfCardsTableCellElement = document.createElement('td');
        numberOfCardsTableCellElement.style.width = '5%';
        numberOfCardsTableCellElement.style.textAlign = 'center';

        const notesTableCellElement = document.createElement('td');

        const cockatriceTableCellElement = document.createElement('td');
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

window.onload = initialize;
