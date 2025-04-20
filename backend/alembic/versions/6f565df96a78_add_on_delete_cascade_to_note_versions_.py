"""add_on_delete_cascade_to_note_versions_fk

Revision ID: 6f565df96a78
Revises: eb753f6103db
Create Date: 2025-04-20 14:47:58.483084

"""

from typing import Optional, Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6f565df96a78"
down_revision: Optional[str] = "eb753f6103db"
branch_labels: Optional[Sequence[str]] = None
depends_on: Optional[Sequence[str]] = None

# Define constraint name for consistency
CONSTRAINT_NAME = op.f("fk_note_versions_note_id_notes")


def upgrade() -> None:
    """Applies ON DELETE CASCADE using batch mode for SQLite compatibility."""
    with op.batch_alter_table("note_versions", schema=None) as batch_op:
        # Drop the existing foreign key constraint
        batch_op.drop_constraint(CONSTRAINT_NAME, type_="foreignkey")
        # Recreate the foreign key constraint with ON DELETE CASCADE
        batch_op.create_foreign_key(
            CONSTRAINT_NAME, "notes", ["note_id"], ["id"], ondelete="CASCADE"
        )


def downgrade() -> None:
    """Removes ON DELETE CASCADE using batch mode for SQLite compatibility."""
    with op.batch_alter_table("note_versions", schema=None) as batch_op:
        # Drop the foreign key constraint with CASCADE
        batch_op.drop_constraint(CONSTRAINT_NAME, type_="foreignkey")
        # Recreate the foreign key constraint WITHOUT ON DELETE CASCADE
        batch_op.create_foreign_key(CONSTRAINT_NAME, "notes", ["note_id"], ["id"])
