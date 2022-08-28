import { Time } from "./types";

/* @param {number} start - start time in seconds
 * @param {number} now   - current time in seconds
 * @returns {Time} now - start
 */
const calcPassedTime = (start: number, now: number): Time => {
    let passed = now - start;
    let t : Time = {days:0, hours:0, minutes:0, seconds:0};
    const minute = 60;
    const hour = 3600;
    const day = 3600 * 24;
    t.days = Math.floor(passed / day);
    passed -= day * t.days;
    t.hours = Math.floor(passed / hour);
    passed -= hour * t.hours;
    t.minutes = Math.floor(passed / minute);
    passed -= minute * t.minutes;
    t.seconds = passed;
    return t;
};

const carryTime = (t: Time): Time => {
    let _now = t; 
    if(_now.seconds >= 60) {
        _now.seconds %= 60;
        _now.minutes++;
    }
    if(_now.minutes >= 60) {
        _now.minutes %= 60;
        _now.hours++;
    }
    if(_now.hours >= 24) {
        _now.hours %= 24;
        _now.hours++;
    }
    return _now;
};

const updateTime = (prev: Time, diff: number): Time => {
    const minute = 60;
    const hour = 3600;
    const day = 3600 * 24;
    
    const diffTime = calcPassedTime(0, diff);
    let _now = prev;
    _now.days += diffTime.days;
    _now.hours += diffTime.hours;
    _now.minutes += diffTime.minutes;
    _now.seconds += diffTime.seconds;
    
    return carryTime(_now);
};

const tick = (t: Time): Time => {
     const now = { days:t.days, hours:t.hours, minutes:t.minutes, seconds:t.seconds + 1 };
     return carryTime(now);
};

export { calcPassedTime, carryTime, updateTime, tick };
