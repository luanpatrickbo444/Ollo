create extension if not exists pgcrypto;
create table if not exists public.conversations (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 title text not null default 'Nova conversa',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(),
 conversation_id uuid not null references public.conversations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('user','assistant')),
 content text not null,
 created_at timestamptz not null default now()
);
create index if not exists conversations_user_updated_idx on public.conversations(user_id,updated_at desc);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id,created_at);
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
drop policy if exists "Users manage own conversations" on public.conversations;
create policy "Users manage own conversations" on public.conversations for all to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
drop policy if exists "Users read own messages" on public.messages;
create policy "Users read own messages" on public.messages for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists "Users insert own messages" on public.messages;
create policy "Users insert own messages" on public.messages for insert to authenticated with check (user_id=(select auth.uid()) and exists(select 1 from public.conversations c where c.id=conversation_id and c.user_id=(select auth.uid())));
create or replace function public.touch_conversation() returns trigger language plpgsql as $$ begin update public.conversations set updated_at=now() where id=new.conversation_id; return new; end; $$;
drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation after insert on public.messages for each row execute function public.touch_conversation();
grant select,insert,update,delete on public.conversations to authenticated;
grant select,insert on public.messages to authenticated;
