-- Saudi-first defaults and cross-business contact integrity.
-- Existing businesses and their historical currency values are intentionally unchanged.
alter table public.businesses alter column currency set default 'SAR';
alter table public.businesses alter column country set default 'Saudi Arabia';

create or replace function public.validate_transaction_contact_business()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.contact_id is not null and not exists (
    select 1
    from public.contacts c
    where c.id = new.contact_id
      and c.business_id = new.business_id
  ) then
    raise exception 'Contact does not belong to this business'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists transactions_validate_contact_business on public.transactions;
create trigger transactions_validate_contact_business
before insert or update of contact_id, business_id on public.transactions
for each row execute function public.validate_transaction_contact_business();

-- This prevents a transaction or correction RPC from linking a contact owned by
-- another business, even if a future client path forgets to validate ownership.
