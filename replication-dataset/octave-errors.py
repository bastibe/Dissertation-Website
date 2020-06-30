import pandas
import json

df = pandas.read_pickle('../../data/evaluations/noisy_speech.pkl')

df = df.query('truth=="consensus"') \
       .query('algo != ["amdf", "autoc", "cep", "dnn", "nls"]') \
       .query('vad=="mixed"')
df.algo = df.algo.cat.remove_unused_categories()

pretty_names = {'bana': 'BANA', 'crepe': 'CREPE', 'dio': 'DIO', 'kaldi': 'KALDI',
                'maps_f0': 'MAPS', 'mbsc': 'MBSC', 'nls2': 'NLS', 'pefac': 'PEFAC',
                'praat': 'PRAAT', 'rapt': 'RAPT', 'rnn': 'RNN', 'sacc': 'SACC',
                'safe': 'SAFE', 'shr': 'SHR', 'sift': 'SIFT', 'srh': 'SRH',
                'straight': 'STRAIGHT', 'swipe': 'SWIPE', 'yaapt': 'YAAPT', 'yin': 'YIN'}

data = {}
for algo, group in df.groupby(['algo']):
    high = group.groupby(['snr']).mean()['high octave errors']
    low = group.groupby(['snr']).mean()['low octave errors']
    remaining = group.groupby(['snr']).mean()['remaining errors']

    data[pretty_names[algo]] = dict(
        snrs=list(high.index),
        high=list(high.values),
        low=list(low.values),
        remaining=list(remaining.values)
    )

with open('octave-errors.json', 'wt') as f:
    json.dump(data, f, indent=2)
