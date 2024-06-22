#!/bin/bash

# Download Echidna
cd ~
wget https://github.com/crytic/echidna/releases/download/v2.2.3/echidna-2.2.3-x86_64-linux.tar.gz

# Extract the archive
tar -xvf echidna-2.2.3-x86_64-linux.tar.gz
rm echidna-2.2.3-x86_64-linux.tar.gz

# Move it to the programs folder
mv echidna /usr/local/bin/

# solc-select
solc-select install 0.8.25