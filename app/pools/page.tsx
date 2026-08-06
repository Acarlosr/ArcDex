import { redirect } from "next/navigation"

// Rota legada — o app real vive em /app/pools
export default function LegacyPoolsRedirect() {
  redirect("/app/pools")
}
