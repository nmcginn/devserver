##!/bin/sh

#kill `ps -ef | grep -E "node.*$1" | grep -v "grep" | awk '{ print $2 }'`

#/usr/local/bin/node $1

param (
    [string]$proc = "./yourjsfile.js"
)
get-process | where-object {$_.ProcessName -eq "node"} | stop-process
node $proc