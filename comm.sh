#!/usr/bin/env sh

eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519-gitlab

git init
git checkout -B main
git add -A
git commit -m 'added all files'

