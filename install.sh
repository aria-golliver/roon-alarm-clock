#!/bin/bash
set -eEuo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

outfile=${1:-$HOME/bin/alarm-clock}

mkdir -p "$(dirname "$outfile")"
bun build "$SCRIPT_DIR/app.js" --compile --outfile "$outfile"