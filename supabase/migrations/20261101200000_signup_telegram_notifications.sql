create table if not exists public.signup_notification_deliveries (
  user_id uuid not null references auth.users(id) on delete cascade,
  telegram_admin_id text not null,
  sent_at timestamptz not null default now(),
  primary key (user_id, telegram_admin_id)
);

alter table public.signup_notification_deliveries enable row level security;
revoke all on table public.signup_notification_deliveries
  from public, anon, authenticated;
grant select, insert, delete on table public.signup_notification_deliveries
  to service_role;

comment on table public.signup_notification_deliveries is
  'Idempotency receipts for Telegram notifications sent after a new signup.';
