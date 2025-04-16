import logging

from app.db.base import Base
from app.db.session import engine
from app.models.note import Note  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db() -> None:
    logger.info("creating initial database tables...")
    # Create all defined tables that inherit from Base
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created.")


if __name__ == "__main__":
    init_db()
