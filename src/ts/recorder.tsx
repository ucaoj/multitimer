import axios from "axios";
import type { Time, TimeAndPropProps, StopType } from './types';

const server_url = "http://localhost:8000"

const stopTypeMap = new Map([["STOP", 1], ["RESET", 2], ["DELETE", 3], ["HUP", 4]]);

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

export { recordTime };
