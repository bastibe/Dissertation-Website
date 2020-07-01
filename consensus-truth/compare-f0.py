import numpy
import pickle
import pathlib
from scipy.interpolate import interp1d
import json

with pathlib.Path('../../data/evaluations/ground_truths.pkl').open('rb') as file:
    data = pickle.load(file)

pretty_names = {'ptdb_tug': 'PTDB-TUG',
                'keele': 'KEELE',
                'cstr': 'FDA'}

export = {}
for corpus, corpusdata in data.items():
    if corpus not in pretty_names:
        continue

    all_factors = []
    for speech, speechdata in corpusdata.items():
        gt_time, gt_pitch, gt_prob = speechdata['ground_truth']
        ct_time, ct_pitch, ct_prob = speechdata['consensus']
        gt_pitch = interp1d(gt_time, gt_pitch, copy=False, bounds_error=False, fill_value=0)(ct_time)
        gt_prob = interp1d(gt_time, gt_prob, copy=False, bounds_error=False, fill_value=0)(ct_time)
        gt_pitch[gt_prob < 0.5] = 0
        ct_pitch[ct_prob < 0.5] = 0
        gt_pitch[gt_pitch < 0] = 0  # why???
        factors = gt_pitch / ct_pitch
        all_factors.append( factors[numpy.isfinite(factors) & (factors != 0)] )

    all_factors = numpy.concatenate(all_factors)

    # calculate GPE/FPE:
    gpe = numpy.sum((all_factors < 1/1.2) | (all_factors > 1.2)) / len(all_factors)
    print(f'{corpus} has {gpe*100:.1f} % GPE')
    fpe = numpy.mean(numpy.abs(1 - all_factors[(all_factors > 1/1.2) & (all_factors < 1.2)]))
    print(f'{corpus} has {fpe*100:.3f} Hz mean FPE (at 100 Hz)')

    # calculate error histogram:
    hist, edges = numpy.histogram(numpy.log(all_factors),
                                  range=[numpy.log(1/3.5), numpy.log(3.5)],
                                  bins=100, density=True)
    export[pretty_names[corpus]] = dict(
        edges=numpy.exp((edges[1:]+edges[:-1])/2).tolist(),
        density=hist.tolist(),
    )

with open('compare-f0.json', 'wt') as f:
    json.dump(export, f, indent=2)
