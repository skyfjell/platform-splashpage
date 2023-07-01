import Config, { SplashConfigError } from "@/config";
import { getToken } from "next-auth/jwt";
import { headers, cookies } from "next/dist/client/components/headers";
import "server-only";

function getData() {
  const {
    pageMetadata: { title },
    theme: { primary },
  } = Config();
  return { title, primary };
}

const metadata = Config().pageMetadata;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getToken({
    req: {
      headers: headers(),
      cookies: cookies(),
    } as any,
  });

  const { title, primary } = await getData();
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="favicon.ico" />
        <title>{title}</title>
      </head>
      <body style={{ backgroundColor: primary }}>{children}</body>
    </html>
  );
}
