# EasyBY-website

De website van easy-by.nl: de twee diensten van EasyBY (Tijdwinst en de AI-scan), het aanbod met prijzen, een voorbeeldrapport en een inlogpagina die doorstuurt naar het klantenservicebord van een winkel (`<winkel>.easy-by.nl`).

Statische HTML en CSS, zonder build-stap of server-code.

| Bestand | Wat |
|---|---|
| `index.html` | Voorpagina: kernbelofte, onze diensten, aanbod met prijzen, vragen |
| `mini-scan.html` | Gratis mini-scan aanvragen (formulier dat een mail opstelt) |
| `over-ons.html` | Over EasyBY en contact |
| `tijdwinst.html` | Dienst Tijdwinst (automatisering): werkwijze in vier stappen, wat in het Tijdwinstrapport staat |
| `ai-scan.html` | Dienst AI-scan (AI-vindbaarheid): wat we meten, werkwijze in vijf stappen, prijzen |
| `klantenservice.html` | De klantenservice-automatisering, als voorbeeld van Tijdwinst |
| `voorbeeldrapport.html` | Voorblad en samenvatting van een AI-scanrapport en een Tijdwinstrapport, met verzonnen gegevens |
| `inloggen.html` | Naam van de winkel invullen, door naar het bord. Het inloggen zelf gebeurt op het bord |
| `tokens.css` | De EasyBY-huisstijl (kleuren, lettertype, vormen). Pas de huisstijl alleen hier aan |
| `site.js` | Beweging: rapportbladen komen op, cijfers tellen op, balken, streepjes en de tijdlijn lopen vol, telkens opnieuw als ze in beeld komen. Niets bij voorkeur voor minder beweging |
| `base.css`, `site.css` | Basisregels en de opmaak van de pagina's. De rapportonderdelen (`.r-…`) volgen de pdf-huisstijl uit tool-notion-automatisering |
| `fonts/` | Public Sans (SIL Open Font License, zie `fonts/OFL.txt`) |

Bekijken: open `index.html` in de browser.

## Nog in te vullen

- Contactgegevens: `hallo@easy-by.nl` en `06 00 00 00 00` zijn voorbeeldwaarden (zoek op `MOCK`).
- Het mini-scanformulier opent het mailprogramma van de bezoeker (mailto); er is geen externe formulierdienst.
- De namen en cijfers in de rapportvoorbeelden zijn verzonnen.
