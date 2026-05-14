-- Enable required extensions
create extension if not exists "pgcrypto";

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  locale text default 'ru',
  premium boolean default false,
  created_at timestamptz default now()
);

-- Teams (48 WC2026 placeholder teams)
create table teams (
  id serial primary key,
  code text unique not null,
  name_ru text not null,
  name_en text not null,
  flag_emoji text,
  group_letter char(1)
);

-- Predictions
create table predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  groups jsonb not null default '{}',
  bracket jsonb not null default '{}',
  champion_team_id int references teams(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Leagues
create table leagues (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  owner_id uuid references profiles(id) on delete cascade,
  is_paid boolean default false,
  entry_fee numeric(10,2),
  prize_pool numeric(10,2),
  locked_at timestamptz,
  created_at timestamptz default now()
);

create table league_members (
  league_id uuid references leagues(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  points int default 0,
  primary key (league_id, user_id)
);

-- Daily challenges
create table daily_challenges (
  id uuid primary key default gen_random_uuid(),
  active_date date unique not null,
  question_ru text not null,
  question_en text not null,
  options jsonb not null,
  correct_option_id text,
  created_at timestamptz default now()
);

create table daily_submissions (
  challenge_id uuid references daily_challenges(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  option_id text not null,
  is_correct boolean,
  submitted_at timestamptz default now(),
  primary key (challenge_id, user_id)
);

-- Penalty scores
create table penalty_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  score int not null,
  played_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Auto-update updated_at on predictions
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at
  before update on predictions
  for each row execute procedure update_updated_at_column();

-- RLS: enable on all tables
alter table profiles enable row level security;
alter table teams enable row level security;
alter table predictions enable row level security;
alter table leagues enable row level security;
alter table league_members enable row level security;
alter table daily_challenges enable row level security;
alter table daily_submissions enable row level security;
alter table penalty_scores enable row level security;

-- RLS policies: profiles
create policy "Profiles are publicly readable" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- RLS policies: teams
create policy "Teams are publicly readable" on teams for select using (true);

-- RLS policies: predictions
create policy "Users can read own predictions" on predictions for select using (auth.uid() = user_id);
create policy "Users can insert own predictions" on predictions for insert with check (auth.uid() = user_id);
create policy "Users can update own predictions" on predictions for update using (auth.uid() = user_id);

-- RLS policies: leagues
create policy "Leagues readable by members" on leagues for select
  using (exists (select 1 from league_members where league_id = leagues.id and user_id = auth.uid()));
create policy "Users can create leagues" on leagues for insert with check (auth.uid() = owner_id);
create policy "Owners can update leagues" on leagues for update using (auth.uid() = owner_id);

-- RLS policies: league_members
create policy "Members readable by league members" on league_members for select
  using (exists (select 1 from league_members lm where lm.league_id = league_members.league_id and lm.user_id = auth.uid()));
create policy "Users can join leagues" on league_members for insert with check (auth.uid() = user_id);

-- RLS policies: daily_challenges
create policy "Challenges are publicly readable" on daily_challenges for select using (true);

-- RLS policies: daily_submissions
create policy "Users can read own submissions" on daily_submissions for select using (auth.uid() = user_id);
create policy "Users can submit once" on daily_submissions for insert with check (auth.uid() = user_id);

-- RLS policies: penalty_scores
create policy "Users can read own scores" on penalty_scores for select using (auth.uid() = user_id);
create policy "Users can insert own scores" on penalty_scores for insert with check (auth.uid() = user_id);

-- Seed 48 placeholder teams (groups A–L, 4 per group)
-- Real draw data to be updated when announced
insert into teams (code, name_ru, name_en, flag_emoji, group_letter) values
('USA', 'США', 'USA', '🇺🇸', 'A'),
('MEX', 'Мексика', 'Mexico', '🇲🇽', 'A'),
('CAN', 'Канада', 'Canada', '🇨🇦', 'A'),
('NZL', 'Новая Зеландия', 'New Zealand', '🇳🇿', 'A'),
('BRA', 'Бразилия', 'Brazil', '🇧🇷', 'B'),
('ARG', 'Аргентина', 'Argentina', '🇦🇷', 'B'),
('COL', 'Колумбия', 'Colombia', '🇨🇴', 'B'),
('PAR', 'Парагвай', 'Paraguay', '🇵🇾', 'B'),
('FRA', 'Франция', 'France', '🇫🇷', 'C'),
('ENG', 'Англия', 'England', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'C'),
('GER', 'Германия', 'Germany', '🇩🇪', 'C'),
('BEL', 'Бельгия', 'Belgium', '🇧🇪', 'C'),
('ESP', 'Испания', 'Spain', '🇪🇸', 'D'),
('POR', 'Португалия', 'Portugal', '🇵🇹', 'D'),
('NED', 'Нидерланды', 'Netherlands', '🇳🇱', 'D'),
('CRO', 'Хорватия', 'Croatia', '🇭🇷', 'D'),
('ITA', 'Италия', 'Italy', '🇮🇹', 'E'),
('SUI', 'Швейцария', 'Switzerland', '🇨🇭', 'E'),
('DEN', 'Дания', 'Denmark', '🇩🇰', 'E'),
('AUT', 'Австрия', 'Austria', '🇦🇹', 'E'),
('MAR', 'Марокко', 'Morocco', '🇲🇦', 'F'),
('SEN', 'Сенегал', 'Senegal', '🇸🇳', 'F'),
('NGR', 'Нигерия', 'Nigeria', '🇳🇬', 'F'),
('EGY', 'Египет', 'Egypt', '🇪🇬', 'F'),
('JPN', 'Япония', 'Japan', '🇯🇵', 'G'),
('KOR', 'Южная Корея', 'South Korea', '🇰🇷', 'G'),
('AUS', 'Австралия', 'Australia', '🇦🇺', 'G'),
('IRN', 'Иран', 'Iran', '🇮🇷', 'G'),
('KSA', 'Саудовская Аравия', 'Saudi Arabia', '🇸🇦', 'H'),
('QAT', 'Катар', 'Qatar', '🇶🇦', 'H'),
('UAE', 'ОАЭ', 'UAE', '🇦🇪', 'H'),
('IRQ', 'Ирак', 'Iraq', '🇮🇶', 'H'),
('URU', 'Уругвай', 'Uruguay', '🇺🇾', 'I'),
('ECU', 'Эквадор', 'Ecuador', '🇪🇨', 'I'),
('CHI', 'Чили', 'Chile', '🇨🇱', 'I'),
('PER', 'Перу', 'Peru', '🇵🇪', 'I'),
('POL', 'Польша', 'Poland', '🇵🇱', 'J'),
('UKR', 'Украина', 'Ukraine', '🇺🇦', 'J'),
('CZE', 'Чехия', 'Czech Republic', '🇨🇿', 'J'),
('SVK', 'Словакия', 'Slovakia', '🇸🇰', 'J'),
('TUR', 'Турция', 'Turkey', '🇹🇷', 'K'),
('GRE', 'Греция', 'Greece', '🇬🇷', 'K'),
('SRB', 'Сербия', 'Serbia', '🇷🇸', 'K'),
('HUN', 'Венгрия', 'Hungary', '🇭🇺', 'K'),
('CMR', 'Камерун', 'Cameroon', '🇨🇲', 'L'),
('GHA', 'Гана', 'Ghana', '🇬🇭', 'L'),
('CIV', 'Кот-д''Ивуар', 'Ivory Coast', '🇨🇮', 'L'),
('ALG', 'Алжир', 'Algeria', '🇩🇿', 'L');
