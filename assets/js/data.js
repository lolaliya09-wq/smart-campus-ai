// Исходные (тестовые) данные. Показания датчиков имитируются.
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function random(min,max){return +(Math.random()*(max-min)+min).toFixed(1)}
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));

// id, корпус, этаж, тип, температура, CO2, энергия (kWh), людей, базовая линия энергии
const ROOM_SEED=[
["A-101","Корпус A",1,"Компьютерный класс",24.3,780,3.6,18,3.8],
["A-102","Корпус A",1,"Лекционная аудитория",23.1,650,2.8,40,3.0],
["A-205","Корпус A",2,"Лекционная аудитория",25.9,1620,3.9,55,3.5],
["A-301","Корпус A",3,"Кафедра",22.4,540,1.6,4,1.8],
["B-101","Корпус B",1,"Лаборатория физики",24.8,720,4.4,12,4.5],
["B-204","Корпус B",2,"Лаборатория химии",25.2,860,5.2,0,2.6],
["B-310","Корпус B",3,"Компьютерный класс",26.1,1090,3.9,22,3.8],
["C-001","Корпус C",0,"Серверная",33.1,420,6.8,0,6.0],
["C-110","Корпус C",1,"Лекционная аудитория",22.8,600,2.4,28,2.6],
["D-201","Корпус D",2,"Учебный класс",26.8,800,2.2,16,2.4],
["D-Hall","Корпус D",1,"Актовый зал",24.0,980,5.1,0,3.2],
["D-Lib","Корпус D",1,"Библиотека",23.5,700,2.1,35,2.2]
];
// Для «аномальных» помещений история строится вокруг другого значения
const HIST_BASE={"A-205":{co2:900},"C-001":{temperature:26},"B-204":{energy:2.5},"D-201":{temperature:22}};

function buildRooms(){
  return ROOM_SEED.map((a,i)=>{
    const [id,building,floor,type,temperature,co2,energy,occupancy,baseline]=a;
    const r={id,building,floor,type,temperature,co2,energy,occupancy,baseline,history:{}};
    const rnd=rng(i+7),amp={temperature:.6,co2:40,energy:.3},o=HIST_BASE[id]||{};
    Object.keys(amp).forEach(k=>{
      const base=o[k]??r[k];
      r.history[k]=Array.from({length:10},()=>{const v=base+(rnd()*2-1)*amp[k];return k==="co2"?Math.round(v):+v.toFixed(1)});
    });
    r.status=roomStatus(r);
    return r;
  });
}

function buildDevices(rooms){
  const d=[],stamp=i=>"2026-10-22 14:"+String(10+i*2).padStart(2,"0");
  rooms.forEach((r,i)=>{
    d.push({id:`TEMP-${r.id}-01`,room:r.id,type:"Temperature Sensor",status:"online",value:r.temperature,unit:"°C",updatedAt:stamp(i)});
    d.push({id:`CO2-${r.id}-01`,room:r.id,type:"CO₂ Sensor",status:"online",value:r.co2,unit:"ppm",updatedAt:stamp(i)});
  });
  d.push(
    {id:"PWR-C-001-01",room:"C-001",type:"Power Meter",status:"online",value:6.8,unit:"kWh",updatedAt:"2026-10-22 14:31"},
    {id:"ACC-A-101-01",room:"A-101",type:"Access Control",status:"online",value:"closed",unit:"",updatedAt:"2026-10-22 14:05"},
    {id:"CAM-D-Hall-01",room:"D-Hall",type:"Camera",status:"offline",value:"no signal",unit:"",updatedAt:"2026-10-22 09:12"},
    {id:"HVAC-A-205-01",room:"A-205",type:"HVAC Controller",status:"online",value:"auto",unit:"",updatedAt:"2026-10-22 14:28"}
  );
  ["CO2-B-204-01","TEMP-A-301-01"].forEach(id=>{const x=d.find(v=>v.id===id);x.status="offline";x.updatedAt="2026-10-22 08:40"});
  return d;
}

function buildIncidents(){
  return [
    {id:1,title:"Высокий уровень CO2",room:"A-205",priority:"high",status:"open",assignee:"Инженер",comment:"Лекция на 55 человек, вентиляция не справляется",created:"2026-10-22"},
    {id:2,title:"Перегрев серверной",room:"C-001",priority:"high",status:"in_progress",assignee:"Администратор",comment:"Проверить кондиционер",created:"2026-10-22"},
    {id:3,title:"Датчик CO2 не отвечает",room:"B-204",priority:"medium",status:"open",assignee:"Инженер",comment:"",created:"2026-10-21"},
    {id:4,title:"Перерасход энергии в актовом зале",room:"D-Hall",priority:"medium",status:"open",assignee:"Оператор",comment:"Людей нет, свет и проектор включены",created:"2026-10-21"},
    {id:5,title:"Замена лампы",room:"D-201",priority:"low",status:"done",assignee:"Оператор",comment:"Выполнено",created:"2026-10-19"}
  ];
}
