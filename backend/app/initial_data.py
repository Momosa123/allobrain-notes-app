import logging

from app.db.base import Base
from app.db.session import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db() -> None:
    logger.info("creating initial database tables...")
    # Create all defined tables that inherit from Base
    Base.metadata.creat_all(bind=engine)
    logger.info("Database tables created.")


if __name__ == "__main__":
    init_db()
