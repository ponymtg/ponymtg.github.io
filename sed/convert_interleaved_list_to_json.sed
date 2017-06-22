# Simple sed script to convert an interleaved list of card names and image filenames into JSON.
1~2 s/^.*$/        'name': '\0',/
2~2 s/^.*$/        'image': '\0',/
1~2 i \ \ \ \ {
2~2 a \ \ \ \ \ \ \ \ 'creator': 'rowcla',
2~2 a \ \ \ \ },

