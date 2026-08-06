import { redirect } from "next/navigation"

// Rota legada — o app real vive em /app/swap
export default function LegacySwapRedirect() {
  redirect("/app/swap")
}
