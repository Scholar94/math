
let adminToken = "";
let courses = [];
const $ = id => document.getElementById(id);
function setStatus(id, message, type="") {
  const node = $(id);
  if (!node) return;
  node.innerHTML = message ? `<div class="status ${type}">${escapeHtml(message)}</div>` : "";
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
async function callServer(method, ...args) {
  try { return await apiCall(method, ...args); }
  catch (error) {
    if (/admin session has expired/i.test(error.message) && adminToken) logout(error.message);
    throw error;
  }
}
$("loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const button = $("loginBtn");
  button.disabled = true; setStatus("loginStatus", "Signing in\u2026");
  try {
    const result = await callServer("adminLogin", $("password").value);
    adminToken = result.token;
    $("password").value = "";
    $("loginPanel").classList.add("hidden");
    $("dashboard").classList.remove("hidden");
    $("logoutBtn").classList.remove("hidden");
    setStatus("loginStatus", "");
    await refreshAll();
  } catch (error) {
    setStatus("loginStatus", error.message || "Sign-in failed.", "error");
  } finally { button.disabled = false; }
});
async function refreshAll() { await loadCourses(); await loadOrders(); await refreshLearners(); await loadAnalytics(); }
async function loadCourses(note) {
  try {
    courses = await callServer("adminListCourses", adminToken);
    renderCourseList();
    fillOrderCourses();
    setStatus("courseStatus", note || `${courses.length} course(s) in your catalogue.`, "success");
  } catch (error) { setStatus("courseStatus", error.message, "error"); }
}
function renderCourseList() {
  const list = $("courseList");
  if (!courses.length) { list.innerHTML = '<p class="muted">No courses yet. Select \u201CNew course\u201D to create one.</p>'; return; }
  list.innerHTML = courses.map(course => `<article class="course-row">
    <div style="flex:1;min-width:0"><h3>${escapeHtml(course.title)} <span class="pill ${course.published ? "" : "off"}">${course.published ? "Published" : "Draft"}</span></h3>
    <p>${escapeHtml(course.category)} \u00B7 ${escapeHtml(course.level)} \u00B7 \u20A6${Number(course.price).toLocaleString("en-NG")}</p>
    <p>${escapeHtml(course.description)}</p><span class="small muted">ID: ${escapeHtml(course.id)}</span></div>
    <div class="row-actions"><button class="btn secondary" onclick="editCourse('${escapeHtml(course.id)}')">Edit</button><button class="btn secondary" onclick="togglePublish('${escapeHtml(course.id)}')">${course.published ? "Unpublish" : "Publish"}</button><button class="btn danger" onclick="deleteCourse('${escapeHtml(course.id)}')">Delete</button></div>
    </article>`).join("");
}
function fillOrderCourses() {
  ["grantCourse","orderCourse","lessonCourse","questionCourse"].forEach(id => {
    const select = $(id); if (!select) return;
    const previous = select.value;
    select.innerHTML = courses.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.title)} \u2014 \u20A6${Number(c.price).toLocaleString("en-NG")}</option>`).join("");
    if (courses.some(c => c.id === previous)) select.value = previous;
  });
  syncAmount();
}
function syncAmount() {
  const course = courses.find(c => c.id === $("orderCourse").value);
  if (course && !$("orderAmount").dataset.manual) $("orderAmount").value = course.price;
}
$("orderCourse").addEventListener("change", () => { $("orderAmount").dataset.manual = ""; syncAmount(); });
$("orderAmount").addEventListener("input", () => { $("orderAmount").dataset.manual = "1"; });
function newCourse() {
  $("courseForm").reset(); $("courseId").value = ""; $("published").checked = true;
  $("editorTitle").textContent = "Create a course"; $("editorPanel").classList.remove("hidden"); setStatus("editorStatus", "");
  $("editorPanel").scrollIntoView({behavior:"smooth",block:"start"});
}
function editCourse(id) {
  const c = courses.find(item => item.id === id); if (!c) return;
  $("courseId").value = c.id; $("title").value = c.title; $("price").value = c.price;
  $("category").value = c.category || ""; $("level").value = c.level || ""; $("description").value = c.description || "";
  $("sampleYoutubeId").value = c.sampleYoutubeId || ""; $("driveFileId").value = c.driveFileId || "";
  $("driveUrl").value = c.driveUrl || ""; $("published").checked = !!c.published;
  $("editorTitle").textContent = "Edit course"; $("editorPanel").classList.remove("hidden"); setStatus("editorStatus", "");
  $("editorPanel").scrollIntoView({behavior:"smooth",block:"start"});
}
function closeEditor() { $("editorPanel").classList.add("hidden"); }
$("courseForm").addEventListener("submit", async event => {
  event.preventDefault(); const button = $("saveBtn"); button.disabled = true;
  setStatus("editorStatus", "Saving course\u2026");
  const data = {
    id: $("courseId").value, title: $("title").value, price: $("price").value,
    category: $("category").value, level: $("level").value, description: $("description").value,
    sampleYoutubeId: $("sampleYoutubeId").value.trim(), driveFileId: $("driveFileId").value.trim(),
    driveUrl: $("driveUrl").value.trim(), published: $("published").checked
  };
  try {
    await callServer("adminSaveCourse", adminToken, data);
    setStatus("editorStatus", "Course saved successfully.", "success");
    await loadCourses(); closeEditor();
  } catch (error) { setStatus("editorStatus", error.message, "error"); }
  finally { button.disabled = false; }
});
async function togglePublish(id) {
  const c = courses.find(item => item.id === id); if (!c) return;
  try { await callServer("adminSaveCourse", adminToken, {...c, published: !c.published}); await loadCourses(); }
  catch (error) { setStatus("courseStatus", error.message, "error"); }
}
async function deleteCourse(id) {
  const c = courses.find(item => item.id === id); if (!c) return;
  if (!confirm(`Delete "${c.title}" from the course catalogue? Existing order records remain.`)) return;
  try { await callServer("adminDeleteCourse", adminToken, id); await loadCourses("Course deleted."); }
  catch (error) { setStatus("courseStatus", error.message, "error"); }
}
async function loadOrders(note) {
  try {
    const orders = await callServer("adminListOrders", adminToken);
    $("ordersBody").innerHTML = orders.length ? orders.map(row => `<tr>${row.slice(1,2).concat(row.slice(2,3),row.slice(5,6),row.slice(6,7),row.slice(7,8),row.slice(8,9)).map(value => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`).join("") : '<tr><td colspan="6" class="muted">No order records yet.</td></tr>';
    setStatus("orderStatus", note || `${orders.length} recent order record(s).`, "success");
  } catch (error) { setStatus("orderStatus", error.message, "error"); }
}
$("orderForm").addEventListener("submit", async event => {
  event.preventDefault(); const button = $("orderSaveBtn"); button.disabled = true;
  setStatus("orderStatus", "Saving order\u2026");
  const data = { customer:$("orderCustomer").value, contact:$("orderContact").value, courseId:$("orderCourse").value, amount:$("orderAmount").value, paymentStatus:$("paymentStatus").value, deliveryStatus:$("deliveryStatus").value, notes:$("orderNotes").value };
  try {
    const result = await callServer("adminAddOrder", adminToken, data);
    $("orderForm").reset(); $("orderAmount").dataset.manual = ""; fillOrderCourses();
    await loadOrders(`Order recorded. Reference: ${result.reference}`);
  } catch (error) { setStatus("orderStatus", error.message, "error"); }
  finally { button.disabled = false; }
});
$("orderUpdateForm").addEventListener("submit",async e=>{e.preventDefault();try{await callServer("adminSetOrderStatus",adminToken,$("updateReference").value,$("updatePaymentStatus").value,$("updateDeliveryStatus").value,$("updateOrderNotes").value);await loadOrders("Order status updated. Verify the actual bank record before choosing Paid - verified.");await loadAnalytics()}catch(e){setStatus("orderStatus",e.message,"error")}});
async function loadAnalytics(){try{const a=await callServer("adminGetAnalytics",adminToken);const cards=[["Learners",a.learners],["Courses",a.courses],["Lessons",a.lessons],["Enrolment records",a.enrollments],["Orders",a.orders],["Pending orders",a.pendingOrders],["Verified orders",a.verifiedOrders],["Verified revenue",`\u20A6${Number(a.verifiedRevenue||0).toLocaleString()}`],["Quiz attempts",a.quizAttempts]];$("analyticsCards").innerHTML=cards.map(([k,v])=>`<div class="panel" style="margin:0;padding:14px"><div class="muted">${escapeHtml(k)}</div><strong style="font-size:1.35rem;color:var(--navy)">${escapeHtml(v)}</strong></div>`).join("");setStatus("analyticsStatus","Overview updated.","success")}catch(e){setStatus("analyticsStatus",e.message,"error")}}
$("lessonForm").addEventListener("submit",async e=>{e.preventDefault();try{await callServer("adminAddLesson",adminToken,{courseId:$("lessonCourse").value,order:$("lessonOrder").value,title:$("lessonTitle").value,description:$("lessonDescription").value,driveFileId:$("lessonFileId").value,driveUrl:$("lessonUrl").value,durationMinutes:$("lessonDuration").value,published:$("lessonPublished").checked});setStatus("contentStatus","Lesson added successfully. Enrolled learners can now see it.","success");$("lessonForm").reset();$("lessonOrder").value="1";$("lessonPublished").checked=true;await loadAnalytics()}catch(e){setStatus("contentStatus",e.message,"error")}});
$("questionForm").addEventListener("submit",async e=>{e.preventDefault();try{await callServer("adminAddQuestion",adminToken,{courseId:$("questionCourse").value,topic:$("questionTopic").value,question:$("questionText").value,a:$("optionA").value,b:$("optionB").value,c:$("optionC").value,d:$("optionD").value,correct:$("correctOption").value,explanation:$("questionExplanation").value,published:$("questionPublished").checked});setStatus("contentStatus","Question added successfully.","success");$("questionForm").reset();$("questionTopic").value="General practice";$("questionPublished").checked=true;await loadAnalytics()}catch(e){setStatus("contentStatus",e.message,"error")}});
let learners = [];
let enrollments = [];
function formatDate(value) {
  if (!value) return "\u2014";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "\u2014" : d.toLocaleString();
}
async function refreshLearners(note) {
  try {
    const results = await Promise.all([
      callServer("adminListLearners", adminToken),
      callServer("adminListEnrollments", adminToken)
    ]);
    learners = results[0] || []; enrollments = results[1] || [];
    const select = $("grantLearner");
    const previous = select.value;
    select.innerHTML = learners.filter(l => l.status === "Active").map(l => `<option value="${escapeHtml(l.email)}">${escapeHtml(l.name)} \u2014 ${escapeHtml(l.email)}</option>`).join("");
    if (!select.options.length) select.innerHTML = '<option value="">No active learner accounts yet</option>';
    if (learners.some(l => l.email === previous && l.status === "Active")) select.value = previous;
    $("learnersBody").innerHTML = learners.length ? learners.map(l => `<tr><td>${escapeHtml(l.name)}</td><td>${escapeHtml(l.email)}</td><td>${escapeHtml(l.status)}</td><td>${escapeHtml(formatDate(l.lastLogin))}</td><td>${l.status === "Active" ? `<button class="btn danger" onclick="setLearnerStatus('${escapeHtml(l.email)}','Disabled')">Disable</button>` : `<button class="btn secondary" onclick="setLearnerStatus('${escapeHtml(l.email)}','Active')">Enable</button>`} <button class="btn secondary" onclick="resetLearnerPassword('${escapeHtml(l.email)}')">Reset password</button></td></tr>`).join("") : '<tr><td colspan="5" class="muted">No learner accounts registered yet. Ask learners to create an account first.</td></tr>';
    $("enrollmentsBody").innerHTML = enrollments.length ? enrollments.map(e => `<tr><td>${escapeHtml(e.email)}</td><td>${escapeHtml(e.courseTitle)}</td><td>${escapeHtml(e.status)}</td><td>${escapeHtml(formatDate(e.grantedAt))}</td><td>${escapeHtml(e.notes)}</td><td>${e.status.toLowerCase() === "active" ? `<button class="btn danger" onclick="revokeEnrollment('${escapeHtml(e.email)}','${escapeHtml(e.courseId)}')">Revoke</button>` : `<button class="btn secondary" onclick="grantExisting('${escapeHtml(e.email)}','${escapeHtml(e.courseId)}')">Reactivate</button>`}</td></tr>`).join("") : '<tr><td colspan="6" class="muted">No course enrolments yet.</td></tr>';
    setStatus("learnerStatus", note || `${learners.length} learner account(s) and ${enrollments.length} enrolment record(s) loaded.`, "success");
  } catch (error) { setStatus("learnerStatus", error.message, "error"); }
}
$("grantForm").addEventListener("submit", async event => {
  event.preventDefault();
  const button = $("grantBtn"); button.disabled = true;
  const email = $("grantLearner").value, courseId = $("grantCourse").value, notes = $("grantNotes").value;
  if (!email || !courseId) { setStatus("learnerStatus", "Select a registered learner and a course.", "error"); button.disabled = false; return; }
  if (!confirm(`Grant access to ${email} for ${courses.find(c=>c.id===courseId)?.title || "this course"}? Only continue after verifying payment.`)) { button.disabled = false; return; }
  try {
    const result = await callServer("adminGrantEnrollment", adminToken, email, courseId, notes);
    $("grantNotes").value = "";
    await refreshLearners(result.message || "Course access granted in the portal. Now share the restricted Drive file with the learner.");
  } catch (error) { setStatus("learnerStatus", error.message, "error"); }
  finally { button.disabled = false; }
});
async function revokeEnrollment(email, courseId) {
  if (!confirm(`Revoke app access for ${email}? You must also remove this learner's Google Drive permission.`)) return;
  try { const result = await callServer("adminRevokeEnrollment", adminToken, email, courseId); await refreshLearners(result.message || "Enrolment revoked in the portal. Also remove the learner's Drive permission."); }
  catch (error) { setStatus("learnerStatus", error.message, "error"); }
}
async function grantExisting(email, courseId) {
  if (!confirm(`Reactivate access for ${email}? Confirm payment and Drive permissions first.`)) return;
  try { const result = await callServer("adminGrantEnrollment", adminToken, email, courseId, "Reactivated by admin"); await refreshLearners(result.message || "Access reactivated."); }
  catch (error) { setStatus("learnerStatus", error.message, "error"); }
}
async function resetLearnerPassword(email) {
  const temp = prompt(`Type a temporary password (12+ characters) for ${email}. Tell the learner privately.`);
  if (temp === null) return;
  try { const result = await callServer("adminResetLearnerPassword", adminToken, email, temp); setStatus("learnerStatus", result.message, "success"); }
  catch (error) { setStatus("learnerStatus", error.message, "error"); }
}
async function setLearnerStatus(email, status) {
  const verb = status === "Disabled" ? "disable" : "enable";
  if (!confirm(`Are you sure you want to ${verb} the learner account ${email}?`)) return;
  try { const result = await callServer("adminSetLearnerStatus", adminToken, email, status); await refreshLearners(result.message); }
  catch (error) { setStatus("learnerStatus", error.message, "error"); }
}
async function logout(message) {
  try { if (adminToken) await callServer("adminLogout", adminToken); } catch (e) {}
  adminToken = ""; courses = []; learners = []; enrollments = [];
  $("dashboard").classList.add("hidden"); $("loginPanel").classList.remove("hidden"); $("logoutBtn").classList.add("hidden");
  $("courseList").innerHTML = ""; $("ordersBody").innerHTML = '<tr><td colspan="6" class="muted">Sign in to view orders.</td></tr>';
  $("learnersBody").innerHTML = '<tr><td colspan="5" class="muted">Sign in to load learners.</td></tr>';
  $("enrollmentsBody").innerHTML = '<tr><td colspan="6" class="muted">Sign in to load enrolments.</td></tr>';
  setStatus("loginStatus", typeof message === "string" ? message : "You have signed out.", typeof message === "string" ? "error" : "success");
}
