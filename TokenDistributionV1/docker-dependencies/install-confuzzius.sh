#!/bin/bash

# From: https://github.com/christoftorres/ConFuzzius#installation-instructions

cd ~

# Solidity compiler
# add-apt-repository ppa:ethereum/ethereum
# apt-get update
# apt-get install solc

# solc-select
solc-select install 0.8.25

# Download Z3 Prover (source code)
wget https://github.com/Z3Prover/z3/archive/refs/tags/Z3-4.8.5.tar.gz

# Extract the archive
tar -xvf Z3-4.8.5.tar.gz
rm Z3-4.8.5.tar.gz

# Install Z3 Prover with Python bindings
cd z3-Z3-4.8.5
python3 scripts/mk_make.py --python
cd build
make
make install

# Download ConFuzzius
cd ~
wget https://github.com/christoftorres/ConFuzzius/archive/refs/tags/v0.0.2.tar.gz

# Extract the archive
tar -xvf v0.0.2.tar.gz
rm v0.0.2.tar.gz

# Install ConFuzzius
cd ConFuzzius-0.0.2
cd fuzzer
pip3 install -r requirements.txt