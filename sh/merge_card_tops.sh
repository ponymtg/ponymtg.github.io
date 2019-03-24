#!/bin/bash -f

# This script uses Imagemagick to extract the top parts of the specified card
# image files, and joins them all together into one tall image, which it writes
# to the standard output. The result is an image containing essentially a
# vertical list of card names, which makes it easier to manually enter them into
# the cards database.
#
# Example invocation:
#
#     ./merge_card_tops *.png > list.png
#
# <https://stackoverflow.com/questions/14381711/bash-expand-braces-and-globs-with-spaces-in-filenames>

# Since we're expecting a wildcard, we need to accept all arguments to the
# script. We use $@ for this, but we also need to quote it (if we don't, Bash
# doesn't handle the spaces in filenames correctly).

convert -crop 100%x4%+0+33% -append "$@" -
