/* Talks to the Google Apps Script web app with fetch(). Used by learn.html and admin.html. */
async function apiCall(method, ...args) {
  const url = String(SITE_CONFIG.appsScriptUrl || "").trim();
  if (!url) throw new Error("The academy server is not connected yet. The site owner must set appsScriptUrl in config.js.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40000);
  let response;
  try {
    // A plain-text body keeps this a "simple" request, which Apps Script accepts from any website.
    response = await fetch(url, { method: "POST", body: JSON.stringify({ method: method, args: args }), redirect: "follow", signal: controller.signal });
  } catch (err) {
    throw new Error(err && err.name === "AbortError" ? "The server took too long to answer. Please try again." : "Cannot reach the academy server. Check your internet connection and try again.");
  } finally { clearTimeout(timer); }
  let data;
  try { data = await response.json(); }
  catch (err) { throw new Error("The academy server sent an unexpected reply. The owner should check that the web app is deployed as 'Execute as: Me' with access 'Anyone', using the newest version."); }
  if (!data || data.ok !== true) throw new Error((data && data.error) || "Request failed.");
  return data.result;
}
