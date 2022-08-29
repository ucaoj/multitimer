import React from 'react';
import { Box, Stack, 
    Table, Thead, Tbody, Tfood, Tr, Th, Td, TableCaption, TableContainer,
    IconButton
} from '@chakra-ui/react';
import { RepeatIcon, DeleteIcon } from '@chakra-ui/icons';
import type { Time, TimeRecord, TimerRecord } from './types';
import { deleteRecord, fetchRecords } from './recorder';
import { TimerDisp } from './timer';
import { calcPassedTime } from './calcTime';

type RecordDispProp = {
    rs: TimerRecord[];
};

const RecordDisp = ({rs}: RecordDispProp): JSX.Element => {
    const [isDisp, setIsDisp] = React.useState(Array(rs?rs.length:0).fill(true));

    React.useEffect(() => {
        if(!rs || rs.length !== isDisp.length) {
            setIsDisp(Array(rs?rs.length:0).fill(true));
        }
    });
    console.log("RecordDisp: ", isDisp);

    const handleDelete = (r: TimerRecord, i: number): void => {
        deleteRecord(r);
        setIsDisp(p => {
            const p_new = [...p];
            p_new[i] = false;
            return p_new;
        });
        console.log(isDisp);
    };

    return (
        <>
            { rs.map((r,i) => isDisp[i] && (
                <Tr key={r.start}>
                    <Th>{r.name}</Th>
                    <Th><TimerDisp t={calcPassedTime(0, r.duration)} /></Th>
                    <Th>
                        <IconButton aria-label='delete' icon={<DeleteIcon />} m={3} onClick={() => handleDelete(r, i)} /> 
                   </Th>
                </Tr>))
            } 
        </>
    );
};

const accumRecord = (recs: TimerRecord[]): Map<number, TimerRecord[]> => {
    //recs.sort((a,b) => {
//        if(a.id < b.id) return -1;
//        else if(a.id > b.id) return 1;
//        else return 0;
//    });
    let rec_map = new Map<number, TimerRecord[]>();
    for(const r of recs){
        if(r.stop_type === "STOP") continue;
        if(rec_map.has(r.id)) {
            rec_map.get(r.id).push(r);
        }
        else {
            rec_map.set(r.id, Array(r));
        }
    }
    
    return rec_map;
};

const recordToArray = async (): (TimerRecord[])[] => {
    console.log("recordToArray");
    let recMap: Map<number, TimerRecord[]>;
    try {
        const recs = await fetchRecords();
        recMap = accumRecord(recs);
        console.log("accum: ", [...recMap.values()]);
        return [...recMap.values()];
    }
    catch(err) {
        console.log("[ERROR]@recordToArray: ", err);
    }
}

const RecordPanel = (): JSX.Element => {
    const [records, setRecords] = React.useState([] as TimeRecord[][]);
    const [reload, setReload] = React.useState(false);
    React.useEffect(() => {
        const accessRecords = async () => {
            const res = await recordToArray();
            setRecords(res);
        }
        console.log("record fetching...");
        accessRecords();
    }, [reload]);

    return (
        <>
        <IconButton aria-label='reload' icon={<RepeatIcon />} m={3} onClick={() => setReload(p => !p)} />
        <TableContainer>
        <Table variant='simple'>
        <Thead>
            <Tr>
                <Th>name</Th>
                <Th>time</Th>
            </Tr>
        </Thead>
        <Tbody>
            { records.map(r => (
                    <RecordDisp rs={r} key={r?r[0].id:-1}/>
            )) }
        </Tbody>
        </Table>
        </TableContainer>
        </>
    );
};

export { RecordPanel };
