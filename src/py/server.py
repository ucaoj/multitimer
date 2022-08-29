import sqlite3
import datetime
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

app = FastAPI()
db_path = "../db/multitimer.db"

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
    stop_type: int = Field(ge=1, le=4, description="STOP: 1\nRESET: 2\nDELETE: 3\nHUP: 4")

def db_insert_item(item: RecordItem):
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    cur.execute(f"INSERT INTO records VALUES ({item.id}, \'{item.name}\', \'{item.start.isoformat()}\', {item.duration.days}, {item.duration.seconds}, {item.stop_type})")
    con.commit()

@app.post("/record/")
def record_timer(item: RecordItem):
    db_insert_item(item) 

@app.post("/delete/")
def delete_record(item: RecordItem):
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    cur.execute(f"DELETE FROM records WHERE id={item.id} AND name=\'{item.name}\' AND timer_start=\'{item.start.isoformat()}\';");
    con.commit()

@app.get("/stat/")
def stat_page():
    con = sqlite3.connect(db_path)
    cur = con.cursor()
    res = cur.execute("SELECT id,name,timer_start,days,seconds,stoptype FROM records")
    all_data = res.fetchall()
    stats = [{"id":d[0], "name":d[1], "start":d[2], "days":d[3], "seconds":d[4], "stop_type":d[5]} for d in all_data]
    return stats

if __name__ == '__main__':
    uvicorn.run(app)
