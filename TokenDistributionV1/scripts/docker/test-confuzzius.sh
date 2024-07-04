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

# TODO: change here the command for ConFuzzius
# sudo docker exec -it tokendistributionv1-test-confuzzius-1 npm run test:echidna