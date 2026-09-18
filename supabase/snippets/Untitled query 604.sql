-- ═══════════════════════════════════════════════════
-- TEHSIL PLATFORM - Baza Sxemi (1-9 sinif)
-- ═══════════════════════════════════════════════════

-- 1. ROL TİPİ
create type user_role as enum ('student', 'teacher', 'parent', 'admin');

-- 2. PROFİLLƏR (auth.users ilə əlaqəli)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role user_role not null default 'student',
  grade_level smallint check (grade_level between 1 and 9),
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. FƏNLƏR
create table subjects (
  id serial primary key,
  name text not null,
  slug text unique not null,
  icon text,
  grade_min smallint not null default 1,
  grade_max smallint not null default 9,
  created_at timestamptz default now()
);

-- 4. MÖVZULAR
create table topics (
  id serial primary key,
  subject_id int references subjects(id) on delete cascade,
  grade_level smallint not null check (grade_level between 1 and 9),
  title text not null,
  description text,
  order_index int default 0,
  created_at timestamptz default now()
);

-- 5. SUALLAR
create table questions (
  id uuid primary key default gen_random_uuid(),
  topic_id int references topics(id) on delete set null,
  teacher_id uuid references profiles(id) on delete set null,
  type text not null check (type in ('multiple_choice', 'true_false', 'fill_blank')),
  body text not null,
  image_url text,
  options jsonb,
  correct_answer jsonb not null,
  explanation text,
  difficulty smallint check (difficulty between 1 and 5) default 3,
  grade_level smallint not null check (grade_level between 1 and 9),
  created_at timestamptz default now()
);

-- 6. İMTAHANLAR
create table exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  subject_id int references subjects(id) on delete set null,
  grade_level smallint not null check (grade_level between 1 and 9),
  teacher_id uuid references profiles(id) on delete set null,
  duration_minutes int default 30,
  total_questions int default 0,
  passing_score int default 60,
  is_published boolean default false,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- 7. İMTAHAN-SUALLAR ƏLAQƏSİ
create table exam_questions (
  exam_id uuid references exams(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  order_index int default 0,
  points int default 1,
  primary key (exam_id, question_id)
);

-- 8. ŞAGİRD CƏHİDLƏRİ
create table attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references exams(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  started_at timestamptz default now(),
  finished_at timestamptz,
  score numeric(5,2),
  max_score numeric(5,2),
  percentage numeric(5,2),
  status text default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  time_spent_seconds int default 0
);

-- 9. CAVABLAR
create table answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references attempts(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  answer jsonb,
  is_correct boolean,
  points_earned numeric(5,2) default 0,
  answered_at timestamptz default now()
);

-- 10. SİNİFLƏR (müəllim-şagird əlaqəsi)
create table classes (
  id serial primary key,
  name text not null,
  grade_level smallint not null check (grade_level between 1 and 9),
  teacher_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table class_students (
  class_id int references classes(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (class_id, student_id)
);

-- 11. İNDEKSLƏR (sürət üçün)
create index idx_profiles_role on profiles(role);
create index idx_profiles_grade on profiles(grade_level);
create index idx_topics_subject on topics(subject_id);
create index idx_topics_grade on topics(grade_level);
create index idx_questions_grade on questions(grade_level);
create index idx_questions_topic on questions(topic_id);
create index idx_exams_grade on exams(grade_level);
create index idx_exams_subject on exams(subject_id);
create index idx_attempts_student on attempts(student_id);
create index idx_attempts_exam on attempts(exam_id);
create index idx_answers_attempt on answers(attempt_id);

-- ═══════════════════════════════════════════════════
-- ✅ Sxem hazırdır
-- ═══════════════════════════════════════════════════