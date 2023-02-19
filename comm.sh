#!/usr/bin/env sh

eval "$(ssh-agent -s)"

#paste your keys location here v
ssh-add <location>

git init
git checkout -B main
git add -A
git commit -m 'added all files'

