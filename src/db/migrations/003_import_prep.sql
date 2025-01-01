begin transaction;

insert into assignment (id, name)
values
    ('chapel', 'Chapel'),
    ('east-side', 'East Side'),
    ('west-side', 'West Side'),
    ('garbages-windows', 'Garbages / Windows'),
    ('gym-stage-kitchen', 'Gym / Stage / Kitchen'),
    ('east-bathrooms', 'East Bathrooms'),
    ('west-bathrooms', 'West Bathrooms');

insert into schema_version (version) values (3);

commit;
