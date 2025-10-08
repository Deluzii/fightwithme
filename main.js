import { DiscordSDK } from "@discord/embedded-app-sdk";

window.addEventListener("DOMContentLoaded", async () => {
  const btn = document.getElementById("btnHello");
  const msg = document.getElementById("message");
  const sdk = new DiscordSDK.ActivitySDK();

  // --- STATUS BAR ---
  const statusBar = document.createElement("div");
  Object.assign(statusBar.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    textAlign: "center",
    fontFamily: "monospace",
    fontSize: "14px",
    padding: "6px 0",
    background: "#202225",
    color: "#ff0",
    borderBottom: "2px solid #444",
    zIndex: "99999",
  });
  statusBar.textContent = "🔄 Checking Discord connection...";
  document.body.appendChild(statusBar);
  const setStatus = (text, color = "#57F287") => {
    statusBar.textContent = text;
    statusBar.style.color = color;
  };

  // --- DEBUG CONSOLE ---
  const debug = document.createElement("div");
  Object.assign(debug.style, {
    position: "fixed",
    bottom: "0",
    left: "0",
    width: "360px",
    height: "180px",
    background: "rgba(0,0,0,0.8)",
    color: "#0f0",
    fontFamily: "monospace",
    fontSize: "12px",
    overflowY: "auto",
    borderTopRightRadius: "10px",
    border: "2px solid #333",
    padding: "6px 10px",
    zIndex: "99998",
  });
  debug.innerHTML = "🟡 Initializing...";
  document.body.appendChild(debug);
  const log = (t, c = "#0f0") => {
    const line = document.createElement("div");
    line.style.color = c;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${t}`;
    debug.appendChild(line);
    debug.scrollTop = debug.scrollHeight;
  };

  const show = (t, c = "#57F287") => {
    msg.textContent = t;
    msg.style.color = c;
    msg.classList.add("visible");
    setTimeout(() => msg.classList.remove("visible"), 2000);
  };

  // --- SDK Initialization ---
  let connected = false;
  try {
    await sdk.ready();
    connected = true;
    log("✅ SDK ready");
    setStatus(`🟢 Connected as ${sdk.user?.username || "Discord User"}`);

    try {
      const channel = await sdk.commands.getChannel();
      await sdk.commands.setActivityInstance({ location: channel.id });
      log("🔗 Shared instance enabled for channel: " + channel.name);
      setStatus(`🟢 Shared instance active – ${sdk.user?.username}`);
    } catch (err) {
      log("⚠️ Could not enable shared instance", "#ff0");
      setStatus("🟡 Connected (no shared instance)", "#ff0");
    }
  } catch (e) {
    log("⚠️ SDK not connected (local mode)", "#ff0");
    setStatus("🔴 Local test mode (solo instance)", "#ff5555");
  }

  // --- RECEIVE BROADCASTS ---
  if (sdk.subscribe) {
    sdk.subscribe("ACTIVITY_INSTANCE_STATE_UPDATE", (data) => {
      if (data?.state?.message) {
        show(data.state.message, "#ED4245");
        btn.classList.add("active");
        setTimeout(() => btn.classList.remove("active"), 600);
        log("📩 Received: " + data.state.message, "#FEE75C");
      }
    });
  } else {
    log("❌ sdk.subscribe unavailable", "#f44");
  }

  // --- BUTTON CLICK BROADCAST ---
  btn.onclick = () => {
    const text = `${sdk.user?.username || "Someone"} says Hi 👋`;
    show(text, "#5865F2");
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), 600);

    if (connected && sdk.commands?.sendActivityInstanceState) {
      try {
        sdk.commands.sendActivityInstanceState({
          activity_instance_id: sdk.instanceId,
          state: { message: text },
        });
        log("📤 Broadcasted: " + text);
      } catch (err) {
        log("❌ Broadcast failed: " + err.message, "#f44");
      }
    } else {
      log("🟡 Local click (no Discord connection)", "#ff0");
    }
  };
});
