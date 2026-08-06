import { redirect } from "next/navigation"

// Rota legada — o app real vive em /app/history
export default function LegacyHistoryRedirect() {
  redirect("/app/history")
}
