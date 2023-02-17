#!/usr/bin/env sh

eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519-gitlab

set -e

npm run build

cd dist

echo > .nojeykyll

git init
git checkout -B main
git add -A
git commit -m 'deploy'

git push -f git@github.com:d0nut-dev/spotxtract.git main:gh-pages

cd -
