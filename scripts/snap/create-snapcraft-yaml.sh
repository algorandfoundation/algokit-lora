#!/bin/bash

# Ensure the script fails on errors
set -e

# Check if the correct number of arguments are passed
if [ "$#" -ne 4 ]; then
  echo "Usage: $0 <destination_directory> <release_tag> <grade> <source_dir>"
  exit 1
fi

# Assign arguments to variables
DESTINATION_DIR="$1"
RELEASE_TAG="$2"
GRADE="$3"
SOURCE_DIR="$4"

# Ensure the destination directory exists
mkdir -p "${DESTINATION_DIR}/snap"

# Extract version from RELEASE_TAG, assuming it's in the format "vX.Y.Z"
VERSION="${RELEASE_TAG#v}"

# Create the snapcraft.yaml file
cat > "${DESTINATION_DIR}/snap/snapcraft.yaml" <<EOF
name: algokit-lora
base: core22
version: "$VERSION"
summary: Short description of algokit-lora.
description: |
  Detailed description of algokit-lora.

confinement: classic
grade: $GRADE

parts:
  algokit-lora:
    source: "$SOURCE_DIR"
    plugin: dump
    stage:
      - icons
      - algokit-lora
      - algokit-lora.desktop
      - usr/lib/
    prime:
      - icons
      - algokit-lora
      - algokit-lora.desktop
      - usr/lib/
      - -usr/lib/x86_64-linux-gnu/libEGL_mesa.so.0.0.0
      - -usr/lib/x86_64-linux-gnu/libGLESv2.so.2.1.0
      - -usr/lib/x86_64-linux-gnu/libGLX_mesa.so.0.0.0
      - -usr/lib/x86_64-linux-gnu/libcaca++.so.0.99.19
      - -usr/lib/x86_64-linux-gnu/libcolordprivate.so.2.0.5
      - -usr/lib/x86_64-linux-gnu/libdconf.so.1.0.0
      - -usr/lib/x86_64-linux-gnu/libexslt.so.0.8.20
      - -usr/lib/x86_64-linux-gnu/libgstcheck-1.0.so.0.2003.0
      - -usr/lib/x86_64-linux-gnu/libgstcontroller-1.0.so.0.2003.0
      - -usr/lib/x86_64-linux-gnu/libicuio.so.70.1
      - -usr/lib/x86_64-linux-gnu/libicutest.so.70.1
      - -usr/lib/x86_64-linux-gnu/libjacknet.so.0.1.0
      - -usr/lib/x86_64-linux-gnu/libjackserver.so.0.1.0
      - -usr/lib/x86_64-linux-gnu/liborc-test-0.4.so.0.32.0
      - -usr/lib/x86_64-linux-gnu/libpulse-simple.so.0.1.1
      - -usr/lib/x86_64-linux-gnu/libunwind-coredump.so.0.0.0
      - -usr/lib/x86_64-linux-gnu/libunwind-ptrace.so.0.0.0
      - -usr/lib/x86_64-linux-gnu/libunwind-x86_64.so.8.0.1
      - -usr/lib/x86_64-linux-gnu/libwoff2enc.so.1.0.2
      - -usr/lib/x86_64-linux-gnu/libicutu.so.70.1
      - -usr/lib/x86_64-linux-gnu/libsamplerate.so.0.2.2
      - -usr/lib/x86_64-linux-gnu/libxcb-dri2.so.0.0.0
      - -usr/lib/x86_64-linux-gnu/libxcb-glx.so.0.0.0
      - -usr/lib/x86_64-linux-gnu/libxcb-present.so.0.0.0
      - -usr/lib/x86_64-linux-gnu/libxcb-sync.so.1.0.0
      - -usr/lib/x86_64-linux-gnu/libxcb-xfixes.so.0.0.0
      - -usr/lib/x86_64-linux-gnu/libxshmfence.so.1.0.0
    stage-packages:
      - libwebkit2gtk-4.0-37
      - freeglut3
      - libglu1-mesa

apps:
  algokit-lora:
    command: algokit-lora
    desktop: algokit-lora.desktop
    plugs:
      - desktop
      - desktop-legacy
      - home
      - x11
      - wayland
      - network
      - network-bind
EOF

echo "snapcraft.yaml has been created at ${DESTINATION_DIR}/snap/snapcraft.yaml"
