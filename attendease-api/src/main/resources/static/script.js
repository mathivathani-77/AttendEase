const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let classrooms = [], marks = {}, markStudents = [];

function toast(msg, err) {
  const t = $("toast"); t.textContent = msg; t.className = "show" + (err ? " err" : "");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.className = "", 2500);
}
async function api(path, body) {
  const opt = body ? {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)} : {};
  const r = await fetch(path, opt);
  if (!r.ok) throw new Error("Request failed (" + r.status + ")");
  return r.json();
}

document.querySelectorAll("nav button").forEach(b => b.onclick = () => {
  document.querySelectorAll("nav button").forEach(x => x.setAttribute("aria-selected", x === b));
  document.querySelectorAll("section").forEach(s => s.classList.toggle("on", s.id === b.dataset.tab));
});

async function loadClassrooms() {
  try { classrooms = await api("/api/classrooms"); }
  catch (e) { return toast("Cannot reach the server. Is the app running?", true); }
  const opts = classrooms.length
    ? classrooms.map(c => `<option value="${c.id}">${esc(c.name)} (${esc(c.teacherName)})</option>`).join("")
    : `<option value="">No classrooms yet</option>`;
  ["sClass","listClass","mClass","rClass"].forEach(id => { const v = $(id).value; $(id).innerHTML = opts; if (v) $(id).value = v; });
  showStudents();
}
$("addClass").onclick = async () => {
  const name = $("cName").value.trim(), teacherName = $("cTeacher").value.trim();
  if (!name) return toast("Enter a classroom name", true);
  try { await api("/api/classrooms", {name, teacherName}); $("cName").value = $("cTeacher").value = ""; toast("Classroom added"); loadClassrooms(); }
  catch (e) { toast(e.message, true); }
};

$("addStudent").onclick = async () => {
  const name = $("sName").value.trim(), rollNumber = $("sRoll").value.trim(), classroomId = Number($("sClass").value);
  if (!name || !rollNumber) return toast("Enter the name and roll number", true);
  if (!classroomId) return toast("Add a classroom first", true);
  try { await api("/api/students", {name, rollNumber, classroomId}); $("sName").value = $("sRoll").value = ""; toast("Student added"); $("listClass").value = classroomId; showStudents(); }
  catch (e) { toast(e.message, true); }
};
async function getStudents(id) { return id ? api("/api/classrooms/" + id + "/students") : []; }
async function showStudents() {
  const list = await getStudents($("listClass").value).catch(() => []);
  $("studentList").innerHTML = list.length
    ? `<table><thead><tr><th>Roll</th><th>Name</th></tr></thead><tbody>${list.map(s => `<tr><td>${esc(s.rollNumber)}</td><td>${esc(s.name)}</td></tr>`).join("")}</tbody></table>`
    : `<div class="empty">No students in this classroom yet. Add one above.</div>`;
}
$("listClass").onchange = showStudents;

$("mDate").value = new Date().toISOString().slice(0, 10);
$("loadMark").onclick = async () => {
  const id = $("mClass").value, date = $("mDate").value;
  if (!id || !date) return toast("Choose a classroom and a date", true);
  try {
    markStudents = await getStudents(id);
    const saved = await api(`/api/attendance/classroom/${id}?date=${date}`);
    marks = {}; markStudents.forEach(s => marks[s.id] = "PRESENT");
    saved.forEach(a => marks[a.studentId] = a.status);
    renderMark();
  } catch (e) { toast(e.message, true); }
};
function renderMark() {
  const c = classrooms.find(x => x.id == $("mClass").value);
  $("markCard").hidden = false;
  $("markTitle").textContent = (c ? c.name : "") + " on " + $("mDate").value;
  $("markBody").innerHTML = markStudents.length ? markStudents.map(s => `
    <tr><td>${esc(s.rollNumber)}</td><td>${esc(s.name)}</td>
    <td><div class="tog">
      <button class="p ${marks[s.id]==="PRESENT"?"sel":""}" data-id="${s.id}" data-st="PRESENT">Present</button>
      <button class="a ${marks[s.id]==="ABSENT"?"sel":""}" data-id="${s.id}" data-st="ABSENT">Absent</button>
    </div></td></tr>`).join("") : `<tr><td colspan="3" class="empty">No students in this classroom yet.</td></tr>`;
}
$("markBody").onclick = e => { const b = e.target.closest("button"); if (b) { marks[b.dataset.id] = b.dataset.st; renderMark(); } };
$("allPresent").onclick = () => { markStudents.forEach(s => marks[s.id] = "PRESENT"); renderMark(); };
$("saveMark").onclick = async () => {
  const classroomId = Number($("mClass").value), date = $("mDate").value;
  try {
    await Promise.all(markStudents.map(s => api("/api/attendance", {studentId:s.id, classroomId, date, status:marks[s.id]})));
    toast("Attendance saved");
  } catch (e) { toast(e.message, true); }
};

$("loadReport").onclick = async () => {
  const id = $("rClass").value; if (!id) return toast("Choose a classroom", true);
  try {
    const students = await getStudents(id);
    const sums = await Promise.all(students.map(s => api(`/api/attendance/student/${s.id}/summary`)));
    $("reportCard").hidden = false;
    $("reportBody").innerHTML = students.length ? students.map((s, i) => {
      const m = sums[i], p = Math.round(m.attendancePercentage), low = m.totalDays > 0 && p < 75;
      return `<tr><td>${esc(s.rollNumber)}</td><td>${esc(s.name)}</td><td>${m.presentDays}</td><td>${m.absentDays}</td>
        <td><div class="row" style="flex-wrap:nowrap;gap:10px;align-items:center"><span class="pct ${low?"low":""}">${p}%</span>
        <div class="bar ${low?"low":""}" style="flex:1"><i style="width:${p}%"></i></div></div></td></tr>`;
    }).join("") : `<tr><td colspan="5" class="empty">No students in this classroom yet.</td></tr>`;
  } catch (e) { toast(e.message, true); }
};

loadClassrooms();