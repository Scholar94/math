let deferredInstallPrompt = null;
const installButtons = () => [document.getElementById("installAppBtn"), document.getElementById("installMainBtn")].filter(Boolean);
function setInstallButtonVisibility(visible) {
  installButtons().forEach(button => { button.hidden = !visible; });
}
async function requestInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    try {
      await deferredInstallPrompt.userChoice;
    } catch (_) {}
    deferredInstallPrompt = null;
    setInstallButtonVisibility(false);
    return;
  }
  const steps = document.getElementById("installSteps");
  if (steps) {
    steps.hidden = false;
    steps.scrollIntoView({behavior:"smooth", block:"nearest"});
  }
}
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  setInstallButtonVisibility(true);
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  setInstallButtonVisibility(false);
});
document.addEventListener("DOMContentLoaded", () => {
  const main = document.getElementById("installMainBtn");
  const nav = document.getElementById("installAppBtn");
  const help = document.getElementById("showInstallSteps");
  if (main) main.addEventListener("click", requestInstall);
  if (nav) nav.addEventListener("click", requestInstall);
  if (help) help.addEventListener("click", () => {
    const steps = document.getElementById("installSteps");
    if (steps) {
      steps.hidden = !steps.hidden;
      if (!steps.hidden) steps.scrollIntoView({behavior:"smooth", block:"nearest"});
    }
  });
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("./service-worker.js").catch(err => console.warn("Service worker registration failed:", err));
  }
});
