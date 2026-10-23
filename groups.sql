-- Group chats for miloCHAT. This block is also part of milo.'s supabase-setup.sql; run either (safe to run again).
-- Needs the main setup (friendships / are_friends) to be run first.
-- ===== group chats (miloCHAT): groups, members, messages (disappear after 24 hours, 5 MB per group) =====
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 40),
  owner uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.group_members (
  gid uuid not null references public.groups(id) on delete cascade,
  uid uuid not null references auth.users(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (gid, uid)
);
create index if not exists group_members_uid on public.group_members (uid);
create or replace function public.is_member(g uuid, u uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.group_members where gid = g and uid = u) $$;
create or replace function public.is_group_owner(g uuid, u uuid) returns boolean language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.groups where id = g and owner = u) $$;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
drop policy if exists "grp read" on public.groups;
drop policy if exists "grp insert" on public.groups;
drop policy if exists "grp update" on public.groups;
drop policy if exists "grp delete" on public.groups;
create policy "grp read" on public.groups for select to authenticated using (owner = auth.uid() or public.is_member(id, auth.uid()));
create policy "grp insert" on public.groups for insert to authenticated with check (owner = auth.uid());
create policy "grp update" on public.groups for update to authenticated using (owner = auth.uid()) with check (owner = auth.uid());
create policy "grp delete" on public.groups for delete to authenticated using (owner = auth.uid());
drop policy if exists "gm read" on public.group_members;
drop policy if exists "gm add" on public.group_members;
drop policy if exists "gm remove" on public.group_members;
create policy "gm read" on public.group_members for select to authenticated using (public.is_member(gid, auth.uid()));
create policy "gm add" on public.group_members for insert to authenticated with check (public.is_group_owner(gid, auth.uid()) and (uid = auth.uid() or public.are_friends(auth.uid(), uid)));
create policy "gm remove" on public.group_members for delete to authenticated using (uid = auth.uid() or public.is_group_owner(gid, auth.uid()));
create or replace function public.grp_after() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.group_members(gid, uid) values (new.id, new.owner) on conflict do nothing; return null; end $$;
drop trigger if exists grp_after_t on public.groups;
create trigger grp_after_t after insert on public.groups for each row execute function public.grp_after();
create or replace function public.gm_before() returns trigger language plpgsql security definer set search_path = public as $$
begin if (select count(*) from public.group_members where gid = new.gid) >= 20 then raise exception 'group_full'; end if; return new; end $$;
drop trigger if exists gm_before_t on public.group_members;
create trigger gm_before_t before insert on public.group_members for each row execute function public.gm_before();

create table if not exists public.group_msgs (
  id bigint generated always as identity primary key,
  gid uuid not null references public.groups(id) on delete cascade,
  sender uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('text','song','img','voice')),
  body text not null,
  bytes int not null default 0,
  created_at timestamptz not null default now(),
  reply_to bigint,
  rx jsonb not null default '{}'::jsonb,
  pv text generated always as (case when kind = 'text' then left(body, 80) when kind = 'song' then left(body, 300) else null end) stored
);
create index if not exists group_msgs_time on public.group_msgs (gid, created_at desc);
alter table public.group_msgs enable row level security;
drop policy if exists "gmsg read" on public.group_msgs;
drop policy if exists "gmsg send" on public.group_msgs;
drop policy if exists "gmsg update" on public.group_msgs;
drop policy if exists "gmsg unsend" on public.group_msgs;
create policy "gmsg read" on public.group_msgs for select to authenticated using (public.is_member(gid, auth.uid()) and created_at > now() - interval '1 day');
create policy "gmsg send" on public.group_msgs for insert to authenticated with check (sender = auth.uid() and public.is_member(gid, auth.uid()));
create policy "gmsg update" on public.group_msgs for update to authenticated using (public.is_member(gid, auth.uid())) with check (public.is_member(gid, auth.uid()));
create policy "gmsg unsend" on public.group_msgs for delete to authenticated using (sender = auth.uid());
create or replace function public.gmsg_before() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.sender := auth.uid();
  new.bytes := octet_length(new.body) + 64;
  new.rx := '{}'::jsonb;
  if new.reply_to is not null and not exists (select 1 from public.group_msgs where id = new.reply_to and gid = new.gid) then new.reply_to := null; end if;
  if new.bytes > 400000 then raise exception 'message_too_large'; end if;
  if (select count(*) from public.group_msgs where sender = new.sender and created_at > now() - interval '1 minute') >= 30 then raise exception 'rate_limited'; end if;
  return new;
end $$;
drop trigger if exists gmsg_before_t on public.group_msgs;
create trigger gmsg_before_t before insert on public.group_msgs for each row execute function public.gmsg_before();
create or replace function public.gmsg_after() returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.group_msgs where gid = new.gid and created_at < now() - interval '1 day';
  delete from public.group_msgs where id in (
    select id from (select id, sum(bytes) over (order by created_at desc, id desc) as run from public.group_msgs where gid = new.gid) s where s.run > 5242880);
  return null;
end $$;
drop trigger if exists gmsg_after_t on public.group_msgs;
create trigger gmsg_after_t after insert on public.group_msgs for each row execute function public.gmsg_after();
create or replace function public.gmsg_guard() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if new.id <> old.id or new.gid <> old.gid or new.sender <> old.sender or new.kind <> old.kind or new.body <> old.body
     or new.bytes <> old.bytes or new.created_at <> old.created_at or new.reply_to is distinct from old.reply_to then raise exception 'message_locked'; end if;
  if new.rx is distinct from old.rx then
    if pg_column_size(new.rx) > 3000 then raise exception 'rx_too_large'; end if;
    if (new.rx - coalesce(auth.uid()::text, '')) <> (old.rx - coalesce(auth.uid()::text, '')) then raise exception 'rx_locked'; end if;
  end if;
  return new;
end $$;
drop trigger if exists gmsg_guard_t on public.group_msgs;
create trigger gmsg_guard_t before update on public.group_msgs for each row execute function public.gmsg_guard();
do $$ declare t text; begin
  foreach t in array array['groups','group_members','group_msgs'] loop
    begin execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null; when undefined_object then null; end;
  end loop;
end $$;
