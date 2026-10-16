document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());

var menuToggle = document.getElementById("menuToggle");
var navLinks = document.getElementById("navLinks");
if (menuToggle) menuToggle.addEventListener("click", function(){ navLinks.classList.toggle("show"); });

var backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", function(){
  if (backToTop) backToTop.style.display = window.scrollY > 400 ? "block" : "none";
});
if (backToTop) backToTop.addEventListener("click", function(){ window.scrollTo({top:0,behavior:"smooth"}); });

var revealEls = document.querySelectorAll(".committee-card, .form-card-link, .section");
var io = new IntersectionObserver(function(entries){
  entries.forEach(function(en){ if (en.isIntersecting) en.target.style.opacity = 1; });
}, {threshold:.1});
revealEls.forEach(function(el){ el.style.opacity = 1; io.observe(el); });

function validate(input, condition, message) {
  var err = input.parentElement.querySelector(".error-msg");
  if (!condition) {
    if (!err) {
      err = document.createElement("div");
      err.className = "error-msg";
      input.parentElement.appendChild(err);
    }
    err.textContent = message;
    return false;
  } else {
    if (err) err.remove();
    return true;
  }
}

function renderNotices() {
  var grid = document.getElementById("noticeGrid");
  if (!grid) return;
  var list = readStore(STORAGE_KEYS.notices, []).sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
  var countEl = document.getElementById("noticeCount");
  if (countEl) countEl.textContent = "(" + list.length + ")";
  grid.innerHTML = list.map(function(n){
    return "<div class='card'><h3>" + n.title + "</h3><p>" + n.body + "</p><small>" + fmtDate(n.date) + "</small></div>";
  }).join("");
}

function renderCommittee() {
  var grid = document.getElementById("committeeGrid");
  if (!grid) return;
  var list = readStore(STORAGE_KEYS.committee, []).sort(function(a,b){ return (a.order||0)-(b.order||0); });
  grid.innerHTML = list.map(function(c){
    var photo = c.photo ? c.photo : "https://via.placeholder.com/120?text=Photo";
    return "<div class='committee-card'><img class='committee-photo' src='" + photo + "'><h3>" + c.name + "</h3><p>" + c.position + "</p></div>";
  }).join("");
}

function populateLocationFilters() {
  var donors = readStore(STORAGE_KEYS.donors, []);
  var districtSel = document.getElementById("filterDistrict");
  if (!districtSel) return;
  var districts = Array.from(new Set(donors.map(function(d){ return d.district; })));
  districtSel.innerHTML = "<option value=''>সব জেলা</option>" + districts.map(function(d){ return "<option value='" + d + "'>" + d + "</option>"; }).join("");
}

function renderDonors() {
  var grid = document.getElementById("donorGrid");
  if (!grid) return;
  var donors = readStore(STORAGE_KEYS.donors, []);
  var search = (document.getElementById("searchDonor") || {}).value || "";
  var blood = (document.getElementById("filterBlood") || {}).value || "";
  var district = (document.getElementById("filterDistrict") || {}).value || "";
  var onlyAvailable = (document.getElementById("filterAvailable") || {}).checked;
  var filtered = donors.filter(function(d){
    var matchSearch = d.name.toLowerCase().indexOf(search.toLowerCase()) !== -1;
    var matchBlood = blood ? d.blood === blood : true;
    var matchDistrict = district ? d.district === district : true;
    var matchAvail = onlyAvailable ? d.available : true;
    return matchSearch && matchBlood && matchDistrict && matchAvail;
  });
  var countEl = document.getElementById("resultCount");
  if (countEl) countEl.textContent = filtered.length;
  var donorCountEl = document.getElementById("donorCount");
  if (donorCountEl) donorCountEl.textContent = donors.length;
  var empty = document.getElementById("emptyState");
  if (empty) empty.classList.toggle("hidden", filtered.length > 0);
  grid.innerHTML = filtered.map(function(d){
    return "<div class='card'><h3>" + d.name + " (" + d.blood + ")</h3><p>" + d.district + ", " + d.upazila + "</p><p>📞 " + d.phone + "</p><p>" + (d.available ? "✅ উপলব্ধ" : "❌ অনুপলব্ধ") + "</p></div>";
  }).join("");
}

["searchDonor","filterBlood","filterDistrict","filterAvailable"].forEach(function(id){
  var el = document.getElementById(id);
  if (el) el.addEventListener("input", renderDonors);
  if (el) el.addEventListener("change", renderDonors);
});

var requestForm = document.getElementById("requestForm");
if (requestForm) requestForm.addEventListener("submit", function(e){
  e.preventDefault();
  var fd = new FormData(requestForm);
  var entry = {
    id: uid(),
    patientName: fd.get("patientName"),
    blood: fd.get("blood"),
    hospital: fd.get("hospital"),
    district: fd.get("district"),
    upazila: fd.get("upazila"),
    phone: fd.get("phone"),
    dateNeeded: fd.get("dateNeeded"),
    status: "pending",
    date: new Date().toISOString()
  };
  var list = readStore(STORAGE_KEYS.bloodRequests, []);
  list.push(entry);
  writeStore(STORAGE_KEYS.bloodRequests, list);
  alert("আপনার আবেদন গ্রহণ করা হয়েছে। প্রত্যয় টিম শীঘ্রই যোগাযোগ করবে।");
  requestForm.reset();
});

var donorForm = document.getElementById("donorForm");
if (donorForm) donorForm.addEventListener("submit", function(e){
  e.preventDefault();
  var consent = donorForm.querySelector("[name=consent]");
  if (consent && !consent.checked) { alert("সম্মতি প্রদান আবশ্যক"); return; }
  var fd = new FormData(donorForm);
  var entry = {
    id: uid(),
    name: fd.get("name"),
    blood: fd.get("blood"),
    phone: fd.get("phone"),
    district: fd.get("district"),
    upazila: fd.get("upazila"),
    age: fd.get("age"),
    status: "pending",
    date: new Date().toISOString()
  };
  var list = readStore(STORAGE_KEYS.donorRequests, []);
  list.push(entry);
  writeStore(STORAGE_KEYS.donorRequests, list);
  alert("আপনার অনুরোধ জমা হয়েছে। এডমিন অনুমোদনের পর তালিকায় দেখা যাবে।");
  donorForm.reset();
});

var contactForm = document.getElementById("contactForm");
if (contactForm) contactForm.addEventListener("submit", function(e){
  e.preventDefault();
  alert("ধন্যবাদ! আপনার বার্তা পাঠানো হয়েছে।");
  contactForm.reset();
});

renderNotices();
renderCommittee();
populateLocationFilters();
renderDonors();