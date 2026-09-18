-- ═══════════════════════════════════════════════════
-- ƏLAVƏ RLS POLICY-LƏR
-- ═══════════════════════════════════════════════════

-- exam_questions: müəllim öz imtahanına sual əlavə edə bilər
drop policy if exists "Müəllim öz imtahanına sual əlavə edir" on exam_questions;

create policy "Müəllim öz imtahanına sual əlavə edir"
  on exam_questions for insert
  with check (
    exists (
      select 1 from exams e
      where e.id = exam_questions.exam_id
      and e.teacher_id = auth.uid()
    )
  );

-- exam_questions: müəllim öz suallarını görə bilər
drop policy if exists "Müəllim öz imtahan suallarını görür" on exam_questions;

create policy "Müəllim öz imtahan suallarını görür"
  on exam_questions for select
  using (
    exists (
      select 1 from exams e
      where e.id = exam_questions.exam_id
      and (e.teacher_id = auth.uid() or e.is_published = true)
    )
  );

-- exam_questions: müəllim silə bilər
drop policy if exists "Müəllim öz imtahan sualını silir" on exam_questions;

create policy "Müəllim öz imtahan sualını silir"
  on exam_questions for delete
  using (
    exists (
      select 1 from exams e
      where e.id = exam_questions.exam_id
      and e.teacher_id = auth.uid()
    )
  );

-- questions: müəllim öz sualını yaradır (insert)
drop policy if exists "Müəllim sual yaradır" on questions;

create policy "Müəllim sual yaradır"
  on questions for insert
  with check (auth.uid() = teacher_id);

-- questions: müəllim öz sualını silir
drop policy if exists "Müəllim öz sualını silir" on questions;

create policy "Müəllim öz sualını silir"
  on questions for delete
  using (auth.uid() = teacher_id);

-- questions: müəllim öz sualını yeniləyir
drop policy if exists "Müəllim öz sualını yeniləyir" on questions;

create policy "Müəllim öz sualını yeniləyir"
  on questions for update
  using (auth.uid() = teacher_id);