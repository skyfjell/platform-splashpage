import "server-only";
import Config, { SplashConfigError } from "@/config";
import { redirect } from "next/navigation";
import App from "../components/Apps";
import { cookies, headers } from "next/dist/client/components/headers";
import { getToken } from "next-auth/jwt";

async function getData(token: any) {
  const cfg = Config();

  const apps = cfg.apps.filter(
    ({ auth }) =>
      auth?.some((obj) =>
        Object.entries(obj).every(
          ([k, v]) =>
            token[k] &&
            typeof token[k] === "string" &&
            v.length !== 0 &&
            v.includes(token[k] as string)
        )
      ) ?? true
  );
  const theme = cfg.theme;
  return { theme, apps };
}

export default async function Page() {
  const token = await getToken({
    req: {
      headers: headers(),
      cookies: cookies(),
    } as any,
  });

  if (!token) {
    return redirect("/api/auth/signin");
  }

  const { apps, theme } = await getData(token);

  return (
    <main>
      <App apps={apps} theme={theme} />
    </main>
  );
}
