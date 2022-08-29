import React from "react";
import { Editable, EditableInput, EditablePreview,
        Button, IconButton, Stack, Text, Box, Grid, GridItem } from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import type { Time, TimerProps, TimeAndPropProps, StopType } from './types';
import { recordTime } from './recorder';
import { tick } from './calcTime';


const TimerDisp = ({ t }: TimerProps): React.ReactNode => {
    const days = (t.days < 10 ? "0":"") + t.days.toString();
    const hours = (t.hours < 10 ? "0":"") + t.hours.toString();
    const minutes = (t.minutes < 10 ? "0":"") + t.minutes.toString();
    const seconds = (t.seconds < 10 ? "0":"") + t.seconds.toString();
    return <Text fontSize='4xl'>{days}:{hours}:{minutes}:{seconds}</Text>;
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
    if(st.isOn) {
        recordTime(st, "STOP");
    }
    const stTime = st.isOn?null:new Date();
    return { id:st.id, t:st.t, start:stTime, prev:stTime, name:st.name, isOn:!st.isOn };
};

const onReset = (st:TimeAndPropProps): TimeAndPropProps => {
    if(st.start) recordTime(st, "RESET");
    return { id:st.id, t:{days:0, hours:0, minutes:0, seconds:0}, start:null, prev:null, name:st.name, isOn:false };
};

const updateTimer = (p: TimeAndPropProps): TimeAndPropProps => {
    const now = new Date();
    return {id:p.id, t:(p.isOn&&p.prev!=null?tick(p.t, now, p.prev):p.t), start: p.start, prev:now, name:p.name, isOn:p.isOn};
};

const TimerWithButton = ({t} : TimerProps): JSX.Element => {
    const defaultTime = {days:0, hours:0, minutes:0, seconds:0};
    const [timerState, setTimerState] = React.useState([{id:0, t:defaultTime, start:null, prev:null, name:"", isOn:false}]);
    const [intervalId, setIntervalId] = React.useState(null as number);
    const [timerId, setTimerId] = React.useState(1);


    const handleStartOrStop = (id: number): void => {
        if(!intervalId) {
            const intervalid = setInterval(() => {
                setTimerState(prev => prev.map(p => updateTimer(p)));
            }, 1000);
            setIntervalId(intervalid);
        }
        setTimerState(prev => prev.map(p => p.id===id?onStartOrStop(p):p));
    };

    const handleReset = (id: number): void => {
        //Db.send(timerState);
        setTimerState(prev => prev.map(p => p.id===id?onReset(p):p));
    };

    const handleDelete = (id: number): void => {
        setTimerState(prev => prev.filter(p => p.id!==id));
    };

    const handleNameChange = (nextValue:string, id: number): void => {
        setTimerState(prev => prev.map(
            p => ({ id:p.id, t:p.t, start:p.start, prev:p.prev, name:(nextValue&&id===p.id?nextValue:p.name), isOn:p.isOn })
        ));
    }

    const handleAddTimer = (): void => {
        setTimerState(prev => prev.concat([{id: timerId, t:defaultTime, start:new Date(), prev:null, name:"", isOn:false}]));
        setTimerId(prev => prev+1);
    }

    return (
        <>
            <Grid autoColumns='minmax(200px,300px)' gap={4}>
            {timerState.map((st,id) => 
                (<Box key={st.id} m={1} p={3} border='2px' borderRadius="5" borderColor='gray.200'>
                    <Editable fontSize='2xl' defaultValue="timer name" onChange={nextValue => { handleNameChange(nextValue, st.id); }}>
                        <EditablePreview />
                        <EditableInput />
                    </Editable>
                    <TimerDisp t={st.t}/>
                    <Stack spacing={4} direction='row' align='center'>
                        <Button onClick={ () => {handleStartOrStop(st.id);} }>{st.isOn?"stop":"start"}</Button>
                        <Button onClick={ () => {handleReset(st.id);} }>reset</Button>
                        <Button onClick={ () => {
                            if(st.start) recordTime(st, "DELETE");
                            handleDelete(st.id);
                        } }>delete</Button>
                    </Stack>
                </Box>)
            )}
            </Grid>
            <IconButton aria-label='add' icon={<AddIcon />} m={3} onClick={handleAddTimer} />
        </>
    ); 
};

export { TimerWithButton, TimerDisp };
