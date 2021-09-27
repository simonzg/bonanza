#!/bin/bash

rm -rf temp
mkdir temp
cd temp
ssh ubuntu@18.141.69.185 '/home/ubuntu/test/pack.sh'
scp ubuntu@18.141.69.185:test/data.tgz .
tar xzf data.tgz
cp -r bonanza/data/* ../data/
