const $=id=>document.getElementById(id);
const isAdmin=currentUser.role==="Administrator";
$("campus").value=getSettings().campus;
$("themeNow").textContent=document.body.classList.contains("light")?"светлая":"тёмная";
$("themeBtn").onclick=toggleTheme;
$("saveCampus").onclick=()=>{saveData("sc_settings",{campus:$("campus").value.trim()||"Smart Campus AI"});location.reload()};
$("resetBtn").disabled=!isAdmin;
$("resetNote").textContent=isAdmin?"Вернёт исходные помещения, устройства и инциденты.":"Доступно только роли Administrator.";
$("resetBtn").onclick=()=>{if(confirm("Сбросить все тестовые данные?")){resetData();location.reload()}};
