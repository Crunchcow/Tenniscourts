# ==========================================
# Tenniscourts – Hetzner Deployment Script (PowerShell)
# Verwendung: .\deploy.ps1
#   Erstmalig: .\deploy.ps1 -FirstDeploy
# ==========================================

param(
    [string]$ServerIP   = "89.167.0.28",
    [string]$ServerUser = "root",
    [switch]$FirstDeploy
)

$ErrorActionPreference = "Stop"
$RemoteBackend  = "/var/www/tenniscourts/backend"
$RemoteFrontend = "/var/www/tenniscourts/frontend"

function Write-Step { param([string]$Text) Write-Host ">>> $Text" -ForegroundColor Cyan }
function Write-Ok   { param([string]$Text) Write-Host "    OK: $Text" -ForegroundColor Green }
function Write-Err  { param([string]$Text) Write-Host "    FEHLER: $Text" -ForegroundColor Red }

# ──────────────────────────────────────────────────────────────────────────────
# 1. React Frontend lokal bauen
# ──────────────────────────────────────────────────────────────────────────────
Write-Step "Baue React Frontend..."
Push-Location "$PSScriptRoot\frontend"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Err "npm build fehlgeschlagen"; exit 1 }
Pop-Location
Write-Ok "Frontend gebaut (frontend/dist/)"

# ──────────────────────────────────────────────────────────────────────────────
# 2. Server-Verzeichnisse anlegen
# ──────────────────────────────────────────────────────────────────────────────
Write-Step "Erstelle Server-Verzeichnisse..."
ssh "${ServerUser}@${ServerIP}" "mkdir -p $RemoteBackend $RemoteFrontend"
Write-Ok "Verzeichnisse vorhanden"

# ──────────────────────────────────────────────────────────────────────────────
# 3. Backend kopieren
# ──────────────────────────────────────────────────────────────────────────────
Write-Step "Kopiere Backend-Dateien..."

# Einzelne kritische Verzeichnisse und Dateien (kein .venv, kein __pycache__, kein db.sqlite3)
scp -r "$PSScriptRoot\backend\courts"        "${ServerUser}@${ServerIP}:${RemoteBackend}/"
scp -r "$PSScriptRoot\backend\tenniscourts"  "${ServerUser}@${ServerIP}:${RemoteBackend}/"
scp    "$PSScriptRoot\backend\manage.py"     "${ServerUser}@${ServerIP}:${RemoteBackend}/"
scp    "$PSScriptRoot\backend\requirements.txt" "${ServerUser}@${ServerIP}:${RemoteBackend}/"
Write-Ok "Backend-Dateien kopiert"

# ──────────────────────────────────────────────────────────────────────────────
# 4. Frontend-Build kopieren
# ──────────────────────────────────────────────────────────────────────────────
Write-Step "Kopiere React-Build..."
scp -r "$PSScriptRoot\frontend\dist\." "${ServerUser}@${ServerIP}:${RemoteFrontend}/"
Write-Ok "Frontend-Build kopiert"

# ──────────────────────────────────────────────────────────────────────────────
# 5. Nginx-Config und Systemd-Service kopieren (nur FirstDeploy)
# ──────────────────────────────────────────────────────────────────────────────
if ($FirstDeploy) {
    Write-Step "Kopiere Nginx-Config und Systemd-Service..."
    scp "$PSScriptRoot\nginx.conf" "${ServerUser}@${ServerIP}:/etc/nginx/sites-available/tenniscourts"
    scp "$PSScriptRoot\gunicorn-tenniscourts.service" "${ServerUser}@${ServerIP}:/etc/systemd/system/gunicorn-tenniscourts.service"
    Write-Ok "Config-Dateien kopiert"
}

# ──────────────────────────────────────────────────────────────────────────────
# 6. Server-Setup per SSH
# ──────────────────────────────────────────────────────────────────────────────
Write-Step "Fuehre Server-Setup aus..."

if ($FirstDeploy) {
    Write-Host "    Erstmalige Einrichtung (venv, migrate, service)..." -ForegroundColor Yellow
    $remoteCmd = @"
set -e
cd $RemoteBackend

# Python-venv anlegen
python3 -m venv .venv
.venv/bin/pip install --quiet --upgrade pip
.venv/bin/pip install --quiet -r requirements.txt

# Migrations + Static
.venv/bin/python manage.py migrate --noinput
.venv/bin/python manage.py collectstatic --noinput
.venv/bin/python manage.py setup_courts

# Eigentümer setzen
chown -R www-data:www-data /var/www/tenniscourts

# Systemd-Service aktivieren
systemctl daemon-reload
systemctl enable gunicorn-tenniscourts
systemctl start gunicorn-tenniscourts

# Nginx aktivieren
ln -sfn /etc/nginx/sites-available/tenniscourts /etc/nginx/sites-enabled/tenniscourts
nginx -t && systemctl reload nginx

echo "=== Erstmalige Einrichtung abgeschlossen ==="
"@
} else {
    $remoteCmd = @"
set -e
cd $RemoteBackend

# Dependencies aktualisieren
.venv/bin/pip install --quiet -r requirements.txt

# Migrations + Static
.venv/bin/python manage.py migrate --noinput
.venv/bin/python manage.py collectstatic --noinput

# Eigentümer aktualisieren
chown -R www-data:www-data /var/www/tenniscourts

# Gunicorn graceful reload
systemctl reload gunicorn-tenniscourts

echo "=== Update abgeschlossen ==="
"@
}

ssh "${ServerUser}@${ServerIP}" $remoteCmd
Write-Ok "Server-Setup abgeschlossen"

# ──────────────────────────────────────────────────────────────────────────────
# 7. Health Check
# ──────────────────────────────────────────────────────────────────────────────
Write-Step "Health Check..."
Start-Sleep -Seconds 3

try {
    $result = Invoke-WebRequest -Uri "http://${ServerIP}/api/courts/" -UseBasicParsing -TimeoutSec 10
    if ($result.StatusCode -eq 200) {
        Write-Ok "API antwortet (HTTP 200)"
        Write-Host ""
        Write-Host ">>> Deployment erfolgreich!" -ForegroundColor Green
        Write-Host "    App:   http://${ServerIP}" -ForegroundColor Green
        Write-Host "    Admin: http://${ServerIP}/admin/" -ForegroundColor Green
    }
} catch {
    Write-Host ""
    Write-Host ">>> Health Check fehlgeschlagen – app evtl. noch nicht bereit." -ForegroundColor Yellow
    Write-Host "    Logs: ssh ${ServerUser}@${ServerIP} 'journalctl -u gunicorn-tenniscourts -n 30'" -ForegroundColor Yellow
}
