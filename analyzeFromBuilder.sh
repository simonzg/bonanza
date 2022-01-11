#!/bin/bash

ssh ubuntu@builder.meter.io 'cd /home/ubuntu/test/bonanza && mkdir -p analysis && npm run analyze'
rsync -rvz --delete ubuntu@builder.meter.io:/home/ubuntu/test/bonanza/analysis ./
