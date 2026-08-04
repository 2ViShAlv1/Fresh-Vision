import json
import tokenize
import io

def strip_comments(source_code):
    result = []
    g = tokenize.generate_tokens(io.StringIO(source_code).readline)
    last_lineno = -1
    last_col = 0
    try:
        for tokval in g:
            toknum, tokstr, start, end, line = tokval
            s_line, s_col = start
            e_line, e_col = end

            if s_line > last_lineno:
                last_col = 0
            if s_col > last_col:
                result.append(" " * (s_col - last_col))

            if toknum == tokenize.COMMENT:
                pass
            else:
                result.append(tokstr)

            last_lineno = e_line
            last_col = e_col
        return "".join(result)
    except Exception:
        return source_code

with open('/home/vank/Final_Project/Untitled1.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb.get('cells', []):
    if cell.get('cell_type') == 'code':
        source = cell.get('source', [])
        if isinstance(source, list):
            source_str = "".join(source)
            no_comments = strip_comments(source_str)
            if no_comments:
                cell['source'] = no_comments.splitlines(keepends=True)
            else:
                cell['source'] = []
        else:
            source_str = source
            cell['source'] = strip_comments(source_str)

with open('/home/vank/Final_Project/Untitled1.ipynb', 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)
    f.write('\n')
print("Done stripping comments")
