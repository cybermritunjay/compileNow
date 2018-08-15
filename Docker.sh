#!/bin/bash
set -e

to=$1 #store time in a variable
shift	#shift each arguments to bycot time

cont=$(docker run --rm -d "$@") #execute command docker rum --rm -d -u mysql -e 'NODE_PATH=/usr/local/lib/node_modules' -i -t -v  "path to temp folder":/user IMAGE /user/script.sh python file.py 
code=$(timeout "$to" docker wait "$cont" || true) #execute timeout 20s docker wait OUTPUT OF CONT || true
echo docker kill $cont &> /dev/null #execute docker kill OUTPUT OF  CONT &> /dev/null
echo -n 'status: '
if [ -z "$code" ]; then
    echo timeout
else
    echo exited: $code
fi

echo output:
# pipe to sed simply for pretty nice indentation
docker logs $cont | sed 's/^/\t/'

docker rm $cont &> /dev/null