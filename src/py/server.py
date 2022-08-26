import sqlite3
import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI()

# https://fastapi.tiangolo.com/ja/tutorial/cors/
origins = [
    "http://localhost:3000",
    "http://localhost:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)


@app.get("/")
async def main():
    return FileResponse("../../dist/index.html")

@app.get("/app.js")
async def return_js():
    return FileResponse("../../dist/app.js")

class RecordItem(BaseModel):
    id: int
    name: str
    start: datetime.datetime
    duration: datetime.timedelta 
    stop_type: int

def db_insert_item(item: RecordItem):
    con = sqlite3.connect("../db/multitimer.db")
    cur = con.cursor()
    cur.execute(f"INSERT INTO records VALUES ({item.id}, \'{item.name}\', {item.duration.days}, {item.duration.seconds}, {item.stop_type})")
    cur.commit()

@app.post("/record/")
def record_timer(item: RecordItem):
    db_insert_item(item) 
