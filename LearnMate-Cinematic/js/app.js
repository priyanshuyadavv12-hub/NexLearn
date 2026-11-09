const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const courses = [
  {id:'javascript',title:'JavaScript Essentials',category:'WEB DEVELOPMENT',desc:'Build a strong foundation in the language of the web.',icon:'⌘',tone:'lilac',progress:35,lessons:['Variables & data types','Functions and scope','Arrays and objects','DOM manipulation']},
  {id:'design',title:'Creative UI Foundations',category:'DESIGN THINKING',desc:'Learn the principles behind clear, delightful interfaces.',icon:'✧',tone:'blue',progress:62,lessons:['Visual hierarchy','Colour & typography','Spacing systems','Responsive layouts']},
  {id:'cs',title:'Computer Science Core',category:'CORE CONCEPTS',desc:'Strengthen the fundamentals that power great software.',icon:'⌬',tone:'peach',progress:18,lessons:['Data structures','Algorithms basics','Operating systems','Database concepts']}
];
const quizBank = {
 javascript:[
  {q:'Which keyword declares a block-scoped variable that can be reassigned?',o:['var','let','const','static'],a:1,e:'let is block-scoped and can be reassigned.'},
  {q:'Which array method creates a new array by transforming every element?',o:['forEach()','filter()','map()','push()'],a:2,e:'map() returns a new array containing transformed values.'},
  {q:'What does === compare in JavaScript?',o:['Only values','Only data types','Value and type','Object keys'],a:2,e:'Strict equality checks both value and type.'},
  {q:'Which method adds an item to the end of an array?',o:['pop()','push()','shift()','slice()'],a:1,e:'push() appends one or more items to an array.'},
  {q:'Which symbol is used for a single-line comment?',o:['<!-- -->','//','/**/','#'],a:1,e:'Two forward slashes begin a JavaScript single-line comment.'}
 ],
 html:[
  {q:'Which HTML element is used for the largest heading?',o:['<head>','<h6>','<h1>','<header>'],a:2,e:'h1 represents the highest-level heading.'},
  {q:'Which CSS property changes text colour?',o:['font-style','color','background','text-decoration'],a:1,e:'The color property sets the foreground text colour.'},
  {q:'What does CSS stand for?',o:['Creative Style Sheets','Cascading Style Sheets','Computer Style Syntax','Colourful Style Sheets'],a:1,e:'CSS stands for Cascading Style Sheets.'},
  {q:'Which HTML attribute provides alternative text for an image?',o:['title','src','alt','href'],a:2,e:'alt provides a text alternative for an image.'},
  {q:'Which CSS layout system is one-dimensional?',o:['Grid','Flexbox','Float','Position'],a:1,e:'Flexbox is designed primarily for one-dimensional layouts.'}
 ],
 general:[
  {q:'Which data structure follows FIFO order?',o:['Stack','Queue','Tree','Graph'],a:1,e:'A queue follows First In, First Out.'},
  {q:'What is the time complexity of binary search on a sorted array?',o:['O(n)','O(n²)','O(log n)','O(1)'],a:2,e:'Binary search halves the search space each step.'},
  {q:'Which part of the computer executes instructions?',o:['RAM','CPU','SSD','Monitor'],a:1,e:'The CPU executes program instructions.'},
  {q:'Which language is commonly used to query relational databases?',o:['HTML','SQL','CSS','XML'],a:1,e:'SQL is used to manage and query relational databases.'},
  {q:'Which of these is an operating system?',o:['Python','MySQL','Linux','Chrome'],a:2,e:'Linux is an operating system.'}
 ]
};

let state = loadState();
let activeQuiz = null, questionIndex = 0, selectedAnswer = null, answers = [];
function loadState(){
  try { return JSON.parse(localStorage.getItem('learnmateState')) || {user:null,quizzes:0,totalScore:0,hours:0,streak:1,progress:{javascript:35,design:62,cs:18}}; }
  catch { return {user:null,quizzes:0,totalScore:0,hours:0,streak:1,progress:{javascript:35,design:62,cs:18}}; }
}
function save(){ localStorage.setItem('learnmateState',JSON.stringify(state)); }
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2300)}
function initials(name){return (name||'L').trim().charAt(0).toUpperCase()}
function showApp(){
  $('#loginScreen').classList.add('hidden');$('#appScreen').classList.remove('hidden');
  const name=state.user?.name||'Learner';$('#sideName').textContent=name;$('#sideAvatar').textContent=initials(name);$('#topAvatar').textContent=initials(name);$('#heroName').textContent=name.split(' ')[0]+'.';
  $('#todayDate').textContent=new Intl.DateTimeFormat('en',{weekday:'long',month:'long',day:'numeric'}).format(new Date()).toUpperCase();
  renderAll();
}
function renderAll(){
  const completed=state.quizzes||0;$('#statCourses').textContent=String(courses.filter(c=>(state.progress[c.id]||c.progress)>0).length).padStart(2,'0');
  $('#statQuizzes').textContent=String(completed).padStart(2,'0');$('#statHours').innerHTML=(state.hours||0).toFixed(1)+'<span>h</span>';$('#streakCount').textContent=state.streak||1;
  const courseRows=courses.map(c=>({...c,progress:state.progress[c.id]??c.progress}));
  $('#coursePreview').innerHTML=courseRows.map(c=>`<div class="course-row"><div class="course-thumb thumb-${c.tone}">${c.icon}</div><div class="course-info"><strong>${c.title}</strong><small>${c.category}</small><div class="mini-progress"><span style="width:${c.progress}%"></span></div></div><span class="course-percent">${c.progress}%</span></div>`).join('');
  $('#allCourses').innerHTML=courseRows.map(c=>`<article class="learning-card"><div class="course-thumb thumb-${c.tone}">${c.icon}</div><span class="section-kicker">${c.category}</span><h3>${c.title}</h3><p>${c.desc}</p><div class="mini-progress"><span style="width:${c.progress}%"></span></div><small style="font-size:8px;color:#9a8b7c;margin-bottom:13px">${c.progress}% completed</small><button data-course="${c.id}">Continue this path ↗</button></article>`).join('');
  const avg=Math.round(courseRows.reduce((sum,c)=>sum+c.progress,0)/courseRows.length);$('#overallPercent').innerHTML=avg+'<small>%</small>';$('#overallBar').style.width=avg+'%';$('#progressCourseCount').textContent=`${courseRows.filter(c=>c.progress>=100).length} / 3 paths complete`;
  $('#progressCourses').innerHTML=courseRows.map(c=>`<div class="break-row"><strong>${c.title}</strong><div class="mini-progress"><span style="width:${c.progress}%"></span></div><span>${c.progress}%</span></div>`).join('');
  $('#quizScore').textContent=completed?Math.round(state.totalScore/completed)+'%':'—';$('#quizAttempts').textContent=completed?`${completed} quiz session${completed===1?'':'s'} completed.`:'Complete a quiz to see your stats.';
  $('#recommendTitle').textContent=completed?'Turn your quiz insights into a habit':'Build a 20-minute study ritual';$('#recommendText').textContent=completed?'Review the questions you missed, then revisit that topic in your learning path.':'A small, repeatable session can make learning feel effortless.';
}
function navigate(page){
  $$('.page').forEach(p=>p.classList.toggle('active-page',p.id===`page-${page}`));
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
  const titles={overview:'A little progress, every day.',learning:'Your learning journey.',quiz:'Practice. Discover. Improve.',progress:'Look how far you have come.'};
  $('#pageHeading').textContent=titles[page]||titles.overview;
}
$('#loginForm').addEventListener('submit',e=>{
  e.preventDefault();const name=$('#userName').value.trim(),email=$('#userEmail').value.trim();
  if(name.length<2){toast('Please enter your name.');return}
  state.user={name,email};save();showApp();
});
$$('.nav-item').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
$$('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
$('#logoutBtn').addEventListener('click',()=>{state.user=null;save();$('#appScreen').classList.add('hidden');$('#loginScreen').classList.remove('hidden');$('#loginForm').reset();toast('You have logged out.')});
$('#allCourses').addEventListener('click',e=>{
  const btn=e.target.closest('[data-course]');if(!btn)return;const id=btn.dataset.course;const c=courses.find(x=>x.id===id);
  state.progress[id]=Math.min(100,(state.progress[id]??c.progress)+7);state.hours=(state.hours||0)+0.3;save();renderAll();toast(`${c.title}: +7% progress. Keep it up!`);
});
$('#startQuiz').addEventListener('click',()=>{
  const subject=$('#quizSubject').value;activeQuiz=quizBank[subject];questionIndex=0;answers=[];selectedAnswer=null;renderQuestion();
});
function renderQuestion(){
  const q=activeQuiz[questionIndex];
  $('#quizStage').innerHTML=`<div class="quiz-topline"><span>QUESTION ${questionIndex+1} OF ${activeQuiz.length}</span><span>${Math.round(questionIndex/activeQuiz.length*100)}% COMPLETE</span></div><div class="mini-progress" style="margin-top:12px"><span style="width:${(questionIndex+1)/activeQuiz.length*100}%"></span></div><h3 class="quiz-question">${q.q}</h3><div class="answer-list">${q.o.map((opt,i)=>`<button class="answer-option ${selectedAnswer===i?'selected':''}" data-answer="${i}">${String.fromCharCode(65+i)}. &nbsp; ${escapeHTML(opt)}</button>`).join('')}</div><div class="quiz-controls"><button id="nextQuestion" ${selectedAnswer===null?'disabled style="opacity:.45;cursor:not-allowed"':''}>${questionIndex===activeQuiz.length-1?'Finish quiz':'Next question'} ↗</button></div>`;
  $$('.answer-option').forEach(b=>b.addEventListener('click',()=>{selectedAnswer=Number(b.dataset.answer);renderQuestion()}));
  $('#nextQuestion').addEventListener('click',()=>{if(selectedAnswer===null)return;answers.push(selectedAnswer);if(questionIndex<activeQuiz.length-1){questionIndex++;selectedAnswer=null;renderQuestion()}else finishQuiz()});
}
function finishQuiz(){
  let score=0;activeQuiz.forEach((q,i)=>{if(answers[i]===q.a)score++});
  const percent=Math.round(score/activeQuiz.length*100);state.quizzes=(state.quizzes||0)+1;state.totalScore=(state.totalScore||0)+percent;state.hours=(state.hours||0)+0.2;save();renderAll();
  const feedback=percent===100?'Perfect score. Brilliant work!':percent>=60?'Nice work. Keep building on that knowledge.':'Good effort. Every attempt is a step forward.';
  $('#quizStage').innerHTML=`<div class="quiz-result"><div class="result-score">${percent}%</div><h3>${score} out of ${activeQuiz.length} correct</h3><p>${feedback}</p><button id="reviewQuiz">Review answers</button> <button id="retryQuiz">Try another round ↗</button><div id="answerReview" style="display:none;text-align:left;margin-top:20px"></div></div>`;
  $('#reviewQuiz').addEventListener('click',()=>{const box=$('#answerReview');box.style.display='block';box.innerHTML=activeQuiz.map((q,i)=>`<p style="font-size:10px;line-height:1.6;border-top:1px solid #eee5dc;padding-top:10px"><b>${i+1}. ${q.q}</b><br><span style="color:${answers[i]===q.a?'#66845d':'#b36e55'}">Your answer: ${escapeHTML(q.o[answers[i]])}</span><br><span style="color:#66845d">Correct: ${escapeHTML(q.o[q.a])}</span><br><span style="color:#96887b">${q.e}</span></p>`).join('')});
  $('#retryQuiz').addEventListener('click',()=>$('#startQuiz').click());
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
if(state.user)showApp();
