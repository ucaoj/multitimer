create table if not exists multitimer.records (
    id INTEGER unique primary key,
    name text NOT NULL,
    timer_start text, 
    days integer,
    seconds integer,
    stoptype integer --0: stop, 1: reset, 2: delete
);
