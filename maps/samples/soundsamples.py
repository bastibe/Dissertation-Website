import json
import numpy
import soundfile
from tqdm import tqdm
from evaluation import db, create_test_signal, get_true_base_frequency, pesto_experiment

samplerate = 48000

noise = {'cafeteria': 'CAFE-CAFE-1.au',
         'traffic': 'STREET-CITY-1.au',
         'car': 'CAR-WINDOWNB-1.au'}
speech = {'male1': 'mic_M01_si629.au',
          'male2': 'mic_M02_sx77.au',
          'female1': 'mic_F01_si499.au',
          'female2': 'mic_F02_si671.au'}

for k, v in list(noise.items()):
    noise[k] = db.find({'filename': v})[0]['_id']
for k, v in list(speech.items()):
    speech[k] = db.find({'filename': v})[0]['_id']

noise['white'] = 'white noise'

tracks = {}

for snr in tqdm([40, 35, 30, 25, 20, 15, 10, 5, 0, -5, -10, -15, -20]):
    for noisename, noiseid in noise.items():
        for speechname, speechid in speech.items():
            signal = create_test_signal(speechid, noiseid, 10*60, snr, samplerate)
            filename = speechname + noisename + str(snr) + '.wav'
            soundfile.write(filename, signal, samplerate)
            true_f, true_t = get_true_base_frequency(speechid)
            est_t, est_f, est_p = pesto_experiment(signal, samplerate)
            est_f[est_p < 0.5] = 0
            tracks[filename] = {'true_t': list(true_t), 'true_f': list(true_f),
                                'est_t': list(est_t), 'est_f': list(est_f)}

with open('tracks.json', 'w') as f:
    json.dump(tracks, f)
