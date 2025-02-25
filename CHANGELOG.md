## 1.20.2
* Added a few more cases to the FiCG parser to detect transforming cards correctly.
* Updated the FiCG parser to handle the new Battle supertype.
* Added the new "defense" property for Battle cards.
* Updated Friendship is Card Games up to "Friendship is Card Games: Beyond Equestria: Pinkie Pie Steps Up ".

## 1.20.1
* Added the "otherSideOf" property to the list of displayed properties in card search results.

## 1.20.0
* Updated the FiCG parser to correctly handle Daybound and Nightbound cards.
* Updated Friendship is Card Games up to "Friendship is Card Games: Father of the Bridlewood".

## 1.19.0
* Removed several instances of the global CARDS variable and replaced them with injected dependencies.

## 1.18.0
* Increased the font size slightly on all pages.
* Updated the FiCG parser to correctly parse Attraction cards that have "(N lights)" after the flavor text.
* Updated Friendship is Card Games up to "Friendship is Card Games: Hoof Done It?".

## 1.17.0
* Fixed a broken link for the Nightfall in Equestria card "Look! A Distraction".
* Updated the Cockatrice XML generator to automatically assume card rarities for cards which lack them.

## 1.16.5
* Updated Friendship is Card Games up to "Friendship is Card Games: d20 Pony, Ch. 8, Pt. 2".
* Added some additional chapter cards for "My Little Planeswalker".

## 1.16.4
* Updated Friendship is Card Games up to "Friendship is Card Games: d20 Pony, Ch. 7, Pt. 2".

## 1.16.3
* Updated Friendship is Card Games up to "Friendship is Card Games: The Journal of the Two Sisters".

## 1.16.2
* Updated Friendship is Card Games up to "Friendship is Card Games: Twilight Sparkle and the Crystal Heart Spell".
* Added new set: AndyManX

## 1.16.1
* Fixed a bug with the FICG booster generator due to the new asynchronous card loader.

## 1.16.0
* Updated Friendship is Card Games up to "Friendship is Card Games: Pony Life, Season 2, Week 7".

## 1.15.0
* Added new asynchronous card loader to replace old method of loading cards via included script file. Card data is now stored in JSON files and loaded when appropriate.

## 1.14.3
* Updated Friendship is Card Games up to "Friendship is Card Games and Witchcraft: Horse Women".
* Fixed some type line detection bugs.

## 1.14.2
* Performed some minor refactoring on the `main.js` script.

## 1.14.1
* Updated Friendship is Card Games up to "Pony Life, Week 6".
* Updated the FICG parser to simplify how transformation is handled, and to add support for modal double-faced cards (MDFC).

## 1.14.0
* Updated Friendship is Card Games up to "Friendship is Forever Card Games: Deep Tissue Memories".
* Updated the FICG parser to use a data file for rules text input.
* Fixed a bug with parsing Adventure cards.
* Updated the PonyMTG logo to a cleaner, more modern style.

## 1.13.1
* Updated Friendship is Card Games up to "Friendship is Card Games: My Little Pony Comics & Quiz (Japanese Manga)".
* Updated FICG tokens list.
* Added more Friendship is Card Games card images.

## 1.13.0
* Added "Spicy Cards", a newly-discovered set from 2014.
* Added some more Friendship is Card Games card images.
* Added some Miscellany cards for "bbsartboutique".

## 1.12.3
* Fixed bug that was preventing Cockatrice XML from generating.

## 1.12.2
* Fixed flavor text detection bug.
* Removed flavor text detection from RoboFoME.
* Added better reporting to the FICG parser unit tests.
* Updated Friendship is Card Games up to "Founding Day and Ponies & Parapets".

## 1.12.1
* Fixed flavor text detection bug.

## 1.12.0
* Added flavor text detection to the FICG parser.
* Updated Friendship is Card Games up to "Imposing Sovereigns I".
* Renamed some Python scripts to a more consistent naming convention.

## 1.11.0
* Corrected a typo in one FICG card name ("Shake Thing Up!" -> "Shake Things Up!")
* Fixed a bug in the FICG parser that prevented some transforming cards from being recognized as transformers.
* Upgraded the Cockatrice XML generator to use Cockatrice XML v4.
* Updated the Cockatrice XML generation function to something a bit more flexible and robust.
* Added a JSON schema for PonyMTG card objects.

## 1.10.1
* Updated "Friendship is Card Games" to "Ponyville Mysteries #2 and #3". All episodes of Friendship is Magic and Equestria Girls are now complete.
* Updated the FICG parser to produce UTF-8 output.
* Updates the FICG parser to auto-convert en dashes to em dashes.
* Adjusted the foil probability in FICG boosters to be more like real life booster packs.

## 1.10.0
* Updated the FICG booster generator to produce a fairer balance of colors in booster packs.
* Added random "foil" cards to the FICG booster generator.
* Added new "foil" styles for foil cards.
* Added images for all Friendship is Card Games cards that have images so far (although the images are not yet associated to the cards, which are still using proxies).
* Added images for some Sideboard of Harmony cards.
* Updated "Merodi is Card Games" with some new cards.
* Updated the FICG parser to output in a more JSON-like style (double quotes instead of single)
* Updated the entire card database to use a more JSON-style format (double quotes)

## 1.9.4
* Fixed a bug that prevented hybrid mana from being parsed and rendered correctly.
* Added detection for a typo ("Enchantent") to the FICG parser.
* Reformatted and added documentation to some Javascript code.
* Updated unit tests.

## 1.9.3
* Added "Empire of Shadows (PREVIEW)" set.

## 1.9.2
* Updated "My Little Planeswalker" with all known latest cards.

## 1.9.1
* Added card rarity to displayed properties.
* Added card rarity to searchable properties.
* Updated "My Little Planeswalker" with all known latest cards.
* Added "Merodi is Card Games" set.
* Added "Friendship is Card Games: When It Rains" set.

## 1.9.0
* Added Javascript unit tests for some PonyMTG functions.
* Added faction watermark support to the FICG parser.
* Re-enabled the "Search By" panel.
* Added search by watermark functionality.
* Updated "Friendship is Card Games" to "Student Counsel".

## 1.8.0
* Added unit tests for the FICG parser.
* Updated "Friendship is Card Games" to Legends of Magic #11 & #12

## 1.7.6
* Updated "Friendship is Card Games" to the end of Season 8.
* Fixed a bug with parsing Instants in the FICG parser.
* Fixed RoboFoME so that it doesn't generate card names that already exist.

## 1.7.5
* Fixed a bug in the Cockatrice XML generator which was preventing it from generating the file data.

## 1.7.4
* Added Zennistrad's "My Little Planeswalker".

## 1.7.3
* Updated "Friendship is Card Games" up to "Marks for Effort".

## 1.7.2
* Fixed syntax error in the FICG tokens list.

## 1.7.1
* Updated "Friendship is Card Games" with all latest cards.
* Made a fix to the FICG parser to account for Legendary Planeswalkers and Arcane Instants.

## 1.7.0
* Completed the FICG stats page.
* Updated "Friendship is Card Games" for the 5000-cards celebration.

## 1.6.6
* Completed the set of Zennistrad's "My Little Planeswalker: Twilight's Spark" cards.
* Added cards for Zennistrad's "My Little Planeswalker: Shattered Sunset" to the Miscellany.
* Added cards for Zennistrad's "My Little Planeswalker: Sideboard Stories" to the Miscellany.

## 1.6.5
* Added an in-progress statistics page for "Friendship is Card Games".

## 1.5.5
* Updated "Friendship is Card Games" with Summertime Shorts Part 2 and Better Together, Part 1.

## 1.5.4
* Updated "Friendship is Card Games" to the end of Season 7, plus Summertime Shorts Part 1.

## 1.5.3
* Added cards from Mawbane and STANTONBEN to the Miscellany.
* Added an "unused cards" file, to record cards that, while still archived, aren't included in the database for various reasons.

## 1.5.2
* Added more of Zennistrad's "My Little Planeswalker" cards, plus some corrections.

## 1.5.1
* Updated "Friendship is Card Games" to the latest episode cards.
* Added Zennistrad's "My Little Planeswalker" cards to the Miscellany.
* Added some miscellaneous cards.

## 1.5.0
* Moved set data into its own file.

## 1.4.6
* Updated "Friendship is Card Games" to the latest episode cards.

## 1.4.5
* Reclassified Modernwater's "MTG mtg" as a Miscellany collection, and moved it out of the main sets.
* Fixed a small property display bug on the Miscellany page.
* Made a small improvement to the double-sided card detection in the FICG parser.

## 1.4.4
* Updated "Friendship is Card Games" with the 2017 Equestria Girls specials, plus a couple more comic editions.
* Fixed a small bug in the FICG parser which caused it to incorrectly detect some card text lines as type lines.

## 1.4.3
* Added several Miscellany cards.
* Updated the IPU parser to add in some missing data for double-sized cards.

## 1.4.2
* Made all subpages open in the same tab instead of opening a new one.
* Added the source file for the booster pack art.
* Added new booster pack art: Daybreaker

## 1.4.1
* Added an extra condition to the FICG parser for detecting transforming cards.

## 1.4.0
* Allow Miscellany cards (cards with no defined set) to appear in the main search.
* Added shell script to ease entry of card data.
* Added lots of miscellaneous cards.

## 1.3.3
* Fixed set name appearing as "undefined" on the Print Sheet page for Miscellany cards.

## 1.3.2
* Updated "Friendship is Card Games" with the latest cards for episodes 1 to 11 of Season 7.
* Added new emblems and tokens for the FICG booster packs.

## 1.3.1
* Added "Ungula", a set of card images covering the first two seasons of Friendship is Card Games, made by Fimfiction
  user NoLongerBreathedIn.

## 1.3.0
* Added new Miscellany section, for one-off or uncategorizable cards that aren't part of any set.
* Added a Home link to the top of every subpage.
* Card view pages (the ones reached by supplying a card hash in the URL) now have a simplified layout showing only the
  card, plus a Home link.
* Added support for a "Source URL" property in card tables, which links through to the given URL.
* The Print Sheet page can accept Miscellany cards.
* Minor update to About page.
* The FICG Python parser now reads from standard input and writes to standard output, rather than requiring a file.
* Updated the FICG parser's invocation script to use streams instead of file arguments.

## 1.2.1
* Improved RoboFoME's generation algorithm.
* Updated "Friendship is Card Games" with the latest IDW cards.

## 1.2.0
* Added RoboFoME, a random card generator.

## 1.1.4
* Added a Bash script to ease invocation of the FICG parser.
* Updated "Friendship is Card Games" with the latest IDW cards.

## 1.1.3
* Fixed an alignment issue on the print sheet generator where card images were aligning to the middle instead of the
  top.
* Made the PonyMTG logo a link to the home page.
* Updated "Friendship is Card Games" with the latest IDW cards.

## 1.1.2
* Fixed an issue with the FICG parser which caused it to misinterpret the final word of the card name as a mana cost on
  cards which don't have a cost.

## 1.1.1
* Corrected a couple of layout issues with the proxy generator on non-main pages.
* Increased the text generosity on the print sheet font size estimator.

## 1.1.0
* Changed proxy cards to use a table layout, to maintain better proportions of the card sections.
* Disabled the previous/next page buttons if there's no previous or next page.
* Slight tweak to the card text font size estimator to make it more generous with the sizing.
* Make the print sheet use slightly lower text size generosity.

## 1.0.3
* Ported the FICG parser to Python 3.
* Updated "Friendship is Card Games" set with all season 6 episodes, added some of FanOfMostEverything's IDW cards.
* Updated "Nightfall" with full card details.
* Renamed "Derpibooru 7220" to "Phil Srobeighn".

## 1.0.2
* Made the About page look slightly less terrible.
* Added a new advanced search section for General options.
* Added an "Only show cards which have images" option.
* Added card set: "PONI MTG".

## 1.0.1
* Added a local visit counter and tips panel.
* Reworded the advice panel on the Print sheets page.
* Added a "View card image" button.
* Added card set: "MtG: Fallout Equestria".
* Added card set: "Friendship the Gathering: Unseen Invasion".
* Added card set: "Friendship the Gathering: Finest Hour".

## 1.0.0
* First release!
* Added favicon.
* Added Bootstrap styles to pages that didn't have them yet.
* Added a warning to the advanced search box to note that it's not yet 100% useful.
* Changed the container for result card images from `col-md-3` to `col-md-5`, which avoids an issue of the image
  overlapping the info box at some screen widths (due to the fact that card images are not permitted to resize).
* Removed the "Search by" panel.
* Improved the styling of the search field and the card info panels.
* Reworded the About page and added a disclaimer.
* Added card set: "5moo2".
* Added card set: "ArixOrdragc".

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
