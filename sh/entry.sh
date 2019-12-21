#!/bin/bash

# This script helps to automate the process of generating a JSON file from a
# collection of card images.
#
# Invocation is as follows:
#
#     ./entry.sh FILE_SPECIFIER
#
# where `FILE_SPECIFIER` is a wildcard path that resolves to one or more card
# image files, eg. "cards/*.png".
#
# When invoked, the script will read all the card image files and combine their
# tops into one long easy-to-read list. It then opens this combined image in an
# image viewer. On the terminal, you will then be prompted to enter the names of
# each card, one-by-one. When all names have been entered, the script will then
# transform the resulting list into JSON format, and write it to the standard
# output stream.

# The image viewer application to use for viewing the combined cards image.
IMAGE_VIEWER=viewnior

# Name of the temporary directory the script will be using. This will be deleted
# when the script finishes.
DATESTAMP=$(date +%Y%m%d%H%M%S)
TMP_DIR=".ponymtg_tmp_$DATESTAMP"

# Names for the temporary output files.
OUTPUT_CARD_TOPS_IMAGE_FILENAME=card_tops.png

# Create the temporary directory.
mkdir -p $TMP_DIR

# Using Imagemagick, combine the tops of all the specified card images into one
# big image, and save it in the temporary directory.
convert -crop 100%x4%+0+33% -append "$@" $TMP_DIR/$OUTPUT_CARD_TOPS_IMAGE_FILENAME

# Open the combined card image in the background.
$IMAGE_VIEWER $TMP_DIR/$OUTPUT_CARD_TOPS_IMAGE_FILENAME &

echo "Enter the card names from top to bottom." 1>&2
echo "Press Ctrl-D after all card names have been entered." 1>&2
CARD_NAMES=$(cat)

# Assemble the specified card images into a newline-delimited list.
image_filename_list=
for file in "$@";do
    image_filename_list="$image_filename_list$file\n"
done

# Create a sed script to transform the interleaved list (once we interleave the
# card names and images) to JSON.
SED_SCRIPT=$(cat <<'SED'
1~2 s/^.*$/        "name": "\0",/
2~2 s/^.*$/        "image": "\0",/
1~2 i \ \ \ \ {
2~2 a \ \ \ \ \ \ \ \ "creator": "",
2~2 a \ \ \ \ },
SED
)

# Use `paste` to interleave the two lists, then use the sed script to convert
# this to the appropriate JSON format.
paste -d '\n' <(echo "$CARD_NAMES") <(echo -e "$image_filename_list") | sed -f <(echo "$SED_SCRIPT")

# Delete the temporary directory.
rm -rf $TMP_DIR
