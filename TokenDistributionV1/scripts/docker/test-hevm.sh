#!/bin/bash

# Prompt
read -p "Do you want to run a fresh build of the container? (y/n): " response
echo # new line

# Check the response
if [[ ${response,,} == "y" ]] # response to lowercase
then
    sudo docker compose up --build -d test-hevm 
else
    sudo docker compose up -d test-hevm
fi

sudo docker exec -it tokendistributionv1-test-hevm-1 /bin/bash