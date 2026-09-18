-- RLS-i aktiv et
alter table profiles enable row level security;
alter table subjects enable row level security;
alter table topics enable row level security;
alter table questions enable row level security;
alter table exams enable row level security;
alter table exam_questions enable row level security;
alter table attempts enable row level security;
alter table answers enable row level security;
alter table classes enable row level security;
alter table class_students enable row level security;

-- ═══ PROFILES ═══
create policy "Hamı profil görə bilər"
  on profiles for select using (true);

create policy "İstifadəçi öz profilini yeniləyir"
  on profiles for update using (auth.uid() = id);

-- ═══ SUBJECTS ═══
create policy "Hamı fənləri görür"
  on subjects for select using (true);

-- ═══ TOPICS ═══
create policy "Hamı mövzuları görür"
  on topics for select using (true);

-- ═══ QUESTIONS ═══
create policy "Müəllim öz suallarını idarə edir"
  on questions for all using (auth.uid() = teacher_id);

create policy "Şagirdlər sualları görür"
  on questions for select using (true);

-- ═══ EXAMS ═══
create policy "Müəllim öz imtahanlarını idarə edir"
  on exams for all using (auth.uid() = teacher_id);

create policy "Hamı publik imtahanları görür"
  on exams for select using (is_published = true);

-- ═══ ATTEMPTS ═══
create policy "Şagird öz cəhdlərini görür"
  on attempts for select using (auth.uid() = student_id);

create policy "Şagird öz cəhdi yaradır"
  on attempts for insert with check (auth.uid() = student_id);

create policy "Şagird öz cəhdini yeniləyir"
  on attempts for update using (auth.uid() = student_id);

create policy "Müəllim şagird cəhdlərini görür"
  on attempts for select using (
    exists (
      select 1 from exams e
      where e.id = attempts.exam_id and e.teacher_id = auth.uid()
    )
  );

-- ═══ ANSWERS ═══
create policy "Şagird öz cavablarını idarə edir"
  on answers for all using (
    exists (
      select 1 from attempts a
      where a.id = answers.attempt_id and a.student_id = auth.uid()
    )
  );

-- ═══ CLASSES ═══
create policy "Müəllim öz siniflərini idarə edir"
  on classes for all using (auth.uid() = teacher_id);

create policy "Hamı sinifləri görür"
  on classes for select using (true);

-- ═══ CLASS_STUDENTS ═══
create policy "Hamı sinif şagirdlərini görür"
  on class_students for select using (true);

create policy "Müəllim öz sinfinə şagird əlavə edir"
  on class_students for all using (
    exists (
      select 1 from classes c
      where c.id = class_students.class_id and c.teacher_id = auth.uid()
    )
  );