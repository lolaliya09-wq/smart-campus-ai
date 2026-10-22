function renderDashboard(){
  const rooms=getRooms(),devices=getDevices(),incidents=getIncidents();
  const online=devices.filter(d=>d.status==="online").length,off=devices.length-online;
  const attn=rooms.filter(r=>roomStatus(r)!=="normal").length;
  const open=incidents.filter(i=>i.status!=="done").length;
  const energy=rooms.reduce((s,r)=>s+r.energy,0).toFixed(1);
  const k=[["Помещений",rooms.length,`${attn} требуют внимания`],["Устройств online",online,`из ${devices.length}`],["Устройств offline",off,"нужна проверка"],
    ["Открытых инцидентов",open,`всего ${incidents.length}`],["Энергия сейчас",energy+" kWh","по всем корпусам"]];
  document.getElementById("kpis").innerHTML=k.map(([t,v,s])=>`<div class="kpi"><span>${t}</span><b>${v}</b><small>${s}</small></div>`).join("");

  const blds=[...new Set(rooms.map(r=>r.building))];
  makeChart("energyChart",{type:"bar",data:{labels:blds,datasets:[{label:"Энергия, kWh",data:blds.map(b=>+rooms.filter(r=>r.building===b).reduce((s,r)=>s+r.energy,0).toFixed(1)),backgroundColor:"#38bdf8"}]}});
  makeChart("tempChart",{type:"line",data:{labels:rooms.map(r=>r.id),datasets:[{label:"Температура, °C",data:rooms.map(r=>r.temperature),borderColor:"#f59e0b",backgroundColor:"#f59e0b55",tension:.3,fill:true}]}});
  makeChart("deviceChart",{type:"doughnut",data:{labels:["online","offline"],datasets:[{data:[online,off],backgroundColor:["#22c55e","#ef4444"],borderWidth:0}]}});
  document.getElementById("notifList").innerHTML=getNotifications().map(n=>`<li><i class="dot d-${n.lvl}"></i><span>${esc(n.text)}</span></li>`).join("")||"<li>Предупреждений нет</li>";
}
document.getElementById("refresh").onclick=()=>{simulateRooms();renderDashboard()};
renderDashboard();
