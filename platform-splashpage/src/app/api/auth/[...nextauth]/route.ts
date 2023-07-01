import Config from "@/config";
import NextAuth from "next-auth";

export async function GET(...args: any) {
  const handler = NextAuth(Config().authOptions);
  return await handler(...args);
}

export async function POST(...args: any) {
  const handler = NextAuth(Config().authOptions);
  return await handler(...args);
}
