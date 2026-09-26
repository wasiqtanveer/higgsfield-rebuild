import os, re
dele = [l.strip() for l in open('.shots/purge.txt') if l.strip().startswith('src/components/')]
names = {d.split('/')[-1] for d in dele}
hits = []
for root, _, files in os.walk('src'):
    norm = root.replace(os.sep, '/')
    if any(norm.endswith('/components/' + n) for n in names):
        continue
    for f in files:
        if not f.endswith(('.jsx', '.js')):
            continue
        p = os.path.join(root, f)
        s = open(p, encoding='utf-8').read()
        for n in names:
            if re.search(r'components/' + n + r'/', s):
                hits.append(p.replace(os.sep, '/') + ' -> ' + n)
print('\n'.join(sorted(set(hits))) or '  none')
