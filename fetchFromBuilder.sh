#!/bin/bash

rm -rf temp
mkdir temp
cd temp
ssh ubuntu@builder.meter.io '/home/ubuntu/test/pack.sh'
scp ubuntu@builder.meter.io:test/data.tgz .
tar xzf data.tgz
cp -r bonanza/data/* ../data/
