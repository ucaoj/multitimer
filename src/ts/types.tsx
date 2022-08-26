
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
    name : string,
    isOn : boolean,
};

type StopType = "STOP" | "RESET" | "DELETE" | "HUP";

export { Time, TimerProps, TimeAndPropProps, StopType };
