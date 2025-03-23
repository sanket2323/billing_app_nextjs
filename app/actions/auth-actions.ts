"use server";

import { auth, signIn,signOut } from "@/auth";

export async function signInWithGoogle() {
  await signIn("google");
}

export async function signOutWithGoogle() {
    await signOut();
}

export async function getUserSession(){
    const session = await auth()
   return session;
}