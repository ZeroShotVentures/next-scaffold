"use client";

import { stripeClient } from "@better-auth/stripe/client";
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    stripeClient({
      subscription: true,
    }),
    adminClient(),
  ],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  subscription,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail,
  updateUser,
  changeEmail,
  changePassword,
  deleteUser,
  admin,
} = authClient;
