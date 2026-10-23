import type { Metadata } from "next";
import { MakerSignIn } from "@/screens/maker/MakerSignIn";

export const metadata: Metadata = { title: "Sign in · Chhito!" };

export default function SignInPage() {
  return <MakerSignIn />;
}
