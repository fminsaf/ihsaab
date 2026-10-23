create table if not exists public.feedbacks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists feedbacks_business_created_idx
  on public.feedbacks (business_id, created_at desc);

alter table public.feedbacks enable row level security;
drop policy if exists feedbacks_insert_owner on public.feedbacks;
create policy feedbacks_insert_owner on public.feedbacks
  for insert to authenticated
  with check (user_id = auth.uid() and public.owns_business(business_id));

grant insert on public.feedbacks to authenticated;
revoke select, update, delete on public.feedbacks from anon, authenticated;
