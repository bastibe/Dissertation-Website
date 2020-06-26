import json
import pandas

table = pandas.read_msgpack('experiment_results_recordings.msg')
data = table.query('threshold==True')
data = data.groupby(['snr', 'algo']).mean().unstack('algo')
labels = {'maps_f0': 'MaPS', 'pefac': 'PEFAC', 'rapt': 'RAPT', 'yin': 'YIN'}

out = {}
for algo in data.gpe:
    out[labels[algo]] = dict(data.gpe[algo] * 100)

with open('maps-compare-gpe.json', 'wt') as f:
    json.dump(out, f)

out = {}
for algo in data.fpe:
    out[labels[algo]] = dict(data.fpe[algo] * 100)

with open('maps-compare-fpe.json', 'wt') as f:
    json.dump(out, f)
