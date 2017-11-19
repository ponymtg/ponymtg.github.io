function Sort() {};

/**
 * Given an object containing a number of key-value pairs, return an array of
 * the keys sorted.
 */
Sort.objectByKey = function(object, sortOrder) {
    if (sortOrder === undefined) {
        sortOrder = 'ascending';
    }

    var keys = Object.keys(object);

    keys.sort(
        function(keyA, keyB) {
            return keyA - keyB;
        }
    );

    if (sortOrder === 'descending') {
        keys.reverse(); 
    }

    return keys;
}

/**
 * Given an object containing a number of key-value pairs, return an array of
 * the keys sorted by the value of a function on the value.
 */
Sort.objectByFunction = function(object, func, sortOrder)  {
    if (sortOrder === undefined) {
        sortOrder = 'ascending';
    }

    var keys = Object.keys(object);

    keys.sort(
        function(keyA, keyB) {
            var sortResult = func(object[keyA]) - func(object[keyB]);
            if (sortResult == 0) {
                // If the sort result is 0 (both values are the same), use the
                // key to decide ordering instead.
                sortResult = keyA.localeCompare(keyB);
                if (sortOrder === 'descending') {
                    sortResult = 0 - sortResult;
                }
            }
            return sortResult;
        }
    );

    if (sortOrder === 'descending') {
        keys.reverse(); 
    }

    return keys;
}

/**
 * Given an object containing a number of key-value pairs, return an array of
 * the keys sorted by their corresponding value.
 */
Sort.objectByValue = function(object, sortOrder) {
    if (sortOrder === undefined) {
        sortOrder = 'ascending';
    }

    var keys = Object.keys(object);

    keys.sort(
        function(keyA, keyB) {
            var sortResult = object[keyA] - object[keyB];
            if (sortResult == 0) {
                // If the sort result is 0 (both values are the same), use the
                // key to decide ordering instead.
                sortResult = keyA.localeCompare(keyB);
                if (sortOrder === 'descending') {
                    sortResult = 0 - sortResult;
                }
            }
            return sortResult;
        }
    );

    if (sortOrder === 'descending') {
        keys.reverse(); 
    }

    return keys;
}

/**
 * Given an array of strings, return a new array sorted alphabetically.
 */
Sort.alphabetically = function(strings) {
    var sortedStrings = strings;

    sortedStrings.sort(
        function(stringA, stringB) {
            return stringA.localeCompare(stringB);
        }
    );

    return sortedStrings;
}
