#!/bin/bash

apt-get update
apt-get install apt-file
apt-file update

# File editor
apt-get install nano

# Json parser
apt-get install -y jq