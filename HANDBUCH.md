# Tennisplatz-Buchung - Benutzerhandbuch

## Projektübersicht

Die **Tennisplatz-Buchung** ist ein webbasiertes System zur Verwaltung und Buchung von Tennisplätzen. Sie ermöglicht Tennisspielern die einfache Online-Reservierung von Plätzen und Administratoren die effiziente Verwaltung aller Buchungen.

---

## Für Tennisspieler (Endbenutzer)

### Zugang zur Buchung
- **URL:** `https://[domain]/`
- **Keine Anmeldung erforderlich** für die Buchung

### Platz buchen

#### 1. Platzübersicht anzeigen
1. Webseite aufrufen
2. Alle verfügbaren Plätze werden angezeigt mit:
   - Platzname und Beschreibung
   - Aktueller Belegungsstatus
   - Verfügbarkeit im Zeitverlauf

#### 2. Gewünschten Zeitraum auswählen
1. Datum im Kalender auswählen
2. Startzeit klicken
3. Endzeit festlegen
4. Verfügbarkeit wird sofort angezeigt

#### 3. Buchungsdaten eingeben
1. **Name:** Vollständiger Name
2. **E-Mail:** Gültige E-Mail-Adresse
3. **Telefon:** (Optional, für Rückfragen)
4. **Anmerkungen:** Zusätzliche Wünsche

#### 4. Buchung bestätigen
1. Daten prüfen
2. "Buchen" Button klicken
3. Bestätigungs-E-Mail erhalten

### Buchung stornieren
1. Link in der Bestätigungs-E-Mail klicken
2. Oder Stornierungs-Link aufbewahren
3. Stornierung wird sofort wirksam

### Wichtige Regeln
- **Buchungsfrist:** Mindestens 14 Tage im Voraus
- **Maximale Dauer:** 2 Stunden pro Buchung
- **Gleichzeitige Buchungen:** Pro Person nur eine aktive Buchung
- **Stornierung:** Bis 24 Stunden vor Beginn kostenlos

---

## Für Platzverwalter und Administratoren

### Admin-Zugang
- **URL:** `https://[domain]/admin/`
- **Login:** Mit Admin-Zugangsdaten

### Hauptfunktionen im Admin-Bereich

#### 1. Platzverwaltung
Unter **Plätze** können Sie:
- Neue Plätze anlegen
- Platzdetails bearbeiten
- Plätze aktivieren/deaktivieren
- Reihenfolge festlegen

**Platzdetails:**
- **Name:** Eindeutige Bezeichnung (z.B. "Platz 1", "Sandplatz A")
- **Beschreibung:** Details zum Platz (Belag, Besonderheiten)
- **Aktiv:** Platz für Buchungen freigeben
- **Reihenfolge:** Anzeigereihenfolge auf der Webseite

#### 2. Sperrzeiten verwalten
Unter **Sperrzeiten** können Sie:
- Administrative Blockierungen einrichten
- Trainingszeiten festlegen
- Spieltage reservieren
- Wartungsarbeiten planen
- Veranstaltungen eintragen

**Sperrzeit-Typen:**
- **Training:** Regelmäßige Trainingszeiten
- **Spieltag:** Vereinsinterne Spieltage
- **Platzsperrung:** Wartungsarbeiten, Reparaturen
- **Veranstaltung:** Turniere, Vereinsfeiern

**Sperrzeit anlegen:**
1. Platz auswählen
2. Titel und Typ festlegen
3. Start- und Endzeit eingeben
4. Notiz hinzufügen (optional)
5. Ersteller vermerken
6. Speichern

#### 3. Buchungen verwalten
Unter **Buchungen** können Sie:
- Alle Buchungen einsehen
- Buchungen bearbeiten
- Buchungen stornieren
- Statistiken auswerten

**Buchungs-Status:**
- **Bestätigt:** Normale, aktive Buchungen
- **Ausstehend:** Für Genehmigungs-Workflows
- **Storniert:** Gelöschte Buchungen

---

## Wichtige Administrationsaufgaben

### Neuen Platz anlegen
1. Admin-Bereich → Plätze → Add
2. **Name:** Eindeutige Bezeichnung
3. **Beschreibung:** Belag, Besonderheiten
4. **Aktiv:** Häkchen setzen
5. **Reihenfolge:** Position festlegen
6. Speichern

### Regelmäßige Sperrzeiten einrichten
1. Admin-Bereich → Sperrzeiten → Add
2. **Platz:** Entsprechenden Platz auswählen
3. **Typ:** Art der Sperrung wählen
4. **Titel:** Klare Bezeichnung (z.B. "Training Jugend")
5. **Zeitraum:** Wiederkehrende Zeiten eintragen
6. **Notiz:** Zusätzliche Informationen
7. **Erstellt von:** Name eintragen
8. Speichern

### Buchungsübersicht prüfen
1. Admin-Bereich → Buchungen
2. Filter nach Datum oder Status
3. Doppelbuchungen erkennen
4. Problematische Buchungen bearbeiten

### Statistiken auswerten
- Auslastung der Plätze
- Buchungsfrequenz
- Stornierungsquoten
- Beliebteste Zeiten

---

## Buchungsregeln und -richtlinien

### Für Benutzer
- **Fairness:** Andere Spieler berücksichtigen
- **Pünktlichkeit:** Plätze rechtzeitig nutzen
- **Ordnung:** Platz sauber hinterlassen
- **Kommunikation:** Absagen zeitnah mitteilen

### Für Administratoren
- **Konsistenz:** Regeln konsequent anwenden
- **Transparenz:** Regeln klar kommunizieren
- **Flexibilität:** Ausnahmen begründet zulassen
- **Dokumentation:** Alle Vorgänge protokollieren

### Zeitliche Regeln
- **Saisonzeiten:** Sommer/Winter-Zeiten beachten
- **Lichtzeiten:** Bei Dunkelheit nur beleuchtete Plätze
- **Wetterregeln:** Bei Nässe Plätze sperren
- **Wartungszeiten:** Regelmäßige Pflege einplanen

---

## Mobile Nutzung

### Responsive Design
- Volle Funktionalität auf Smartphones und Tablets
- Touch-optimierte Kalenderansicht
- Schnelle Buchung auch unterwegs

### Mobile Best Practices
- WLAN für stabile Nutzung
- Browser-Lesezeichen für schnellen Zugriff
- Push-Benachrichtigungen aktivieren

---

## Fehlerbehebung

### Häufige Probleme

**"Buchung nicht möglich"**
- Verfügbarkeit prüfen
- Zeitformat korrekt?
- Alle Pflichtfelder ausgefüllt?
- Internetverbindung stabil?

**"Platz nicht verfügbar"**
- Andere Zeitzone wählen
- Warteliste nutzen
- Admin kontaktieren
- Sperrzeiten prüfen

**"E-Mail nicht erhalten"**
- Spam-Ordner prüfen
- E-Mail-Adresse korrekt?
- Postfach voll?
- Alternative E-Mail versuchen

**"Stornierung nicht möglich"**
- Link in E-Mail prüfen
- Frist abgelaufen?
- Admin kontaktieren
- Neue Buchung erstellen

---

## Wichtige Prozesse

### Saisonwechsel
1. Alte Buchungen archivieren
2. Öffnungszeiten anpassen
3. Platzpreise aktualisieren
4. Sperrzeiten neu planen

### Turnierorganisation
1. Plätze für Turnier sperren
2. Normalbetrieb anpassen
3. Teilnehmer informieren
4. Sonderregelungen kommunizieren

### Wartungsarbeiten
1. Plätze rechtzeitig sperren
2. Benutzer informieren
3. Alternative Plätze anbieten
4. Dauer kommunizieren

---

## Sicherheit und Datenschutz

### Benutzerschutz
- Keine übermäßigen Daten erheben
- E-Mail-Adressen nicht weitergeben
- Stornierungs-Links sicher gestalten

### Datensicherheit
- Regelmäßige Backups
- Zugriffsberechtigungen prüfen
- SSL-Verschlüsselung nutzen

### DSGVO-Konformität
- Datenschutzerklärung bereitstellen
- Einwilligungen einholen
- Löschfristen beachten

---

## Technische Informationen

### Systemanforderungen
- Moderner Webbrowser
- Internetverbindung
- Aktivierte Cookies

### Browser-Unterstützung
- Chrome (aktuellste Version)
- Firefox (aktuellste Version)
- Safari (aktuellste Version)
- Edge (aktuellste Version)

### Wartung
- Regelmäßige Updates
- Performance-Optimierung
- Log-Dateien überwachen

---

## Support und Hilfe

### Technischer Support
Bei Systemproblemen:
- IT-Abteilung des Vereins
- Screenshot des Fehlers machen
- Browser und Version angeben
- Uhrzeit des Problems

### Inhaltliche Fragen
Bei organisatorischen Fragen:
- Platzverwalter
- Tennissabteilung
- Vereinsleitung

### Notfallkontakte
- Akute Platzprobleme: Hausmeister
- Buchungskonflikte: Platzverwalter
- Systemausfall: IT-Support

---

## Best Practices

### Für Benutzer
- Frühzeitig buchen
- Absagen rechtzeitig mitteilen
- Plätze sauber hinterlassen
- Regeln beachten

### Für Administratoren
- Tägliche Kontrolle
- Regelmäßige Wartung
- Benutzer unterstützen
- Statistiken pflegen

---

## Zukunftsentwicklungen

### Geplante Funktionen
- Mobile App
- Automatische Erinnerungen
- Mehrsprachige Unterstützung
- Erweiterte Statistiken

### Feedback
- Verbesserungsvorschläge willkommen
- Regelmäßige Umfragen
- Nutzerfeedback einarbeiten

---

## Rechtliche Hinweise

### Haftung
- Nutzung auf eigene Gefahr
- Verein haftet nicht für Unfälle
- Missbrauch wird geahndet

### Nutzungsbedingungen
- Buchungen sind verbindlich
- Entgelte werden fällig bei Nutzung
- Ausschluss bei wiederholtem Fehlverhalten

---

*Letzte Aktualisierung: April 2026*
