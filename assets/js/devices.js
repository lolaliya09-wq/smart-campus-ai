const q=document.getElementById("q"),ft=document.getElementById("fType"),fs=document.getElementById("fStatus");
q.value=new URLSearchParams(location.search).get("q")||"";
ft.innerHTML='<option value="">Все типы</option>'+[...new Set(getDevices().map(d=>d.type))].map(t=>`<option>${t}</option>`).join("");
function renderDevices(){
  const s=q.value.trim().toLowerCase(),all=getDevices();
  const list=all.filter(d=>(!s||(d.id+d.room+d.type).toLowerCase().includes(s))&&(!ft.value||d.type===ft.value)&&(!fs.value||d.status===fs.value));
  document.querySelector("#tbl tbody").innerHTML=list.map(d=>`<tr><td><b>${esc(d.id)}</b></td><td>${esc(d.room)}</td><td>${esc(d.type)}</td>
    <td>${badge(d.status,d.status)}</td><td>${esc(d.value)} ${esc(d.unit)}</td><td>${esc(d.updatedAt)}</td>
    <td><button class="btn small" data-id="${esc(d.id)}">${d.status==="online"?"Отключить":"Включить"}</button></td></tr>`).join("")||'<tr><td colspan="7">Ничего не найдено</td></tr>';
  document.getElementById("count").textContent=`Показано ${list.length} из ${all.length}`;
}
document.querySelector("#tbl tbody").onclick=e=>{
  const id=e.target.dataset.id;if(!id)return;
  const all=getDevices(),d=all.find(x=>x.id===id);
  d.status=d.status==="online"?"offline":"online";d.updatedAt=nowStr();
  saveData("sc_devices",all);renderDevices();
};
[q,ft,fs].forEach(e=>e.addEventListener("input",renderDevices));
renderDevices();
