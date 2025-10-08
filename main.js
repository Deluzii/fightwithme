import * as DiscordSDK from "https://cdn.jsdelivr.net/npm/@discord/embedded-app-sdk@1.2.0/+esm";

window.addEventListener("DOMContentLoaded", async () => {
  const log = (msg) => {
    const el = document.getElementById("log");
    el.textContent = msg;
  };

  log("Initializing...");

  const sdk = new DiscordSDK.ActivitySDK();

  try {
    await sdk.ready();
    log("✅ SDK Ready. Connected to Discord.");
  } catch (err) {
    log("⚠️ Failed to connect to Discord.");
    return;
  }

  // Shared instance listener
  sdk.subscribe("ACTIVITY_INSTANCE_STATE_UPDATE", (data) => {
    if (data?.state?.message) log(`📨 ${data.state.message}`);
  });

  // Button click broadcast
  document.getElementById("hiBtn").onclick = () => {
    const msg = "👋 Hello from Fight With Me!";
    sdk.commands.sendActivityInstanceState({
      activity_instance_id: sdk.instanceId,
      state: { message: msg },
    });
    log(msg);
  };
});
