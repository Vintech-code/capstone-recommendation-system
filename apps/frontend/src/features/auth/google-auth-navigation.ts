import type { AccessRole } from "@/features/auth/access-types";

const googleAuthChannelPrefix = "tcc-guidance:google-auth";
const googleAuthTimeoutMs = 5 * 60 * 1000;

interface GoogleAuthPopupResult {
  status: "success" | "error";
  portal: AccessRole;
  error?: string;
}

interface GoogleAuthMessage extends GoogleAuthPopupResult {
  type: "google-auth-complete";
  flow: string;
}

interface GoogleAuthChannel {
  addEventListener: (
    type: "message",
    listener: (event: MessageEvent<unknown>) => void,
  ) => void;
  removeEventListener: (
    type: "message",
    listener: (event: MessageEvent<unknown>) => void,
  ) => void;
  close: () => void;
}

interface GoogleAuthPopupOptions {
  portal: AccessRole;
  onResult: (result: GoogleAuthPopupResult) => void;
  createChannel?: (name: string) => GoogleAuthChannel;
  createFlowId?: () => string;
  openPopup?: (url: string, target: string, features: string) => Window | null;
  scheduleTimeout?: (callback: () => void, delay: number) => number;
  cancelTimeout?: (id: number) => void;
}

function getGoogleAuthChannelName(flow: string) {
  return `${googleAuthChannelPrefix}:${flow}`;
}

function isGoogleAuthMessage(
  value: unknown,
  flow: string,
  portal: AccessRole,
): value is GoogleAuthMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as Partial<GoogleAuthMessage>;
  return (
    message.type === "google-auth-complete" &&
    message.flow === flow &&
    message.portal === portal &&
    (message.status === "success" || message.status === "error")
  );
}

function startGoogleAuthentication(
  target: string,
  {
    portal,
    onResult,
    createChannel = (name) => new BroadcastChannel(name),
    createFlowId = () => crypto.randomUUID(),
    openPopup = (url, name, features) => window.open(url, name, features),
    scheduleTimeout = (callback, delay) => window.setTimeout(callback, delay),
    cancelTimeout = (id) => window.clearTimeout(id),
  }: GoogleAuthPopupOptions,
) {
  const flow = createFlowId();
  const authorizationUrl = new URL(target, window.location.origin);
  authorizationUrl.searchParams.set("popup", "1");
  authorizationUrl.searchParams.set("flow", flow);

  let channel: GoogleAuthChannel;
  try {
    channel = createChannel(getGoogleAuthChannelName(flow));
  } catch {
    onResult({ status: "error", portal, error: "popup_unavailable" });
    return false;
  }

  let timeoutId: number | null = null;
  const cleanup = () => {
    if (timeoutId !== null) cancelTimeout(timeoutId);
    channel.removeEventListener("message", handleMessage);
    channel.close();
  };
  const handleMessage = (event: MessageEvent<unknown>) => {
    if (!isGoogleAuthMessage(event.data, flow, portal)) return;
    cleanup();
    onResult({
      status: event.data.status,
      portal,
      error: event.data.error,
    });
  };

  channel.addEventListener("message", handleMessage);
  const popup = openPopup(
    authorizationUrl.toString(),
    `tcc-google-auth-${flow}`,
    "popup=yes,width=520,height=720,resizable=yes,scrollbars=yes",
  );

  if (!popup) {
    cleanup();
    onResult({ status: "error", portal, error: "popup_blocked" });
    return false;
  }

  timeoutId = scheduleTimeout(() => {
    cleanup();
    onResult({ status: "error", portal, error: "popup_timeout" });
  }, googleAuthTimeoutMs);

  popup.focus();
  return true;
}

export { getGoogleAuthChannelName, startGoogleAuthentication };
export type { GoogleAuthMessage, GoogleAuthPopupResult };
