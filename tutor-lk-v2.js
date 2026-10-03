(function(){
"use strict";
function esc(s){return String(s||"").replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function list(){try{return JSON.parse(localStorage.getItem("pu_students")||"[]")}catch(e){return[]}}
function save(x){localStorage.setItem("pu_students",JSON.stringify(x))}
function gradeNumber(st){return Number(String(st.grade||"1").match(/\d+/)?.[0]||1)}
function notebook(st){try{return JSON.parse(localStorage.getItem("pu_notebook_"+st.name)||"{}")}catch(e){return{}}}
function avg(st){var n=notebook(st),v=Object.keys(n.ratings||{}).map(function(k){return +n.ratings[k]||0}).filter(Boolean);return v.length?Math.round(v.reduce(function(a,b){return a+b},0)/v.length):0}
function normalizeStudents(){var a=list(),changed=false;a.forEach(function(st){if(st.grade!=="1 класс"){st.grade="1 класс";changed=true}});if(changed)save(a)}\nfunction cleanOptions(){
 document.querySelectorAll("#grade,#boardGrade,#newGrade").forEach(function(sel){
   if(!sel)return;
   if(sel.id==="newGrade"){
     sel.innerHTML='<option value="1 класс">1 класс</option>';
     sel.value="1 класс";
   }else{
     sel.innerHTML='<option value="1">1 класс</option>';
     sel.value="1";
   }
 });
 document.querySelectorAll("#subject,#boardSubject").forEach(function(sel){
   if(!sel)return;
   var val=sel.value==="russian"?"russian":"math";
   sel.innerHTML='<option value="math">Математика</option><option value="russian">Русский язык</option>';
   sel.value=val;
 });
 document.querySelectorAll(".classBoardSubjects").forEach(function(x){
   x.innerHTML='<span>🔤 Русский язык</span><span>➗ Математика</span>';
 });
 document.querySelectorAll("#program h1").forEach(function(h){if(/1–4|1-4/.test(h.textContent))h.textContent="Программа 1 класса"});
 document.querySelectorAll("#program .muted").forEach(function(x){if(/1–4|1-4/.test(x.textContent))x.textContent="Темы КТП 1 класса"});
}
function installStudentUI(){
 var sec=document.getElementById("students");if(!sec)return;
 var top=sec.querySelector(".top");if(top&&!document.getElementById("studentSearchBar")){
   var bar=document.createElement("div");bar.id="studentSearchBar";bar.innerHTML='<div class="lkStudentSummary"><b id="lkStudentCount">0</b><span>учеников</span></div><input id="lkStudentSearch" type="search" placeholder="Поиск ученика…"><button class="secondary" id="lkClearSearch" type="button">Сбросить</button>';
   top.insertAdjacentElement("afterend",bar);
 }
 var search=document.getElementById("lkStudentSearch");
 if(search&&!search.dataset.bound){search.dataset.bound="1";search.addEventListener("input",renderStudents)}
 var clear=document.getElementById("lkClearSearch");
 if(clear&&!clear.dataset.bound){clear.dataset.bound="1";clear.onclick=function(){if(search)search.value="";renderStudents()}}
}
function renderStudents(){
 var box=document.getElementById("studentList");if(!box)return;
 installStudentUI();
 var all=list(),search=(document.getElementById("lkStudentSearch")?.value||"").trim().toLowerCase();
 var ss=all.filter(function(st){return !search||String(st.name||"").toLowerCase().includes(search)});
 var count=document.getElementById("lkStudentCount");if(count)count.textContent=all.length;
 if(!ss.length){
   box.innerHTML=search?'<div class="emptyStudents"><div class="emptyIcon">🔎</div><h2>Никого не нашли</h2><p>Попробуй другое имя.</p></div>':'<div class="emptyStudents"><div class="emptyIcon">👩‍🎓</div><h2>Пока нет учеников</h2><p>Добавь первого ученика — здесь будет его дневник и история занятий.</p><button class="primary" id="lkEmptyAdd">+ Добавить ученика</button></div>';
   var eb=document.getElementById("lkEmptyAdd");if(eb)eb.onclick=function(){document.getElementById("modal")?.classList.add("show")};
   return;
 }
 box.innerHTML=ss.map(function(st){
   var idx=all.indexOf(st),a=avg(st),n=notebook(st),notes=n.notes?"Есть заметка":"Заметок нет";
   return '<div class="studentNotebookCard studentListCard lkStudentCard"><div class="studentListHead"><div style="display:flex;gap:14px;align-items:center"><div class="studentListAvatar">'+esc(String(st.name||"?").trim().charAt(0).toUpperCase())+'</div><div><div class="studentListName">'+esc(st.name)+'</div><div class="studentMeta">1 класс · '+(a?("средняя отметка "+a+"/10"):"оценок пока нет")+'</div></div></div><span class="lkArrow">→</span></div><div class="lkStudentInfo"><span>📝 '+notes+'</span><span>📚 Русский + математика</span></div><div class="studentOpen"><button class="primary" type="button" data-open-student="'+idx+'">Открыть дневник</button><button class="secondary lkDelete" type="button" data-delete-lk="'+idx+'">Удалить</button></div></div>';
 }).join("");
}
document.addEventListener("click",function(e){
 var del=e.target.closest("[data-delete-lk]");if(!del)return;
 e.preventDefault();e.stopPropagation();
 var all=list(),st=all[+del.dataset.deleteLk];if(!st)return;
 if(!confirm("Удалить ученика «"+st.name+"»?"))return;
 all.splice(+del.dataset.deleteLk,1);save(all);
 localStorage.removeItem("pu_active_student");
 renderStudents();
},false);
var oldRender=window.renderStudents;
window.renderStudents=renderStudents;
function boot(){
 cleanOptions();
 installStudentUI();
 renderStudents();
 setTimeout(cleanOptions,100);
 setTimeout(renderStudents,150);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();