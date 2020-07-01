import numpy
import pickle
import pathlib
import json

with pathlib.Path('../../data/evaluations/ground_truths.pkl').open('rb') as file:
    data = pickle.load(file)

pretty_names = {'ptdb_tug': 'PTDB-TUG',
                'keele': 'KEELE',
                'cstr': 'FDA',
                'timit': 'TIMIT',
                'mocha_timit': 'MOCHA-TIMIT',
                'cmu_arctic': 'CMU-ARCTIC'}

export = {}
for corpus, corpusdata in data.items():
    if corpus not in pretty_names:
        continue

    all_pitches = []
    for speech, speechdata in corpusdata.items():
        time, pitch, prob = speechdata['consensus']
        pitch[prob < 0.5] = 0
        all_pitches.append( pitch[numpy.isfinite(pitch) & (pitch != 0)] )
    all_pitches = numpy.concatenate(all_pitches)

    # calculate histograms:
    hist, edges = numpy.histogram(all_pitches,
                                  range=[50, 450],
                                  bins=100, density=True)
    export[pretty_names[corpus]] = dict(
        edges=((edges[1:]+edges[:-1])/2).tolist(),
        density=hist.tolist()
    )

with open('f0-histogram.json', 'wt') as f:
    json.dump(export, f, indent=2)
