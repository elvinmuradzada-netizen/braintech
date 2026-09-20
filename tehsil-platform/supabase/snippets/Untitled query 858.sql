-- ═══ CƏDVƏLLƏR ═══
create table if not exists cities (
  id serial primary key,
  name text not null unique
);

create table if not exists districts (
  id serial primary key,
  city_id int references cities(id) on delete cascade,
  name text not null
);

create table if not exists schools (
  id serial primary key,
  district_id int references districts(id) on delete cascade,
  name text not null,
  address text
);

-- RLS - hamı oxuya bilər
alter table cities enable row level security;
alter table districts enable row level security;
alter table schools enable row level security;

drop policy if exists "Hamı şəhərləri görür" on cities;
create policy "Hamı şəhərləri görür" on cities for select using (true);

drop policy if exists "Hamı rayonları görür" on districts;
create policy "Hamı rayonları görür" on districts for select using (true);

drop policy if exists "Hamı məktəbləri görür" on schools;
create policy "Hamı məktəbləri görür" on schools for select using (true);

-- ═══ ŞƏHƏRLƏR ═══
insert into cities (name) values 
  ('Bakı'), ('Sumqayıt'), ('Gəncə'), ('Mingəçevir')
on conflict (name) do nothing;

-- ═══ BAKININ RAYONLARI ═══
insert into districts (city_id, name)
select c.id, d.name
from cities c
cross join (values 
  ('Binəqədi'), ('Qaradağ'), ('Nizami'), ('Nərimanov'),
  ('Nəsimi'), ('Pirallahı'), ('Sabunçu'), ('Səbail'),
  ('Suraxanı'), ('Xətai'), ('Xəzər'), ('Yasamal')
) as d(name)
where c.name = 'Bakı';

-- ═══ SUMQAYIT RAYONLARI ═══
insert into districts (city_id, name)
select c.id, d.name
from cities c
cross join (values 
  ('1-ci massiv'), ('2-ci massiv'), ('3-cü massiv'), ('Mərkəz')
) as d(name)
where c.name = 'Sumqayıt';

-- ═══ GƏNCƏ RAYONLARI ═══
insert into districts (city_id, name)
select c.id, d.name
from cities c
cross join (values 
  ('Kəpəz'), ('Nizami'), ('Mərkəz')
) as d(name)
where c.name = 'Gəncə';

-- ═══ MİNGƏÇEVİR RAYONLARI ═══
insert into districts (city_id, name)
select c.id, d.name
from cities c
cross join (values ('Mərkəz')) as d(name)
where c.name = 'Mingəçevir';

-- ═══ NÜMUNƏ MƏKTƏBLƏR ═══
insert into schools (district_id, name, address)
select d.id, s.name, s.address
from districts d
cross join (values
  ('20 nömrəli tam orta məktəb', 'Bakı, Binəqədi'),
  ('135 nömrəli tam orta məktəb', 'Bakı, Binəqədi'),
  ('158 nömrəli tam orta məktəb', 'Bakı, Binəqədi'),
  ('183 nömrəli tam orta məktəb', 'Bakı, Binəqədi'),
  ('5 nömrəli tam orta məktəb', 'Bakı, Binəqədi')
) as s(name, address)
where d.name = 'Binəqədi';