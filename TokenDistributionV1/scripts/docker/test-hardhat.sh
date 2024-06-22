#!/bin/bash

# Prompt
read -p "Do you want to run a fresh build of the container? (y/n): " response
echo # new line

# Check the response
if [[ ${response,,} == "y" ]] # response to lowercase
then
    sudo docker compose up --build test-hardhat 
else
    sudo docker compose up test-hardhat
fi