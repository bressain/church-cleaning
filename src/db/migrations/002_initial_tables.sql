pragma foreign_keys = on;

begin transaction;

create table if not exists family (
    id text primary key,
    surname text not null,
    p1_name text not null,
    p1_phone text,
    p1_email text,
    p2_name text,
    p2_phone text,
    p2_email text,
    available integer
);

create table if not exists assignment (
    id text primary key,
    name text not null
);

create table if not exists family_assignment (
    id text primary key,
    family_id text not null,
    assignment_id text not null,
    date_assigned text not null,
    foreign key (family_id) references family (id),
    foreign key (assignment_id) references assignment (id)
);

insert into schema_version (version) values (2);

commit;
