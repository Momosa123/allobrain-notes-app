from fastapi import FastAPI

app = FastAPI(title="AlloBrain Notes API")

@app.get("/")
async def read_root():
    """
    Root endpoint providing a welcome message.
    """

    return {"message": "Welcome to AlloBrain Notes API"}