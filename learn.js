
var learnerToken = '', learnerName = '';
var $ = id => document.getElementById(id);
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
// NOTE: not named "status" - that clashes with the built-in window.status property.
function setMsg(id, msg, type = '') { $(id).innerHTML = msg ? `<div class="status ${type}">${esc(msg)}</div>` : ''; }
var server = apiCall;
function showMode(mode, keepMessage) {
  const titles = { login: 'Learner sign in', register: 'Create learner account', forgot: 'Reset your password' };
  $('authTitle').textContent = titles[mode] || titles.login;
  $('registerForm').classList.toggle('hidden', mode !== 'register');
  $('loginForm').classList.toggle('hidden', mode !== 'login');
  $('forgotForm').classList.toggle('hidden', mode !== 'forgot');
  if (mode === 'forgot') { $('resetStep2').classList.add('hidden'); $('resetEmail').disabled = false; }
  if (!keepMessage) setMsg('authStatus', '');
}
$('forgotLink').addEventListener('click', e => { e.preventDefault(); $('resetEmail').value = $('loginEmail').value; showMode('forgot'); });
$('forgotForm').addEventListener('submit', async e => {
  e.preventDefault();
  const step2 = !$('resetStep2').classList.contains('hidden');
  $('resetBtn').disabled = true;
  try {
    if (!step2) {
      setMsg('authStatus', 'Sending code...');
      const r = await server('learnerRequestReset', $('resetEmail').value);
      $('resetStep2').classList.remove('hidden'); $('resetEmail').disabled = true; $('resetBtn').textContent = 'Change password';
      setMsg('authStatus', r.message, 'success');
    } else {
      const r = await server('learnerResetPassword', $('resetEmail').value, $('resetCode').value, $('resetPassword').value);
      const email = $('resetEmail').value;
      $('forgotForm').reset(); $('resetBtn').textContent = 'Send reset code';
      showMode('login', true); $('loginEmail').value = email;
      setMsg('authStatus', r.message, 'success');
    }
  } catch (err) { setMsg('authStatus', err.message, 'error'); }
  finally { $('resetBtn').disabled = false; }
});
$('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('registerBtn').disabled = true;
  setMsg('authStatus', 'Creating your account\u2026');
  try {
    const r = await server('learnerRegister', { name: $('regName').value, email: $('regEmail').value, password: $('regPassword').value });
    const email = $('regEmail').value;
    $('registerForm').reset();
    showMode('login', true);
    $('loginEmail').value = email.trim();
    $('loginPassword').focus();
    setMsg('authStatus', (r && r.message) || 'Account created. Sign in now.', 'success');
  } catch (err) { setMsg('authStatus', err.message, 'error'); }
  finally { $('registerBtn').disabled = false; }
});
$('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('loginBtn').disabled = true;
  setMsg('authStatus', 'Signing in\u2026');
  try {
    const r = await server('learnerLogin', $('loginEmail').value, $('loginPassword').value);
    learnerToken = r.token; learnerName = r.name; saveSession();
    $('loginPassword').value = '';
    $('auth').classList.add('hidden');
    $('portal').classList.remove('hidden');
    $('welcome').textContent = 'Welcome, ' + learnerName;
    setMsg('authStatus', '');
    await loadCourses();
  } catch (err) { setMsg('authStatus', err.message, 'error'); }
  finally { $('loginBtn').disabled = false; }
});
function sessionExpired(err) { return /session has expired|sign in again/i.test(err.message || ''); }
function handleError(id, err) {
  if (sessionExpired(err)) { logout(err.message); return; }
  setMsg(id, err.message, 'error');
}
function renderProgress(courses, progress) {
  $('progressSummary').innerHTML = `<h3>Your progress</h3>${courses.map(c => {
    const p = progress.courses[c.id] || { total: 0, completed: 0 };
    const pct = p.total ? Math.round(p.completed / p.total * 100) : 0;
    return `<div class="course"><strong>${esc(c.title)}</strong><p class="muted">${p.completed} of ${p.total} lessons completed</p><div class="progressbar"><span style="width:${pct}%"></span></div></div>`;
  }).join('')}` + (progress.attempts.length ? `<h3>Recent quiz results</h3><div class="course">${progress.attempts.slice(0, 5).map(a => `<p>${esc(a.topic)} \u2014 ${a.score}/${a.total} (${a.percent}%) \u00B7 ${esc(a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '')}</p>`).join('')}</div>` : '');
}
var myCourses = [];
async function refreshProgress() {
  const progress = await server('learnerGetProgress', learnerToken);
  renderProgress(myCourses, progress);
  return progress;
}
async function loadCourses() {
  setMsg('courseStatus', 'Loading your courses\u2026');
  try {
    myCourses = await server('learnerMyCourses', learnerToken);
    const progress = await server('learnerGetProgress', learnerToken);
    setMsg('courseStatus', myCourses.length ? `${myCourses.length} enrolled course(s) found.` : 'No courses are assigned to your account yet. After your payment is verified, the academy will enrol you; then sign in again.', myCourses.length ? 'success' : '');
    renderProgress(myCourses, progress);
    $('courses').innerHTML = myCourses.map(c => `<article class="course" id="course-${esc(c.id)}"><h3>${esc(c.title)}</h3><p class="muted">${esc(c.category)} \u00B7 ${esc(c.level)}</p><p>${esc(c.description)}</p><div class="lessons" id="lessons-${esc(c.id)}"><p class="muted">Loading lessons\u2026</p></div><section><h4>Practice quiz</h4><div id="quiz-${esc(c.id)}"><button class="btn secondary" onclick="loadQuiz('${esc(c.id)}')">Load practice questions</button></div></section></article>`).join('');
    for (const c of myCourses) await loadLessons(c.id, (progress.courses[c.id] || {}).completedLessons || []);
  } catch (err) { handleError('courseStatus', err); }
}
function playerUrl(l) {
  let url = l.driveFileId ? 'https://drive.google.com/file/d/' + encodeURIComponent(l.driveFileId) + '/preview' : String(l.driveUrl || '');
  if (url.includes('drive.google.com/file/d/') && !url.endsWith('/preview')) url = url.replace(/\/(view|edit)(?:\?.*)?$/, '/preview');
  return /^https:\/\/(drive\.google\.com|docs\.google\.com)\//i.test(url) ? url : '';
}
async function loadLessons(courseId, completedIds) {
  const target = $('lessons-' + courseId);
  if (!target) return;
  try {
    const lessons = await server('learnerGetLessons', learnerToken, courseId);
    if (!lessons.length) { target.innerHTML = '<p class="muted">Lessons are being prepared for this course. Please check back soon.</p>'; return; }
    const done = new Set(completedIds || []);
    target.innerHTML = lessons.map(l => {
      const url = playerUrl(l);
      const player = url ? `<iframe loading="lazy" src="${esc(url)}" allow="autoplay" referrerpolicy="no-referrer" title="${esc(l.title)}"></iframe><p class="muted">Video playback requires internet and your Drive permission.</p>` : '<p class="muted">The lesson video has not been attached yet.</p>';
      const isDone = done.has(l.id);
      return `<div class="lesson"><h4>${esc(l.order)}. ${esc(l.title)}</h4><p>${esc(l.description)}</p>${player}<button class="btn secondary" id="done-${esc(l.id)}" ${isDone ? 'disabled' : ''} onclick="completeLesson('${esc(courseId)}','${esc(l.id)}')">${isDone ? '\u2713 Completed' : 'Mark lesson complete'}</button></div>`;
    }).join('');
  } catch (e) {
    if (sessionExpired(e)) { logout(e.message); return; }
    target.innerHTML = `<p class="status error">${esc(e.message)}</p>`;
  }
}
async function completeLesson(courseId, lessonId) {
  const btn = $('done-' + lessonId);
  if (btn) btn.disabled = true;
  try {
    const r = await server('learnerMarkLessonComplete', learnerToken, courseId, lessonId);
    if (btn) btn.textContent = '\u2713 Completed';
    setMsg('courseStatus', r.message, 'success');
    await refreshProgress();           // update progress only; do not reload videos/quizzes
  } catch (e) { if (btn) btn.disabled = false; handleError('courseStatus', e); }
}
async function loadQuiz(courseId) {
  const target = $('quiz-' + courseId);
  target.innerHTML = '<p class="muted">Loading quiz\u2026</p>';
  try {
    const qs = await server('learnerGetQuiz', learnerToken, courseId, '');
    if (!qs.length) { target.innerHTML = '<p class="muted">No published questions are available yet.</p>'; return; }
    target.dataset.questions = JSON.stringify(qs.map(q => ({ id: q.id })));
    target.innerHTML = `<form onsubmit="submitQuiz(event,'${esc(courseId)}')">${qs.map((q, i) => `<div class="question"><strong>${i + 1}. ${esc(q.question)}</strong>${q.options.map((o, j) => `<label><input required type="radio" name="q-${esc(q.id)}" value="${'ABCD'[j]}"> <span>${'ABCD'[j]}. ${esc(o)}</span></label>`).join('')}</div>`).join('')}<button class="btn" type="submit">Submit answers</button></form>`;
  } catch (e) { if (sessionExpired(e)) { logout(e.message); return; } target.innerHTML = `<p class="status error">${esc(e.message)}</p>`; }
}
async function submitQuiz(event, courseId) {
  event.preventDefault();
  const target = $('quiz-' + courseId);
  const submitBtn = event.target.querySelector('button[type=submit]');
  if (submitBtn) submitBtn.disabled = true;
  const qs = JSON.parse(target.dataset.questions || '[]');
  const answers = {};
  qs.forEach(q => { const picked = target.querySelector(`input[name="q-${CSS.escape(q.id)}"]:checked`); if (picked) answers[q.id] = picked.value; });
  try {
    const r = await server('learnerSubmitQuiz', learnerToken, courseId, '', answers);
    target.innerHTML = `<div class="status success"><strong>Score: ${r.score}/${r.total} (${r.percent}%)</strong></div>${r.details.map((d, i) => `<div class="question"><strong>${i + 1}. ${esc(d.question)}</strong><p>Your answer: ${esc(d.chosen || 'Not answered')} \u00B7 Correct answer: ${esc(d.correct)}</p><p>${esc(d.explanation)}</p></div>`).join('')}<button class="btn secondary" onclick="loadQuiz('${esc(courseId)}')">Try again</button>`;
    await refreshProgress();           // keep the result on screen; only refresh the summary
  } catch (e) { if (submitBtn) submitBtn.disabled = false; handleError('courseStatus', e); }
}
async function logout(message) {
  try { if (learnerToken) await server('learnerLogout', learnerToken); } catch (e) {}
  learnerToken = ''; learnerName = ''; myCourses = []; saveSession();
  $('portal').classList.add('hidden');
  $('auth').classList.remove('hidden');
  $('courses').innerHTML = ''; $('progressSummary').innerHTML = ''; setMsg('courseStatus', '');
  showMode('login', true);
  setMsg('authStatus', typeof message === 'string' ? message : 'You have signed out.', typeof message === 'string' ? 'error' : 'success');
}

function saveSession() {
  try { if (learnerToken) sessionStorage.setItem('scLearner', JSON.stringify({ t: learnerToken, n: learnerName })); else sessionStorage.removeItem('scLearner'); } catch (e) {}
}
(async function restoreSession() {
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem('scLearner') || 'null'); } catch (e) {}
  if (!saved || !saved.t) return;
  learnerToken = saved.t; learnerName = saved.n || '';
  $('auth').classList.add('hidden'); $('portal').classList.remove('hidden');
  $('welcome').textContent = 'Welcome, ' + learnerName;
  await loadCourses();
})();
// Render maths such as $x^2$ or \\(a^m \\times a^n\\) whenever lessons or quizzes are drawn.
(function setupMath() {
  let busy = false, timer = null;
  function run() {
    if (!window.renderMathInElement || busy) return;
    busy = true;
    try { renderMathInElement($('courses'), { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }, { left: '$', right: '$', display: false }], throwOnError: false }); } catch (e) {}
    setTimeout(() => { busy = false; }, 0);
  }
  new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(run, 60); }).observe($('courses'), { childList: true, subtree: true });
})();
