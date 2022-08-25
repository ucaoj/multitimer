import React from "react";

type Time = {
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
};

type TimerProps = {
    t: Time,
};

const TimerDisp = ({ t }: TimerProps): React.ReactNode => {
    return <div>{t.days}:{t.hours}:{t.minutes}:{t.seconds}</div>;
};

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

type TimeAndPropProps = {
    id: number,
    t : Time,
    name : string,
    isOn : boolean,
};

//type TimerNameProps = {
//    name: string,
//    callback: (e: React.FormEvent<HTMLInputElement>) => void,
//};
//
//const TimerName = ({name,callback}: TimerNameProps): JSX.Element => {
//    return <input value={name} onChange={callback} />;
//};
//
//type buttonProps = {
//    name: string,
//    callback: (e: React.MouseEvent<HTMLButtonElement>) => void,
//};
//
//const TimerButton = ({name, callback} : buttonProps): JSX.Element => {
//    return (
//        <button onClick={callback}>
//            {name}
//        </button>
//    );
//};

const onStartOrStop = (st: TimeAndPropProps): TimeAndPropProps => {
    console.log("onstartorstop called");
    return { id:st.id, t:st.t, name:st.name, isOn:!st.isOn };
};

const onReset = (st:TimeAndPropProps): TimeAndPropProps => {
    return { id:st.id, t:{days:0, hours:0, minutes:0, seconds:0}, name:st.name, isOn:false };
};

const isTimerZero = (t: Timer): bool => {
    return t.days===0 && t.hours===0 && t.minutes===0 && t.seconds===0;
};

const TimerWithButton = ({t} : TimerProps): JSX.Element => {
    const defaultTime = {days:0, hours:0, minutes:0, seconds:0};
    const [timerState, setTimerState] = React.useState([{id:0, t:defaultTime, name:"", isOn:false}]);
    const [intervalId, setIntervalId] = React.useState(null as number);
    const [timerId, setTimerId] = React.useState(1);


    const handleStartOrStop = (e: React.MouseEvent<HTMLButtonElement>, id: number): void => {
        if(!intervalId) {
            const intervalid = setInterval(() => {
                setTimerState(prev => prev.map(p => ({id:p.id, t:(p.isOn?tick(p.t):p.t), name:p.name, isOn:p.isOn})));
            }, 1000);
            setIntervalId(intervalid);
        }
        setTimerState(prev => prev.map(p => p.id===id?onStartOrStop(p):p));
    };

    const handleReset = (e: React.MouseEvent<HTMLButtonElement>, id: number): void => {
        //Db.send(timerState);
        setTimerState(prev => prev.map(p => p.id===id?onReset(p):p));
    };

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, id: number): void => {
        setTimerState(prev => prev.filter(p => p.id!==id));
    };

    const handleNameChange = (e:React.FormEvent<HTMLInputElement>, id: number): void => {
        setTimerState(prev => prev.map(
            p => ({ id:p.id, t:p.t, name:(e.currentTarget.value&&id===p.id?e.currentTarget.value:p.name), isOn:p.isOn })
        ));
    }

    const handleAddTimer = (e: React.MouseEvent<HTMLButtonElement>): void => {
        setTimerState(prev => prev.concat([{id: timerId, t:defaultTime, name:"", isOn:false}]));
        setTimerId(prev => prev+1);
    }

    return (
        <>
            {timerState.map((st,id) => 
                (<div key={st.id}>
                    <input value={st.name} onChange={ e => { handleNameChange(e, st.id); } }/>
                    <TimerDisp t={st.t}/>
                    <button onClick={ e => {handleStartOrStop(e, st.id);} }>{st.isOn?"stop":"start"}</button>
                    <button onClick={ e => {handleReset(e, st.id);} }>reset</button>
                    <button onClick={ e => {handleDelete(e, st.id);} }>delete</button>
                </div>)
            )}
            <button onClick={handleAddTimer}>add</button>
        </>
    ); 
};

export default TimerWithButton;
export default Time;
