#!/usr/bin/env bash
# https://www.spsc.tugraz.at/tools/ptdb-tug

mkdir -p PTDB-TUG_original

wget https://www2.spsc.tugraz.at/databases/PTDB-TUG/SPEECH_DATA_ZIPPED.zip -O PTDB-TUG_original.zip
unzip PTDB-TUG_original.zip -d PTDB-TUG_original

mkdir -p PTDB-TUG_original/DOCUMENTATION
cd PTDB-TUG_original/DOCUMENTATION
wget https://www2.spsc.tugraz.at/databases/PTDB-TUG/DOCUMENTATION/InterSpeech2011Master.pdf
wget https://www2.spsc.tugraz.at/databases/PTDB-TUG/DOCUMENTATION/PTDB-TUG_REPORT.pdf
wget https://www2.spsc.tugraz.at/databases/PTDB-TUG/DOCUMENTATION/RECORDING-PROTOCOL.txt
wget https://www2.spsc.tugraz.at/databases/PTDB-TUG/DOCUMENTATION/SPEAKER-PROFILES.txt
wget https://www2.spsc.tugraz.at/databases/PTDB-TUG/DOCUMENTATION/TIMIT-PROMPTS.txt
