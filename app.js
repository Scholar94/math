/*
  Scholar's Camp Mathematics Academy — public website settings
  Configure WhatsApp and the Apps Script URL before publishing.
*/
const SITE_CONFIG = {
  brand: "Scholar's Camp Mathematics Academy",
  whatsappNumber: "", // International digits only, e.g. 2348012345678
  contactEmail: "",
  currency: "₦",
  appsScriptUrl: "" // Deployed Google Apps Script Web App URL
};

const FALLBACK_SAMPLES = [
  { title: "Indices: The basic rule", topic: "INDICES", description: "Learn what happens when powers with the same base are multiplied.", duration: "Short lesson", youtubeId: "" },
  { title: "Logarithms made clearer", topic: "LOGARITHMS", description: "Connect logarithms with powers and learn the key idea.", duration: "Short lesson", youtubeId: "" },
  { title: "Solve a simple equation", topic: "ALGEBRA", description: "Follow a step-by-step method to find the unknown.", duration: "Short lesson", youtubeId: "" }
];

const FALLBACK_COURSES = [
  { id: "sample-indices", title: "Indices Made Easy", category: "FOUNDATION TOPIC", level: "JSS/SSS", description: "Rules of indices, worked examples, and practice questions.", price: 1000, published: true },
  { id: "sample-logs", title: "Logarithms Made Easy", category: "FOUNDATION TOPIC", level: "SSS", description: "Understand logarithmic rules and practise solving questions.", price: 1500, published: true },
  { id: "sample-algebra", title: "Algebra Revision Bundle", category: "TOPIC BUNDLE", level: "JSS/SSS", description: "A selected collection of algebra lessons and practice activities.", price: 3000, published: true }
];

let COURSES = [...FALLBACK_COURSES];

const formatMoney = amount => SITE_CONFIG.currency + Number(amount || 0).toLocaleString("en-NG");
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));

function whatsappUrl(message) {
  const number = SITE_CONFIG.whatsappNumber.replace(/\D/g, "");
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : "";
}
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 3500);
}
function openWhatsApp(message) {
  const url = whatsappUrl(message);
  if (!url) {
    showToast("WhatsApp is not configured yet. Add your number in app.js before publishing.");
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
function renderSamples(samples = FALLBACK_SAMPLES) {
  const grid = document.getElementById("sampleGrid");
  if (!grid) return;
  grid.innerHTML = samples.slice(0, 6).map(item => {
    const id = String(item.youtubeId || "").trim();
    const video = /^[A-Za-z0-9_-]{11}$/.test(id)
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0" title="${escapeHtml(item.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
      : `<div class="video-placeholder"><div><span class="play-mark">▶</span><strong>${escapeHtml(item.topic || "SAMPLE")} SAMPLE</strong><small>Add a public YouTube video ID in the website settings</small></div></div>`;
    return `<article class="sample-card"><div class="video-frame">${video}</div><div class="sample-info"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><div class="sample-meta"><span>${escapeHtml(item.topic || "MATHEMATICS")}</span><span>${escapeHtml(item.duration || "Video lesson")}</span></div></div></article>`;
  }).join("");
}
function renderCourses(courses) {
  const grid = document.getElementById("courseGrid");
  if (!grid) return;
  const visible = (courses || []).filter(c => c.published !== false && c.active !== false);
  if (!visible.length) {
    grid.innerHTML = `<div class="empty-courses"><strong>New courses are coming soon.</strong><p>Please check back shortly or message us for available lessons.</p></div>`;
    return;
  }
  grid.innerHTML = visible.map((course, index) => `
    <article class="course-card">
      <div class="course-top"><div class="course-icon">${escapeHtml(course.icon || "∑")}</div><span class="course-tag">${escapeHtml(course.category || "MATHEMATICS COURSE")}</span></div>
      <div class="course-info"><h3>${escapeHtml(course.title)}</h3><p>${escapeHtml(course.description || "Video lessons and practice activities.")}</p>
      <div class="course-level">${escapeHtml(course.level || "All learners")}</div>
      <div class="course-price">${formatMoney(course.price)} <small>/ course</small></div>
      <button class="course-link" data-course-index="${index}">Ask about this course <span>→</span></button></div>
    </article>`).join("");
  grid.querySelectorAll("[data-course-index]").forEach(button => button.addEventListener("click", () => {
    const course = visible[Number(button.dataset.courseIndex)];
    if (!course) return;
    openWhatsApp(`Hello! I am interested in ${course.title} (${formatMoney(course.price)}). Please send me the course details and official payment instructions.`);
  }));
}

function configureLearnerPortalLink() {
  const nav = document.getElementById("mainNav");
  if (!nav || !SITE_CONFIG.appsScriptUrl.trim()) return;
  let link = document.getElementById("learnerPortalLink");
  if (!link) {
    link = document.createElement("a");
    link.id = "learnerPortalLink";
    link.textContent = "Learner sign in";
    nav.insertBefore(link, nav.querySelector(".nav-cta") || null);
  }
  link.href = SITE_CONFIG.appsScriptUrl.trim() + "?page=learn";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
}

function loadPublicCourses() {
  const url = SITE_CONFIG.appsScriptUrl.trim();
  if (!url) {
    renderCourses(COURSES);
    renderSamples(FALLBACK_SAMPLES);
    return;
  }
  const callbackName = "__academyCoursesCallback";
  const existing = document.getElementById("academyCatalogScript");
  if (existing) existing.remove();
  window[callbackName] = payload => {
    if (payload && Array.isArray(payload.courses)) {
      COURSES = payload.courses;
      renderCourses(COURSES);
      const publicSamples = Array.isArray(payload.samples) && payload.samples.length ? payload.samples : FALLBACK_SAMPLES;
      renderSamples(publicSamples);
    } else {
      renderCourses(COURSES);
      renderSamples(FALLBACK_SAMPLES);
      showToast("Could not load the live course catalogue. Showing sample courses.");
    }
    delete window[callbackName];
  };
  const script = document.createElement("script");
  script.id = "academyCatalogScript";
  script.src = `${url}${url.includes("?") ? "&" : "?"}action=catalog&callback=${callbackName}&t=${Date.now()}`;
  script.onerror = () => {
    renderCourses(COURSES);
    renderSamples(FALLBACK_SAMPLES);
    showToast("Course catalogue is temporarily unavailable. Showing sample courses.");
    delete window[callbackName];
  };
  document.head.appendChild(script);
}
function init() {
  renderSamples(FALLBACK_SAMPLES);
  renderCourses(COURSES);
  configureLearnerPortalLink();
  loadPublicCourses();
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  const mainLink = document.getElementById("whatsappMain");
  if (mainLink) mainLink.addEventListener("click", event => {
    event.preventDefault();
    openWhatsApp("Hello! I would like help choosing a Mathematics video lesson. Please tell me the available topics and prices.");
  });
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  if (menuToggle && nav) menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  if (SITE_CONFIG.contactEmail) {
    const emailLink = document.querySelector(".cta-email");
    if (emailLink) {
      emailLink.href = `mailto:${SITE_CONFIG.contactEmail}`;
      emailLink.textContent = SITE_CONFIG.contactEmail;
    }
  }
}
document.addEventListener("DOMContentLoaded", init);
