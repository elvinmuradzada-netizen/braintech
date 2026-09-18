-- auth.users-a insert olanda avtomatik profil yarat
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, grade_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'İstifadəçi'),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'student'),
    nullif(new.raw_user_meta_data->>'grade_level', '')::smallint
  );
  return new;
end;
$$;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();