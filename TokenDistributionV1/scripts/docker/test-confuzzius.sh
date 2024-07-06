#!/bin/bash

# Prompt
read -p "Do you want to run a fresh build of the container? (y/n): " response
echo # new line

# Check the response
if [[ ${response,,} == "y" ]] # response to lowercase
then
    sudo docker compose up --build -d test-confuzzius 
else
    sudo docker compose up -d test-confuzzius 
fi

# Run the fuzzer on the TokenDistribution contract (this doesn't work probably for the compiler version (and the lacking of support for the newer evm versions))
sudo docker exec -it tokendistributionv1-test-confuzzius-1 python3 /root/fuzzer/main.py -s /root/contracts/TokenDistribution.sol -c TokenDistribution --solc v0.8.25

# Run the fuzzer on the example contract: (this works)
# sudo docker exec -it tokendistributionv1-test-confuzzius-1 python3 fuzzer/main.py -s examples/TokenSale/contracts/TokenSale.sol -c TokenSale --solc v0.4.26 --evm byzantium -t 10