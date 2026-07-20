import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

/** Legacy URL → nový learning hub */
export default function HypotecniAkademieRedirect() {
  redirect(routes.akademie);
}
