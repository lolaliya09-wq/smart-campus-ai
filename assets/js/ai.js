// «AI Analytics»: пороги, z-score, рекомендации (rule-based, без внешних API)
function mean(v){return v.reduce((a,b)=>a+b,0)/v.length}
function stdDev(v){const m=mean(v);return Math.sqrt(v.reduce((s,x)=>s+Math.pow(x-m,2),0)/v.length)}
function zScore(values,current){const sd=stdDev(values);if(sd===0)return 0;return Math.abs((current-mean(values))/sd)}

const RANK={normal:0,warning:1,critical:2};
const tempLevel=t=>t>=32?"critical":(t>=28||t<18)?"warning":"normal";
const co2Level=c=>c>=1500?"critical":c>=1000?"warning":"normal";
function energyLevel(r){const k=r.energy/r.baseline;return k>=1.6?"critical":k>=1.3?"warning":"normal"}
function roomStatus(r){return[tempLevel(r.temperature),co2Level(r.co2),energyLevel(r)].sort((a,b)=>RANK[b]-RANK[a])[0]}

function getRecommendation(r){
  if(r.co2>=1500)return"Критический CO₂: включить вентиляцию и проверить аудиторию.";
  if(r.temperature>=32)return"Перегрев: проверить кондиционер или систему вентиляции.";
  if(r.occupancy===0&&r.energy>4)return"В помещении нет людей, но энергопотребление высокое: отключить оборудование.";
  if(energyLevel(r)!=="normal")return"Потребление выше базовой линии: проверить оборудование и освещение.";
  if(r.co2>=1000)return"CO₂ повышен: проветрить помещение.";
  if(r.temperature>=28)return"Температура повышена: проверить кондиционирование.";
  if(r.temperature<18)return"Слишком холодно: проверить отопление.";
  return"Параметры в норме.";
}

const PARAMS=[["temperature","Температура","°C",r=>tempLevel(r.temperature)],["co2","CO₂","ppm",r=>co2Level(r.co2)],["energy","Энергия","kWh",r=>energyLevel(r)]];
// Аномалия = превышен порог ИЛИ z-score > 2 относительно истории показаний
function detectAnomalies(rooms){
  const out=[];
  rooms.forEach(r=>PARAMS.forEach(([key,name,unit,lvlFn])=>{
    const lvl=lvlFn(r),z=r.history?zScore(r.history[key],r[key]):0,zAnom=z>2,reasons=[];
    if(lvl!=="normal")reasons.push(`превышен порог (${lvl})`);
    if(zAnom)reasons.push(`z-score ${z.toFixed(1)} > 2: резкое отклонение от среднего`);
    if(reasons.length)out.push({room:r.id,param:name,value:r[key],unit,z,risk:lvl!=="normal"?lvl:"warning",reason:reasons.join("; "),rec:getRecommendation(r)});
  }));
  return out.sort((a,b)=>RANK[b.risk]-RANK[a.risk]||b.z-a.z);
}

function getNotifications(){
  const n=[];
  getRooms().forEach(r=>{
    if(r.co2>=1000)n.push({lvl:co2Level(r.co2),text:`Высокий CO₂ в ${r.id}: ${r.co2} ppm`});
    if(r.temperature>=28)n.push({lvl:tempLevel(r.temperature),text:`${r.temperature>=32?"Перегрев":"Повышенная температура"} в ${r.id}: ${r.temperature} °C`});
    if(energyLevel(r)!=="normal")n.push({lvl:energyLevel(r),text:`Перерасход энергии в ${r.id}: ${r.energy} kWh при норме ${r.baseline}`});
  });
  getDevices().filter(d=>d.status==="offline").forEach(d=>n.push({lvl:"warning",text:`Датчик offline: ${d.id} (${d.room})`}));
  return n.sort((a,b)=>RANK[b.lvl]-RANK[a.lvl]);
}
