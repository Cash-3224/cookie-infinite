-- Cookie Infinite multiplayer trading schema (Supabase SQL Editor)
-- IMPORTANT: run this only after creating Supabase Auth accounts for players.
create table if not exists public.ci_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username ~ '^[A-Za-z0-9_]{3,16}$'),
  created_at timestamptz not null default now()
);
create table if not exists public.ci_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cookies numeric(30,0) not null default 0 check (cookies >= 0),
  updated_at timestamptz not null default now()
);
create table if not exists public.ci_skin_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  skin_id text not null check (skin_id in ('classic','golden','mint','void','rainbow')),
  acquired_at timestamptz not null default now(),
  primary key(user_id, skin_id)
);
create table if not exists public.ci_trade_log (
  id bigint generated always as identity primary key,
  sender uuid not null references auth.users(id),
  recipient uuid not null references auth.users(id),
  trade_type text not null check (trade_type in ('cookies','skin')),
  amount numeric(30,0), skin_id text, created_at timestamptz not null default now(),
  check ((trade_type='cookies' and amount > 0 and skin_id is null) or (trade_type='skin' and amount is null and skin_id is not null))
);
alter table public.ci_profiles enable row level security;
alter table public.ci_wallets enable row level security;
alter table public.ci_skin_inventory enable row level security;
alter table public.ci_trade_log enable row level security;
create policy "profiles readable to signed-in players" on public.ci_profiles for select to authenticated using (true);
create policy "players can read own wallet" on public.ci_wallets for select to authenticated using (auth.uid() = user_id);
create policy "players can read own skins" on public.ci_skin_inventory for select to authenticated using (auth.uid() = user_id);
create policy "players can read their trade history" on public.ci_trade_log for select to authenticated using (auth.uid() = sender or auth.uid() = recipient);
create or replace function public.ci_transfer_cookies(p_recipient_username text, p_amount numeric) returns void
language plpgsql security definer set search_path=public as $$
declare sender_id uuid := auth.uid(); recipient_id uuid; sender_balance numeric;
begin
 if sender_id is null then raise exception 'Sign in first'; end if;
 if p_amount is null or p_amount <= 0 or p_amount <> trunc(p_amount) then raise exception 'Amount must be a positive whole number'; end if;
 select user_id into recipient_id from public.ci_profiles where lower(username)=lower(trim(p_recipient_username));
 if recipient_id is null then raise exception 'Recipient not found'; end if;
 if recipient_id=sender_id then raise exception 'Cannot transfer to yourself'; end if;
 perform pg_advisory_xact_lock(hashtext(least(sender_id::text,recipient_id::text)));
 perform pg_advisory_xact_lock(hashtext(greatest(sender_id::text,recipient_id::text)));
 select cookies into sender_balance from public.ci_wallets where user_id=sender_id for update;
 if sender_balance is null or sender_balance < p_amount then raise exception 'Not enough cookies'; end if;
 update public.ci_wallets set cookies=cookies-p_amount, updated_at=now() where user_id=sender_id;
 insert into public.ci_wallets(user_id,cookies) values(recipient_id,p_amount) on conflict(user_id) do update set cookies=public.ci_wallets.cookies+p_amount,updated_at=now();
 insert into public.ci_trade_log(sender,recipient,trade_type,amount) values(sender_id,recipient_id,'cookies',p_amount);
end; $$;
create or replace function public.ci_transfer_skin(p_recipient_username text, p_skin_id text) returns void
language plpgsql security definer set search_path=public as $$
declare sender_id uuid := auth.uid(); recipient_id uuid;
begin
 if sender_id is null then raise exception 'Sign in first'; end if;
 if p_skin_id not in ('classic','golden','mint','void','rainbow') then raise exception 'Invalid skin'; end if;
 select user_id into recipient_id from public.ci_profiles where lower(username)=lower(trim(p_recipient_username));
 if recipient_id is null then raise exception 'Recipient not found'; end if;
 if recipient_id=sender_id then raise exception 'Cannot trade with yourself'; end if;
 if p_skin_id='classic' then raise exception 'The default skin cannot be traded'; end if;
 delete from public.ci_skin_inventory where user_id=sender_id and skin_id=p_skin_id;
 if not found then raise exception 'You do not own that skin'; end if;
 insert into public.ci_skin_inventory(user_id,skin_id) values(recipient_id,p_skin_id) on conflict(user_id,skin_id) do nothing;
 insert into public.ci_trade_log(sender,recipient,trade_type,skin_id) values(sender_id,recipient_id,'skin',p_skin_id);
end; $$;
revoke all on function public.ci_transfer_cookies(text,numeric) from public;
revoke all on function public.ci_transfer_skin(text,text) from public;
grant execute on function public.ci_transfer_cookies(text,numeric) to authenticated;
grant execute on function public.ci_transfer_skin(text,text) to authenticated;
