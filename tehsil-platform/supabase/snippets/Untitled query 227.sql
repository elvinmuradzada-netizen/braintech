drop policy if exists "Müəllim şagird profillərini görür" on profiles;

create policy "Müəllim şagird profillərini görür"
  on profiles for select
  using (
    exists (
      select 1 from attempts a
      join exams e on e.id = a.exam_id
      where a.student_id = profiles.id
      and e.teacher_id = auth.uid()
    )
  );