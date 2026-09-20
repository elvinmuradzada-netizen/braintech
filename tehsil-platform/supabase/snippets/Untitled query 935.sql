alter table payments enable row level security;

drop policy if exists "Şagird öz ödənişlərini görür" on payments;
create policy "Şagird öz ödənişlərini görür"
  on payments for select using (auth.uid() = student_id);

drop policy if exists "Şagird ödəniş yaradır" on payments;
create policy "Şagird ödəniş yaradır"
  on payments for insert with check (auth.uid() = student_id);

drop policy if exists "Şagird öz ödənişini yeniləyir" on payments;
create policy "Şagird öz ödənişini yeniləyir"
  on payments for update using (auth.uid() = student_id);