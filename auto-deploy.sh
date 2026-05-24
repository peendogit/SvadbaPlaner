#!/bin/bash
cd /var/www/SvadbaPlaner
git fetch origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
    echo "$(date): Promjena detektovana, deploying..."
    git pull
    npm run build
    cp -r build/* /var/www/svadba/
    if [ -d "server" ]; then
        cp server/server.js /var/www/svadba-api/server.js
        cp server/rsvp.html /var/www/svadba-api/rsvp.html
        cd /var/www/svadba-api && npm install --production
        pm2 restart svadba-api
        cd /var/www/SvadbaPlaner
    fi
    echo "$(date): Deploy završen"
fi
