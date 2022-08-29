
type Time = {
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
};

type TimerProps = {
    t: Time,
};

type TimeAndPropProps = {
    id: number,
    t : Time,
    start: Date | null,
    prev: Date | null,
    name : string,
    isOn : boolean,
};

type StopType = "STOP" | "RESET" | "DELETE" | "HUP";

type TimerRecord = {
    id: number,
    name: string,
    start: Date | null,
    duration: number,
    stop_type: StopType,
};

export { Time, TimerProps, TimeAndPropProps, StopType, TimerRecord };
