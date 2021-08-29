/**
 * Card loader
 *
 * Functions for loading the card database from data URLs.
 *
 * In older versions, the card database was just a handful of JS script files
 * that defined global arrays of card data. This has since been replaced with a
 * loader that uses the Fetch API to load the card data JSON files
 * asynchronously.
 *
 * The advantage of the asynchronous approach is that it allows dynamic elements
 * such as progress bars to be updated while the card data is loading. (However,
 * this is optional - some pages currently don't bother with a progress bar and
 * will simply pause until loading is complete).
 *
 * Currently, any page that needs access to the card database (eg. index, sets,
 * roboFoME) will perform a `loadCards` at the start to load the card data files
 * that it needs. We are assuming that the browser will cache the card data file
 * after the first time, so that subsequent loads proceed more quickly.
 */

/**
 * Load cards from a JSON file containing card data. This is simply a wrapper
 * around `streamUrl`, which does the actual fetching - it then decodes the JSON
 * into the expected array of card objects and returns it.
 *
 * If a progress function is supplied, progress updates will be periodically
 * sent to this function, allowing the application to indicate how far the load
 * has progressed.
 *
 * A label can also be supplied to indicate what group of cards is being
 * uploaded, which will be passed to the progress function. This allows the UI
 * to give better information about what exactly it is loading.
 *
 * @param {string} url
 * @param {function} progressFunc
 * @return {Object[]}
 */
const loadCards = async function loadCards(url, progressFunc, cardGroupLabel) {
    const cardsData = await streamUrl(url, progressFunc, cardGroupLabel);
    if (cardsData) {
        const cards = JSON.parse(cardsData);
        return cards;
    }

    return null;
};

/**
 * Stream string data asynchronously from a URL and return a Promise for the
 * result.
 *
 * If `label` is supplied, this is used as a label for the stream being
 * read - this gets passed to the progress function, and can be used by the UI
 * to recognize what is being loaded.
 *
 * If an optional `progressFunc(bytesRead, contentLength, url, identifier)` is
 * supplied, it is called each time the stream reads a new chunk of data and
 * can be used to update UI elements with information about the ongoing data
 * transfer.
 *
 * @param {string} url
 * @param {function} progressFunc
 * @return {Promise}
 */
const streamUrl = async function streamUrl(url, progressFunc, label) {
    const response = await fetch(url);
    const contentLength = response.headers.get('Content-Length');
    const reader = response.body.getReader();

    let bytes = new Uint8Array()

    while (true) {
        const result = await reader.read();
        if (result.value == undefined) {
            break;
        }

        const bytesRead = result.value;
        const newBytes = new Uint8Array(bytes.length + bytesRead.length);
        newBytes.set(bytes);
        newBytes.set(bytesRead, bytes.length);
        bytes = newBytes;

        if (progressFunc) {
            progressFunc(bytes.length, contentLength, url, label);
        }
    }

    const utf8Decoder = new TextDecoder();
    const text = utf8Decoder.decode(bytes);

    return text;
};
