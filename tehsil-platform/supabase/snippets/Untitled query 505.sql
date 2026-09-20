create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references profiles(id) on delete cascade,
  exam_id uuid references exams(id) on delete cascade,
  attempt_id uuid references attempts(id) on delete set null,
  amount numeric(10,2) not null,
  currency text default 'AZN',
  status text default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider text default 'payriff',
  provider_order_id text unique,
  provider_payment_id text,
  payment_url text,
  paid_at timestamptz,
  created_at timestamptz default now()
);

alter table exams add column if not exists price numeric(10,2) default 0;
alter table exams add column if not exists is_paid boolean default false;

alter table payments enable row level security;

drop policy if exists "Şagird öz ödənişlərini görür" on payments;
create policy "Şagird öz ödənişlərini görür"
  on payments for select using (auth.uid() = student_id);

drop policy if exists "Şagird ödəniş yaradır" on payments;
create policy "Şagird ödəniş yaradır"
  on payments for insert with check (auth.uid() = student_id);