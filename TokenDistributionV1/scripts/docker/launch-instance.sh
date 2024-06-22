#!/bin/bash

# Check if an argument is passed
if [ $# -eq 0 ]; then
    echo "Error: you must choose an instance name!"
    echo "Usage: npm run <name>"
    exit 1
fi

case $1 in
    owner)
    ;;
    recipient)
    ;;
    validator-1)
    ;;
    validator-2)
    ;;
    validator-3)
    ;;
    *) # unknown option
        echo "Invalid name: $1"
        exit 1
    ;;
esac

# Prompt
read -p "Do you want to run a fresh build of the container? (y/n): " response
echo # new line

# Check the response
if [[ ${response,,} == "y" ]] # response to lowercase
then
    sudo docker compose up --build -d $1 
else
    sudo docker compose up -d $1
fi

sudo docker exec -it tokendistributionv1-$1-1 /bin/bash