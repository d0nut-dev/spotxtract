#!/usr/bin/env sh

eval "$(ssh-agent -s)"
ssh-add <your key's location>

set -e

npm run build

cd dist

echo > .nojeykyll

git init
git checkout -B main #(or your own branch name)
git add -A
git commit -m 'deploy'

#example: git push -f git@github.com:d0nut-dev/spotxtract.git main:gh-pages
git push -f git@github.com:<username>/<repo_name>.git <branch>
cd -
