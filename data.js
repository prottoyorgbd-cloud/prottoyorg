const STORAGE_KEYS = {
  notices: "prottoy_notices",
  committee: "prottoy_committee",
  donors: "prottoy_donors",
  donorRequests: "prottoy_donor_requests",
  bloodRequests: "prottoy_blood_requests",
  performance: "prottoy_performance",
  users: "prottoy_users",
  adminSession: "prottoy_admin_session"
};

const ADMIN_CREDENTIALS = {
  email: "prottoyorg.bd@gmail.com",
  password: "RafiRafi"
};

function readStore(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : (fallback || []);
  } catch (e) {
    return fallback || [];
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function fmtDate(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  var months = ["জানুয়ারি","ফেব্রুয়ারি","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্টেম্বর","অক্টোবর","নভেম্বর","ডিসেম্বর"];
  return d.getDate() + " " + months[d.getMonth()] + ", " + d.getFullYear();
}

function seedDefaults() {
  if (!localStorage.getItem(STORAGE_KEYS.notices)) {
    writeStore(STORAGE_KEYS.notices, [
      { id: uid(), title: "মাসিক সভার নোটিশ", body: "আগামী মাসের সাধারণ সভা অনুষ্ঠিত হবে। সকল সদস্যকে উপস্থিত থাকার অনুরোধ করা হলো।", date: new Date().toISOString() },
      { id: uid(), title: "রক্তদান কর্মসূচি", body: "আগামী শুক্রবার রক্তদান কর্মসূচি অনুষ্ঠিত হবে।", date: new Date().toISOString() }
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.committee)) {
    writeStore(STORAGE_KEYS.committee, [
      { id: uid(), name: "শাহজাহান আজাদ", position: "পরিচালক", photo: "", order: 1 },
      { id: uid(), name: "শাহাদাত হোসেন", position: "পরিচালক", photo: "", order: 2 },
      { id: uid(), name: "জোবাইদ রাফি", position: "পরিচালক", photo: "", order: 3 }
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.donors)) {
    writeStore(STORAGE_KEYS.donors, [
      { id: uid(), name: "নমুনা দাতা ১", blood: "O+", district: "কুমিল্লা", upazila: "নাঙ্গলকোট", phone: "01700000000", available: true },
      { id: uid(), name: "নমুনা দাতা ২", blood: "B+", district: "কুমিল্লা", upazila: "নাঙ্গলকোট", phone: "01800000000", available: true }
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.donorRequests)) writeStore(STORAGE_KEYS.donorRequests, []);
  if (!localStorage.getItem(STORAGE_KEYS.bloodRequests)) writeStore(STORAGE_KEYS.bloodRequests, []);
  if (!localStorage.getItem(STORAGE_KEYS.performance)) writeStore(STORAGE_KEYS.performance, []);
  if (!localStorage.getItem(STORAGE_KEYS.users)) writeStore(STORAGE_KEYS.users, []);
}

seedDefaults();