import "server-only";
import { AuthOptions } from "next-auth";
import Providers, { TProviders } from "./providers";
import fs from "fs";

export class SplashConfigError extends Error {}

interface ClientProviderBase {
  type: keyof TProviders;
  name: string;
  clientId: string;
  issuer?: string;
}

interface ClientProvider extends ClientProviderBase {
  clientSecret: string;
}

interface AppConfig {
  name: string;
  displayName?: string;
  icon: string;
  auth?: Record<string, string[]>[];
  link: string;
}

interface SplashConfigBase<T extends ClientProviderBase = ClientProviderBase> {
  apps: AppConfig[];
  auths: T[];
  /** Page metadata */
  pageMetadata: {
    title: string;
    description: string;
  };
  /** The url of the webpage */
  url: string;
  /** Color theme */
  theme: {
    primary: string;
    secondary: string;
  };
  /** Title description */
  title?: string;
}

function getEnv(key: string, default_?: string) {
  const name = `SPLASH_${key.toUpperCase()}`;
  return process.env[name] ?? default_;
}

export interface SplashConfig extends SplashConfigBase<ClientProvider> {
  /** Array of next-auth.js supported auth providers */
  authOptions: AuthOptions;
}

class _SplashConfig implements SplashConfig {
  private raw: SplashConfigBase = {
    title: "",
    pageMetadata: { title: "", description: "" },
    url: "",
    auths: [],
    apps: [],
    theme: {
      primary: "",
      secondary: "",
    },
  };
  private DEFAULT_PRIMARY_THEME = "#E0B165";
  private DEFAULT_SECONDARY_THEME = "#255F94";
  private _auth: AuthOptions | null = null;

  constructor() {
    if (!process.env.BUILD) {
      const dir = getEnv("app_dir");
      if (dir === undefined) {
        throw new SplashConfigError("App dir must be defined");
      }
      this.raw = JSON.parse(fs.readFileSync(dir).toString());
      this.validate(this.raw);
    }
  }

  private validate(raw: SplashConfigBase) {
    if ((raw?.url ?? "") === "") {
      throw new SplashConfigError("App url must be defined");
    }
    if ((raw?.pageMetadata?.title ?? "") === "") {
      throw new SplashConfigError("App title metadata must be defined");
    }
    if ((raw?.pageMetadata?.description ?? "") === "") {
      throw new SplashConfigError("App description metadata must be defined");
    }
    const missingSecrets = this.auths
      .filter(({ clientSecret }) => clientSecret === "")
      .map(({ name }) => name);
    if (missingSecrets.length > 0) {
      throw new SplashConfigError(
        "App missing clientSecret for " + missingSecrets.join(", ")
      );
    }
  }

  get pageMetadata() {
    return this.raw.pageMetadata;
  }

  get theme() {
    return {
      primary: this.raw.theme?.primary || this.DEFAULT_PRIMARY_THEME,
      secondary: this.raw.theme?.secondary || this.DEFAULT_SECONDARY_THEME,
    };
  }

  get url() {
    return this.raw.url;
  }

  get apps() {
    return this.raw.apps;
  }

  get auths() {
    return this.raw.auths.map(({ name, ...rest }) => ({
      name,
      ...rest,
      clientSecret: getEnv(`auth_clientsecret_${name}`, "")!,
    }));
  }

  get authOptions() {
    if (!this._auth) {
      // Construct NextAuthJs provider array
      const providers = this.auths.map(({ type, ...config }) => {
        if (!(type in Providers)) {
          throw new SplashConfigError(`Provider ${type} not found`);
        }
        return (Providers as any)[type]({ ...config });
      });

      this._auth = {
        providers,
        theme: { brandColor: this.theme.primary },
        callbacks: {
          async jwt({ token, profile }) {
            return { ...token, ...profile };
          },
        },
      };
    }

    return this._auth!;
  }
}

let _Config: SplashConfig | null = null;
const Config = () => {
  if (!_Config) {
    _Config = new _SplashConfig();
  }
  return _Config;
};

export default Config;
