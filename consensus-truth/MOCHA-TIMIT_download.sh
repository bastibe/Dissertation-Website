#!/usr/bin/env bash
# http://www.cstr.ed.ac.uk/research/projects/artic/mocha.html

mkdir -p MOCHA-TIMIT_original/unchecked
cd MOCHA-TIMIT_original

for FILENAME in LICENCE.txt README.fsew0.v1.1 README.maps0 README.msak0 README_v1.2.txt fsew0_v1.1.tar.gz \
                maps0.tar.gz mocha-timit.txt msak0_v1.1.tar.gz unchecked/faet0.tar.gz unchecked/falh0.tar.gz \
                unchecked/ffes0.tar.gz unchecked/fjmw0.tar.gz unchecked/mjjn0.tar.gz unchecked/mkxr0.tar.gz \
                unchecked/ss240402.tar.gz
do
    wget http://data.cstr.ed.ac.uk/mocha/$FILENAME -O $FILENAME
done

for FILENAME in msak0_v1.1 maps0 fsew0_v1.1 unchecked/faet0 unchecked/falh0 unchecked/ffes0 unchecked/fjmw0 unchecked/mjjn0
do
    mkdir -p $FILENAME
    tar -xf $FILENAME.tar.gz -C $FILENAME
done

tar -xf unchecked/ss240402.tar.gz -C unchecked/
# this file contains different, unknown data:
# tar -xf MOCHA_TIMIT_orig/unchecked/mkxr0.tar.gz -C MOCHA_TIMIT_orig/unchecked/
