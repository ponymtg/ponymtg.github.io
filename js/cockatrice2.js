window.onload = initialize;

function initialize() {
    CARDS = CARDS.concat(FICG_CARDS);
    CARDS = CARDS.concat(IPU_CARDS);

    const information = getInformation(CARDS);
    const setsSelect = document.querySelector('#sets');
    const generateButton = document.querySelector('#generateCockatriceFile');

    information.sets.forEach(
        function(set) {
            let setOption = document.createElement('option');
            setOption.innerHTML = set;
            setOption.value = set;
            setsSelect.appendChild(setOption);
        }
    );

    setsSelect.onchange = function() {
        const selectedSet = setsSelect.value;
        generateButton.disabled = !selectedSet;
        
    }

    generateButton.onclick = function() {
        const selectedSet = setsSelect.value;
        if (selectedSet) {
            const generateUrl = 'generateCockatriceFile.html?set='+selectedSet;
        }
        window.open(generateUrl, '_blank');
    }

    let setName = undefined;

    global.urlParameters = getUrlParameters();
    if (Object.keys(global.urlParameters).length > 0) {
        if (global.urlParameters.set !== undefined) {
            const urlSet = global.urlParameters.set;
            if (SETS[urlSet] !== undefined) {
                setName = urlSet;
            }
        }
    }

    if (setName !== undefined) {
        for (let i = 0; i < setsSelect.options.length; i++) {
            if (setsSelect.options[i].value == setName) {
                setsSelect.selectedIndex = i;
                generateButton.disabled = false;
                break;
            }
        }
    }
}

