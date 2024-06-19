#!/bin/bash

# Ensure the script fails on errors
set -e

# Check if the correct number of arguments are passed
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <release_dir>"
  exit 1
fi

# Assign arguments to variables
RELEASE_DIR="$1"

# Create the algokit-lora.desktop file
cat > "${RELEASE_DIR}/algokit-lora.desktop" <<EOF
[Desktop Entry]
Name=algokit-lora
Exec=algokit-lora %U
Terminal=false
Icon=\${SNAP}/icons/128x128.png
Type=Application
Comment=algokit-lora
EOF

echo "algokit-lora.desktop has been created at ${RELEASE_DIR}/algokit-lora.desktop"
