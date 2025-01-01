begin transaction;

create table if not exists schema_version (
    version integer primary key,
    applied_on text default current_timestamp
);

insert into schema_version (version) values (1);

commit;
