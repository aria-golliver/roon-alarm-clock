#!/bin/bash
set -eEuxo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

outfile=${1:-$HOME/bin/alarm-clock}

bun build "$SCRIPT_DIR/app.js" --compile --outfile "$outfile"