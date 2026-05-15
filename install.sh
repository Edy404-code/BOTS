#!/bin/bash

echo "==================================="
echo "|       INSTALANDO MIRAY"         |
echo "==================================="
echo "Desenvolvido por: [Edissone]"
echo "[Instagram] https://www.instagram.com/elliot2_20"

sudo apt update && sudo apt upgrade -y

echo "[1/5] Instalando NodeJS..."

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

sudo apt install -y nodejs

echo "[2/5] Instalando Chromium..."

sudo apt install -y chromium-browser

echo "[3/5] Instalando dependencias..."

npm install

echo "[4/5] Instalando PM2..."

sudo npm install -g pm2

echo "[5/5] Finalizado"

echo ""
echo "Execute:"
echo "node index.js"
echo ""
