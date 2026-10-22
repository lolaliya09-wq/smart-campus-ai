const $=id=>document.getElementById(id);
$("hRoom").innerHTML=getRooms().map(r=>`<option>${r.id}</option>`).join("");
$("hRoom").value="A-205";
function renderAnalytics(){
  const rooms=getRooms(),an=detectAnomalies(rooms);
  const crit=an.filter(a=>a.risk==="critical").length;
  $("riskKpis").innerHTML=[["Критических",crit],["Предупреждений",an.length-crit],["Помещений с аномалиями",new Set(an.map(a=>a.room)).size]].map(([t,v])=>`<div class="kpi"><span>${t}</span><b>${v}</b></div>`).join("");
  $("anTbody").innerHTML=an.map(a=>`<tr><td><b>${a.room}</b></td><td>${a.param}</td><td>${a.value} ${a.unit}</td><td>${a.z.toFixed(1)}</td><td>${badge(a.risk,STATUS_RU[a.risk])}</td><td class="wrap">${esc(a.reason)}</td><td class="wrap">${esc(a.rec)}</td></tr>`).join("")||'<tr><td colspan="7">Аномалий не обнаружено</td></tr>';
  makeChart("baseChart",{type:"bar",data:{labels:rooms.map(r=>r.id),datasets:[{label:"Базовая линия, kWh",data:rooms.map(r=>r.baseline),backgroundColor:"#64748b"},{label:"Сейчас, kWh",data:rooms.map(r=>r.energy),backgroundColor:rooms.map(r=>({normal:"#22c55e",warning:"#f59e0b",critical:"#ef4444"})[energyLevel(r)])}]}});
  renderHistory();
}
function renderHistory(){
  const r=getRooms().find(x=>x.id===$("hRoom").value),k=$("hParam").value,h=r.history[k],m=mean(h);
  makeChart("histChart",{type:"line",data:{labels:[...h.map((_,i)=>"t-"+(h.length-i)),"сейчас"],datasets:[
    {label:`${r.id}: ${$("hParam").selectedOptions[0].text}`,data:[...h,r[k]],borderColor:"#38bdf8",tension:.3,pointBackgroundColor:[...h.map(()=>"#38bdf8"),zScore(h,r[k])>2?"#ef4444":"#38bdf8"],pointRadius:5},
    {label:"Среднее по истории",data:[...h,r[k]].map(()=>+m.toFixed(2)),borderColor:"#8d9bb8",borderDash:[6,6],pointRadius:0}]}});
}
$("hRoom").onchange=$("hParam").onchange=renderHistory;
$("run").onclick=()=>{simulateRooms();renderAnalytics()};
renderAnalytics();
