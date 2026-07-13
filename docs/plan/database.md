# Database Documentation — TTC-IPMS

> **Technology Transfer Cell — Intellectual Property Management System**  
> Database: **PostgreSQL** · ORM: **SQLModel (SQLAlchemy + Pydantic)**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Engine & Connection](#2-database-engine--connection)
3. [Schema Management](#3-schema-management)
4. [All Tables Reference](#4-all-tables-reference)
   - [users](#41-users)
   - [industry_projects](#42-industry_projects)
   - [agreements](#43-agreements)
   - [mous](#44-mous)
   - [innovation_club_applications](#45-innovation_club_applications)
   - [innovation_club_members](#46-innovation_club_members)
   - [noticeboard_posts](#47-noticeboard_posts)
   - [ipr_violation_reports](#48-ipr_violation_reports)
   - [invention_disclosures](#49-invention_disclosures)
   - [patents](#410-patents)
   - [prosecution_events](#411-prosecution_events)
   - [deadlines](#412-deadlines)
   - [licenses](#413-licenses)
5. [Entity Relationship Diagram](#5-entity-relationship-diagram)
6. [Foreign Key Relationships](#6-foreign-key-relationships)
7. [Enumerations](#7-enumerations)
8. [Indexes](#8-indexes)
9. [Seed Data](#9-seed-data)
10. [Docker Setup](#10-docker-setup)
11. [Connection String Format](#11-connection-string-format)

---

## 1. Overview

The TTC-IPMS uses **PostgreSQL** as its relational database. The schema is defined through **SQLModel** models in Python and is automatically created at application startup via:

```python
SQLModel.metadata.create_all(engine)
```

There is no manual migration tool (e.g. Alembic) currently configured — schema changes require dropping and recreating tables in development, or manual `ALTER TABLE` statements in production.

### Database Naming

| Setting | Value |
|---|---|
| Database name | `ttc_db` |
| Default host | `localhost` |
| Default port | `5432` |
| Default user | `postgres` |
| Default password | `postgrespassword` |

---

## 2. Database Engine & Connection

**File:** `backend/app/database.py`

```python
from sqlmodel import SQLModel, create_engine, Session, select
from app.config import settings

engine = create_engine(settings.database_url, echo=False)
```

- `echo=False` — SQL query logging is disabled; set to `True` for debugging
- The engine is a **singleton** shared across all requests
- Sessions are created per-request via the `get_session()` dependency

### Session Management

```python
def get_session():
    with Session(engine) as session:
        yield session
```

- Each HTTP request gets its own `Session`
- The session is automatically closed after the request completes (context manager)
- Transactions are committed manually inside router functions

---

## 3. Schema Management

### Auto-Creation on Startup

When the FastAPI application starts, `init_db()` is called:

```python
def init_db():
    from app.models import (
        user, project, agreement, mou, innovation_club,
        noticeboard, ipr_violation, disclosure, patent,
        prosecution, deadline, license
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        seed_data(session)
```

This:
1. Imports all model modules (registers them with SQLModel metadata)
2. Creates all tables that don't already exist (`CREATE TABLE IF NOT EXISTS`)
3. Runs seed data insertion if tables are empty

### Schema Changes in Development

Since there is no migration tool, to apply model changes:
1. Drop the existing database: `docker-compose down -v`
2. Restart: `docker-compose up -d`
3. Restart the backend — tables will be recreated

---

## 4. All Tables Reference

### 4.1 `users`

Central user table. All other tables reference this via foreign keys for ownership and audit tracking.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTO INCREMENT | Surrogate key |
| `full_name` | VARCHAR | NOT NULL | Display name |
| `email` | VARCHAR | NOT NULL, UNIQUE, INDEXED | Login identifier |
| `role` | VARCHAR | NOT NULL, DEFAULT `'faculty'` | See `UserRole` enum |
| `department` | VARCHAR | NULLABLE | Academic department |
| `phone` | VARCHAR | NULLABLE | Contact phone |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT `true` | Account status |
| `hashed_password` | VARCHAR | NOT NULL | bcrypt hash |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Registration timestamp |

---

### 4.2 `industry_projects`

Tracks industry-university collaboration projects.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `title` | VARCHAR | NOT NULL | Project title |
| `description` | TEXT | NULLABLE | Full description |
| `industry_partner_name` | VARCHAR | NOT NULL | Company/org name |
| `faculty_lead_id` | INTEGER | FK → `users.id`, NULLABLE | Faculty principal investigator |
| `status` | VARCHAR | NOT NULL, DEFAULT `'proposed'` | See `ProjectStatus` enum |
| `start_date` | DATE | NULLABLE | |
| `end_date` | DATE | NULLABLE | |
| `budget` | FLOAT | NULLABLE | Budget in LKR |
| `created_by_id` | INTEGER | FK → `users.id`, NULLABLE | Creator |
| `created_at` | TIMESTAMP | NOT NULL | |
| `updated_at` | TIMESTAMP | NOT NULL | |

---

### 4.3 `agreements`

Legal agreements (NDAs, licensing, consultancy, etc.) associated with projects.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `title` | VARCHAR | NOT NULL | Agreement name |
| `agreement_type` | VARCHAR | NOT NULL, DEFAULT `'other'` | See `AgreementType` enum |
| `party_name` | VARCHAR | NOT NULL | External party name |
| `project_id` | INTEGER | FK → `industry_projects.id`, NULLABLE | Linked project |
| `file_path` | VARCHAR | NULLABLE | Path to uploaded document |
| `start_date` | DATE | NULLABLE | Effective date |
| `end_date` | DATE | NULLABLE | Expiry date |
| `reminder_date` | DATE | NULLABLE | Alert date |
| `status` | VARCHAR | NOT NULL, DEFAULT `'draft'` | See `AgreementStatus` enum |
| `created_by_id` | INTEGER | FK → `users.id`, NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL | |

---

### 4.4 `mous`

Memoranda of Understanding with partner organizations.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `title` | VARCHAR | NOT NULL | MOU title |
| `partner_organization` | VARCHAR | NOT NULL | Partner institution/company |
| `signatory_internal` | VARCHAR | NULLABLE | University signatory name |
| `signatory_external` | VARCHAR | NULLABLE | Partner signatory name |
| `status` | VARCHAR | NOT NULL, DEFAULT `'draft'` | See `MouStatus` enum |
| `sign_date` | DATE | NULLABLE | Date signed |
| `expiry_date` | DATE | NULLABLE | Expiry date |
| `file_path` | VARCHAR | NULLABLE | Path to signed MOU document |
| `created_by_id` | INTEGER | FK → `users.id`, NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL | |

---

### 4.5 `innovation_club_applications`

Applications submitted to join the university innovation club. Open to public submission (no login required).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `applicant_name` | VARCHAR | NOT NULL | |
| `applicant_email` | VARCHAR | NOT NULL | Contact email |
| `applicant_type` | VARCHAR | NOT NULL, DEFAULT `'student'` | `student` or `faculty` |
| `idea_title` | VARCHAR | NOT NULL | Innovation idea title |
| `idea_description` | TEXT | NULLABLE | Detailed description |
| `status` | VARCHAR | NOT NULL, DEFAULT `'pending'` | See `ApplicationStatus` enum |
| `reviewed_by_id` | INTEGER | FK → `users.id`, NULLABLE | Staff reviewer |
| `created_at` | TIMESTAMP | NOT NULL | Submission timestamp |

---

### 4.6 `innovation_club_members`

Tracks approved members of the innovation club (linked to user accounts).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `user_id` | INTEGER | FK → `users.id`, NOT NULL | Member's user account |
| `role_in_club` | VARCHAR | NOT NULL, DEFAULT `'member'` | Role within club |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT `true` | Membership status |
| `joined_at` | TIMESTAMP | NOT NULL | Join timestamp |

---

### 4.7 `noticeboard_posts`

Announcements and notice posts visible to system users.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `title` | VARCHAR | NOT NULL | Post title |
| `content` | TEXT | NOT NULL | Post body |
| `category` | VARCHAR | NULLABLE | Category tag |
| `is_published` | BOOLEAN | NOT NULL, DEFAULT `true` | Visibility flag |
| `publish_date` | DATE | NULLABLE | Scheduled publish date |
| `expiry_date` | DATE | NULLABLE | Post expiry date |
| `posted_by_id` | INTEGER | FK → `users.id`, NULLABLE | Author |
| `created_at` | TIMESTAMP | NOT NULL | |

---

### 4.8 `ipr_violation_reports`

Reports of intellectual property rights violations (plagiarism, patent infringement, etc.).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `title` | VARCHAR | NOT NULL | Brief violation title |
| `description` | TEXT | NOT NULL | Full violation description |
| `related_patent_or_project` | VARCHAR | NULLABLE | Reference ID (e.g. `PAT-8841`) |
| `severity` | VARCHAR | NOT NULL, DEFAULT `'medium'` | See `ViolationSeverity` enum |
| `status` | VARCHAR | NOT NULL, DEFAULT `'reported'` | See `ViolationStatus` enum |
| `reported_by_id` | INTEGER | FK → `users.id`, NULLABLE | Reporter |
| `created_at` | TIMESTAMP | NOT NULL | |
| `resolved_at` | TIMESTAMP | NULLABLE | Resolution timestamp |

---

### 4.9 `invention_disclosures`

Invention disclosure forms submitted by faculty/researchers before patent filing.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `title` | VARCHAR | NOT NULL | Invention title |
| `description` | TEXT | NULLABLE | Technical summary |
| `department` | VARCHAR | NOT NULL | Submitting department |
| `primary_inventor` | VARCHAR | NOT NULL | Lead inventor name |
| `reviewer` | VARCHAR | NULLABLE | Assigned IP attorney/reviewer |
| `status` | VARCHAR | NOT NULL, DEFAULT `'under_review'` | `under_review`, `needs_revision`, `ready_for_filing` |
| `due_date` | DATE | NULLABLE | Review due date |
| `created_by_id` | INTEGER | FK → `users.id`, NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL | |

---

### 4.10 `patents`

Central patent portfolio table. Each patent is uniquely identified by its patent number.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Internal surrogate key |
| `title` | VARCHAR | NOT NULL | Patent title |
| `patent_number` | VARCHAR | NOT NULL, UNIQUE, INDEXED | e.g. `PAT-8841` |
| `jurisdiction` | VARCHAR | NOT NULL | e.g. `US / PCT`, `EP`, `IN` |
| `assignee` | VARCHAR | NOT NULL | Owning entity |
| `attorney` | VARCHAR | NOT NULL | Assigned IP attorney |
| `filing_date` | DATE | NULLABLE | Date filed |
| `next_due_date` | DATE | NULLABLE | Next action deadline |
| `status` | VARCHAR | NOT NULL, DEFAULT `'drafting'` | `drafting`, `filed`, `office_action`, `granted` |
| `budget` | FLOAT | NULLABLE | Legal budget allocated |
| `claims_text` | TEXT | NULLABLE | Full claims content |
| `legal_notes` | TEXT | NULLABLE | Internal legal notes |
| `created_by_id` | INTEGER | FK → `users.id`, NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL | |

---

### 4.11 `prosecution_events`

Timeline events for patent prosecution (child records of `patents`).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `patent_id` | INTEGER | FK → `patents.id`, NOT NULL | Parent patent |
| `event_title` | VARCHAR | NOT NULL | Event description title |
| `event_date` | DATE | NOT NULL | Date of event |
| `notes` | TEXT | NULLABLE | Additional notes |
| `created_at` | TIMESTAMP | NOT NULL | |

---

### 4.12 `deadlines`

Tracks all critical deadlines across patents, licenses, and disclosures.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `record_id` | VARCHAR | NOT NULL | Reference ID (e.g. `PAT-8841`, `LIC-233`, `DISC-1021`) |
| `title` | VARCHAR | NOT NULL | Deadline description |
| `due_date` | DATE | NOT NULL | Deadline date |
| `severity` | VARCHAR | NOT NULL, DEFAULT `'medium'` | `low`, `moderate`, `high`, `critical` |
| `status` | VARCHAR | NOT NULL, DEFAULT `'pending'` | `pending`, `completed`, `overdue` |
| `assigned_to` | VARCHAR | NULLABLE | Responsible person name |
| `created_at` | TIMESTAMP | NOT NULL | |

---

### 4.13 `licenses`

Technology licensing agreements granting third parties rights to IP assets.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | |
| `title` | VARCHAR | NOT NULL | License agreement name |
| `patent_id` | INTEGER | FK → `patents.id`, NULLABLE | Linked patent (optional) |
| `licensee_name` | VARCHAR | NOT NULL | Licensing company name |
| `royalty_rate` | FLOAT | NULLABLE | Royalty percentage |
| `revenue_ytd` | FLOAT | NULLABLE | Year-to-date revenue in USD |
| `status` | VARCHAR | NOT NULL, DEFAULT `'active'` | `active`, `pending`, `expired`, `terminated` |
| `signing_date` | DATE | NULLABLE | Date license was signed |
| `expiry_date` | DATE | NULLABLE | License expiry date |
| `created_by_id` | INTEGER | FK → `users.id`, NULLABLE | |
| `created_at` | TIMESTAMP | NOT NULL | |

---

## 5. Entity Relationship Diagram

```
users
 ├──< industry_projects (faculty_lead_id, created_by_id)
 ├──< agreements (created_by_id)
 ├──< mous (created_by_id)
 ├──< innovation_club_applications (reviewed_by_id)
 ├──< innovation_club_members (user_id)
 ├──< noticeboard_posts (posted_by_id)
 ├──< ipr_violation_reports (reported_by_id)
 ├──< invention_disclosures (created_by_id)
 ├──< patents (created_by_id)
 └──< licenses (created_by_id)

industry_projects
 └──< agreements (project_id)

patents
 ├──< prosecution_events (patent_id)
 └──< licenses (patent_id)
```

### Cardinality Summary

| Parent Table | Child Table | FK Column | Relationship |
|---|---|---|---|
| `users` | `industry_projects` | `faculty_lead_id` | one-to-many (optional) |
| `users` | `industry_projects` | `created_by_id` | one-to-many (optional) |
| `users` | `agreements` | `created_by_id` | one-to-many |
| `users` | `mous` | `created_by_id` | one-to-many |
| `users` | `innovation_club_applications` | `reviewed_by_id` | one-to-many |
| `users` | `innovation_club_members` | `user_id` | one-to-many |
| `users` | `noticeboard_posts` | `posted_by_id` | one-to-many |
| `users` | `ipr_violation_reports` | `reported_by_id` | one-to-many |
| `users` | `invention_disclosures` | `created_by_id` | one-to-many |
| `users` | `patents` | `created_by_id` | one-to-many |
| `users` | `licenses` | `created_by_id` | one-to-many |
| `industry_projects` | `agreements` | `project_id` | one-to-many (optional) |
| `patents` | `prosecution_events` | `patent_id` | one-to-many |
| `patents` | `licenses` | `patent_id` | one-to-many (optional) |

---

## 6. Foreign Key Relationships

All foreign keys in this schema are **nullable** (i.e. `ON DELETE SET NULL` semantics are implied — deleting a referenced user does not cascade-delete child records, instead the FK value becomes NULL).

> **Note:** SQLModel does not auto-configure `ON DELETE` behavior in the current schema. For production, explicit `ON DELETE` rules should be added via migration.

---

## 7. Enumerations

All enum values are stored as **strings** in the database (not integer codes). This makes the database self-documenting.

### UserRole

| Value | Description |
|---|---|
| `super_admin` | Full system access including user management |
| `ttc_staff` | TTC staff with access to all IP modules |
| `faculty` | Academic staff — can submit disclosures, view patents |
| `industry_partner` | External company partner |
| `club_member` | Innovation club member |

### ProjectStatus

| Value | Description |
|---|---|
| `proposed` | Awaiting approval |
| `ongoing` | Currently active |
| `completed` | Successfully finished |
| `cancelled` | Terminated early |

### AgreementType

| Value | Description |
|---|---|
| `nda` | Non-Disclosure Agreement |
| `licensing` | Technology licensing agreement |
| `consultancy` | Consultancy agreement |
| `other` | Other agreement types |

### AgreementStatus

| Value | Description |
|---|---|
| `draft` | Being drafted |
| `active` | In force |
| `expired` | Past end date |
| `terminated` | Ended early |

### MouStatus

| Value | Description |
|---|---|
| `draft` | Being prepared |
| `pending_signature` | Awaiting signatures |
| `signed` | Fully executed |
| `expired` | Past expiry date |

### ApplicationStatus

| Value | Description |
|---|---|
| `pending` | Awaiting review |
| `approved` | Accepted |
| `rejected` | Declined |

### ViolationStatus

| Value | Description |
|---|---|
| `reported` | Newly reported |
| `investigating` | Under investigation |
| `resolved` | Resolved |
| `dismissed` | Dismissed as unfounded |

### ViolationSeverity

| Value | Description |
|---|---|
| `low` | Minor violation |
| `medium` | Moderate concern |
| `high` | Serious violation |
| `critical` | Urgent / major breach |

### Patent Status (string, not enum)

| Value | Description |
|---|---|
| `drafting` | Specification being written |
| `filed` | Filed with patent office |
| `office_action` | Office action received, response pending |
| `granted` | Patent granted |

### Disclosure Status (string, not enum)

| Value | Description |
|---|---|
| `under_review` | Assigned to reviewer |
| `needs_revision` | Inventor must revise |
| `ready_for_filing` | Cleared for patent filing |

### Deadline Severity (string, not enum)

| Value | Description |
|---|---|
| `low` | Low priority |
| `moderate` | Normal attention required |
| `high` | High priority |
| `critical` | Immediate action required |

### Deadline Status (string, not enum)

| Value | Description |
|---|---|
| `pending` | Not yet completed |
| `completed` | Done |
| `overdue` | Past due date |

---

## 8. Indexes

| Table | Column | Index Type | Purpose |
|---|---|---|---|
| `users` | `email` | UNIQUE INDEX | Fast login lookup, enforce uniqueness |
| `patents` | `patent_number` | UNIQUE INDEX | Fast lookup by patent number, enforce uniqueness |

All primary key columns (`id`) are automatically indexed by PostgreSQL.

---

## 9. Seed Data

The `seed_data()` function in `database.py` populates the database with realistic demo data on first startup:

### Seeded Users (3)

```
admin@university.ac.lk  |  super_admin  |  password: admin123
staff@university.ac.lk  |  ttc_staff    |  password: staff123
user@university.ac.lk   |  faculty      |  password: user123
```

### Seeded Patents (4) + Prosecution Events (4)

| Patent # | Title | Status | Attorney |
|---|---|---|---|
| PAT-8841 | Adaptive edge AI scheduler | `office_action` | Aisha Bennett |
| PAT-8790 | Bio-signal wearable calibration method | `filed` | Rohan Gupta |
| PAT-8612 | Secure federated model watermarking | `granted` | Elena Brooks |
| PAT-8540 | Autonomous materials inspection pipeline | `drafting` | Aisha Bennett |

### Seeded Disclosures (3)

Corresponding disclosures for PAT-8841, PAT-8790, and PAT-8612.

### Seeded Deadlines (4)

| Record ID | Title | Severity | Assigned To |
|---|---|---|---|
| PAT-8841 | Office action response | `critical` | Aisha Bennett |
| LIC-233 | Milestone certification | `high` | Elena Brooks |
| PAT-8790 | Annuity check | `moderate` | Rohan Gupta |
| DISC-1021 | Review revision due | `high` | Prof. Daniel Shaw |

### Seeded Licenses (2)

| Licensee | Royalty | Revenue YTD |
|---|---|---|
| Apple Inc. | 4.5% | $75,000 |
| Medtronic | 3.5% | $53,000 |

### Seeded Industry Projects (3)

| Title | Partner | Status |
|---|---|---|
| IoT-Enabled Campus Smart Grid Optimization | Lanka Electricity Company (LECO) | `ongoing` |
| Wearable Health Monitoring Fabric Calibration | Medtronic Sri Lanka | `proposed` |
| Enterprise Threat Watermarking Core | Virtusa Corp | `completed` |

---

## 10. Docker Setup

PostgreSQL is run via Docker Compose for development:

**`docker-compose.yml`:**

```yaml
services:
  db:
    image: postgres:alpine
    container_name: ttc_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: ttc_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql

volumes:
  postgres_data:
```

### Common Commands

```bash
# Start PostgreSQL in the background
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# Stop and DELETE all data (reset database)
docker-compose down -v

# Connect to PostgreSQL directly
docker exec -it ttc_db psql -U postgres -d ttc_db

# View logs
docker-compose logs db

# Check running containers
docker ps
```

### Useful psql Commands (inside the container)

```sql
-- List all tables
\dt

-- Describe a table
\d patents

-- Count rows
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM patents;

-- View all users
SELECT id, full_name, email, role FROM users;

-- View all patents
SELECT id, patent_number, title, status FROM patents;
```

---

## 11. Connection String Format

**PostgreSQL URL format:**

```
postgresql://<user>:<password>@<host>:<port>/<database>
```

**Default development value (from config.py):**

```
postgresql://postgres:postgrespassword@localhost:5432/ttc_db
```

**Override via `.env` file:**

```env
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/ttc_db
```

> In production, use a secure password and connect via SSL. Example:
> ```
> postgresql://ttc_user:SecurePassword@db.example.com:5432/ttc_production?sslmode=require
> ```
