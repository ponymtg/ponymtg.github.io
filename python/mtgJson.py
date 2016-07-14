# Some miscellaneous JSON functions which produce JSON formatted in the way we'd like for our card database.
# coding=utf-8

# Given a dictionary `dictionary` and a list of keys `keys`, return a nicely-formatted JSON string representation of
# the dictionary's key-value pairs for each key in `keys`. If the dictionary doesn't contain a given key, it will be
# ignored.
def convert_dict_to_json(dictionary, keys):
    json_string = ''
    json_string += '{\n'
    for key in keys:
        if key in dictionary:
            json_string += "    '"+key+"': '"+escape_json(dictionary[key])+"',\n"
        
    json_string += '},'

    return json_string


# Prefix every line in string `string` with `prefix`. (You can use this to indent every line).
def prefix_lines(string, prefix):
    return '\n'.join([(prefix+line) for line in string.split('\n')])


# Given a string `string`, escape certain characters that need to be escaped in the JSON (mostly, single quotes).
def escape_json(string):
    return string.replace("'", "\\'")



# Given a list of dictionaries, convert the list to a JSON-format array of objects. This is not recursive; it will only
# handle flat (non-nested) dictionaries.
def convert_dict_list_to_json(dict_list, keys):
    return '\n'.join([convert_dict_to_json(dictionary, keys) for dictionary in dict_list])


# Given a list of dictionaries (for example, a list of collections of card properties), convert the list to a
# JSON-format array of objects, then wrap it up in a Javascript variable assignment. Our database files tend to be
# simply JS scripts which assign a massive string to a single variable, so this is a quick way to produce them.
#
# `keys` is a list of dictionary keys, which the function uses to decide which dictionary values to include in the
# output (and, more importantly, their ordering).
def encapsulate_dict_list_in_js_variable(dict_list, keys, variable_name):
    js_output = 'var '+variable_name+' =\n'
    js_output += '[\n'
    js_output += prefix_lines(convert_dict_list_to_json(dict_list, keys), '    ')+'\n'
    js_output += '];\n'
    return js_output

