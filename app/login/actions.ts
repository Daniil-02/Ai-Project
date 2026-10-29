"use server";

// Вхід, реєстрація і вихід (практична робота 5). Не змінюйте цей файл.
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/action-result";
import { db } from "@/lib/data/db/client";

// Куди повернутися після входу: лише сторінка цього ж застосунку.
function nextPath(value: FormDataEntryValue | null): string {
  const path = String(value ?? "/");
  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}

export async function signInAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { status: 400, message: "Введіть пошту й пароль." };

  const { error } = await db().auth.signInWithPassword({ email, password });
  if (error) return { status: 401, message: "Неправильна пошта або пароль." };

  redirect(nextPath(formData.get("next")));
}

export async function signUpAction(_previous: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!fullName) fieldErrors.full_name = "Вкажіть ім'я.";
  if (!email.includes("@")) fieldErrors.email = "Вкажіть пошту.";
  if (password.length < 6) fieldErrors.password = "Пароль — щонайменше 6 символів.";
  if (Object.keys(fieldErrors).length > 0) {
    return { status: 400, message: "Перевірте поля реєстрації.", fieldErrors };
  }

  const { data, error } = await db().auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) {
    const taken = error.code === "user_already_exists";
    return { status: 400, message: taken ? "Ця пошта вже зареєстрована." : `Реєстрація не вдалася: ${error.message}` };
  }
  if (!data.session) {
    return {
      status: 400,
      message: "Акаунт створено, але вхід не виконано: у проєкті Supabase увімкнено підтвердження пошти.",
    };
  }

  redirect(nextPath(formData.get("next")));
}

export async function signOutAction(): Promise<void> {
  await db().auth.signOut();
  redirect("/login");
}
