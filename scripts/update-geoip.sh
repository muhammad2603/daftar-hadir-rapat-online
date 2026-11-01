#!/bin/bash

set -euo pipefail
mkdir -p data
cd "$(dirname "$0")/../data"

THIS_MONTH=$(date +%Y-%m)
LAST_MONTH=$(date -d 'last month' +%Y-%m)

for kind in city asn; do
    echo "Sedang Mengunduh GeoIP ${kind}..."
    for ym in "$THIS_MONTH" "$LAST_MONTH"; do
        url="https://download.db-ip.com/free/dbip-${kind}-lite-${ym}.mmdb.gz"
        if curl -fsL -o "${kind}.gz.tmp" "$url"; then
            gunzip -c "${kind}.gz.tmp" > "dbip-${kind}-lite.mmdb.tmp"
            mv "dbip-${kind}-lite.mmdb.tmp" "dbip-${kind}-lite.mmdb"
            rm -f "${kind}.gz.tmp"
            echo "Berhasil mengunduh GeoIP: ${kind} ${ym}"
            break
        fi
    done
done