"""add_note_versions_table

Revision ID: eb753f6103db
Revises: 66e7c2e8be5e
Create Date: 2025-04-19 10:19:54.487256

"""

from typing import Optional, Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "eb753f6103db"
down_revision: Optional[str] = "66e7c2e8be5e"
branch_labels: Optional[Sequence[str]] = None
depends_on: Optional[Sequence[str]] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic -
    # adjust constraint names and remove redundant PK index ###
    op.create_table(
        "note_versions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("note_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "version_timestamp",
            sa.DateTime(timezone=True),
            server_default=sa.text("(CURRENT_TIMESTAMP)"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["note_id"], ["notes.id"], name=op.f("fk_note_versions_note_id_notes")
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_note_versions")),
    )
    op.create_index(
        op.f("ix_note_versions_note_id"), "note_versions", ["note_id"], unique=False
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - remove drop for redundant PK index ###
    op.drop_index(op.f("ix_note_versions_note_id"), table_name="note_versions")
    op.drop_table("note_versions")
    # ### end Alembic commands ###
