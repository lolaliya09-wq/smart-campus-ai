// Работа с localStorage + общие помощники
function saveData(key,data){try{localStorage.setItem(key,JSON.stringify(data))}catch(e){console.warn("localStorage недоступен",e)}}
function loadData(key,fallback=[]){
  try{const raw=localStorage.getItem(key);if(!raw)return fallback;return JSON.parse(raw)}catch{return fallback}
}
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function nowStr(){const d=new Date(),p=n=>String(n).padStart(2,"0");return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`}

function getRooms(){let r=loadData("sc_rooms",null);if(!r){r=buildRooms();saveData("sc_rooms",r)}return r}
function getDevices(){let d=loadData("sc_devices",null);if(!d){d=buildDevices(getRooms());saveData("sc_devices",d)}return d}
function getIncidents(){let i=loadData("sc_incidents",null);if(!i){i=buildIncidents();saveData("sc_incidents",i)}return i}
function getSettings(){return Object.assign({campus:"Smart Campus AI"},loadData("sc_settings",{}))}
function resetData(){["sc_rooms","sc_devices","sc_incidents","sc_settings"].forEach(k=>localStorage.removeItem(k))}

// Обновить значения онлайн-датчиков по состоянию помещений
function syncDevices(rooms,devices){
  devices.forEach(d=>{
    if(d.status!=="online")return;
    const r=rooms.find(x=>x.id===d.room);if(!r)return;
    if(d.type==="Temperature Sensor")d.value=r.temperature;
    else if(d.type==="CO₂ Sensor")d.value=r.co2;
    else if(d.type==="Power Meter")d.value=r.energy;
    else return;
    d.updatedAt=nowStr();
  });
}
// Имитация нового цикла опроса датчиков (небольшой дрейф значений)
function simulateRooms(){
  const rooms=getRooms();
  rooms.forEach(r=>{
    for(const k of["temperature","co2","energy"]){r.history[k].push(r[k]);r.history[k].shift()}
    r.temperature=clamp(+(r.temperature+random(-1.2,1.2)).toFixed(1),18,36);
    r.co2=clamp(Math.round(r.co2+random(-180,220)),400,1900);
    r.energy=clamp(+(r.energy+random(-.6,.6)).toFixed(1),.8,9);
    r.occupancy=Math.max(0,r.occupancy+Math.round(random(-3,3)));
    r.status=roomStatus(r);
  });
  saveData("sc_rooms",rooms);
  const dev=getDevices();syncDevices(rooms,dev);saveData("sc_devices",dev);
  return rooms;
}
