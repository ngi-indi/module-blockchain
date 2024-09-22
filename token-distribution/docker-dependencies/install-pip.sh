#!/bin/bash

apt-get update && apt-get install -y \
    python3 \
    python3-pip \

rm /usr/lib/python*/EXTERNALLY-MANAGED
pip install --no-cache-dir --upgrade pip
pip install --no-cache-dir -r ./docker-dependencies/requirements.txt --break-system-packages