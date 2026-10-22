const $=id=>document.getElementById(id);
const PRI={low:"Низкий",medium:"Средний",high:"Высокий"},ST={open:"Открыт",in_progress:"В работе",done:"Выполнен"};
const isAdmin=currentUser.role==="Administrator";
$("room").innerHTML=getRooms().map(r=>`<option>${r.id}</option>`).join("");
function resetForm(){$("incForm").reset();$("incId").value="";$("assignee").value="Инженер";$("saveBtn").textContent="Добавить";$("cancelBtn").classList.add("hidden")}
function renderIncidents(){
  const fs=$("fStatus").value,fp=$("fPriority").value;
  const list=getIncidents().filter(i=>(!fs||i.status===fs)&&(!fp||i.priority===fp));
  $("tbody").innerHTML=list.map(i=>`<tr><td>${i.id}</td><td class="wrap"><b>${esc(i.title)}</b><br><small class="muted">${esc(i.comment)}</small></td><td>${esc(i.room)}</td>
    <td>${badge(i.priority,PRI[i.priority])}</td>
    <td><select data-act="status" data-id="${i.id}">${Object.entries(ST).map(([v,t])=>`<option value="${v}" ${v===i.status?"selected":""}>${t}</option>`).join("")}</select></td>
    <td>${esc(i.assignee)}</td><td>${esc(i.created)}</td>
    <td><button class="btn small" data-act="edit" data-id="${i.id}">✎</button> ${isAdmin?`<button class="btn small danger" data-act="del" data-id="${i.id}">🗑</button>`:""}</td></tr>`).join("")||'<tr><td colspan="8">Инцидентов нет</td></tr>';
}
$("incForm").onsubmit=e=>{
  e.preventDefault();
  const all=getIncidents(),id=+$("incId").value;
  const data={title:$("title").value.trim(),room:$("room").value,priority:$("priority").value,assignee:$("assignee").value.trim()||"—",comment:$("comment").value.trim()};
  if(!data.title)return;
  if(id)Object.assign(all.find(i=>i.id===id),data);
  else all.push({id:Math.max(0,...all.map(i=>i.id))+1,status:"open",created:nowStr().slice(0,10),...data});
  saveData("sc_incidents",all);resetForm();renderIncidents();
};
$("cancelBtn").onclick=resetForm;
$("tbody").addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  const id=+b.dataset.id,all=getIncidents();
  if(b.dataset.act==="del"&&confirm("Удалить инцидент?")){saveData("sc_incidents",all.filter(i=>i.id!==id));renderIncidents()}
  if(b.dataset.act==="edit"){const i=all.find(x=>x.id===id);
    $("incId").value=i.id;$("title").value=i.title;$("room").value=i.room;$("priority").value=i.priority;$("assignee").value=i.assignee;$("comment").value=i.comment;
    $("saveBtn").textContent="Сохранить";$("cancelBtn").classList.remove("hidden");$("title").focus()}
});
$("tbody").addEventListener("change",e=>{
  if(e.target.dataset.act!=="status")return;
  const all=getIncidents();all.find(i=>i.id===+e.target.dataset.id).status=e.target.value;saveData("sc_incidents",all);renderIncidents();
});
$("fStatus").onchange=$("fPriority").onchange=renderIncidents;
renderIncidents();
