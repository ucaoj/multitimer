import axios from "axios";
import type { Time, TimeAndPropProps, StopType, TimerRecord } from './types';
import { calcPassedTime } from './calcTime';

const server_url = "http://localhost:8000"

const stopTypeArray:StopType[] = ["STOP", "RESET", "DELETE", "HUP"];
const stopTypeMap = new Map(stopTypeArray.map((a, i) => [a, i+1]));

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

export { recordTime, deleteRecord, fetchRecords };
