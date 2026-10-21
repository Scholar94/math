/* Scholar's Camp Mathematics Academy - learner portal */
var learnerToken = '', learnerName = '', myCourses = [], timers = {};
var $ = function (id) { return document.getElementById(id); };
function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function setMsg(id, msg, type) { $(id).innerHTML = msg ? '<div class="status ' + (type || '') + '">' + esc(msg) + '</div>' : ''; }
var server = apiCall;

/* ---------- sign in / register / forgot ---------- */
function showMode(mode, keepMessage) {
  var titles = { login: 'Learner sign in', register: 'Create learner account', forgot: 'Reset your password' };
  $('authTitle').textContent = titles[mode] || titles.login;
  $('registerForm').classList.toggle('hidden', mode !== 'register');
  $('loginForm').classList.toggle('hidden', mode !== 'login');
  $('forgotForm').classList.toggle('hidden', mode !== 'forgot');
  if (mode === 'forgot') { $('resetStep2').classList.add('hidden'); $('resetEmail').disabled = false; $('resetBtn').textContent = 'Send reset code'; }
  if (!keepMessage) setMsg('authStatus', '');
}
$('forgotLink').addEventListener('click', function (e) { e.preventDefault(); $('resetEmail').value = $('loginEmail').value; showMode('forgot'); });
$('forgotForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  var step2 = !$('resetStep2').classList.contains('hidden');
  $('resetBtn').disabled = true;
  try {
    if (!step2) {
      setMsg('authStatus', 'Sending code...');
      var r = await server('learnerRequestReset', $('resetEmail').value);
      $('resetStep2').classList.remove('hidden'); $('resetEmail').disabled = true; $('resetBtn').textContent = 'Change password';
      setMsg('authStatus', r.message, 'success');
    } else {
      var r2 = await server('learnerResetPassword', $('resetEmail').value, $('resetCode').value, $('resetPassword').value);
      var email = $('resetEmail').value;
      $('forgotForm').reset();
      showMode('login', true); $('loginEmail').value = email;
      setMsg('authStatus', r2.message, 'success');
    }
  } catch (err) { setMsg('authStatus', err.message, 'error'); }
  finally { $('resetBtn').disabled = false; }
});
$('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  $('registerBtn').disabled = true;
  setMsg('authStatus', 'Creating your account...');
  try {
    var r = await server('learnerRegister', { name: $('regName').value, email: $('regEmail').value, password: $('regPassword').value });
    var email = $('regEmail').value;
    $('registerForm').reset();
    showMode('login', true);
    $('loginEmail').value = email.trim();
    $('loginPassword').focus();
    setMsg('authStatus', (r && r.message) || 'Account created. Sign in now.', 'success');
  } catch (err) { setMsg('authStatus', err.message, 'error'); }
  finally { $('registerBtn').disabled = false; }
});
$('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  $('loginBtn').disabled = true;
  setMsg('authStatus', 'Signing in...');
  try {
    var r = await server('learnerLogin', $('loginEmail').value, $('loginPassword').value);
    learnerToken = r.token; learnerName = r.name; saveSession();
    $('loginPassword').value = '';
    enterPortal();
  } catch (err) { setMsg('authStatus', err.message, 'error'); }
  finally { $('loginBtn').disabled = false; }
});
function enterPortal() {
  $('auth').classList.add('hidden');
  $('portal').classList.remove('hidden');
  $('welcome').textContent = 'Welcome, ' + learnerName;
  setMsg('authStatus', '');
  return loadAll();
}
function saveSession() {
  try { if (learnerToken) sessionStorage.setItem('scLearner', JSON.stringify({ t: learnerToken, n: learnerName })); else sessionStorage.removeItem('scLearner'); } catch (e) {}
}
function sessionExpired(err) { return /session has expired|sign in again/i.test((err && err.message) || ''); }
function handleError(id, err) {
  if (sessionExpired(err)) { logout(err.message); return; }
  setMsg(id, err.message, 'error');
}
async function logout(message) {
  Object.keys(timers).forEach(function (k) { clearInterval(timers[k]); }); timers = {};
  try { if (learnerToken) await server('learnerLogout', learnerToken); } catch (e) {}
  learnerToken = ''; learnerName = ''; myCourses = []; saveSession();
  $('portal').classList.add('hidden');
  $('auth').classList.remove('hidden');
  $('courses').innerHTML = ''; $('progressSummary').innerHTML = ''; $('stats').innerHTML = ''; $('announcements').innerHTML = ''; $('leaderboard').innerHTML = '';
  setMsg('courseStatus', '');
  showMode('login', true);
  var isMsg = typeof message === 'string';
  setMsg('authStatus', isMsg ? message : 'You have signed out.', isMsg ? 'error' : 'success');
}

/* ---------- loading everything ---------- */
async function loadAll() {
  loadAnnouncements();
  await loadCourses();
}
async function loadAnnouncements() {
  try {
    var items = await server('learnerAnnouncements', learnerToken);
    $('announcements').innerHTML = items.map(function (a) {
      return '<div class="announce"><strong>' + esc(a.subject) + '</strong><p>' + esc(a.message).replace(/\n/g, '<br>') + '</p><span class="muted">' + esc(a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '') + '</span></div>';
    }).join('');
  } catch (e) { if (sessionExpired(e)) logout(e.message); }
}
function renderStats(progress) {
  var s = progress.streak || { current: 0, best: 0 };
  $('stats').innerHTML =
    '<div class="stat"><span class="big">' + s.current + '</span><span>day streak' + (s.activeToday ? ' &#10003; today' : '') + '</span><small>Best: ' + s.best + ' day(s)</small></div>' +
    '<div class="stat"><span class="big">' + (progress.points || 0) + '</span><span>points</span><small>10 per lesson, up to 10 per quiz topic</small></div>' +
    '<div class="stat"><button class="btn secondary" onclick="toggleLeaderboard()">Leaderboard</button><small>See how you rank</small></div>';
}
function bar(pct, cls) { return '<div class="progressbar"><span class="' + (cls || '') + '" style="width:' + Math.max(0, Math.min(100, pct)) + '%"></span></div>'; }
function renderProgress(progress) {
  var html = '<h3>Your progress</h3>' + myCourses.map(function (c) {
    var p = progress.courses[c.id] || { total: 0, completed: 0 };
    var pct = p.total ? Math.round(p.completed / p.total * 100) : 0;
    return '<div class="course"><strong>' + esc(c.title) + '</strong><p class="muted">' + p.completed + ' of ' + p.total + ' lessons completed (' + pct + '%)</p>' + bar(pct) + '</div>';
  }).join('');
  var weak = progress.weakTopics || [];
  if (weak.length) {
    html += '<h3>Quiz strengths and weak spots</h3><div class="course">' + weak.slice(0, 8).map(function (w) {
      return '<div class="topicrow"><span>' + esc(w.topic) + '</span><span class="muted">' + w.percent + '% of ' + w.answered + ' answered</span>' + bar(w.percent, w.percent < 50 ? 'warn' : '') + '</div>';
    }).join('') + '<p class="muted">Topics at the top need the most practice.</p></div>';
  }
  if ((progress.attempts || []).length) {
    html += '<h3>Recent quiz results</h3><div class="course">' + progress.attempts.slice(0, 5).map(function (a) {
      return '<p>' + esc(a.topic) + ' - ' + a.score + '/' + a.total + ' (' + a.percent + '%) &middot; ' + esc(a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : '') + '</p>';
    }).join('') + '</div>';
  }
  $('progressSummary').innerHTML = html;
  renderStats(progress);
  myCourses.forEach(function (c) { updateCertBox(c.id, progress); });
}
async function refreshProgress() {
  var progress = await server('learnerGetProgress', learnerToken);
  renderProgress(progress);
  return progress;
}
async function loadCourses() {
  setMsg('courseStatus', 'Loading your courses...');
  try {
    myCourses = await server('learnerMyCourses', learnerToken);
    setMsg('courseStatus', myCourses.length ? myCourses.length + ' enrolled course(s) found.' : 'No courses are assigned to your account yet. After your payment is verified, the academy will enrol you; then sign in again.', myCourses.length ? 'success' : '');
    $('courses').innerHTML = myCourses.map(function (c) {
      return '<article class="course" id="course-' + esc(c.id) + '"><h3>' + esc(c.title) + '</h3><p class="muted">' + esc(c.category) + ' &middot; ' + esc(c.level) + '</p><p>' + esc(c.description) + '</p>' +
        '<div class="lessons" id="lessons-' + esc(c.id) + '"><p class="muted">Loading lessons...</p></div>' +
        '<section class="certbox" id="cert-' + esc(c.id) + '"></section>' +
        '<section><h4>Practice quiz</h4><div id="quiz-' + esc(c.id) + '"><p class="muted">Loading...</p></div></section></article>';
    }).join('');
    var progress = await server('learnerGetProgress', learnerToken);
    renderProgress(progress);
    for (var i = 0; i < myCourses.length; i++) {
      var c = myCourses[i];
      await loadLessons(c.id, (progress.courses[c.id] || {}).completedLessons || []);
      await loadQuizMenu(c.id);
    }
  } catch (err) { handleError('courseStatus', err); }
}

/* ---------- lessons ---------- */
function playerHtml(l) {
  if (l.youtubeId && /^[A-Za-z0-9_-]{11}$/.test(l.youtubeId)) {
    return '<iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(l.youtubeId) + '?rel=0" title="' + esc(l.title) + '" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
  }
  var url = l.driveFileId ? 'https://drive.google.com/file/d/' + encodeURIComponent(l.driveFileId) + '/preview' : String(l.driveUrl || '');
  if (url.indexOf('drive.google.com/file/d/') >= 0 && !/\/preview$/.test(url)) url = url.replace(/\/(view|edit)(\?.*)?$/, '/preview');
  if (/^https:\/\/(drive\.google\.com|docs\.google\.com)\//i.test(url)) {
    return '<iframe loading="lazy" src="' + esc(url) + '" allow="autoplay" referrerpolicy="no-referrer" title="' + esc(l.title) + '"></iframe><p class="muted">Drive video: playback needs internet and the Google account the academy shared it with.</p>';
  }
  return '<p class="muted">The lesson video has not been attached yet.</p>';
}
async function loadLessons(courseId, completedIds) {
  var target = $('lessons-' + courseId);
  if (!target) return;
  try {
    var lessons = await server('learnerGetLessons', learnerToken, courseId);
    if (!lessons.length) { target.innerHTML = '<p class="muted">Lessons are being prepared for this course. Please check back soon.</p>'; return; }
    var done = {}; (completedIds || []).forEach(function (id) { done[id] = true; });
    target.innerHTML = lessons.map(function (l) {
      var isDone = !!done[l.id];
      var notes = l.notesUrl && /^https:\/\//i.test(l.notesUrl) ? '<p><a class="btn secondary" href="' + esc(l.notesUrl) + '" target="_blank" rel="noopener noreferrer">&#128196; Notes / worksheet</a></p>' : '';
      var written = l.hasNotesText ? '<p><a class="btn secondary" href="notes.html?course=' + encodeURIComponent(courseId) + '&lesson=' + encodeURIComponent(l.id) + '">&#128424; Print notes (PDF)</a></p>' : '';
      return '<div class="lesson"><h4>' + esc(l.order) + '. ' + esc(l.title) + '</h4><p>' + esc(l.description) + '</p>' + playerHtml(l) + notes + written +
        '<button class="btn secondary" id="done-' + esc(l.id) + '" ' + (isDone ? 'disabled' : '') + ' onclick="completeLesson(\'' + esc(courseId) + '\',\'' + esc(l.id) + '\')">' + (isDone ? '&#10003; Completed' : 'Mark lesson complete') + '</button></div>';
    }).join('');
  } catch (e) {
    if (sessionExpired(e)) { logout(e.message); return; }
    target.innerHTML = '<p class="status error">' + esc(e.message) + '</p>';
  }
}
async function completeLesson(courseId, lessonId) {
  var btn = $('done-' + lessonId);
  if (btn) btn.disabled = true;
  try {
    var r = await server('learnerMarkLessonComplete', learnerToken, courseId, lessonId);
    if (btn) btn.innerHTML = '&#10003; Completed';
    setMsg('courseStatus', r.message, 'success');
    await refreshProgress();
  } catch (e) { if (btn) btn.disabled = false; handleError('courseStatus', e); }
}

/* ---------- certificates ---------- */
function updateCertBox(courseId, progress) {
  var box = $('cert-' + courseId);
  if (!box) return;
  var id = (progress.certificates || {})[courseId];
  box.innerHTML = id
    ? '<a class="btn" href="certificate.html?id=' + encodeURIComponent(id) + '" target="_blank" rel="noopener">&#127891; View / print my certificate</a> <button class="btn secondary" onclick="emailCertificate(\'' + esc(courseId) + '\')">&#9993; Email me a PDF copy</button> <span class="muted">Certificate no. ' + esc(id) + '</span><span id="certmsg-' + esc(courseId) + '"></span>'
    : '<button class="btn secondary" onclick="getCertificate(\'' + esc(courseId) + '\')">&#127891; Get my certificate</button><span id="certmsg-' + esc(courseId) + '"></span>';
}
async function emailCertificate(courseId) {
  var msg = $('certmsg-' + courseId);
  msg.innerHTML = '<span class="muted"> Sending...</span>';
  try { var r = await server('learnerEmailCertificate', learnerToken, courseId); msg.innerHTML = '<div class="status success">' + esc(r.message) + '</div>'; }
  catch (e) { if (sessionExpired(e)) { logout(e.message); return; } msg.innerHTML = '<div class="status error">' + esc(e.message) + '</div>'; }
}
async function getCertificate(courseId) {
  var msg = $('certmsg-' + courseId);
  msg.innerHTML = '<span class="muted"> Checking...</span>';
  try {
    await server('learnerCertificate', learnerToken, courseId);
    await refreshProgress();   // the button becomes a "View / print my certificate" link (no pop-up, so phones do not block it)
    setMsg('courseStatus', 'Congratulations! Your certificate is ready. Use the "View / print my certificate" button.', 'success');
  } catch (e) {
    if (sessionExpired(e)) { logout(e.message); return; }
    msg.innerHTML = '<div class="status error">' + esc(e.message) + '</div>';
  }
}

/* ---------- quizzes ---------- */
async function loadQuizMenu(courseId) {
  var target = $('quiz-' + courseId);
  if (!target) return;
  if (timers[courseId]) { clearInterval(timers[courseId]); delete timers[courseId]; }
  try {
    var topics = await server('learnerQuizTopics', learnerToken, courseId);
    if (!topics.length) { target.innerHTML = '<p class="muted">No published practice questions yet.</p>'; return; }
    var total = topics.reduce(function (s, t) { return s + t.count; }, 0);
    target.innerHTML = '<div class="quizmenu"><div><label for="qt-' + esc(courseId) + '">Topic</label><select id="qt-' + esc(courseId) + '"><option value="">All topics (' + total + ' questions)</option>' +
      topics.map(function (t) { return '<option value="' + esc(t.topic) + '">' + esc(t.topic) + ' (' + t.count + ')</option>'; }).join('') + '</select></div>' +
      '<div><label for="qn-' + esc(courseId) + '">Questions</label><input id="qn-' + esc(courseId) + '" type="number" min="1" max="50" value="' + Math.min(10, total) + '"></div>' +
      '<div class="checkrow"><input id="qm-' + esc(courseId) + '" type="checkbox" checked><label for="qm-' + esc(courseId) + '">Timed (1 minute per question)</label></div>' +
      '<div><button class="btn" onclick="startQuiz(\'' + esc(courseId) + '\')">Start quiz</button> <button class="btn secondary" type="button" onclick="openWorksheet(\'' + esc(courseId) + '\')">&#128424; Printable worksheet</button></div></div><div id="qmsg-' + esc(courseId) + '"></div>';
  } catch (e) { if (sessionExpired(e)) { logout(e.message); return; } target.innerHTML = '<p class="status error">' + esc(e.message) + '</p>'; }
}
function openWorksheet(courseId) {
  var topic = $('qt-' + courseId).value, n = Math.min(30, Math.max(1, Number($('qn-' + courseId).value) || 15));
  window.location.href = 'worksheet.html?course=' + encodeURIComponent(courseId) + '&topic=' + encodeURIComponent(topic) + '&n=' + n;   /* same tab: the sign-in lives in this tab's sessionStorage */
}
function fmtTime(sec) { sec = Math.max(0, sec); var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
async function startQuiz(courseId) {
  var target = $('quiz-' + courseId);
  var topic = $('qt-' + courseId).value, count = Number($('qn-' + courseId).value) || 10, timed = $('qm-' + courseId).checked;
  try {
    var q = await server('learnerStartQuiz', learnerToken, courseId, topic, count, timed);
    var endAt = q.timeLimitSeconds ? Date.now() + q.timeLimitSeconds * 1000 : 0;
    target.dataset.quizToken = q.quizToken;
    target.dataset.questions = JSON.stringify(q.questions.map(function (x) { return x.id; }));
    target.innerHTML = '<form onsubmit="return false" id="qf-' + esc(courseId) + '">' +
      '<div class="quizhead"><strong>' + esc(q.topic) + ' &middot; ' + q.questions.length + ' question(s)</strong>' + (endAt ? '<span class="timer" id="qt2-' + esc(courseId) + '">' + fmtTime(q.timeLimitSeconds) + '</span>' : '') + '</div>' +
      q.questions.map(function (x, i) {
        return '<div class="question"><strong>' + (i + 1) + '. ' + esc(x.question) + '</strong>' + x.options.map(function (o, j) {
          return '<label><input type="radio" name="q-' + esc(x.id) + '" value="' + 'ABCD'[j] + '"> <span>' + 'ABCD'[j] + '. ' + esc(o) + '</span></label>';
        }).join('') + '</div>';
      }).join('') + '<button class="btn" type="submit" id="qs-' + esc(courseId) + '">Submit answers</button></form>';
    $('qf-' + courseId).addEventListener('submit', function (e) { e.preventDefault(); submitQuiz(courseId); });
    if (endAt) {
      timers[courseId] = setInterval(function () {
        var left = Math.round((endAt - Date.now()) / 1000), el = $('qt2-' + courseId);
        if (el) { el.textContent = fmtTime(left); el.classList.toggle('low', left <= 30); }
        if (left <= 0) { clearInterval(timers[courseId]); delete timers[courseId]; submitQuiz(courseId); }
      }, 500);
    }
  } catch (e) {
    if (sessionExpired(e)) { logout(e.message); return; }
    $('qmsg-' + courseId).innerHTML = '<div class="status error">' + esc(e.message) + '</div>';
  }
}
async function submitQuiz(courseId) {
  var target = $('quiz-' + courseId);
  var token = target.dataset.quizToken;
  if (!token || target.dataset.busy === '1') return;
  target.dataset.busy = '1';
  if (timers[courseId]) { clearInterval(timers[courseId]); delete timers[courseId]; }
  var btn = $('qs-' + courseId); if (btn) btn.disabled = true;
  var ids = JSON.parse(target.dataset.questions || '[]'), answers = {};
  ids.forEach(function (id) { var p = target.querySelector('input[name="q-' + CSS.escape(id) + '"]:checked'); if (p) answers[id] = p.value; });
  try {
    var r = await server('learnerFinishQuiz', learnerToken, token, answers);
    delete target.dataset.quizToken;
    var topics = Object.keys(r.byTopic || {}).map(function (t) { return '<li>' + esc(t) + ': ' + r.byTopic[t][0] + '/' + r.byTopic[t][1] + '</li>'; }).join('');
    target.innerHTML = '<div class="status ' + (r.percent >= 50 ? 'success' : 'error') + '"><strong>Score: ' + r.score + '/' + r.total + ' (' + r.percent + '%)</strong></div>' +
      (topics ? '<ul class="topiclist">' + topics + '</ul>' : '') +
      r.details.map(function (d, i) {
        return '<div class="question"><strong>' + (i + 1) + '. ' + esc(d.question) + '</strong><p>Your answer: ' + esc(d.chosen || 'Not answered') + ' &middot; Correct answer: ' + esc(d.correct) + '</p><p>' + esc(d.explanation) + '</p></div>';
      }).join('') + '<button class="btn secondary" onclick="loadQuizMenu(\'' + esc(courseId) + '\')">Try another quiz</button>';
    delete target.dataset.busy;
    await refreshProgress();
  } catch (e) {
    delete target.dataset.busy; delete target.dataset.quizToken;
    if (sessionExpired(e)) { logout(e.message); return; }
    target.innerHTML = '<div class="status error">' + esc(e.message) + '</div><button class="btn secondary" onclick="loadQuizMenu(\'' + esc(courseId) + '\')">Back to quiz menu</button>';
  }
}

/* ---------- leaderboard ---------- */
async function toggleLeaderboard() {
  var box = $('leaderboard');
  if (box.innerHTML) { box.innerHTML = ''; return; }
  box.innerHTML = '<p class="muted">Loading leaderboard...</p>';
  try {
    var lb = await server('learnerLeaderboard', learnerToken);
    box.innerHTML = '<div class="panel"><h3>Leaderboard</h3>' + (lb.top.length ? '<ol class="lb">' + lb.top.map(function (x) {
      return '<li class="' + (x.you ? 'you' : '') + '"><span>' + esc(x.name) + '</span><strong>' + x.points + ' pts</strong></li>';
    }).join('') + '</ol>' : '<p class="muted">Complete lessons and quizzes to appear here.</p>') +
      '<p class="muted">Your rank: ' + (lb.me.rank || '-') + ' &middot; ' + lb.me.points + ' points. Others see only your first name and last initial.</p>' +
      '<div class="checkrow"><input type="checkbox" id="lbHide" ' + (lb.me.hidden ? 'checked' : '') + '><label for="lbHide">Hide me from the leaderboard</label></div></div>';
    $('lbHide').addEventListener('change', async function () {
      try { var r = await server('learnerSetLeaderboardHidden', learnerToken, $('lbHide').checked); setMsg('courseStatus', r.message, 'success'); } catch (e) { handleError('courseStatus', e); }
    });
  } catch (e) { box.innerHTML = ''; handleError('courseStatus', e); }
}

/* ---------- maths (KaTeX) ---------- */
(function setupMath() {
  var busy = false, timer = null;
  function run() {
    if (!window.renderMathInElement || busy) return;
    busy = true;
    try { renderMathInElement($('portal'), { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }, { left: '$', right: '$', display: false }], throwOnError: false }); } catch (e) {}
    setTimeout(function () { busy = false; }, 0);
  }
  new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(run, 60); }).observe($('portal'), { childList: true, subtree: true });
})();

/* ---------- restore session after a refresh ---------- */
(async function restoreSession() {
  var saved = null;
  try { saved = JSON.parse(sessionStorage.getItem('scLearner') || 'null'); } catch (e) {}
  if (!saved || !saved.t) return;
  learnerToken = saved.t; learnerName = saved.n || '';
  await enterPortal();
})();
