"use server";

import { signIn } from "./auth";

// server action because we cannot run signIn from client side button
export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}
