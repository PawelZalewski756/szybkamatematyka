import { getServiceSupabaseOrNull, isServiceRoleConfigured } from "@/lib/stripe/service-supabase";
import { verifyUserRequest } from "@/lib/subscription/server-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

/**
 * POST /api/account/delete
 *
 * Trwale usuwa konto zalogowanego użytkownika: auth.users, profil i avatar.
 * Nie usuwamy konta z aktywną subskrypcją - najpierw trzeba ją anulować w
 * portalu płatności, żeby uniknąć naliczeń po usunięciu dostępu.
 *
 * Body: { confirmation: "USUŃ" }
 */
export async function POST(request: Request) {
  try {
    const auth = await verifyUserRequest(request);
    if (!auth.ok) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    if (!isServiceRoleConfigured()) {
      return Response.json(
        {
          error: "Usuwanie konta jest chwilowo niedostępne (brak konfiguracji).",
          code: "service_not_configured",
        },
        { status: 503 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Nieprawidłowy format JSON w żądaniu." },
        { status: 400 },
      );
    }

    const confirmation =
      typeof body === "object" && body !== null && "confirmation" in body
        ? String((body as { confirmation: unknown }).confirmation).trim()
        : "";

    if (confirmation !== "USUŃ") {
      return Response.json(
        { error: 'Wpisz „USUŃ”, żeby potwierdzić usunięcie konta.' },
        { status: 400 },
      );
    }

    const supabase = getServiceSupabaseOrNull();
    if (!supabase) {
      return Response.json(
        { error: "Usuwanie konta jest chwilowo niedostępne." },
        { status: 503 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_status, stripe_subscription_id, subscription_cancel_at_period_end")
      .eq("id", auth.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[account-delete] profile read failed", profileError);
      return Response.json(
        { error: "Nie udało się sprawdzić stanu konta. Spróbuj ponownie." },
        { status: 500 },
      );
    }

    const subscriptionStatus = profile?.subscription_status ?? null;
    if (
      subscriptionStatus &&
      ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus) &&
      profile?.stripe_subscription_id &&
      !profile?.subscription_cancel_at_period_end
    ) {
      return Response.json(
        {
          error:
            "Najpierw anuluj aktywną subskrypcję w sekcji „Twój plan”. Dopiero potem możesz usunąć konto.",
          code: "active_subscription",
        },
        { status: 409 },
      );
    }

    // Avatar nie jest powiązany kluczem obcym z auth.users - usuwamy ręcznie.
    const { data: avatarFiles } = await supabase.storage
      .from("avatary")
      .list(auth.user.id);

    if (avatarFiles && avatarFiles.length > 0) {
      await supabase.storage
        .from("avatary")
        .remove(avatarFiles.map((file) => `${auth.user.id}/${file.name}`));
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      auth.user.id,
    );

    if (deleteError) {
      console.error("[account-delete] auth delete failed", deleteError);
      return Response.json(
        {
          error:
            "Nie udało się usunąć konta. Spróbuj ponownie lub napisz do nas.",
        },
        { status: 500 },
      );
    }

    // Gdyby profil nie zniknął kaskadą, usuwamy go jawnie.
    await supabase.from("profiles").delete().eq("id", auth.user.id);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("[account-delete] unexpected error", error);
    return Response.json(
      { error: "Nieoczekiwany błąd. Spróbuj ponownie." },
      { status: 500 },
    );
  }
}
