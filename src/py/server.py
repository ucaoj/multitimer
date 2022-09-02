import base64
import hashlib
import secrets
import sqlite3
import datetime
import time
import sys
import uvicorn
from fastapi import Depends, Body, FastAPI, Response, Request, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPDigest
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

http_digest = HTTPDigest(description="HTTPDigest scheme")

app = FastAPI()

DB_PATH = "../db/multitimer.db"
COOKIE_KEY = 'MTsession'

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

def gen_hash(pwd: str):
    return pwd

nonce_storage = {}
opaque_storage = {}
session_storage = {}

class LoginItem(BaseModel):
    username: str
    pwdhash: str

def get_newid():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    res = cur.execute(f"SELECT MAX(userid) FROM records")
    d = res.fetchone()
    return d+1

def register_session_id(id: int):
    return gen_hash(str(id))

def delete_session_id(session_id: str):
    try:
        session_storage.pop(session_id)
    except KeyError:
        return

def get_userid(session_id: str):
    try:
        return session_storage[session_id]
    except KeyError:
        return 0

@app.post("/auth/signup")
def auth_signup(item: LoginItem, response: Response):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    new_id = get_newid()
    cur.execute(f"INSERT INTO users VALUES ({new_id}, \'{item.name}\', \'{gen_hash(item.password)}\')")

    session_id = register_session_id(new_id)
    response.set_cookie(key=COOKIE_KEY, value=session_id)
    return {}

def create_nonce(username: str):
    timestamp = time.time_ns().to_bytes(8, byteorder=sys.byteorder)
    h = hashlib.sha256(timestamp)
    h.update(b"::")
    h.update(b"secret")

    nonce = base64.b64encode(timestamp+b" "+h.digest()) # slow
    nonce_storage[username] = nonce
    return nonce

def create_opaque(username: str):
    opaque = base64.encode(time.time_ns().to_bytes(8, byteorder=sys.byteorder))
    opaque_storage[username] = opaque
    return opaque


@app.post("/auth/signin/")
def auth_signin(request:Request):
    if not "Authoization" in request.headers:
        nonce = create_nonce(username)
        opaque = create_opaque(username)
        raise HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "incorrect digest token",
            headers={
                "WWW-Authenticate": "Digest",
                "realm": "auth-signin@localhost",
                "qop":"auth, auth-int",
                "algorithm":"SHA-256",
                "nonce": nonce,
                "opaque": opaque
            }
        )
    else:
        try:
            name = request.headers["username"]
            if request.headers["opaque"] != opaque_storage[name]:
                raise KeyError()
            con = sqlite3.connect(DB_PATH)
            cur = con.cursor()
            # realm = request.headers["realm"]
            res = cur.execute(f"SELECT userid, hash FROM users WHERE name = {name}").fetchone()
            if res is None:
                return JSONResponse({"success":"true", "message":"user name was not found"}) 
            [userid, d] = res
            h = hashlib.sha256(f"{name}:auth-signin@localhost:{d}".encode()).hexdigest().encode()
            correct_hash = hashlib.sha256(h)
            correct_hash.update((":"+nonce_storage[name]+":"+"00000001"+":"+request.headers["cnonce"]+":"+request.headers["qop"]+":").encode())
            correct_hash.update(hashlib.sha256("POST:/auth/signin".encode()).hexdigest().encode())
            
            icoming_hash = request.headers["response"]
            message = ""
            if not secrets.compare_digest(correct_hash.hexdigest().encode(), incoming_hash):
                message = "probably incorrect password"
                #raise HTTPExcetption(
                #    status_code = status.HTTP_401_UNAUTHORIZED,
                #    detail = "incorrect digest token",
                #    headers={
                #        "WWW-Authenticate": "Digest",
                #        "realm": "auth-signin@localhost",
                #        "qop":"auth, auth-int",
                #        "algorithm":"SHA-256",
                #        "nonce": nonce_storage[name],
                #        "opaque": opaque_storage[name]
                #    }
                #)

            response = JSONResponse({"succsess": "true", "message":message})
            sess_key = secrets.token_hex(16)
            while session_storage.get(sess_key) is not None:
                sess_key = secrets.token_hex(16)
            session_storage[sess_key] = userid
            response.set_cookie(COOKIE_KEY, sess_key)
            return response

        except KeyError:
            raise HTTPException(
                status_code = status.HTTP_400_BADREQUEST,
                detail = "some headers are missing",
            )


@app.post("/auth/signout/")
def auth_signout(request: Request):
    session_id = request.cookies.get(COOKIE_KEY)
    delete_session_id(session_id)

class RecordItem(BaseModel):
    id: int
    name: str
    start: datetime.datetime
    duration: datetime.timedelta 
    stop_type: int = Field(ge=1, le=4, description="STOP: 1\nRESET: 2\nDELETE: 3\nHUP: 4")

def db_insert_item(item: RecordItem, userid):
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(f"INSERT INTO records VALUES ({item.id}, \'{item.name}\', \'{item.start.isoformat()}\', {item.duration.days}, {item.duration.seconds}, {item.stop_type}, {userid})")
    con.commit()

@app.post("/record/")
def record_timer(item: RecordItem, request: Request):
    userid = get_userid(request.cookies.get(COOKIE_KEY))
    db_insert_item(item, userid)

@app.post("/delete/")
def delete_record(item: RecordItem, request: Request):
    userid = get_userid(request.cookies.get(COOKIE_KEY))
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    cur.execute(f"DELETE FROM records WHERE id={item.id} AND name=\'{item.name}\' AND timer_start=\'{item.start.isoformat()}\' AND userid={userid};");
    con.commit()

@app.get("/stat/")
def stat_page(request: Request):
    userid = get_userid(request.cookies.get(COOKIE_KEY))

    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()
    #res = cur.execute(f"SELECT id,name,timer_start,days,seconds,stoptype FROM records WHERE userid={userid}")
    res = cur.execute(f"SELECT id,name,timer_start,days,seconds,stoptype FROM records")
    all_data = res.fetchall()
    stats = [{"id":d[0], "name":d[1], "start":d[2], "days":d[3], "seconds":d[4], "stop_type":d[5]} for d in all_data]
    return stats

if __name__ == '__main__':
    uvicorn.run(app)
