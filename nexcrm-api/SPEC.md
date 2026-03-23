# NexCRM — Full System Specification

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Local Machine (Docker)                    │
│                                                             │
│  ┌──────────────────┐        ┌──────────────────────────┐  │
│  │   nexcrm-web     │        │      nexcrm-api           │  │
│  │  React + Vite    │◄──────►│   FastAPI + SQLAlchemy    │  │
│  │  Tailwind CSS    │  REST  │   SQLite + Alembic        │  │
│  │  localhost:3000  │  JSON  │   JWT Auth                │  │
│  └──────────────────┘        │   localhost:8000          │  │
│                              └────────────┬─────────────┘  │
│                                           │                 │
│                                   ┌───────▼──────┐         │
│                                   │  nexcrm.db   │         │
│                                   │  (SQLite)    │         │
│                                   └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 2. Data Models

### User
| Field            | Type     | Constraints               |
|------------------|----------|---------------------------|
| id               | Integer  | PK, autoincrement         |
| email            | String   | unique, not null, indexed |
| full_name        | String   | not null                  |
| hashed_password  | String   | not null                  |
| is_active        | Boolean  | default True              |
| created_at       | DateTime | server_default now()      |

### Contact
| Field      | Type     | Constraints           |
|------------|----------|-----------------------|
| id         | Integer  | PK, autoincrement     |
| name       | String   | not null              |
| email      | String   | nullable, indexed     |
| phone      | String   | nullable              |
| company    | String   | nullable              |
| notes      | Text     | nullable              |
| created_by | Integer  | FK → users.id         |
| created_at | DateTime | server_default now()  |
| updated_at | DateTime | onupdate now()        |

### Lead
| Field      | Type     | Constraints                                       |
|------------|----------|---------------------------------------------------|
| id         | Integer  | PK, autoincrement                                 |
| title      | String   | not null                                          |
| contact_id | Integer  | FK → contacts.id, nullable                        |
| status     | Enum     | New/Contacted/Qualified/ClosedWon/ClosedLost      |
| value      | Float    | nullable (deal value)                             |
| notes      | Text     | nullable                                          |
| created_by | Integer  | FK → users.id                                     |
| created_at | DateTime | server_default now()                              |
| updated_at | DateTime | onupdate now()                                    |

### Activity
| Field      | Type     | Constraints                       |
|------------|----------|-----------------------------------|
| id         | Integer  | PK, autoincrement                 |
| type       | Enum     | Call/Email/Meeting/Note           |
| subject    | String   | not null                          |
| body       | Text     | nullable                          |
| contact_id | Integer  | FK → contacts.id, nullable        |
| lead_id    | Integer  | FK → leads.id, nullable           |
| created_by | Integer  | FK → users.id                     |
| created_at | DateTime | server_default now()              |

## 3. REST API Contract

### Auth
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login → returns JWT access token
GET    /api/auth/me           Get current user profile
```

### Contacts
```
GET    /api/contacts          List (paginated, search)
POST   /api/contacts          Create
GET    /api/contacts/{id}     Get by ID
PUT    /api/contacts/{id}     Update
DELETE /api/contacts/{id}     Delete
```

### Leads
```
GET    /api/leads             List (paginated, filter by status)
POST   /api/leads             Create
GET    /api/leads/{id}        Get by ID
PUT    /api/leads/{id}        Update
DELETE /api/leads/{id}        Delete
PATCH  /api/leads/{id}/status Update status only
```

### Activities
```
GET    /api/activities        List (paginated)
POST   /api/activities        Create
GET    /api/activities/{id}   Get by ID
PUT    /api/activities/{id}   Update
DELETE /api/activities/{id}   Delete
```

### Dashboard
```
GET    /api/dashboard/stats   Summary stats
```

### Search
```
GET    /api/search?q=term     Search contacts + leads
```

## 4. Acceptance Criteria

### Auth
- Register with email + password
- Login returns JWT (24h expiry)
- Protected endpoints return 401 without token

### Contacts
- Full CRUD
- Paginated list (default 20/page)
- Search by name, email, company

### Leads
- Full CRUD
- Status pipeline: New → Contacted → Qualified → ClosedWon/ClosedLost
- Optional Contact link

### Activities
- Links to Contact and/or Lead
- Types: Call, Email, Meeting, Note

### Dashboard
- Contact + lead counts
- Leads by status breakdown
- Last 5 activities

### Search
- Cross-entity (contacts + leads)
- Case-insensitive partial match
