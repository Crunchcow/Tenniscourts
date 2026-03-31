#!/bin/bash
# ==========================================
# Tenniscourts – Hetzner Deployment Script
# Verwendung: ./deploy.sh
#   Erstmalig: ./deploy.sh --first-deploy
# ==========================================

set -e

SERVER_IP="89.167.0.28"
SERVER_USER="root"
REMOTE_BACKEND="/var/www/tenniscourts/backend"
REMOTE_FRONTEND="/var/www/tenniscourts/frontend"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

FIRST_DEPLOY=false
[[ "${1}" == "--first-deploy" ]] && FIRST_DEPLOY=true

step()  { echo -e "${CYAN}>>> $1${NC}"; }
ok()    { echo -e "${GREEN}    OK: $1${NC}"; }
warn()  { echo -e "${YELLOW}    $1${NC}"; }
error() { echo -e "${RED}    FEHLER: $1${NC}"; exit 1; }

# ── 1. React Frontend bauen ───────────────────────────────────────────────────
step "Baue React Frontend..."
cd "$SCRIPT_DIR/frontend"
npm run build || error "npm build fehlgeschlagen"
ok "Frontend gebaut (frontend/dist/)"

# ── 2. Server-Verzeichnisse anlegen ──────────────────────────────────────────
step "Erstelle Server-Verzeichnisse..."
ssh "$SERVER_USER@$SERVER_IP" "mkdir -p $REMOTE_BACKEND $REMOTE_FRONTEND"
ok "Verzeichnisse vorhanden"

# ── 3. Backend per rsync ──────────────────────────────────────────────────────
step "Synchronisiere Backend..."
rsync -az --delete \
  --exclude '.venv' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude 'db.sqlite3' \
  --exclude '.env' \
  --exclude 'staticfiles' \
  "$SCRIPT_DIR/backend/" \
  "$SERVER_USER@$SERVER_IP:$REMOTE_BACKEND/"
ok "Backend synchronisiert"

# ── 4. Frontend-Build synchronisieren ────────────────────────────────────────
step "Synchronisiere React-Build..."
rsync -az --delete \
  "$SCRIPT_DIR/frontend/dist/" \
  "$SERVER_USER@$SERVER_IP:$REMOTE_FRONTEND/"
ok "Frontend synchronisiert"

# ── 5. Nginx + Systemd kopieren (nur erstmalig) ───────────────────────────────
if $FIRST_DEPLOY; then
  step "Kopiere Nginx-Config und Systemd-Service..."
  scp "$SCRIPT_DIR/nginx.conf" \
      "$SERVER_USER@$SERVER_IP:/etc/nginx/sites-available/tenniscourts"
  scp "$SCRIPT_DIR/gunicorn-tenniscourts.service" \
      "$SERVER_USER@$SERVER_IP:/etc/systemd/system/gunicorn-tenniscourts.service"
  ok "Config-Dateien kopiert"
fi

# ── 6. Server-Setup ───────────────────────────────────────────────────────────
step "Fuehre Server-Setup aus..."

if $FIRST_DEPLOY; then
  warn "Erstmalige Einrichtung – .env muss bereits auf dem Server liegen!"
  ssh "$SERVER_USER@$SERVER_IP" bash << 'ENDSSH'
    set -e
    cd /var/www/tenniscourts/backend

    python3 -m venv .venv
    .venv/bin/pip install --quiet --upgrade pip
    .venv/bin/pip install --quiet -r requirements.txt

    .venv/bin/python manage.py migrate --noinput
    .venv/bin/python manage.py collectstatic --noinput
    .venv/bin/python manage.py setup_courts

    chown -R www-data:www-data /var/www/tenniscourts

    systemctl daemon-reload
    systemctl enable gunicorn-tenniscourts
    systemctl start gunicorn-tenniscourts

    ln -sfn /etc/nginx/sites-available/tenniscourts /etc/nginx/sites-enabled/tenniscourts
    nginx -t && systemctl reload nginx

    echo "=== Erstmalige Einrichtung abgeschlossen ==="
ENDSSH
else
  ssh "$SERVER_USER@$SERVER_IP" bash << 'ENDSSH'
    set -e
    cd /var/www/tenniscourts/backend

    .venv/bin/pip install --quiet -r requirements.txt
    .venv/bin/python manage.py migrate --noinput
    .venv/bin/python manage.py collectstatic --noinput

    chown -R www-data:www-data /var/www/tenniscourts
    systemctl reload gunicorn-tenniscourts

    echo "=== Update abgeschlossen ==="
ENDSSH
fi
ok "Server-Setup abgeschlossen"

# ── 7. Health Check ───────────────────────────────────────────────────────────
step "Health Check..."
sleep 3
HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://$SERVER_IP/api/courts/" || echo "000")
if [ "$HTTP" = "200" ]; then
  echo ""
  echo -e "${GREEN}>>> Deployment erfolgreich!${NC}"
  echo -e "${GREEN}    App:   http://$SERVER_IP${NC}"
  echo -e "${GREEN}    Admin: http://$SERVER_IP/admin/${NC}"
else
  echo ""
  warn "Health Check fehlgeschlagen (HTTP $HTTP) – evtl. noch nicht bereit."
  warn "Logs: ssh $SERVER_USER@$SERVER_IP 'journalctl -u gunicorn-tenniscourts -n 30'"
fi
