function Categorize() {};

/**
 * Group items into categories.
 *
 * This function takes an array of items, and applies a categorization function
 * to each one to decide what category (or categories) it should be in.
 *
 * The categorization function can return a single value, or multiple values in
 * the form of an array. It can also return `null`; this has the same effect as
 * returning an empty array (ie. the item won't be placed in any category).
 */
Categorize.by = function(items, categorizationFunction) {
    var categorizedItems = {};

    for (var i=0; i < items.length; i++) {
        var item = items[i];

        var categories = categorizationFunction(item);
        if (!Array.isArray(categories)) {
            categories = [categories];
        }

        for (var j=0; j < categories.length; j++) {
            var category = categories[j];
            if (category !== null) {
                if (categorizedItems[category] === undefined) {
                    categorizedItems[category] = [];
                }
                categorizedItems[category].push(item);
            }
        }
    }

    return categorizedItems;
}

/**
 * Categorize items by a composite category string made up of the
 * concatenation of the values returned by a categorization function.
 *
 * For example, if the categorization function returns ['A', 'B', 'C'] for
 * a given item, that item will be categorized as 'ABC'.
 *
 * The ordering of categories returned by the categorization function
 * doesn't matter; items that are in categories ['A', 'B'] and ['B', 'A']
 * will be placed into the same composite category (probably 'AB'). A
 * sort function can be provided to decide the order in which the categories
 * are concatenated into the composite category.
 */
Categorize.byComposite = function(items, categorizationFunction, sortFunction) {
    var categorizedItems = {};

    for (var i=0; i < items.length; i++) {
        var item = items[i];

        var categories = categorizationFunction(item);

        if (categories.length == 0) {
            continue;
        }

        var compositeCategory = categories.sort(sortFunction).reduce(
            function (accumulator, category) {
                return accumulator + category;
            }
        );

        if (categorizedItems[compositeCategory] === undefined) {
            categorizedItems[compositeCategory] = [];
        }
        categorizedItems[compositeCategory].push(item);
    }

    return categorizedItems;
}

/**
 * Given a set of items and the name of a property of those cards, return an
 * object containing items grouped by property.
 *
 * For example, `items` could be a set of card definitions, and `property`
 * could be `supertype`.
 *
 * @param Object[] items
 * @param string property The name of a property
 * @param boolean splitPropertyValues If true, split the property value on
 * whitespace into multiple values
 */
Categorize.byProperty = function(items, property, splitPropertyValues) {
    return Categorize.by(
        items,
        function(item) {
            var categories = [];

            if (item[property] !== undefined) {
                var itemPropertyValues = [item[property]];
                if (splitPropertyValues === true) {
                    itemPropertyValues = item[property].split(/\s+/);
                }
                categories = categories.concat(itemPropertyValues);
            }
            return categories;
        }
    );
}

/**
 * Given two arrays, return the items common to both.
 */
Categorize.union = function(itemsA, itemsB) {
    return itemsA.filter(
        function(itemA) {
            return itemsB.indexOf(itemA) !== -1;
        }
    );
}
