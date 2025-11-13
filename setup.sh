#!/bin/bash
set -euo pipefail

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

function yes_or_no {
    while true; do
        read -p "$* [y/n]: " yn
        case $yn in
            [Yy]*) return 0 ;;  
            [Nn]*) return 1 ;;
        esac
    done
}

NVM_VERSION="${NVM_VERSION:-0.40.3}"
NODE_VERSION="${NODE_VERSION:-24}"
SET_TIMEZONE="${SET_TIMEZONE:-America/Los_Angeles}"

if yes_or_no "install nvm v${NVM_VERSION}?"; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v${NVM_VERSION}/install.sh | bash
    . "$HOME/.nvm/nvm.sh"
fi

if yes_or_no "install node v${NODE_VERSION}?"; then
    nvm install 24
fi

echo "current system time:"
timedatectl
echo ""

if yes_or_no "set timezone to ${SET_TIMEZONE}"; then
    sudo timedatectl set-timezone  ${SET_TIMEZONE}
fi

node -v
npm -v 

cd "$SCRIPT_DIR"
npm install

echo ""
echo ""
echo ""
echo "success!"
echo ""
echo ""
echo ""
echo "please add the following line to your crontab, to eg, wake up at 7:30 am every MON-FRI"
echo "    (run 'crontab -e' to edit)"
echo ""
echo "SHELL=/bin/bash"
echo '30 7 * * MON-FRI (. "/home/roon/.nvm/nvm.sh"; cd "/home/roon/roon-alarm-clock"; WAKE_ME_UP=1 node . 1>>/home/roon/log.txt) 2>&1 | logger -t roon-alarm-clock'
echo ""
echo "and have to good morning :)"