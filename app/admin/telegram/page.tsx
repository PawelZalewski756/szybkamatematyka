import { TelegramDiagnosticsClient } from "@/app/admin/telegram/TelegramDiagnosticsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diagnostyka Telegrama",
  robots: { index: false, follow: false },
};

export default function AdminTelegramPage() {
  return <TelegramDiagnosticsClient />;
}
