#!/bin/bash

echo "============================================"
echo " Plan B CRM - Analytics Server"
echo "============================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null
then
    echo -e "${RED}[ERREUR]${NC} Node.js n'est pas installé !"
    echo ""
    echo "Installez Node.js avec :"
    echo "  - Ubuntu/Debian : sudo apt install nodejs npm"
    echo "  - MacOS : brew install node"
    echo "  - Ou téléchargez : https://nodejs.org"
    echo ""
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Node.js détecté :"
node --version
echo ""

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO]${NC} Installation des dépendances..."
    echo ""
    npm install

    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERREUR]${NC} Installation échouée !"
        exit 1
    fi

    echo -e "${GREEN}[OK]${NC} Dépendances installées avec succès !"
    echo ""
fi

echo -e "${YELLOW}[INFO]${NC} Démarrage du serveur..."
echo ""
echo "============================================"
echo " Serveur Analytics en cours d'exécution"
echo "============================================"
echo ""
echo "  Panel Admin : http://localhost:3000/admin.html"
echo "  Site Vitrine : http://localhost:3000/index.html"
echo "  Page de Test : http://localhost:3000/test-analytics.html"
echo ""
echo "  Identifiants admin :"
echo "  - Username : admin"
echo "  - Password : admin123"
echo ""
echo "  Appuyez sur Ctrl+C pour arrêter le serveur"
echo "============================================"
echo ""

# Démarrer le serveur
node api-server.js
