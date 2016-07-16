## 1.0.0

* First release!
* Added favicon.
* Added Bootstrap styles to pages that didn't have them yet.
* Added a warning to the advanced search box to note that it's not yet 100% useful.
* Changed the container for result card images from `col-md-3` to `col-md-5`, which avoids an issue of the image
overlapping the info box at some screen widths (due to the fact that card images are not permitted to resize).
* Removed the "Search by" panel.
* Improved the styling of the search field and the card info panels.
* Added card set: "5moo2"
* Added card set: "ArixOrdragc"

## 0.2.1

* Fixed a really tricky page-jump bug that occurs when the app displays proxy card results.

## 0.2.0

* Complete site-wide overhaul of stylings to Bootstrap.
* Added print sheet functionality.
* Reworked proxy generation to use dynamic text resizing.
* Removed `name` and `set` URL parameters.
* Added `String.includes` polyfill.

## 0.1.3

* Added some preprocessing to the Cockatrice file generator to ensure a unique name for every card.
* Forced proxy cards to use loaded font from file instead of allowing browser to decide font.

## 0.1.2

* Fixed schema validation errors in generated Cockatrice files.
* Slight reworking of card sorting to correctly sort on name and set.
* Removed `setsToPaths` mapping.
* Added full details for "MTG mlp" set.

## 0.1.1

* Switched to absolute card font sizes to render consistently across browsers.
* Set the card font to Times New Roman rather than generic serif.
* Reworked the card text shrinking algorithm to scale excess text linearly.
* Added a "Random card" feature.
* Reworked the Cockatrice file generator and provided a more user-friendly guide to Cockatrice.

## 0.1.0

* Added a Sets page which contains a details and notes on the various sets contained in the database.
* Added a Cockatrice file generator.

## 0.0.7

* Updated FICG parser to correctly parse split card names, costs, and types.
* Updated proxy card renderer to correctly render split cards.
* Fixed the booster pack generator so that it correctly filters out Conspiracies, Planes, and Schemes.
* Fixed the booster pack generator so that it correctly filters out double-sided cards.
* Added a top bar to the application for accessing subpages.
* Added an About page.
* Added a PonyMTG logo.
* Changed the overall style to very light grays.

## 0.0.6

* Updated FICG parser so that it can handle Snow Instants.
* Updated FICG parser so that it can handle leveler cards.
* Conspiracies, Planes, and Schemes no longer appear in booster packs.
* Added an extra text mass threshold to shrink very long card text.
* Added card set: "Elementals of Harmony".
* Added card set: "Sideboard of Harmony".

## 0.0.5

* Made card images open in new tab when clicked.
* Added URL parameters for linking to specific cards.
* Added a virtual booster pack feature for Friendship is Card Games.
* Added card set: "UWoodward".

## 0.0.4

* Added search by mana type.
* Added card set: "StorycrafterKiro".

## 0.0.3

* Updated FICG parser to detect dialogue at the end of card text as flavor text.
* Minor FICG parser fix to clean decorative double quotes before parsing.
* Changed pagination controls style to bring it in line with advanced search box.
* Made other minor look-and-feel style adjustments.
* Added pagination control to bottom of screen, implemented jump-to-top when switching pages.

## 0.0.2

* FICG parser fix to correctly detect World Enchantments.
* FICG parser fix for incorrect Artifact detection.
* Added typo detection to the FICG parser.
* IPU parser fix for subtype incorrectly carrying over to successive cards.
* Added gradient to improve appearance of gold cards.
* Added cursor styling when mouse is over previous/next page buttons to indicate that the buttons are clickable.
* Added advanced search options: search by card property and filter by set.
* Added card set: "Grumpy-Moogle".
* Added card set: "Twilight Falls".
* Added Friendship is Card Games up to Season 6, Episode 12.

## 0.0.1

* Minor improvements to FICG parser.
* Improved styling of two-color hybrid mana symbols.

## 0.0.0

* First version.
* Implemented searchable database with pagination.
* Implemented card proxy generation
* Wrote Python scripts for parsing the FICG dump and Cockatrice files.
* Added the following card sets:
  * "A Warm Welcome"
  * "Nightfall"
  * "Ponylude"
  * "Friendship is Magic the Gathering"
  * "CRISIS EQUESTRIA"
  * "New Lunar Republic"
  * "The Solar Empire"
  * "Legends are Magic"
  * "Unponied"
  * "Friendship is Magic the Gathering (IPU)"
  * "Derpibooru 7220"
  * "alternatepony"
  * "Equestria Disturbed"
  * "MLP:FiM Season 1 MTG Set"
  * "MLP:FiM Season 2 MTG Set"
  * "MTG mlp"
  * "Elements of Harmony"
  * "MLP-MTG"
  * "My Little Multiverse: Knowledge is Magic"
  * "Friendship is Card Games"
  * "Shards of Friendship"
  * "Oops, I Accidentally Changelings"
  * "The Implicit Neighs"
