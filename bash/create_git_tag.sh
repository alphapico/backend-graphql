#!/bin/bash

new_version_number="$1"

if [ -z "$new_version_number" ]; then
  echo "Usage: $0 <new_version_number>"
  exit 1
fi

highest_version=$(git tag --list "v*" | sort -V | tail -n 1)

if [ -z "$highest_version" ]; then
  git tag "v${new_version_number}"
  echo "Git tag created: v${new_version_number}"
elif [[ "$highest_version" < "v${new_version_number}" ]]; then
  git tag "v${new_version_number}"
  echo "Git tag created: v${new_version_number}"
else
  echo "Error: New version number must be higher than the current highest version number."
  exit 1
fi
