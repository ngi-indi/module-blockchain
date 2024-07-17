#!/bin/bash

echo "Some commands require a Git authentification (just your name and email) to get executed."

source ./.env

git config --global user.name $GIT_NAME
git config --global user.email $GIT_EMAIL

# from: https://hevm.dev/getting-started.html#building

# Z3 (SMT solver)
apt-get install z3 

# foundryup
curl -L https://foundry.paradigm.xyz | bash
source /root/.bashrc # resets the terminal
foundryup 

mkdir hevm-test && cd hevm-test
forge init . --force

# Install hevm
wget https://github.com/ethereum/hevm/releases/download/release/0.53.0/hevm-x86_64-linux
chmod +x ./hevm-x86_64-linux

# Move the contracts to the folder
cd ..
mv ./contracts/TokenDistribution.sol ./hevm-test/src/TokenDistribution.sol
mv ./contracts/IndiToken.sol ./hevm-test/src/IndiToken.sol
mkdir ./hevm-test/\@openzeppelin
mv ./node_modules/\@openzeppelin/contracts ./hevm-test/\@openzeppelin/contracts

# Compile the contracts
cd hevm-test
forge build