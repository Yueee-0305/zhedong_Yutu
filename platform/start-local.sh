#!/bin/sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js is unavailable. Open dist/offline.html directly in your browser.'
  exit 1
fi
node scripts/build.cjs
node server/index.cjs
