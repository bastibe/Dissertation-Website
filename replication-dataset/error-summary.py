import pandas
import json

synth = pandas.read_pickle('../../data/evaluations/synthetic_speech.pkl')
df = pandas.read_pickle('../../data/evaluations/noisy_speech.pkl')
df = df.query('truth=="consensus"') \
       .query('vad=="mixed"') \
       .query('algo != ["amdf", "autoc", "cep", "dnn", "nls"]')
df.algo = df.algo.cat.remove_unused_categories()

pretty_names = {'bana': 'BANA', 'crepe': 'CREPE', 'dio': 'DIO', 'kaldi': 'KALDI',
                'maps_f0': 'MAPS', 'mbsc': 'MBSC', 'nls2': 'NLS', 'pefac': 'PEFAC',
                'praat': 'PRAAT', 'rapt': 'RAPT', 'rnn': 'RNN', 'sacc': 'SACC',
                'safe': 'SAFE', 'shr': 'SHR', 'sift': 'SIFT', 'srh': 'SRH',
                'straight': 'STRAIGHT', 'swipe': 'SWIPE', 'yaapt': 'YAAPT', 'yin': 'YIN'}

data = {}
for algo, algodata in df.groupby('algo'):
    mean_gpe = algodata.groupby(['snr']).mean().gpe
    if algo not in ['bana', 'nls2', 'safe', 'sift', 'yaapt', 'yin']:
        nan_count = 1 - (algodata.groupby(['snr']).count().gpe / 4200)
        false_negatives = algodata.groupby(['snr']).mean().fnr
        false_positives = algodata.groupby(['snr']).mean().fpr
    else:
        nan_count = false_negatives = false_positives = None

    data[pretty_names[algo]] = dict(
        snr=list(mean_gpe.index),
        gpe=list(mean_gpe.values),
        nans=list(nan_count.values) if nan_count is not None else None,
        false_positives=list(false_positives.values) if false_positives is not None else None,
        false_negatives=list(false_negatives.values) if false_negatives is not None else None
    )

with open('error-summary.json', 'wt') as f:
    json.dump(data, f, indent=2)
