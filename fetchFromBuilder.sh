#!/bin/bash

rm -rf temp
mkdir temp
cd temp
ssh ubuntu@18.138.99.50 '/home/ubuntu/test/pack.sh'
scp ubuntu@18.138.99.50:test/data.tgz .
tar xzf data.tgz
cp -r bonanza/data/* ../data/
