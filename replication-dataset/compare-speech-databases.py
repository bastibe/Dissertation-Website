import pandas
import collections
import json


df = pandas.read_pickle('../data/evaluations/noisy_speech.pkl')
df = df.query('truth=="consensus"') \
       .query('vad=="mixed"') \
       .query('algo != ["amdf", "autoc", "cep", "dnn", "nls"]')
df.algo = df.algo.cat.remove_unused_categories()

pretty_names = {'bana': 'BANA', 'crepe': 'CREPE', 'dio': 'DIO', 'kaldi': 'KALDI', 'maps_f0': 'MAPS',
                'mbsc': 'MBSC', 'nls2': 'NLS', 'pefac': 'PEFAC', 'praat': 'PRAAT', 'rapt': 'RAPT',
                'rnn': 'RNN', 'sacc': 'SACC', 'safe': 'SAFE', 'shr': 'SHR', 'sift': 'SIFT',
                'srh': 'SRH', 'straight': 'STRAIGHT', 'swipe': 'SWIPE', 'yaapt': 'YAAPT', 'yin': 'YIN'}

data = collections.defaultdict(dict)
for algoname, algodata in data.groupby('algo'):
    meangpe = algodata.groupby('snr').mean().gpe
    for corpusname, corpusdata in algodata.groupby('speech_dataset'):
        corpusgpe = corpusdata.groupby('snr').mean().gpe
        data[algoname][corpusname] = dict(
            snr=list(corpusgpe.index),
            gpe=list((corpusgpe - meangpe).values)
        )

with open('compare-databases.json', 'wt') as f:
    json.dump(data, f, indent=2)
