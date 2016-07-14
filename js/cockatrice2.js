window.onload = initialize;

function initialize() {
    CARDS = CARDS.concat(FICG_CARDS);
    CARDS = CARDS.concat(IPU_CARDS);

    var information = getInformation(CARDS);
    var setsSelectElement = document.querySelector('#sets');
    var generateCockatriceFileElement = document.querySelector('#generateCockatriceFile');

    for (var i=0; i < information.sets.length; i++) {
        var set = information.sets[i];
        var setOptionElement = document.createElement('option');
        setOptionElement.innerHTML = set;
        setOptionElement.value = set;
        setsSelectElement.appendChild(setOptionElement);
    }

    setsSelectElement.onchange = function() {
        var selectedSet = setsSelectElement.value;
        generateCockatriceFileElement.disabled = !selectedSet;
        
    }

    generateCockatriceFileElement.onclick = function() {
        var selectedSet = setsSelectElement.value;
        if (selectedSet) {
            var generateCockatriceUrl = 'generateCockatriceFile.html?set='+selectedSet;
        };
        window.open(generateCockatriceUrl, '_blank');
    }

    var setName = undefined;

    global.urlParameters = getUrlParameters();
    if (Object.keys(global.urlParameters).length > 0) {
        if (global.urlParameters.set !== undefined) {
            if (global.sets[global.urlParameters.set] !== undefined) {
                setName = global.urlParameters.set; 
            }
        }
    }

    if (setName !== undefined) {
        for (var i=0; i < setsSelectElement.options.length; i++) {
            if(setsSelectElement.options[i].value == setName) {
                setsSelectElement.selectedIndex = i;
                generateCockatriceFileElement.disabled = false;
                break;
            }
        }
    }
}

