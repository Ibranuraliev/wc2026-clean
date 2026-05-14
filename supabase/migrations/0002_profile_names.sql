-- 0002_profile_names.sql
-- Add first_name / last_name columns and update the new-user trigger so we
-- store them when a user signs up via email/password.

alter table profiles
  add column if not exists first_name text,
  add column if not exists last_name  text;

-- Refresh the auto-profile trigger to copy first/last name from the
-- raw_user_meta_data the client sends on signUp().
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, avatar_url, first_name, last_name)
  values (
    new.id,
    coalesce(
      nullif(trim(coalesce(new.raw_user_meta_data->>'first_name','') || ' ' ||
                  coalesce(new.raw_user_meta_data->>'last_name','')), ''),
      new.raw_user_meta_data->>'full_name'
    ),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$;
