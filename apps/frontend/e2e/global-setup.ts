import { createServer, type ViteDevServer } from "vite";

const serverUrl = "http://127.0.0.1:4175/student/login";

async function serverIsAvailable() {
  try {
    const response = await fetch(serverUrl);
    return response.ok;
  } catch {
    return false;
  }
}

export default async function globalSetup() {
  if (await serverIsAvailable()) return undefined;

  let server: ViteDevServer | null = await createServer({
    server: {
      host: "127.0.0.1",
      port: 4175,
      strictPort: true,
    },
  });
  await server.listen();

  return async () => {
    await server?.close();
    server = null;
  };
}
