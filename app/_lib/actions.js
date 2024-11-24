"use server";

import { signIn, signOut } from "./auth";

// server action because we cannot run signIn from client side button
export async function signInAction() {
  await signIn("google", { redirectTo: "/account" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
