#!/usr/bin/env bash
# http://www.cstr.ed.ac.uk/research/projects/fda/

mkdir -p FDA_original
wget "http://www.cstr.ed.ac.uk/research/projects/fda/fda_eval.tar.gz" -O FDA_original.tar.gz
tar -xf FDA_original.tar.gz -C FDA_original
