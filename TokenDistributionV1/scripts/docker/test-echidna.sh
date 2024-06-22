#!/bin/bash

# Prompt
read -p "Do you want to run a fresh build of the container? (y/n): " response
echo # new line

# Check the response
if [[ ${response,,} == "y" ]] # resposne to lowercase
then
    sudo docker compose up --build -d test-echidna 
else
    sudo docker compose up -d test-echidna
fi

sudo docker exec -it tokendistributionv1-test-echidna-1 npm run test:echidna