/* Optional free analytics. Turn on by adding ids in config.js (analytics: { cloudflareToken, ga4Id }). Does nothing if empty. */
(function () {
  var cfg = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.analytics) || {};
  function add(src, attrs) {
    var s = document.createElement("script");
    s.async = true; s.src = src;
    Object.keys(attrs || {}).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s);
  }
  try {
    if (cfg.cloudflareToken && /^[a-f0-9]{16,64}$/i.test(cfg.cloudflareToken)) {
      add("https://static.cloudflareinsights.com/beacon.min.js", { defer: "", "data-cf-beacon": JSON.stringify({ token: cfg.cloudflareToken }) });
    }
    if (cfg.ga4Id && /^G-[A-Z0-9]{4,15}$/.test(cfg.ga4Id)) {
      add("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4Id));
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", cfg.ga4Id, { anonymize_ip: true });
    }
  } catch (e) { /* analytics must never break the site */ }
})();
