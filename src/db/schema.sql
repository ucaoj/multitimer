create table if not exists records (
    id INTEGER,
    name text NOT NULL,
    timer_start text, 
    days integer,
    seconds integer,
    stoptype integer, --0: stop, 1: reset, 2: delete
    userid integer
);


create table if not exists users (
    userid integer primary key,
    name text,
    hash blob
);
