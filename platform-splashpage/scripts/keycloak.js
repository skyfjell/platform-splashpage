const fs = require("fs");

for (var ID = 0; ID < 1; ID++) {
  const username = "admin";
  const password = "admin";
  const HOST = `http://localhost:808${ID}`;

  const getToken = async () => {
    const raw = {
      username,
      password,
      grant_type: "password",
      client_id: "admin-cli",
    };

    const form = new URLSearchParams();
    Object.entries(raw).forEach(([k, v]) => {
      form.append(k, v);
    });

    const data = await fetch(
      `${HOST}/realms/master/protocol/openid-connect/token`,
      {
        method: "POST",
        body: form,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return await data.json();
  };

  const createClient = async () => {
    const body = {
      clientId: "splash",
      redirectUris: ["http://localhost:3000/*"],
    };

    const token = (await getToken())["access_token"];
    await fetch(`${HOST}/admin/realms/master/clients`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  const createUser = async () => {
    const body = {
      firstName: "test",
      lastName: "user",
      username: "testuser",
      email: "test@user.com",
      emailVerified: true,
      enabled: true,
      credentials: [{ type: "password", value: "test123", temporary: false }],
    };

    const token = (await getToken())["access_token"];
    await fetch(`${HOST}/admin/realms/master/users`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  const getClientSecret = async () => {
    const token = (await getToken())["access_token"];
    const result = await fetch(`${HOST}/admin/realms/master/clients`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return (await result.json()).filter(
      ({ clientId }) => clientId === "splash"
    )[0]["secret"];
  };

  const writeEnvFile = async () => {
    await createClient();
    await createUser();
    const secret = await getClientSecret();

    const updated = fs
      .readFileSync(".env.local")
      .toString()
      .split("\n")
      .reduce((curr, val) => {
        if (val.trim() === "") {
          return curr;
        }
        const [k, v] = val.split("=");
        if (k === `SPLASH_AUTH_CLIENTSECRET_${ID}`) {
          curr.push(`${k}="${secret}"`);
        } else {
          curr.push(`${k}=${v}`);
        }
        return curr;
      }, []);

    fs.writeFileSync(".env", updated.join("\n"));
  };

  writeEnvFile();
}
