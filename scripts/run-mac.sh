#!/bin/bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --incognito \
  --ignore-certificate-errors \
  --allow-insecure-localhost \
  --unsafely-treat-insecure-origin-as-secure="https://pos.local:3000,https://mock-api.local:5000" \
  --user-data-dir="/tmp/chrome-dev-profile"
