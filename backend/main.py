# Import routers
from app.routers import notes_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AlloNotes API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    """
    Root endpoint providing a welcome message.
    """

    return {"message": "Welcome to AlloNotes API"}


# Include routes defined in app/routers.
# All the defined routes will be accessible
# via /api/v1/notes as defined in notes_router.py
app.include_router(notes_router.router)
