#!/bin/bash
geth --port 4000 --nodiscover --datadir=./blockchain --maxpeers=0 --http --http.api personal,eth,net,web3,miner,debug --allow-insecure-unlock  --http.corsdomain=* --mine --miner.etherbase 0x3740Ea52f5bBadde4c6aDe7aC324447611a2f1a7 --unlock 0x3740Ea52f5bBadde4c6aDe7aC324447611a2f1a7 "${@}"
