# Tenniscourts – Deployment auf Hetzner

## Server-Infos

| | |
|---|---|
| **IP** | `89.167.0.28` |
| **Hostname** | `WestfaliaOsterwick` (Ubuntu 24.04) |
| **App-Pfad Backend** | `/var/www/tenniscourts/backend/` |
| **App-Pfad Frontend** | `/var/www/tenniscourts/frontend/` |
| **Domain** | `http://tennis.westfalia-osterwick.de` |
| **Stack** | Nginx → Gunicorn (kein Docker) |
| **Gunicorn-Port** | `127.0.0.1:8004` |
| **Nginx-Config** | `/etc/nginx/sites-enabled/tenniscourts` |
| **Systemd-Service** | `gunicorn-tenniscourts` |

---

## Schnell-Update deployen (alles ab Schritt "Server live")

```powershell
# Windows PowerShell (aus dem Projektverzeichnis Tenniscourts/)
.\deploy.ps1
```

```bash
# Git Bash / WSL / Linux
./deploy.sh
```

---

## Erstmalige Einrichtung

### 1. `.env` auf dem Server anlegen

**Vor dem ersten Deploy** — SSH in den Server und die `.env` einmalig anlegen:

```bash
ssh root@89.167.0.28
mkdir -p /var/www/tenniscourts/backend
nano /var/www/tenniscourts/backend/.env
```

Inhalt (anpassen):

```env
SECRET_KEY=langen-zufaelligen-string-hier-eintragen
DEBUG=False
ALLOWED_HOSTS=tennis.westfalia-osterwick.de,89.167.0.28
CORS_ALLOWED_ORIGINS=http://tennis.westfalia-osterwick.de

APPROVAL_REQUIRED=false
ADMIN_API_TOKEN=sicherer-token-fuer-verwaltungs-frontend
ADMIN_PASSWORD=sicheres-adminpasswort

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.dein-provider.de
EMAIL_PORT=587
EMAIL_USE_TLS=true
EMAIL_HOST_USER=tennis@westfalia-osterwick.de
EMAIL_HOST_PASSWORD=email-passwort

DEFAULT_FROM_EMAIL=tennis@westfalia-osterwick.de
ADMIN_EMAIL=Lemke@westfalia-osterwick.de

SITE_URL=http://tennis.westfalia-osterwick.de
```

> **Hinweis:** `SECRET_KEY` erzeugen mit:
> `python3 -c "import secrets; print(secrets.token_hex(32))"`

### 2. Ersten Deploy ausführen

```powershell
# Windows
.\deploy.ps1 -FirstDeploy
```

```bash
# Bash/WSL
./deploy.sh --first-deploy
```

Das Skript erledigt automatisch:
- React-Frontend lokal bauen
- Backend + Frontend auf Server kopieren
- Nginx-Config + Systemd-Service installieren
- Python-venv anlegen, `pip install`, Migrations, `collectstatic`
- Plätze 1–3 anlegen (`setup_courts`)
- Gunicorn starten + Nginx neu laden

---

## Update deployen (nach Code-Änderungen)

```powershell
.\deploy.ps1
```

| Was geändert? | Notwendig? |
|---|---|
| Backend Python-Code | `deploy.ps1` — Gunicorn reload |
| Neue Migration | `deploy.ps1` — migrate wird immer ausgeführt |
| Neues pip-Paket | `deploy.ps1` — pip install immer |
| Frontend-Code | `deploy.ps1` — baut neu und kopiert |
| Nginx-Config | manuell: `scp nginx.conf ...` + `nginx -t && systemctl reload nginx` |
| Systemd-Service | manuell: `scp gunicorn-tenniscourts.service ...` + `systemctl daemon-reload && systemctl restart gunicorn-tenniscourts` |

---

## Nützliche Befehle auf dem Server

```bash
# Service-Status
systemctl status gunicorn-tenniscourts

# Gunicorn graceful reload (kein Downtime)
systemctl reload gunicorn-tenniscourts

# Gunicorn komplett neu starten
systemctl restart gunicorn-tenniscourts

# Logs – Live
journalctl -u gunicorn-tenniscourts -f

# Nginx-Config prüfen und neu laden
nginx -t && systemctl reload nginx

# Django-Shell
cd /var/www/tenniscourts/backend
source .venv/bin/activate
python manage.py shell

# Plätze neu anlegen (falls nötig)
python manage.py setup_courts

# Admin-Passwort ändern
python manage.py changepassword admin
```

---

## Zugänge (Produktion)

| Zugang | URL / Info |
|---|---|
| **App** | `http://tennis.westfalia-osterwick.de` |
| **Verwaltung** | `http://tennis.westfalia-osterwick.de/verwaltung` |
| **Django Admin** | `http://tennis.westfalia-osterwick.de/admin/` |
| **Admin-User** | `admin` / Passwort aus `.env` → `ADMIN_PASSWORD` |
| **Admin-API-Token** | Wert aus `.env` → `ADMIN_API_TOKEN` (für Verwaltungsseite) |

---

## Umgebungsvariablen (`.env`)

| Variable | Beschreibung |
|---|---|
| `SECRET_KEY` | Django Secret Key (langer Zufallsstring) |
| `DEBUG` | `False` im Produktivbetrieb |
| `ALLOWED_HOSTS` | Domain + IP, kommagetrennt |
| `APPROVAL_REQUIRED` | `false` = sofortige Buchung, `true` = Freigabe nötig |
| `ADMIN_API_TOKEN` | Token für das Verwaltungs-Frontend `/verwaltung` |
| `ADMIN_PASSWORD` | Passwort für Django-Admin |
| `EMAIL_HOST` | SMTP-Server |
| `EMAIL_HOST_USER` | SMTP-Benutzername |
| `EMAIL_HOST_PASSWORD` | SMTP-Passwort |
| `ADMIN_EMAIL` | Empfänger Admin-Benachrichtigungen (Lemke@westfalia-osterwick.de) |
| `SITE_URL` | Basis-URL für Stornierungslinks in E-Mails |

---

## Port-Übersicht (Hetzner Server)

| Port | App |
|---|---|
| `8001` | Vereinsheim V2 Backend |
| `8002` | Vereinsheimbuchung Gunicorn |
| **`8004`** | **Tenniscourts Gunicorn (intern, nicht nach außen offen)** |
| `80/443` | Nginx (Reverse Proxy für alle Apps) |

Der Port 8004 läuft nur intern (`127.0.0.1`) und muss **nicht** in der Firewall freigeschaltet werden. Nginx macht den Reverse Proxy.

---

## Firewall / DNS

Kein neuer Port nötig — Nginx läuft bereits auf Port 80.

Nur DNS-Eintrag ergänzen:
```
tennis.westfalia-osterwick.de  →  A  89.167.0.28
```

Sobald der DNS-Eintrag gesetzt ist, ist die App erreichbar.

---

## Troubleshooting

**Gunicorn startet nicht:**
```bash
journalctl -u gunicorn-tenniscourts -n 50
# Meist: falsche .env, fehlende Migrations, falscher Pfad
```

**502 Bad Gateway:**
```bash
systemctl status gunicorn-tenniscourts
# Gunicorn läuft evtl. nicht → systemctl restart gunicorn-tenniscourts
```

**Static Files fehlen:**
```bash
cd /var/www/tenniscourts/backend
.venv/bin/python manage.py collectstatic --noinput
```

**Buchungsseite lädt nicht (404 auf React-Routen):**
- Nginx `try_files $uri $uri/ /index.html;` muss aktiv sein → `nginx -t && systemctl reload nginx`
