begin transaction;

alter table family
add column notes text not null default '';

alter table family
add column permission_given_date text;

insert into schema_version (version) values (4);

commit;
