@echo off
title Instalando MIRAY

echo ===================================
echo        INSTALANDO MIRAY
echo ===================================
echo Desenvolvido por: Edissone
echo.

echo [1/4] Verificando NodeJS...

node -v >nul 2>&1

if %errorlevel% neq 0 (
    echo NodeJS nao instalado.
    echo Instale em:
    echo https://nodejs.org/
    pause
    exit
)

echo [2/4] Instalando dependencias...

npm install

echo [3/4] Instalando PM2...

npm install -g pm2

echo [4/4] Finalizado!
echo.

echo Execute:
echo node index.js
echo.

pause
