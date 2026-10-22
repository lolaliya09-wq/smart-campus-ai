// Общий каркас: авторизация, sidebar, topbar, тема, уведомления
function toggleTheme(){
  const light=!document.body.classList.contains("light");
  saveData("theme",light?"light":"dark");
  location.reload(); // перерисовать графики в цветах темы
}
function makeChart(id,cfg){
  const el=document.getElementById(id);if(!el)return;
  if(!window.Chart){el.parentElement.textContent="Chart.js не загрузился (проверьте интернет)";return}
  const cs=getComputedStyle(document.body);
  Chart.defaults.color=cs.getPropertyValue("--muted").trim();
  Chart.defaults.borderColor=cs.getPropertyValue("--line").trim();
  cfg.options=Object.assign({responsive:true,maintainAspectRatio:false},cfg.options||{});
  const old=Chart.getChart(el);if(old)old.destroy();
  return new Chart(el,cfg);
}
const STATUS_RU={normal:"Норма",warning:"Внимание",critical:"Критично",online:"online",offline:"offline"};
const badge=(cls,text)=>`<span class="badge b-${cls}">${esc(text)}</span>`;

(function(){
  const body=document.body,page=body.dataset.page;
  if(loadData("theme","dark")==="light")body.classList.add("light");
  const user=loadData("sc_user",null);
  if(!user){location.replace("index.html");return}
  window.currentUser=user;
  const nav=[["dashboard","Dashboard","▦"],["rooms","Rooms","🏫"],["devices","Devices","📡"],["incidents","Incidents","🛠"],["analytics","Analytics","🧠"],["settings","Settings","⚙"]];
  const sb=document.getElementById("sidebar");
  sb.innerHTML=`<div class="brand">🏫 ${esc(getSettings().campus)}</div>`+
    nav.map(([id,t,i])=>`<a href="${id}.html" class="${id===page?"active":""}"><span>${i}</span>${t}</a>`).join("")+
    `<div class="side-foot">Роль: ${esc(user.role)}</div>`;
  const notes=getNotifications();
  document.getElementById("topbar").innerHTML=`
    <button id="burger" class="icon" aria-label="Меню">☰</button>
    <input id="globalSearch" type="search" placeholder="Поиск аудиторий и устройств (Enter)">
    <button id="themeButton" class="icon" title="Тема">🌓</button>
    <div class="bell-wrap"><button id="bell" class="icon" aria-label="Уведомления">🔔${notes.length?`<b id="badge">${notes.length}</b>`:""}</button>
      <div id="notifPanel" class="panel hidden"><h3>Уведомления</h3><ul class="list">${
        notes.slice(0,8).map(n=>`<li><i class="dot d-${n.lvl}"></i><span>${esc(n.text)}</span></li>`).join("")||"<li>Нет предупреждений</li>"}</ul></div></div>
    <span class="chip">${esc(user.name)} · ${esc(user.role)}</span><button id="logout" class="btn small">Выйти</button>`;
  document.getElementById("burger").onclick=()=>sb.classList.toggle("open");
  document.getElementById("themeButton").onclick=toggleTheme;
  document.getElementById("bell").onclick=e=>{e.stopPropagation();document.getElementById("notifPanel").classList.toggle("hidden")};
  document.addEventListener("click",e=>{if(!e.target.closest(".bell-wrap"))document.getElementById("notifPanel").classList.add("hidden")});
  document.getElementById("logout").onclick=()=>{localStorage.removeItem("sc_user");location.href="index.html"};
  document.getElementById("globalSearch").addEventListener("keydown",e=>{
    if(e.key!=="Enter")return;
    const q=e.target.value.trim().toLowerCase();if(!q)return;
    const inRooms=getRooms().some(r=>(r.id+r.type+r.building).toLowerCase().includes(q));
    location.href=(inRooms?"rooms.html":"devices.html")+"?q="+encodeURIComponent(q);
  });
})();
