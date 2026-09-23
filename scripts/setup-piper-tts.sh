#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# setup-piper-tts.sh — Install Piper TTS on Orange Pi 3B (ARM64 Debian Bookworm)
#
# This script:
#   1. Downloads the Piper binary (ARM64 / aarch64)
#   2. Downloads the en_US-amy-medium voice model
#   3. Verifies the installation
#   4. Installs a systemd service to auto-start the TTS server on boot
#
# Usage:
#   chmod +x setup-piper-tts.sh
#   ./setup-piper-tts.sh
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIPER_DIR="${SCRIPT_DIR}/piper"
VOICES_DIR="${PIPER_DIR}/voices"
PIPER_VERSION="2023.11.14-2"
VOICE_NAME="en_US-amy-medium"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  OWL Kiosk — Piper TTS Setup for Orange Pi 3B${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── Check architecture ────────────────────────────────────────────────────────
ARCH=$(uname -m)
echo -e "${YELLOW}[1/5]${NC} Checking system architecture..."
if [[ "$ARCH" == "aarch64" || "$ARCH" == "arm64" ]]; then
    PIPER_PLATFORM="aarch64"
    echo -e "  ${GREEN}✓${NC} Detected ARM64 (${ARCH}) — compatible"
elif [[ "$ARCH" == "x86_64" ]]; then
    PIPER_PLATFORM="amd64"
    echo -e "  ${GREEN}✓${NC} Detected x86_64 — compatible"
else
    echo -e "  ${RED}✗${NC} Unsupported architecture: ${ARCH}"
    echo "  Piper supports aarch64 (ARM64) and x86_64."
    exit 1
fi

# ── Install system dependencies ──────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[2/5]${NC} Installing system dependencies..."
sudo apt-get update -qq
sudo apt-get install -y -qq wget python3 tar > /dev/null 2>&1
echo -e "  ${GREEN}✓${NC} Dependencies installed"

# ── Download Piper binary ────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/5]${NC} Downloading Piper TTS binary (${PIPER_PLATFORM})..."
mkdir -p "${PIPER_DIR}"

PIPER_URL="https://github.com/rhasspy/piper/releases/download/${PIPER_VERSION}/piper_linux_${PIPER_PLATFORM}.tar.gz"
PIPER_TAR="${PIPER_DIR}/piper.tar.gz"

if [[ -f "${PIPER_DIR}/piper" ]]; then
    echo -e "  ${GREEN}✓${NC} Piper binary already exists, skipping download"
else
    echo "  Downloading from: ${PIPER_URL}"
    wget -q --show-progress -O "${PIPER_TAR}" "${PIPER_URL}"
    echo "  Extracting..."
    tar -xzf "${PIPER_TAR}" -C "${PIPER_DIR}" --strip-components=1
    rm -f "${PIPER_TAR}"
    chmod +x "${PIPER_DIR}/piper"
    echo -e "  ${GREEN}✓${NC} Piper binary installed at ${PIPER_DIR}/piper"
fi

# ── Download voice model ─────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/5]${NC} Downloading voice model (${VOICE_NAME})..."
mkdir -p "${VOICES_DIR}"

MODEL_URL="https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/amy/medium/en_US-amy-medium.onnx"
CONFIG_URL="https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/en/en_US/amy/medium/en_US-amy-medium.onnx.json"

if [[ -f "${VOICES_DIR}/${VOICE_NAME}.onnx" ]]; then
    echo -e "  ${GREEN}✓${NC} Voice model already exists, skipping download"
else
    echo "  Downloading model (~40MB)..."
    wget -q --show-progress -O "${VOICES_DIR}/${VOICE_NAME}.onnx" "${MODEL_URL}"
    echo "  Downloading config..."
    wget -q --show-progress -O "${VOICES_DIR}/${VOICE_NAME}.onnx.json" "${CONFIG_URL}"
    echo -e "  ${GREEN}✓${NC} Voice model installed"
fi

# ── Verify installation ──────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/5]${NC} Verifying installation..."
echo "Hello, I am OWL, your campus assistant" | "${PIPER_DIR}/piper" \
    --model "${VOICES_DIR}/${VOICE_NAME}.onnx" \
    --output_file "/tmp/owl-tts-test.wav" 2>/dev/null

if [[ -f "/tmp/owl-tts-test.wav" ]] && [[ -s "/tmp/owl-tts-test.wav" ]]; then
    echo -e "  ${GREEN}✓${NC} Piper TTS is working! Test audio generated successfully."
    rm -f /tmp/owl-tts-test.wav
else
    echo -e "  ${RED}✗${NC} Piper TTS test failed. Check the installation."
    exit 1
fi

# ── Install systemd service ──────────────────────────────────────────────────
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Installing systemd service...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

SERVICE_FILE="/etc/systemd/system/piper-tts.service"
PYTHON_SERVER="${SCRIPT_DIR}/piper-tts-server.py"

sudo tee "${SERVICE_FILE}" > /dev/null <<EOF
[Unit]
Description=OWL Kiosk Piper TTS Server
After=network.target sound.target
Wants=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=${SCRIPT_DIR}
ExecStart=/usr/bin/python3 ${PYTHON_SERVER}
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Audio access
SupplementaryGroups=audio

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable piper-tts.service
sudo systemctl restart piper-tts.service

# Wait a moment for the server to start
sleep 2

# Verify the server is running
if curl -s http://localhost:5050/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Piper TTS server is running on http://localhost:5050"
else
    echo -e "  ${YELLOW}!${NC} Server may still be starting. Check with:"
    echo "    sudo systemctl status piper-tts.service"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Piper binary:  ${PIPER_DIR}/piper"
echo "  Voice model:   ${VOICES_DIR}/${VOICE_NAME}.onnx"
echo "  TTS server:    http://localhost:5050"
echo "  Systemd unit:  piper-tts.service"
echo ""
echo "  Quick test:"
echo "    curl -o test.wav 'http://localhost:5050/tts?text=Hello+from+OWL'"
echo "    aplay test.wav"
echo ""
echo "  Service management:"
echo "    sudo systemctl status piper-tts.service"
echo "    sudo systemctl restart piper-tts.service"
echo "    journalctl -u piper-tts.service -f"
echo ""
