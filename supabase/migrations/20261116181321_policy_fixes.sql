-- Виправлення за результатами аудиту безпеки ПР 7 (крок 9):
-- Відкликання прав виконання функцій SECURITY DEFINER у ролей public та anon.
revoke execute on function public.handle_new_user() from public, anon;
revoke execute on function public.is_event_participant(uuid) from public, anon;
revoke execute on function public.my_profile_id() from public, anon;
revoke execute on function public.my_rank() from public, anon;
revoke execute on function public.owns_event(uuid) from public, anon;

grant execute on function public.is_event_participant(uuid) to authenticated;
grant execute on function public.my_profile_id() to authenticated;
grant execute on function public.my_rank() to authenticated;
grant execute on function public.owns_event(uuid) to authenticated;
