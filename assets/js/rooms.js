const q=document.getElementById("q"),fb=document.getElementById("fBuilding"),fs=document.getElementById("fStatus");
q.value=new URLSearchParams(location.search).get("q")||"";
fb.innerHTML='<option value="">Все корпуса</option>'+[...new Set(getRooms().map(r=>r.building))].map(b=>`<option>${b}</option>`).join("");
const cls=l=>l==="normal"?"":"t-"+l;
function renderRooms(){
  const s=q.value.trim().toLowerCase();
  const list=getRooms().filter(r=>(!s||(r.id+r.type+r.building).toLowerCase().includes(s))&&(!fb.value||r.building===fb.value)&&(!fs.value||roomStatus(r)===fs.value));
  document.querySelector("#tbl tbody").innerHTML=list.map(r=>`<tr><td><b>${esc(r.id)}</b></td><td>${esc(r.building)}</td><td>${r.floor}</td><td>${esc(r.type)}</td>
    <td class="${cls(tempLevel(r.temperature))}">${r.temperature} °C</td><td class="${cls(co2Level(r.co2))}">${r.co2} ppm</td>
    <td>${r.occupancy}</td><td class="${cls(energyLevel(r))}">${r.energy} kWh</td><td>${badge(roomStatus(r),STATUS_RU[roomStatus(r)])}</td></tr>`).join("")||'<tr><td colspan="9">Ничего не найдено</td></tr>';
  document.getElementById("count").textContent=`Показано ${list.length} из ${getRooms().length}`;
}
[q,fb,fs].forEach(e=>e.addEventListener("input",renderRooms));
document.getElementById("simulate").onclick=()=>{simulateRooms();renderRooms()};
renderRooms();
