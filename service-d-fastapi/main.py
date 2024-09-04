from fastapi import FastAPI

print("Service is running on port 4004")

app = FastAPI()

@app.get("/health-check")
def healthCheck():
    return 'Service D is running'
