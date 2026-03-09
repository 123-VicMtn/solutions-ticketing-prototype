# Solution Ticketing — Prototype

EN - Ticket management application for real estate agencies in French-speaking Switzerland.  
Tenants and owners report requests (breakdowns, repairs, inquiries) to the agency, which handles them and can assign external contractors.

FR - Application de gestion des tickets pour les agences immobilières en Suisse romande.
Les locataires et les propriétaires signalent leurs demandes (pannes, réparations, demandes de renseignements) à l'agence, qui les traite et peut faire appel à des prestataires externes.

## Tech Stack

| Layer      | Technology                |
| ---------- | ------------------------- |
| Backend    | AdonisJS 6 (Node.js 24)  |
| Frontend   | Vue 3 + Inertia.js       |
| Database   | PostgreSQL 17             |
| ORM        | Lucid                     |
| Validation | VineJS                    |
| UI         | TailwindCSS               |
| Containers | Docker + docker-compose   |

## Project Structure

```
├── app/
│   ├── controllers/       # HTTP controllers
│   ├── models/            # Lucid ORM models
│   ├── services/          # Business logic
│   ├── validators/        # Input validation
│   ├── policies/          # Authorization (Bouncer)
│   └── mailers/           # Email templates
├── database/
│   ├── migrations/        # SQL migrations
│   └── seeders/           # Test data
├── inertia/
│   ├── pages/             # Vue pages
│   ├── components/        # Reusable components
│   └── layouts/           # App layouts
├── config/                # AdonisJS configuration
├── start/
│   └── routes.ts          # Route definitions
└── tests/                 # Functional & Playwright tests
```

## License

Private project — all rights reserved.
