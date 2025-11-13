@echo off
echo ============================================
echo  Plan B CRM - Analytics Server
echo ============================================
echo.

REM Vérifier si Node.js est installé
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe !
    echo.
    echo Telechargez Node.js ici : https://nodejs.org
    echo Puis relancez ce script.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detecte :
node --version
echo.

REM Vérifier si les dépendances sont installées
if not exist "node_modules\" (
    echo [INFO] Installation des dependances...
    echo.
    call npm install
    echo.
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Installation echouee !
        pause
        exit /b 1
    )
    echo [OK] Dependances installees avec succes !
    echo.
)

echo [INFO] Demarrage du serveur...
echo.
echo ============================================
echo  Serveur Analytics en cours d'execution
echo ============================================
echo.
echo  Panel Admin : http://localhost:3000/admin.html
echo  Site Vitrine : http://localhost:3000/index.html
echo  Page de Test : http://localhost:3000/test-analytics.html
echo.
echo  Identifiants admin :
echo  - Username : admin
echo  - Password : admin123
echo.
echo  Appuyez sur Ctrl+C pour arreter le serveur
echo ============================================
echo.

REM Démarrer le serveur
node api-server.js

pause
