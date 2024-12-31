begin transaction;

alter table family
add column active integer not null default 1;

insert into assignment (id, name)
values
    ('568b92ee-04a7-4b05-bf3f-47be5d0cae18', 'Chapel'),
    ('27e0a6de-a80e-4368-8b8d-c8d78320f94d', 'East Side'),
    ('2b8ca14b-91e1-4398-aa79-ace7a28cdbc2', 'West Side'),
    ('f7237fab-68e0-4d36-8dad-cd8f6600eacd', 'Garbages / Windows'),
    ('aed71620-cd73-4e84-9d02-f10f4dcc44f7', 'Gym / Stage / Kitchen'),
    ('311fa3e9-0a73-41e1-ae9c-6c41f686d002', 'East Bathrooms'),
    ('5474451a-531f-47ed-8bfc-e6eeeb9cfc42', 'West Bathrooms');

insert into schema_version (version) values (3);

commit;
