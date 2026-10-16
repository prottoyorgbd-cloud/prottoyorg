function checkSession() {
  var session = sessionStorage.getItem(STORAGE_KEYS.adminSession);
  if (session === "true") {
    document.getElementById("loginView").style.display = "none";
    document.getElementById("dashboardView").style.display = "block";
    renderAll();
  } else {
    document.getElementById("loginView").style.display = "block";
    document.getElementById("dashboardView").style.display = "none";
  }
}

var loginForm = document.getElementById("adminLoginForm");
if (loginForm) loginForm.addEventListener("submit", function(e){
  e.preventDefault();
  var email = document.getElementById("adminEmail").value.trim();
  var pass = document.getElementById("adminPassword").value;
  if (email === ADMIN_CREDENTIALS.email && pass === ADMIN_CREDENTIALS.password) {
    sessionStorage.setItem(STORAGE_KEYS.adminSession, "true");
    checkSession();
  } else {
    document.getElementById("loginError").textContent = "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।";
  }
});

var logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) logoutBtn.addEventListener("click", function(){
  sessionStorage.removeItem(STORAGE_KEYS.adminSession);
  checkSession();
});

document.querySelectorAll(".tab-btn").forEach(function(btn){
  btn.addEventListener("click", function(){
    document.querySelectorAll(".tab-btn").forEach(function(b){ b.classList.remove("active"); });
    document.querySelectorAll(".admin-panel").forEach(function(p){ p.classList.remove("active"); });
    btn.classList.add("active");
    document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
  });
});

function computeScores(p) {
  var feeScore = p.totalMonths > 0 ? Math.min(100, (p.feesPaid / p.totalMonths) * 100) : 0;
  var programScore = p.totalPrograms > 0 ? Math.min(100, (p.participated / p.totalPrograms) * 100) : 0;
  var overall = (feeScore * 0.5) + (programScore * 0.5);
  return { feeScore: feeScore, programScore: programScore, overall: overall };
}

/* ---------- নোটিশ ---------- */
function renderNotices() {
  var list = readStore(STORAGE_KEYS.notices, []);
  document.getElementById("noticeTable").innerHTML = list.map(function(n){
    return "<tr><td><b>" + n.title + "</b><br>" + n.body + "</td><td>" + fmtDate(n.date) + "</td><td>" +
      "<button class='btn-sm btn-danger' data-action='deleteNotice' data-id='" + n.id + "'>মুছুন</button></td></tr>";
  }).join("");
}

var noticeForm = document.getElementById("noticeForm");
if (noticeForm) noticeForm.addEventListener("submit", function(e){
  e.preventDefault();
  var list = readStore(STORAGE_KEYS.notices, []);
  list.push({
    id: uid(),
    title: document.getElementById("noticeTitle").value,
    body: document.getElementById("noticeBody").value,
    date: new Date().toISOString()
  });
  writeStore(STORAGE_KEYS.notices, list);
  noticeForm.reset();
  renderNotices();
});

/* ---------- কমিটি ---------- */
function renderCommittee() {
  var list = readStore(STORAGE_KEYS.committee, []).sort(function(a,b){ return (a.order||0)-(b.order||0); });
  document.getElementById("committeeTable").innerHTML = list.map(function(c){
    return "<tr><td>" + c.name + "</td><td>" + c.position + "</td><td>" + c.order + "</td><td>" +
      "<button class='btn-sm btn-danger' data-action='deleteCommittee' data-id='" + c.id + "'>মুছুন</button></td></tr>";
  }).join("");
}

var committeeForm = document.getElementById("committeeForm");
if (committeeForm) committeeForm.addEventListener("submit", function(e){
  e.preventDefault();
  var fileInput = document.getElementById("committeePhoto");
  var name = document.getElementById("committeeName").value;
  var position = document.getElementById("committeePosition").value;
  var order = Number(document.getElementById("committeeOrder").value);

  function save(photoData) {
    var list = readStore(STORAGE_KEYS.committee, []);
    list.push({ id: uid(), name: name, position: position, order: order, photo: photoData || "" });
    writeStore(STORAGE_KEYS.committee, list);
    committeeForm.reset();
    renderCommittee();
  }

  if (fileInput.files && fileInput.files[0]) {
    var reader = new FileReader();
    reader.onload = function(ev){ save(ev.target.result); };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    save("");
  }
});

/* ---------- রক্তদাতা অনুরোধ ---------- */
function renderDonorRequests() {
  var list = readStore(STORAGE_KEYS.donorRequests, []);
  document.getElementById("donorRequestTable").innerHTML = list.map(function(d){
    return "<tr><td>" + d.name + " (" + d.blood + ")</td><td>" + d.district + ", " + d.upazila + "</td><td>" + d.phone + "</td><td>" + d.status + "</td><td>" +
      "<button class='btn-sm btn-approve' data-action='approveDonor' data-id='" + d.id + "'>অনুমোদন</button> " +
      "<button class='btn-sm btn-danger' data-action='rejectDonor' data-id='" + d.id + "'>বাতিল</button></td></tr>";
  }).join("");
}

/* ---------- অনুমোদিত রক্তদাতা ---------- */
function renderDonors() {
  var list = readStore(STORAGE_KEYS.donors, []);
  document.getElementById("donorTable").innerHTML = list.map(function(d){
    return "<tr><td>" + d.name + " (" + d.blood + ")</td><td>" + d.district + ", " + d.upazila + "</td><td>" + d.phone + "</td><td>" + (d.available ? "উপলব্ধ" : "অনুপলব্ধ") + "</td><td>" +
      "<button class='btn-sm btn-approve' data-action='toggleAvailable' data-id='" + d.id + "'>টগল</button> " +
      "<button class='btn-sm btn-danger' data-action='deleteDonor' data-id='" + d.id + "'>মুছুন</button></td></tr>";
  }).join("");
}

/* ---------- রক্তের আবেদন ---------- */
function renderBloodRequests() {
  var list = readStore(STORAGE_KEYS.bloodRequests, []);
  document.getElementById("bloodRequestTable").innerHTML = list.map(function(r){
    return "<tr><td>" + r.patientName + " (" + r.blood + ")</td><td>" + r.hospital + "</td><td>" + r.district + ", " + r.upazila + "</td><td>" + r.phone + "</td><td>" +
      "<button class='btn-sm btn-danger' data-action='deleteBloodRequest' data-id='" + r.id + "'>মুছুন</button></td></tr>";
  }).join("");
}

/* ---------- পারফরম্যান্স ---------- */
function renderPerformance() {
  var list = readStore(STORAGE_KEYS.performance, []);
  document.getElementById("performanceTable").innerHTML = list.map(function(p){
    var s = computeScores(p);
    return "<tr><td>" + p.name + "</td><td>" + p.position + "</td><td>" + s.feeScore.toFixed(0) + "%</td><td>" + s.programScore.toFixed(0) + "%</td><td>" + s.overall.toFixed(0) + "%</td><td>" +
      "<button class='btn-sm btn-danger' data-action='deletePerformance' data-id='" + p.id + "'>মুছুন</button></td></tr>";
  }).join("");
}

var performanceForm = document.getElementById("performanceForm");
if (performanceForm) performanceForm.addEventListener("submit", function(e){
  e.preventDefault();
  var list = readStore(STORAGE_KEYS.performance, []);
  list.push({
    id: uid(),
    name: document.getElementById("perfName").value,
    position: document.getElementById("perfPosition").value,
    chairmanMonths: Number(document.getElementById("perfChairmanMonths").value),
    totalMonths: Number(document.getElementById("perfTotalMonths").value),
    feesPaid: Number(document.getElementById("perfFeesPaid").value),
    totalPrograms: Number(document.getElementById("perfTotalPrograms").value),
    participated: Number(document.getElementById("perfParticipated").value),
    membersAdded: Number(document.getElementById("perfMembersAdded").value)
  });
  writeStore(STORAGE_KEYS.performance, list);
  performanceForm.reset();
  renderPerformance();
});

/* ---------- সব action button একসাথে হ্যান্ডেল ---------- */
document.getElementById("dashboardView").addEventListener("click", function(e){
  var btn = e.target.closest("[data-action]");
  if (!btn) return;
  var action = btn.dataset.action;
  var id = btn.dataset.id;

  if (action === "deleteNotice") {
    writeStore(STORAGE_KEYS.notices, readStore(STORAGE_KEYS.notices, []).filter(function(n){ return n.id !== id; }));
    renderNotices();
  }

  if (action === "deleteCommittee") {
    writeStore(STORAGE_KEYS.committee, readStore(STORAGE_KEYS.committee, []).filter(function(c){ return c.id !== id; }));
    renderCommittee();
  }

  if (action === "approveDonor") {
    var reqs = readStore(STORAGE_KEYS.donorRequests, []);
    var found = reqs.find(function(r){ return r.id === id; });
    if (found) {
      var donors = readStore(STORAGE_KEYS.donors, []);
      donors.push({
        id: uid(), name: found.name, blood: found.blood,
        district: found.district, upazila: found.upazila,
        phone: found.phone, available: true
      });
      writeStore(STORAGE_KEYS.donors, donors);
      writeStore(STORAGE_KEYS.donorRequests, reqs.filter(function(r){ return r.id !== id; }));
    }
    renderDonorRequests();
    renderDonors();
  }

  if (action === "rejectDonor") {
    writeStore(STORAGE_KEYS.donorRequests, readStore(STORAGE_KEYS.donorRequests, []).filter(function(r){ return r.id !== id; }));
    renderDonorRequests();
  }

  if (action === "toggleAvailable") {
    var donors2 = readStore(STORAGE_KEYS.donors, []);
    donors2.forEach(function(d){ if (d.id === id) d.available = !d.available; });
    writeStore(STORAGE_KEYS.donors, donors2);
    renderDonors();
  }

  if (action === "deleteDonor") {
    writeStore(STORAGE_KEYS.donors, readStore(STORAGE_KEYS.donors, []).filter(function(d){ return d.id !== id; }));
    renderDonors();
  }

  if (action === "deleteBloodRequest") {
    writeStore(STORAGE_KEYS.bloodRequests, readStore(STORAGE_KEYS.bloodRequests, []).filter(function(r){ return r.id !== id; }));
    renderBloodRequests();
  }

  if (action === "deletePerformance") {
    writeStore(STORAGE_KEYS.performance, readStore(STORAGE_KEYS.performance, []).filter(function(p){ return p.id !== id; }));
    renderPerformance();
  }
});

function renderAll() {
  renderNotices();
  renderCommittee();
  renderDonorRequests();
  renderDonors();
  renderBloodRequests();
  renderPerformance();
}

checkSession();