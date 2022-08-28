import sqlite3
import datetime

class RecordItem:
    id: int
    name: str
    start: datetime.datetime
    duration: datetime.timedelta 
    stop_type: int
    
    def __init__(self, id_, name_, start_, duration_, stop_type_):
        self.id = id_
        self.name = name_
        self.start = start_
        self.duration = duration_
        self.stop_type = stop_type_

def db_insert_item(item: RecordItem):
    con = sqlite3.connect("multitimer.db")
    cur = con.cursor()
    cur.execute(f"INSERT INTO records VALUES ({item.id}, \'{item.name}\', \'{item.start.isoformat()}\', {item.duration.days}, {item.duration.seconds}, {item.stop_type})")
    con.commit()

def stat_page():
    con = sqlite3.connect("../db/multitimer.db")
    cur = con.cursor()
    res = cur.execute("SELECT id,name,days,seconds,stoptype FROM records")
    all_data = res.fetchall()
    for d in all_data:
        print(f"id: {d[0]}\nname: {d[1]}\ndays: {d[2]}\nseconds: {d[3]}")

item = RecordItem(1, 'test', datetime.datetime.now(), datetime.timedelta(days=0, seconds=3600, microseconds=0, milliseconds=0), 1)

item2 = RecordItem(2, 'test 2', datetime.datetime(1970, 1, 1, hour=13, minute=13, second=13, tzinfo=datetime.timezone.utc), datetime.timedelta(days=0, seconds=1300, microseconds=0, milliseconds=0), 2)
db_insert_item(item)
db_insert_item(item2)

stat_page()
