#!/bin/bash

# Check if an argument is passed
if [ $# -eq 0 ]; then
    echo "Error: you must choose a network name!"
    echo "Usage: npm run <networkName>"
    exit 1
fi

case $1 in
    hardhat)
    ;;
    bnbTestnet)
    ;;
    *) # unknown option
        echo "Invalid network name: $1"
        exit 1
    ;;
esac

# Run the deploy script with the specified network name
npx hardhat run --network $1 scripts/deploy.ts