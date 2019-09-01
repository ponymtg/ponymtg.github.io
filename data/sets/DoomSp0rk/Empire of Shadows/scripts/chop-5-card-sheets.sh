SOURCE_DIR="5-card-sheets"
OUTPUT_DIR="$SOURCE_DIR-chopped"

# Create the output directory if it doesn't exist.
[ ! -d "$OUTPUT_DIR" ] && mkdir -p "$OUTPUT_DIR"

# Crop all files from the source directory one-by-one and output the cropped
# versions to the output directory.

# top: 17px
# left: 23px
# right: 22px
# bottom: 21px

for file in `ls $SOURCE_DIR/*.jpg`
do
    # For each file, get its name with the path and suffix stripped.
    base_name=$(basename -s .jpg $file)

    # Crop the image's borders off, slice it into 10 equal parts, and save to
    # the output directory.
    magick $file -crop 1875x523+23+17 - \
    | magick - -crop 20%x100% "$OUTPUT_DIR/$base_name-%d.jpg"
done
