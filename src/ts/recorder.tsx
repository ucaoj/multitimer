import axios from "axios";
import type { Time, TimeAndPropProps, StopType, TimerRecord } from './types';
import { calcPassedTime } from './calcTime';

const server_url = "http://localhost:8000"

const stopTypeArray:StopType[] = ["STOP", "RESET", "DELETE", "HUP"];
const stopTypeMap = new Map(stopTypeArray.map((a, i) => [a, i+1]));

const hashPwd = (pwd: string): string => {
    return pwd;  
};

const register = async (username: string, pwd: string): boolean => {
    try{
        const res = await axios.post(server_url+"/auth/signup", {
                        name: username,
                        pwd: hashPwd(pwd), 
                });
        return true;
   }catch(err) {
        console.log("[ERROR]@register ", err);
        return false;
   }
}

const digestStr = async (str: string): ArrayBuffer => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuf = await crypto.sublte.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuf));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0').join(''));
    return hashHex;
}

const generateHash = async (username: string, realm: string, pwd: string, nonce: string, cnonce: string, nc: string, qop: string): string => {
    const a1 = digestStr(username + ":" + realm + ":" + pwd);
    const a2 = await digestStr("POST:/auth/signin");
    return digestStr(a1+":"+nonce+":"+nc+":"+cnonce+":"+qop+":"+a2);
}

//session ID is stored on cookies
const signin = async (username: string, pwd: string): [boolean, string] => {
    try{
        const regName = /[a-zA-Z0-9_-]+/; 
        const regPwd = /[a-zA-Z0-9_]+/;
        const regPwd_8plus = /[a-zA-Z0-9_]{8,}/;

        if(!regName.test(username)) return [false, "user name contains invalid characters"];
        if(!regPwd.test(pwd)) {
            return [false, "password contains invalid characters"];
        }
        else {
            if(!regPwd_8plus.test(pwd)) return [false, "password must contain 8 or above characters"];
        }

        const res = await axios.post(server_url+"/auth/signin", {
                        name: username,
                    });
        return [false, ""];
    }catch(err) {
        console.log("[ERROR]@login ", err);
        if(err.response.status === 401 && err.response.headers["WWW-Authenticate"] === "Digest") {
            if(err.response.headers["algorithm"] !== "SHA-256") return [false, "Some internal algorithm failed. Please Retry"];
            const cnonce_num = new Uint8Array(8);
            self.crypto.getRandomValues(cnonce_num);
            const cnonce = cnonce_num.map(b => b.toString(16).padStart(2, '0').join(''));
            const config = {
                headers: {
                    "Authorization": "Digest",
                    "username": username,
                    "realm": err.response.headers["realm"],
                    "uri": "/auth/signin",
                    "algorithm": err.response.headers["algorithm"],
                    "nonce": err.response.headers["nonce"],
                    "nc": "00000001",
                    "cnonce": cnonce,
                    "qop": "auth",
                    "response": await generate_hash(username, err.response.headers["realm"],pwd, err.response.headers["nonce"], cnonce, "00000001", "auth"),
                    "opaque": err.response.headers["opaque"],
                }
            };
            const res = await axios.post(server_url+"/auth/signin/", {}, config);
            if(res.data.success) return [true, ""];
            else return [false, res.data.message]
        }
        else {
            return [false, "server returned incorrect response"]
        }
    }
}

const logout = async (username: string): boolean => {
    try {
        const res = axios.post(server_url+"/auth/logout", {
                    username,
                });
        return true;
    }
    catch(err) {
        console.log("[ERROR]@logout ", err);
        return false;
    }
}


const recordTime = (st: TimeAndPropProps, stoptype: StopType): void => {
    const totalSec = st.t.days * 24 * 60 * 60 + st.t.hours * 60 * 60 + st.t.minutes * 60 + st.t.seconds + 0.0;
    const data = {
        id: st.id, 
        name: st.name,
        start: st.start?.toISOString(),    //TODO convert
        duration: totalSec, 
        stop_type: stopTypeMap.get(stoptype)    //undefined?
    };

    const url = axios.post(server_url+"/record/", data)
                .then(() => {
                    console.log(url);
                })
                .catch(err => {
                    console.log("error", err);
                });
};

const deleteRecord = (r: TimerRecord): void => {
    const data = {
        id: r.id,
        name: r.name,
        start: r.start?.toISOString(),
        duration: r.duration + 0.0,
        stop_type: stopTypeMap.get(r.stop_type)
    };
    const url = axios.post(server_url+"/delete/", data);
};

const fetchRecords = async (): TimerRecord[] => {
    let recs: TimerRecord[] = [];
    try{
        const res = await axios.get(server_url+"/stat/");
        const data = await res.data;

        if(!Array.isArray(data)) {
            //throw
            console.log("data is not array");
            recs = [];
        }
        //TODO validate

        recs = data.map(d => {
            const passedSec = d.days * 3600 + d.seconds;
            const tr: TimerRecord = {
                id: d.id,
                name: d.name,
                start: new Date(d.start),
                duration: passedSec,
                stop_type: stopTypeArray[d.stop_type-1],
            }; 
            return tr;
        });
    } catch(err){
        console.log("[ERROR]@fetchRecords:", err);     
    }
    return recs;
};

export { recordTime, signin, register, deleteRecord, fetchRecords };
