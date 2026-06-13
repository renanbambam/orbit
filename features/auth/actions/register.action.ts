"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas/auth.schemas";

export async function registerUser(input: RegisterInput) {
  const data = registerSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hash(data.password, 12);
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
  });

  await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false,
  });

  return { success: true as const };
}
