-- Складна складова «оновлення в реальному часі» (Supabase Realtime).
-- Зміни в заявках на події транслюються у браузер у реальному часі.
alter publication supabase_realtime add table public.event_registrations;
