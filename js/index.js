////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// index.js                                                                   // 
//                                                                            //
// The entry point for the main search page of the application.               //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

const cardsLoadProgress = function cardsLoadProgress(
    bytesRead,
    contentLength,
    url,
    cardGroupLabel
) {
    global.elements.progressBarStatus.innerHTML = `Loading ${cardGroupLabel}...`;
    const progressPercentage = Math.floor((bytesRead / contentLength) * 100);
    global.elements.progressBar.style.width = progressPercentage + '%';
};

/**
 * Application setup.
 */
const initialize = async function initialize() {
    // Get any parameters passed in the URL.
    global.urlParameters = getUrlParameters();

    // Get references to various page elements.
    const elementIds = [
        'advancedSearch',
        'container',
        'menuBar',
        'printSheetLink',
        'results',
        'searchBar',
        'searchField',
        'searchButton',
        'tagline',
        'title',
    ];

    for (var i=0; i < elementIds.length; i++) {
        global.elements[elementIds[i]] = document.querySelector(
            '#' + elementIds[i]
        );
    }

    // Set up the panel containing the loading progress bar, which should be one
    // of the first things the user sees on starting the site.
    const progressPanel = document.createElement('div');
    progressPanel.id = 'progressPanel';
    
    const progressBarContainer = document.createElement('div');
    progressBarContainer.className = 'progress';
    progressBarContainer.style.margin = '32px auto';
    progressBarContainer.style.width = '75%';

    const progressBar = document.createElement('div');
    progressBar.id = 'progressBar';
    progressBar.className = 'progress-bar progress-bar-striped active';
    progressBar.role = 'progressbar';
    progressBar.style.width = '0%';

    const progressBarStatus = document.createElement('div');
    progressBarStatus.id = 'progressBarStatus';

    progressBarContainer.appendChild(progressBar);
    progressPanel.appendChild(progressBarContainer);
    progressPanel.appendChild(progressBarStatus);
    global.elements.container.appendChild(progressPanel);

    global.elements.progressBar = progressBar;
    global.elements.progressBarStatus = progressBarStatus;

    let CARDS = await loadAllCards(cardsLoadProgress);
    let sets = await loadAllSets();

    // Assuming that the cards all loaded successfully, remove the loading
    // progress panel, and show the search bar.
    progressPanel.parentNode.removeChild(progressPanel);
    global.elements.searchBar.style.display = '';

    if (!global.urlParameters.noSort) {
        // Sort the entire database alphabetically by set, then name.
        CARDS = sortByProperties(CARDS, ['name', 'set'], true);
    }

    // For every card, there may be certain additional properties that we can
    // derive from the information supplied, such as the card's colors. These
    // are useful for refining searches.
    for (let i=0; i < CARDS.length; i++) {
        CARDS[i].derivedProperties = getDerivedCardProperties(CARDS[i]);

        // For the card's hash, we'll also put this directly on the card
        // itself, as the filtering function only looks at the card's static
        // properties, and we do sometimes want to filter by hash.
        CARDS[i].hash = CARDS[i].derivedProperties.hash;
    }

    // Similarly, collect some information about the database as a whole (eg. a
    // list of all sets that are in it).
    global.information = getInformation(CARDS);

    // The title screen has a dynamic tagline which depends on the number of
    // cards, so set that now.
    var tagline = global.text.tagline.dynamic;
    tagline = tagline.replace(
        '{NUMBER_OF_CARDS}',
        '<strong>' + global.information.overall.numberOfCards + '</strong>'
    );
    global.elements.tagline.innerHTML = tagline;

    // The "random card" link selects a random set, then a random card from
    // that set, then gets the card hash, and opens PonyMTG in a new tab with
    // the hash passed in the URL. Although we could simply pick a random card
    // from anywhere in the database, we select by set first to give every set
    // an equal chance of being picked (otherwise, the largest sets would
    // dominate the random card selection).
    var randomCardElement = document.querySelector('#randomCard');
    randomCardElement.onclick = function () {
        var randomSet = global.information.sets[
            rnd(global.information.sets.length)
        ];
        var randomSetCards = getCardsFilteredBySet(CARDS, [randomSet]);
        var randomCard = randomSetCards[rnd(randomSetCards.length)];
        var randomCardUrl = '?hash='+randomCard.hash;
        // window.open(randomCardUrl, '_blank');
        window.open(randomCardUrl);
    }

    // Set up the search field to perform searches of the card database when
    // Enter is pressed.
    global.elements.searchField.onkeypress = function(event) {
        if (event.keyCode == 13) {
            initiateSearch(CARDS, sets);
        }
    };

    // Also set up the search button to perform searches when clicked.
    global.elements.searchButton.onclick = function(event) {
        initiateSearch(CARDS, sets);
    };
    
    // Set a placeholder message inside the search field to prompt the user to
    // search for something (with a helpful randomly-selected suggestion).
    var suggestedSearchTerm = global.text.search.suggestions[
        rnd(global.text.search.suggestions.length)
    ];
    var searchPlaceholderMessage = global.text.search.placeholder
        + ' (example: "' + suggestedSearchTerm + '")';
    global.elements.searchField.placeholder = searchPlaceholderMessage;

    // Focus on the search box.
    global.elements.searchField.focus();

    // Add a control to expand the advanced search box.
    var advancedSearchExpander = document.querySelector('#advancedSearchLink');
    advancedSearchExpander.onclick = function(e) {
        var table = document.querySelector(
            '#' + global.advancedSearchIdPrefix+'_table'
        );
        if (table.style.display === 'none') {
            table.style.display = 'block';
        }
        else {
            table.style.display = 'none';
        }
    }

    // Generate and add the advanced search control box.
    global.elements.advancedSearch.appendChild(generateAdvancedSearchElement());

    // Increment a simple visit counter in local storage. We'll use this to
    // decide when to bother the user with tips.
    var visitCount = localStorage.getItem('visitCount');
    if (visitCount === null) {
        visitCount = 0;
    }
    visitCount++;
    localStorage.setItem('visitCount', visitCount);

    // Based on the number of times the user has visited, decide whether or not
    // to show them a tip, and if so, which tip.
    if (visitCount % global.values.tipFrequency === 1) {
        var tipIndexToShow = Math.floor(visitCount / global.values.tipFrequency)
            % global.text.tips.length;
        global.elements.results.appendChild(
            generateTipPanel(global.text.tips[tipIndexToShow])
        );
    }

    // Default to search by name only.
    var searchByNameCheckbox = document.querySelector(
        '#' + global.advancedSearchIdPrefix + '_searchByCardProperty_name'
    );
    searchByNameCheckbox.checked = true;

    // Default to displaying cards from all available sets.
    var filterBySetCheckbox = document.querySelector(
        '#' + global.advancedSearchIdPrefix + '_filterBySet_selectAll'
    );
    filterBySetCheckbox.click();

    // Default to searching all mana types.
    var manaTypes = Object.keys(
        global.mappings.manaTypesToRepresentativeSymbols
    );
    for (var i=0; i < manaTypes.length; i++) {
        var manaType = manaTypes[i];
        var filterByManaTypeCheckbox = document.querySelector(
            '#' + global.advancedSearchIdPrefix + '_filterByManaType_' + manaType);
        filterByManaTypeCheckbox.checked = true;
    }

    // Maintain a global reference to the print sheet link in the navbar. This
    // contains a dynamic count of how many cards are currently on the print
    // sheet, which we would like to update as cards are added.
    global.elements.printSheetLink = document.querySelector('#printSheetLink');

    // Initialize the badge on the print sheet button to the appropriate number.
    global.elements.printSheetLink.innerHTML += ' <span id="printSheetCountBadge" class="badge">' + getNumberOfCardsInPrintSheet() + '</span>';

    // If a `hash` parameter is passed in the URL, auto-search for a card that
    // matches that hash.
    if (Object.keys(global.urlParameters).length > 0) {
        if (global.urlParameters.hash !== undefined) {
            // For card display, we rearrange the main page slightly; we remove
            // the top menu bar and the main container, we move the card
            // results table out into the main body of the page, and we add a
            // small PonyMTG logo above it which links back to home.
            global.elements.menuBar.style.display = 'none';
            global.elements.container.style.display = 'none';

            var logoSmall = document.createElement('a');
            logoSmall.href = '/';
            logoSmall.className = 'logo-small';
            logoSmall.style.marginBottom = '32px';

            document.body.appendChild(logoSmall);
            document.body.appendChild(global.elements.results);
            
            global.search.results = getCardsFilteredByProperties(
                CARDS,
                {'hash': global.urlParameters.hash}
            );
            global.pagination.currentPage = 0;
            global.pagination.numberOfPages = Math.ceil(
                global.search.results.length / global.pagination.cardsPerPage
            );
            displayResults(global.search.results, sets);

            // Since this is an auto-search from which we only ever expect to
            // get one result, don't show the "found X cards" message.
            var foundCardsMessageElement = document.querySelector(
                '#foundCardsMessagePanel'
            );
            foundCardsMessageElement.parentNode.removeChild(
                foundCardsMessageElement
            );
        }
    }
};

window.onload = initialize;
