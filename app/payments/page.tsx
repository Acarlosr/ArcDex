import { redirect } from "next/navigation"

// Rota legada — o app real vive em /app/payments
export default function LegacyPaymentsRedirect() {
  redirect("/app/payments")
}
