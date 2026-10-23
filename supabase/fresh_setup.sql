-- Fresh Ihsaab database setup. Fixed ledger definitions are application code;
-- postings are account_code values embedded in transactions. No accounts table.
create extension if not exists pgcrypto;

create table public.businesses(id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade, name text not null, country text, currency text not null default 'USD', tax_id text, registration_number text, address text, contact_email text, phone text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.contacts(id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, name text not null, email text, phone text, company_name text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.feedbacks(id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, business_id uuid not null references public.businesses(id) on delete cascade, answers jsonb not null check(jsonb_typeof(answers)='object'), created_at timestamptz not null default now());
create index feedbacks_business_created_idx on public.feedbacks(business_id, created_at desc);
create table public.inventory_products(id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, name text not null, sku text, description text, unit text not null default 'item', quantity_on_hand numeric(14,3) not null default 0 check(quantity_on_hand>=0), sale_price numeric(14,2) not null default 0 check(sale_price>=0), purchase_cost numeric(14,2) not null default 0 check(purchase_cost>=0), average_cost numeric(14,2) not null default 0 check(average_cost>=0), is_archived boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create unique index inventory_products_sku_unique on public.inventory_products(business_id,lower(sku)) where sku is not null and sku<>'';
create table public.transactions(id uuid primary key default gen_random_uuid(), business_id uuid not null references public.businesses(id) on delete cascade, contact_id uuid references public.contacts(id) on delete set null, date date not null default current_date, type text not null check(type in('income','expense','transfer','opening')), amount numeric(14,2) not null check(amount>0), description text, category text, tax_reserved numeric(14,2) not null default 0, metadata jsonb not null default '{}'::jsonb, ledger_lines jsonb not null default '[]'::jsonb check(jsonb_typeof(ledger_lines)='array'), correction_of uuid references public.transactions(id) on delete restrict, correction_role text check(correction_role in('reversal','replacement')), created_at timestamptz not null default now());
create index transactions_business_date_idx on public.transactions(business_id,date desc);
create table public.transaction_items(id uuid primary key default gen_random_uuid(), transaction_id uuid not null references public.transactions(id) on delete cascade, product_id uuid references public.inventory_products(id) on delete set null, item_name text not null, sku_snapshot text, unit_snapshot text not null, quantity numeric(14,3) not null check(quantity>0), unit_price numeric(14,2) not null default 0, line_total numeric(14,2) not null default 0, cost_per_unit numeric(14,2) not null default 0, stock_delta numeric(14,3) not null default 0, created_at timestamptz not null default now());
create index transaction_items_transaction_idx on public.transaction_items(transaction_id);

create or replace function public.owns_business(bid uuid) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.businesses where id=bid and owner_id=auth.uid()) $$;
revoke all on function public.owns_business(uuid) from public; grant execute on function public.owns_business(uuid) to authenticated;
alter table public.businesses enable row level security; alter table public.contacts enable row level security; alter table public.feedbacks enable row level security; alter table public.inventory_products enable row level security; alter table public.transactions enable row level security; alter table public.transaction_items enable row level security;
create policy businesses_owner on public.businesses for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy contacts_owner on public.contacts for all to authenticated using(public.owns_business(business_id)) with check(public.owns_business(business_id));
create policy feedbacks_insert_owner on public.feedbacks for insert to authenticated with check(user_id=auth.uid() and public.owns_business(business_id));
create policy products_owner_read on public.inventory_products for select to authenticated using(public.owns_business(business_id));
create policy transactions_owner_read on public.transactions for select to authenticated using(public.owns_business(business_id));
create policy transactions_owner_insert on public.transactions for insert to authenticated with check(public.owns_business(business_id));
create policy items_owner_read on public.transaction_items for select to authenticated using(exists(select 1 from public.transactions t where t.id=transaction_id and public.owns_business(t.business_id)));
grant select,insert,update,delete on public.businesses,public.contacts to authenticated; grant insert on public.feedbacks to authenticated; grant select,insert on public.transactions to authenticated; grant select on public.inventory_products,public.transaction_items to authenticated;
revoke select,update,delete on public.feedbacks from anon,authenticated;
revoke update,delete on public.transactions from anon,authenticated; revoke insert,update,delete on public.transaction_items,public.inventory_products from anon,authenticated;

-- Journal lines are generated server side and cannot be supplied or edited by clients.
create or replace function public.guard_ledger_lines() returns trigger language plpgsql as $$ begin if current_setting('ihsaab.write_lines',true) is distinct from 'yes' then new.ledger_lines:='[]'::jsonb; end if; return new; end $$;
create trigger transactions_guard_lines_insert before insert on public.transactions for each row execute function public.guard_ledger_lines();
create trigger transactions_guard_lines_update before update of ledger_lines on public.transactions for each row execute function public.guard_ledger_lines();
create or replace function public.post_transaction(tid uuid) returns void language plpgsql security definer set search_path=public as $$
declare t public.transactions%rowtype; lines jsonb:='[]'::jsonb; cat text; paid text; debit_code text; amt numeric; tax numeric; gross numeric; cost numeric;
begin
 select * into t from public.transactions where id=tid; if not found or t.type='opening' then return; end if;
 cat:=lower(coalesce(t.category,'')); amt:=t.amount; tax:=coalesce(t.tax_reserved,0); gross:=amt+tax; paid:=case when cat like '%bank_transfer%' or cat like '%bank transfer%' then 'bank' else 'cash' end;
 if t.correction_role='reversal' and t.correction_of is not null then
  select coalesce(jsonb_agg(jsonb_build_object('account_code',x->>'account_code','debit',coalesce((x->>'credit')::numeric,0),'credit',coalesce((x->>'debit')::numeric,0),'description',x->>'description')),'[]'::jsonb) into lines from public.transactions o cross join lateral jsonb_array_elements(o.ledger_lines) x where o.id=t.correction_of;
 elsif t.type='transfer' then
  if cat like '%bank to cash%' then lines:=jsonb_build_array(jsonb_build_object('account_code','cash','debit',amt,'credit',0),jsonb_build_object('account_code','bank','debit',0,'credit',amt)); else lines:=jsonb_build_array(jsonb_build_object('account_code','bank','debit',amt,'credit',0),jsonb_build_object('account_code','cash','debit',0,'credit',amt)); end if;
 elsif t.type='income' and cat like 'customer payment%' then lines:=jsonb_build_array(jsonb_build_object('account_code',paid,'debit',amt,'credit',0),jsonb_build_object('account_code','accounts_receivable','debit',0,'credit',amt));
 elsif t.type='income' then
  lines:=jsonb_build_array(jsonb_build_object('account_code',case when cat like '%unpaid%' then 'accounts_receivable' else paid end,'debit',gross,'credit',0),jsonb_build_object('account_code',case when cat like 'service income%' then 'service_revenue' else 'sales_revenue' end,'debit',0,'credit',amt));
  if tax>0 then lines:=lines||jsonb_build_array(jsonb_build_object('account_code','taxes_payable','debit',0,'credit',tax)); end if;
  select coalesce(sum(quantity*cost_per_unit),0) into cost from public.transaction_items where transaction_id=t.id and stock_delta<0;
  if cost>0 then lines:=lines||jsonb_build_array(jsonb_build_object('account_code','cost_of_goods_sold','debit',cost,'credit',0),jsonb_build_object('account_code','inventory','debit',0,'credit',cost)); end if;
 elsif t.type='expense' then
  if cat like '%stock purchase%' then debit_code:='inventory'; elsif cat like '%asset purchase%' then debit_code:='property_plant_equipment'; else debit_code:=case when cat like '%electric%' or cat like '%utilit%' then 'utilities' when cat like '%rent%' then 'rent' when cat like '%salary%' or cat like '%wage%' then 'salaries' when cat like '%internet%' or cat like '%telephone%' then 'internet_telephone' when cat like '%insurance%' then 'insurance' when cat like '%transport%' or cat like '%travel%' then 'transport' when cat like '%advert%' or cat like '%market%' then 'advertising' when cat like '%repair%' then 'repairs' when cat like '%bank charge%' then 'bank_charges' when cat like '%tax%' or cat like '%licen%' then 'taxes_licenses' when cat like '%office%' or cat like '%suppl%' then 'office_supplies' else 'misc_expense' end; end if;
  lines:=jsonb_build_array(jsonb_build_object('account_code',debit_code,'debit',amt,'credit',0));
  if tax>0 then lines:=lines||jsonb_build_array(jsonb_build_object('account_code','input_tax_recoverable','debit',tax,'credit',0)); end if;
  lines:=lines||jsonb_build_array(jsonb_build_object('account_code',case when cat like '%unpaid%' then 'accounts_payable' else paid end,'debit',0,'credit',gross));
 end if;
 perform set_config('ihsaab.write_lines','yes',true); update public.transactions set ledger_lines=lines where id=t.id; perform set_config('ihsaab.write_lines','no',true);
end $$;
revoke all on function public.post_transaction(uuid) from public,anon,authenticated;
create or replace function public.post_transaction_trigger() returns trigger language plpgsql security definer set search_path=public as $$ begin perform public.post_transaction(new.id); return null; end $$;
create constraint trigger transactions_post_journal after insert on public.transactions deferrable initially deferred for each row execute function public.post_transaction_trigger();

create or replace function public.initialize_business_opening(p_business_id uuid,p_opening_balances jsonb default '[]'::jsonb) returns void language plpgsql security definer set search_path=public as $$
declare i jsonb; code text; cat text; amt numeric; normal_dr boolean; dr numeric:=0; cr numeric:=0; j jsonb:='[]'::jsonb;
begin
 if not public.owns_business(p_business_id) then raise exception 'Business access denied'; end if;
 for i in select value from jsonb_array_elements(coalesce(p_opening_balances,'[]'::jsonb)) loop
  cat:=lower(coalesce(i->>'category','')); amt:=abs(coalesce((i->>'balance')::numeric,0));
  code:=case when cat='asset' and lower(coalesce(i->>'name','')) like '%receiv%' then 'accounts_receivable' when cat='asset' and lower(coalesce(i->>'name','')) like '%cash%' then 'cash' when cat='asset' and lower(coalesce(i->>'name','')) like '%bought %' then 'property_plant_equipment' when cat='asset' then 'bank' when cat='liability' and lower(coalesce(i->>'name','')) like '%pay%' then 'accounts_payable' when cat='liability' then 'loans_payable' when cat in('income','revenue') then 'sales_revenue' when cat='expense' then 'misc_expense' when cat='equity' and lower(coalesce(i->>'name','')) like '%capital%' then 'owners_equity' else 'retained_earnings' end;
  normal_dr:=cat in('asset','expense'); if coalesce((i->>'balance')::numeric,0)<0 then normal_dr:=not normal_dr; end if;
  if normal_dr then dr:=dr+amt; j:=j||jsonb_build_array(jsonb_build_object('account_code',code,'debit',amt,'credit',0)); else cr:=cr+amt; j:=j||jsonb_build_array(jsonb_build_object('account_code',code,'debit',0,'credit',amt)); end if;
 end loop;
 if abs(dr-cr)>0.01 then raise exception 'Opening balances do not balance (debits %, credits %)',dr,cr; end if;
 if jsonb_array_length(j)>0 then perform set_config('ihsaab.write_lines','yes',true); insert into public.transactions(business_id,type,amount,description,category,ledger_lines) values(p_business_id,'opening',dr,'Opening balances','Opening balances',j); perform set_config('ihsaab.write_lines','no',true); end if;
end $$;
revoke all on function public.initialize_business_opening(uuid,jsonb) from public,anon; grant execute on function public.initialize_business_opening(uuid,jsonb) to authenticated;

create or replace function public.save_inventory_product(p_business_id uuid,p_product_id uuid,p_name text,p_sku text,p_description text,p_category text,p_unit text,p_initial_stock numeric,p_sale_price numeric,p_purchase_cost numeric,p_is_archived boolean) returns uuid language plpgsql security definer set search_path=public as $$
declare rid uuid; opening_value numeric;
begin if not public.owns_business(p_business_id) then raise exception 'Business access denied'; end if;
 if p_product_id is null then
  if coalesce(p_initial_stock,0)<0 or coalesce(p_purchase_cost,0)<0 then raise exception 'Initial stock and purchase cost cannot be negative'; end if;
  insert into public.inventory_products(business_id,name,sku,description,unit,quantity_on_hand,sale_price,purchase_cost,average_cost,is_archived) values(p_business_id,p_name,nullif(p_sku,''),p_description,p_unit,greatest(coalesce(p_initial_stock,0),0),greatest(coalesce(p_sale_price,0),0),greatest(coalesce(p_purchase_cost,0),0),greatest(coalesce(p_purchase_cost,0),0),coalesce(p_is_archived,false)) returning id into rid;
  opening_value:=round(coalesce(p_initial_stock,0)*coalesce(p_purchase_cost,0),2);
  if opening_value>0 then perform set_config('ihsaab.write_lines','yes',true); insert into public.transactions(business_id,type,amount,description,category,ledger_lines) values(p_business_id,'opening',opening_value,'Initial inventory','Initial inventory',jsonb_build_array(jsonb_build_object('account_code','inventory','debit',opening_value,'credit',0),jsonb_build_object('account_code','retained_earnings','debit',0,'credit',opening_value))); perform set_config('ihsaab.write_lines','no',true); end if;
 else update public.inventory_products set name=p_name,sku=nullif(p_sku,''),description=p_description,unit=p_unit,sale_price=p_sale_price,purchase_cost=p_purchase_cost,is_archived=coalesce(p_is_archived,false),updated_at=now() where id=p_product_id and business_id=p_business_id returning id into rid; if rid is null then raise exception 'Product not found'; end if; end if; return rid; end $$;
revoke all on function public.save_inventory_product(uuid,uuid,text,text,text,text,text,numeric,numeric,numeric,boolean) from public,anon; grant execute on function public.save_inventory_product(uuid,uuid,text,text,text,text,text,numeric,numeric,numeric,boolean) to authenticated;

create or replace function public.create_inventory_transaction(p_business_id uuid,p_action text,p_date date,p_description text,p_contact_id uuid,p_payment_status text,p_payment_method text,p_tax_reserved numeric,p_category text,p_items jsonb,p_debit_account_id uuid default null,p_credit_account_id uuid default null) returns uuid language plpgsql security definer set search_path=public as $$
declare tid uuid; i jsonb; p public.inventory_products%rowtype; q numeric; price numeric; total numeric:=0; delta numeric; cat text;
begin
 if not public.owns_business(p_business_id) then raise exception 'Business access denied'; end if; if p_action not in('sale','stock_purchase') then raise exception 'Invalid inventory action'; end if;
 if p_contact_id is not null and not exists(select 1 from public.contacts where id=p_contact_id and business_id=p_business_id) then raise exception 'Contact does not belong to this business'; end if;
 for i in select value from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop q:=(i->>'quantity')::numeric; select * into p from public.inventory_products where id=(i->>'product_id')::uuid and business_id=p_business_id and not is_archived for update; if not found or q<=0 then raise exception 'Invalid item'; end if; if p_action='sale' and p.quantity_on_hand<q then raise exception 'Insufficient stock for %',p.name; end if; total:=total+round(q*case when p_action='sale' then p.sale_price else p.purchase_cost end,2); end loop;
 if total<=0 then raise exception 'Transaction total must be positive'; end if;
 cat:=case when p_action='sale' then 'Sale' else 'Stock purchase' end||' · '||case when p_payment_status='unpaid' then 'Unpaid' else 'Paid' end||case when p_payment_status<>'unpaid' and p_payment_method='bank_transfer' then ' · bank_transfer' else '' end||case when nullif(p_category,'') is not null then ' · '||p_category else '' end;
 insert into public.transactions(business_id,contact_id,date,type,amount,description,category,tax_reserved) values(p_business_id,p_contact_id,coalesce(p_date,current_date),case when p_action='sale' then 'income' else 'expense' end,total,p_description,cat,coalesce(p_tax_reserved,0)) returning id into tid;
 for i in select value from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop q:=(i->>'quantity')::numeric; select * into p from public.inventory_products where id=(i->>'product_id')::uuid and business_id=p_business_id for update; price:=case when p_action='sale' then p.sale_price else p.purchase_cost end; delta:=case when p_action='sale' then -q else q end;
  insert into public.transaction_items(transaction_id,product_id,item_name,sku_snapshot,unit_snapshot,quantity,unit_price,line_total,cost_per_unit,stock_delta) values(tid,p.id,p.name,p.sku,p.unit,q,price,round(q*price,2),case when delta<0 then p.average_cost else price end,delta);
  update public.inventory_products set quantity_on_hand=quantity_on_hand+delta,average_cost=case when delta>0 then round((quantity_on_hand*average_cost+q*price)/(quantity_on_hand+q),2) else average_cost end,updated_at=now() where id=p.id;
 end loop; return tid;
end $$;
revoke all on function public.create_inventory_transaction(uuid,text,date,text,uuid,text,text,numeric,text,jsonb,uuid,uuid) from public,anon; grant execute on function public.create_inventory_transaction(uuid,text,date,text,uuid,text,text,numeric,text,jsonb,uuid,uuid) to authenticated;

create or replace function public.correct_transaction(p_transaction_id uuid,p_amount numeric,p_date date,p_description text,p_category text,p_contact_id uuid,p_tax_reserved numeric,p_debit_account_id uuid,p_credit_account_id uuid,p_inventory_items jsonb default null) returns uuid language plpgsql security definer set search_path=public as $$
declare old public.transactions%rowtype; rid uuid; rep uuid; i record; j jsonb; p public.inventory_products%rowtype; q numeric; delta numeric; price numeric;
begin select * into old from public.transactions where id=p_transaction_id for update; if not found or not public.owns_business(old.business_id) then raise exception 'Transaction not found'; end if; if old.type='opening' then raise exception 'Opening balances cannot be edited here'; end if; if old.correction_role='reversal' then raise exception 'Cannot edit reversal'; end if; if coalesce(p_amount,old.amount)<=0 then raise exception 'Transaction amount must be greater than zero'; end if;
 insert into public.transactions(business_id,contact_id,date,type,amount,description,category,tax_reserved,correction_of,correction_role) values(old.business_id,old.contact_id,old.date,old.type,old.amount,old.description,'Correction reversal · '||coalesce(old.category,''),old.tax_reserved,old.id,'reversal') returning id into rid;
 for i in select * from public.transaction_items where transaction_id=old.id loop if i.product_id is not null then update public.inventory_products set quantity_on_hand=quantity_on_hand-i.stock_delta where id=i.product_id; insert into public.transaction_items(transaction_id,product_id,item_name,sku_snapshot,unit_snapshot,quantity,unit_price,line_total,cost_per_unit,stock_delta) values(rid,i.product_id,i.item_name,i.sku_snapshot,i.unit_snapshot,i.quantity,i.unit_price,i.line_total,i.cost_per_unit,-i.stock_delta); end if; end loop;
 insert into public.transactions(business_id,contact_id,date,type,amount,description,category,tax_reserved,correction_of,correction_role) values(old.business_id,p_contact_id,coalesce(p_date,current_date),old.type,coalesce(p_amount,old.amount),p_description,p_category,coalesce(p_tax_reserved,0),old.id,'replacement') returning id into rep;
 if p_inventory_items is not null then for j in select value from jsonb_array_elements(p_inventory_items) loop q:=(j->>'quantity')::numeric; select * into p from public.inventory_products where id=(j->>'product_id')::uuid and business_id=old.business_id for update; if not found or q<=0 then raise exception 'Invalid corrected item'; end if; delta:=case when old.type='income' then -q else q end; if delta<0 and p.quantity_on_hand<q then raise exception 'Insufficient stock for %',p.name; end if; price:=case when delta<0 then p.sale_price else p.purchase_cost end; insert into public.transaction_items(transaction_id,product_id,item_name,sku_snapshot,unit_snapshot,quantity,unit_price,line_total,cost_per_unit,stock_delta) values(rep,p.id,p.name,p.sku,p.unit,q,price,round(q*price,2),case when delta<0 then p.average_cost else price end,delta); update public.inventory_products set quantity_on_hand=quantity_on_hand+delta,updated_at=now() where id=p.id; end loop; end if; return rep;
end $$;
revoke all on function public.correct_transaction(uuid,numeric,date,text,text,uuid,numeric,uuid,uuid,jsonb) from public,anon; grant execute on function public.correct_transaction(uuid,numeric,date,text,text,uuid,numeric,uuid,uuid,jsonb) to authenticated;

notify pgrst,'reload schema';
