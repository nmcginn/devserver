#!/bin/sh
kill `ps -ef | grep -E "node.*$1" | grep -v "grep" | awk '{ print $2 }'`
/usr/local/bin/node $1
