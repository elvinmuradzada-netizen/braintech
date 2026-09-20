-- ═══ MESAJLAR ═══
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text default 'system' check (type in ('system', 'exam', 'result', 'payment', 'news', 'welcome')),
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_messages_user on messages(user_id);
create index if not exists idx_messages_read on messages(user_id, is_read);

-- RLS
alter table messages enable row level security;

drop policy if exists "İstifadəçi öz mesajlarını görür" on messages;
create policy "İstifadəçi öz mesajlarını görür"
  on messages for select using (auth.uid() = user_id);

drop policy if exists "İstifadəçi öz mesajını oxundu edir" on messages;
create policy "İstifadəçi öz mesajını oxundu edir"
  on messages for update using (auth.uid() = user_id);

-- ═══ XOŞ GƏLDİN MESAJI (qeydiyyatdan sonra) ═══
create or replace function public.send_welcome_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.messages (user_id, title, body, type)
  values (
    new.id,
    '🎉 BrainTech-ə xoş gəldiniz!',
    'Hörmətli ' || coalesce(new.full_name, 'istifadəçi') || ',

BrainTech onlayn təhsil platformasına qeydiyyatdan keçdiyiniz üçün təşəkkür edirik!

Platformada sizi nə gözləyir:
✓ Onlayn imtahanlar — 1-9-cu siniflər üçün
✓ Canlı yarışlar və bilik yarışları
✓ Fərdi statistika və inkişaf dinamikası
✓ Sertifikatlar (70%+ nəticə üçün)
✓ Reytinq cədvəli

Başlamaq üçün:
1. "İmtahanlar" bölməsinə keçin
2. Mövcud imtahanlardan birini seçin
3. İmtahana başlayın və nəticənizi görün

Uğurlar!
BrainTech komandası',
    'welcome'
  );
  return new;
end;
$$;

drop trigger if exists on_profile_created_welcome on profiles;

create trigger on_profile_created_welcome
  after insert on profiles
  for each row execute function public.send_welcome_message();

-- ═══ İMTAHAN BİLDİRİŞİ ═══
create or replace function public.notify_new_exam()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  student record;
  exam_title text;
begin
  -- Yalnız yayımlanmış imtahanlar üçün
  if new.is_published = true and (old.is_published is null or old.is_published = false) then
    exam_title := new.title;
    
    for student in
      select id from public.profiles
      where role = 'student' and grade_level = new.grade_level
    loop
      insert into public.messages (user_id, title, body, type)
      values (
        student.id,
        '📝 Yeni imtahan: ' || exam_title,
        'Salam!

Sizin sinfiniz üçün yeni imtahan yayımlandı:

📖 ' || exam_title || '
⏱ Müddət: ' || new.duration_minutes || ' dəqiqə
🎯 Keçid balı: ' || new.passing_score || '%

İmtahana qoşulmaq üçün "İmtahanlar" bölməsinə keçin.

Uğurlar!',
        'exam'
      );
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists on_exam_published on exams;

create trigger on_exam_published
  after update on exams
  for each row execute function public.notify_new_exam();

-- ═══ NƏTİCƏ BİLDİRİŞİ ═══
create or replace function public.notify_exam_result()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  exam_title text;
begin
  if new.status = 'completed' and (old.status is null or old.status != 'completed') then
    select title into exam_title from public.exams where id = new.exam_id;
    
    insert into public.messages (user_id, title, body, type)
    values (
      new.student_id,
      '🏆 İmtahan nəticəniz hazırdır!',
      'Salam!

"' || exam_title || '" imtahanını tamamladınız.

📊 Nəticəniz: ' || round(new.percentage) || '%
✓ Bal: ' || new.score || '/' || new.max_score || '

' || case when new.percentage >= 70 
        then '🎓 Təbriklər! Sertifikat qazandınız!'
        else '💪 Növbəti dəfə daha yaxşı olacaq!'
      end || '

Statistika bölməsindən ətraflı nəticələrinizi görə bilərsiniz.',
      'result'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_attempt_completed on attempts;

create trigger on_attempt_completed
  after update on attempts
  for each row execute function public.notify_exam_result();