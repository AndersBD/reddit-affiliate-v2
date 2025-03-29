#!/bin/bash

# Script to synchronize with GitHub repository
# Usage: bash scripts/github-sync.sh "Your commit message"

# Check if commit message is provided
if [ $# -eq 0 ]; then
  echo "Error: Please provide a commit message."
  echo "Usage: bash scripts/github-sync.sh \"Your commit message\""
  exit 1
fi

COMMIT_MESSAGE="$1"

# Add all changes
git add .

# Commit with the provided message
git commit -m "$COMMIT_MESSAGE"

# Set GitHub token for authentication
git remote set-url origin "https://x-access-token:$GITHUB_TOKEN@github.com/AndersBD/reddit-affiliate-v2.git"

# Push to the repository
git push origin main

echo "Successfully pushed to GitHub repository!"