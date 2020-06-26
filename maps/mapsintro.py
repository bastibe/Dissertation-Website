import pesto
import numpy as np
import json
import soundfile

signal, fs = soundfile.read('Mann_short.wav')
t, f, p = pesto.pesto(pesto.SignalBlocks(signal, fs, hopsize=512))
f[p<0.5] = 0

with open('Mann_short.json', 'w') as outfile:
    json.dump(dict(est_t=list(t), est_f=list(f)), outfile)
