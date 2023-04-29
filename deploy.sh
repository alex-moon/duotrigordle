#!/bin/bash

doctl auth init --context=ajmoon

/snap/bin/doctl registry login --context=ajmoon || exit 9

docker-compose build || exit 9

# Tag and push the image to the DOCR
docker push registry.digitalocean.com/ajmoon/duotrigordle:live || exit 9

scp -oStrictHostKeyChecking=no docker-compose.yml ajmoon:docker-compose.duotrigordle.yml || exit 9

ssh ajmoon "
    doctl registry login --context=ajmoon
    docker pull registry.digitalocean.com/ajmoon/duotrigordle:live
    docker stack deploy -c docker-compose.duotrigordle.yml duotrigordle --with-registry-auth
    docker run --rm -i -v /var/run/docker.sock:/var/run/docker.sock -u root ubirak/docker-php:latest stack:converge duotrigordle
    docker system prune -f
" || exit 9

doctl registry repo list-tags $1 --context=ajmoon \
    | grep -o "sha256.*" \
    | xargs doctl registry repo delete-manifest -f --context=ajmoon duotrigordle
