#!/bin/sh
set -e

echo "==> Ensuring data directory..."
mkdir -p data

echo "==> Applying schema patches..."
python -c "
from app.core.database import engine
from sqlalchemy import text, inspect

insp = inspect(engine)
tables = insp.get_table_names()

with engine.begin() as conn:
    # Patch: activities.due_date
    if 'activities' in tables:
        cols = [c['name'] for c in insp.get_columns('activities')]
        if 'due_date' not in cols:
            conn.execute(text('ALTER TABLE activities ADD COLUMN due_date DATETIME'))
            print('Added activities.due_date')
        if 'is_done' not in cols:
            conn.execute(text('ALTER TABLE activities ADD COLUMN is_done BOOLEAN NOT NULL DEFAULT 0'))
            print('Added activities.is_done')

    # Patch: notifications table
    if 'notifications' not in tables:
        conn.execute(text('''
            CREATE TABLE notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id),
                title VARCHAR NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR NOT NULL,
                entity_type VARCHAR,
                entity_id INTEGER,
                is_read BOOLEAN NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT (datetime(\"now\"))
            )
        '''))
        print('Created notifications table')

    # Patch: users.role
    if 'users' in tables:
        cols = [c['name'] for c in insp.get_columns('users')]
        if 'role' not in cols:
            conn.execute(text(\"ALTER TABLE users ADD COLUMN role VARCHAR NOT NULL DEFAULT 'member'\"))
            conn.execute(text(\"UPDATE users SET role = 'admin' WHERE id = (SELECT MIN(id) FROM users)\"))
            print('Added users.role and promoted first user to admin')

print('Schema patches done.')
"

echo "==> Stamping Alembic to head..."
alembic stamp head 2>/dev/null || true

echo "==> Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
