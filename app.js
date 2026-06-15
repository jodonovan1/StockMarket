const STORAGE_KEY = "investorChallengeConsoleV1";

const masterDecks = {
  1: [
    {title:"Strong Consumer Spending", text:"Families are spending more money in shops.", effects:{QH:1, II:0, BZ:0}},
    {title:"Positive Economic News", text:"Businesses are optimistic about the economy.", effects:{QH:1, II:1, BZ:1}},
    {title:"New Infrastructure Contract", text:"A major construction project has been announced.", effects:{QH:0, II:2, BZ:0}},
    {title:"Technology Award", text:"A new innovation has attracted attention.", effects:{QH:0, II:0, BZ:2}},
    {title:"Rising Business Costs", text:"Higher operating costs affect many companies.", effects:{QH:-1, II:-1, BZ:-1}},
    {title:"Online Shopping Boom", text:"Consumer spending continues to grow.", effects:{QH:1, II:0, BZ:1}},
    {title:"Investor Confidence Rises", text:"Investors are willing to take more risks.", effects:{QH:1, II:1, BZ:2}},
    {title:"Supply Chain Delays", text:"Shipping delays affect some businesses.", effects:{QH:-1, II:-2, BZ:0}},
    {title:"New Government Investment", text:"Government spending supports business growth.", effects:{QH:1, II:2, BZ:1}},
    {title:"Strong Market Finish", text:"The market closes the lesson positively.", effects:{QH:1, II:1, BZ:1}}
  ],
  2: [
    {title:"Mixed Trading Day", text:"Some investors take profits while others continue buying.", effects:{QH:1, II:0, BZ:1}},
    {title:"Strong Employment Data", text:"The economy appears healthy.", effects:{QH:1, II:1, BZ:2}},
    {title:"Overseas Markets Fall", text:"International markets experience losses.", effects:{QH:-1, II:-1, BZ:-2}},
    {title:"Investor Uncertainty", text:"Rumours create concern among investors.", effects:{QH:-1, II:-2, BZ:-2}},
    {title:"Market Crash", text:"Breaking news shocks investors. Panic selling begins across the market.", effects:{QH:-3, II:-4, BZ:-6}},
    {title:"Market Panic Continues", text:"Many investors continue selling their shares.", effects:{QH:-1, II:-2, BZ:-3}},
    {title:"Bargain Hunters Enter", text:"Some investors begin buying cheap shares.", effects:{QH:1, II:1, BZ:2}},
    {title:"Government Support Package", text:"Support measures help businesses and boost confidence.", effects:{QH:2, II:2, BZ:2}},
    {title:"Investor Confidence Returns", text:"The market begins recovering.", effects:{QH:1, II:2, BZ:3}},
    {title:"Recovery Rally", text:"Investors return to the market as prices rise strongly.", effects:{QH:2, II:2, BZ:4}}
  ],
  3: [
    {title:"Consumer Confidence Returns", text:"Shoppers are spending again.", effects:{QH:2, II:1, BZ:1}},
    {title:"Stable Trading Day", text:"Investors remain cautious but optimistic.", effects:{QH:1, II:1, BZ:1}},
    {title:"Major Infrastructure Project", text:"Government announces new transport funding.", effects:{QH:0, II:3, BZ:1}},
    {title:"Technology Product Launch", text:"A new product receives positive reviews.", effects:{QH:0, II:0, BZ:3}},
    {title:"Rising Interest Rates", text:"Borrowing becomes more expensive.", effects:{QH:-1, II:-1, BZ:-2}},
    {title:"Strong Company Earnings", text:"Businesses report better-than-expected profits.", effects:{QH:1, II:2, BZ:2}},
    {title:"Supply Problems Return", text:"Some industries experience delays.", effects:{QH:-1, II:-2, BZ:-1}},
    {title:"Investor Optimism", text:"Many investors expect future growth.", effects:{QH:1, II:1, BZ:2}},
    {title:"Market Rally", text:"Investors buy shares across the market.", effects:{QH:2, II:2, BZ:2}},
    {title:"End-of-Simulation Surge", text:"Strong buying pushes prices higher before trading closes.", effects:{QH:1, II:2, BZ:3}}
  ]
};

function deepCopy(obj){ return JSON.parse(JSON.stringify(obj)); }

function initialState(){
  return {
    lesson: 1,
    cardIndex: 0,
    companies: {
      QH: {name:"Quokka Holdings", price:3, previous:3, available:40},
      II: {name:"Ironbark Industries", price:5, previous:5, available:25},
      BZ: {name:"Blue Zenith Technologies", price:10, previous:10, available:15}
    },
    rewards: [
      {id:1, name:"Prize Box 1", price:8},
      {id:2, name:"Prize Box 2", price:10},
      {id:3, name:"Prize Box 3", price:12},
      {id:4, name:"Prize Box 4", price:15},
      {id:5, name:"Prize Box 5", price:20},
      {id:6, name:"Prize Box 6", price:30}
    ],
    students: [],
    decks: deepCopy(masterDecks),
    log: []
  };
}

let state = load();

function load(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(!parsed.decks) parsed.decks = deepCopy(masterDecks);
      return parsed;
    }
  } catch(e) {
    console.error(e);
  }
  return initialState();
}

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const el = document.getElementById("saveStatus");
  if(el) el.textContent = "Saved " + new Date().toLocaleTimeString();
}

function log(message){
  state.log.unshift("[" + new Date().toLocaleTimeString() + "] " + message);
  save();
}

function bankValue(student){
  return (student.deposits || []).reduce((sum, d) => sum + Number(d.maturityValue || 0), 0);
}

function shareValue(student, ticker){
  return Number(student.shares[ticker] || 0) * Number(state.companies[ticker].price);
}

function portfolioValue(student){
  return Math.round(Number(student.cash || 0) + bankValue(student) + shareValue(student,"QH") + shareValue(student,"II") + shareValue(student,"BZ"));
}

function saveStudentSnapshot(student, label){
  if(!student.history) student.history = [];
  student.history.push({
    label,
    lesson: state.lesson,
    card: state.cardIndex,
    cash: student.cash,
    bank: bankValue(student),
    qh: student.shares.QH,
    ii: student.shares.II,
    bz: student.shares.BZ,
    value: portfolioValue(student),
    time: new Date().toISOString()
  });
}

function saveSnapshot(){
  state.students.forEach(student => saveStudentSnapshot(student, "L" + state.lesson + " C" + state.cardIndex));
  log("Saved snapshot for all students.");
  render();
}

function render(){
  renderMarket();
  renderRewards();
  renderStudents();
  renderSelectors();
  renderTransactionFields(false);
  renderStatus();
  renderLeaderboard();
  renderLog();
  drawGraph();
  save();
}

function renderMarket(){
  const body = document.getElementById("marketBody");
  if(!body) return;
  body.innerHTML = "";
  Object.entries(state.companies).forEach(([ticker, company]) => {
    const change = Number(company.price) - Number(company.previous);
    const cls = change > 0 ? "pos" : change < 0 ? "neg" : "zero";
    const sign = change > 0 ? "+" : "";
    body.insertAdjacentHTML("beforeend", `<tr>
      <td><strong>${company.name}</strong> (${ticker})</td>
      <td>${company.price}</td>
      <td class="${cls}">${sign}${change}</td>
      <td>${company.available}</td>
    </tr>`);
  });
}

function renderRewards(){
  const body = document.getElementById("rewardsBody");
  if(!body) return;
  body.innerHTML = "";
  state.rewards.forEach(reward => {
    body.insertAdjacentHTML("beforeend", `<tr>
      <td>${reward.name}</td>
      <td>${reward.price}</td>
      <td><input type="number" min="0" step="1" value="${reward.price}" onchange="setRewardPrice(${reward.id}, this.value)"></td>
    </tr>`);
  });
}

function renderStudents(){
  const body = document.getElementById("studentsBody");
  if(!body) return;
  body.innerHTML = "";
  state.students.forEach(student => {
    body.insertAdjacentHTML("beforeend", `<tr>
      <td><strong>${student.name}</strong></td>
      <td>${student.cash}</td>
      <td>${student.shares.QH}</td>
      <td>${student.shares.II}</td>
      <td>${student.shares.BZ}</td>
      <td>${bankValue(student)}</td>
      <td><strong>${portfolioValue(student)}</strong></td>
      <td><button onclick="removeStudent('${student.id}')">Remove</button></td>
    </tr>`);
  });
}

function renderSelectors(){
  ["txStudent", "graphStudent"].forEach(id => {
    const el = document.getElementById(id);
    if(!el) return;
    const current = el.value;
    el.innerHTML = "";
    state.students.forEach(student => {
      const option = document.createElement("option");
      option.value = student.id;
      option.textContent = student.name;
      el.appendChild(option);
    });
    if(state.students.some(s => s.id === current)) el.value = current;
  });
  renderSelectedStudent();
}

function renderStatus(){
  const status = document.getElementById("roundStatus");
  if(status) status.textContent = "Lesson " + state.lesson + " · Card " + state.cardIndex + " of 10";

  const reminder = document.getElementById("tradeReminder");
  if(reminder){
    const trade = state.cardIndex > 0 && state.cardIndex % 2 === 0;
    reminder.className = "reminder" + (trade ? " trade" : "");
    reminder.textContent = trade ? "Trading Round: students may BUY, SELL or HOLD." : "Wait for next card before trading.";
  }

  const lessonSelect = document.getElementById("lessonSelect");
  if(lessonSelect) lessonSelect.value = String(state.lesson);
}

function renderLeaderboard(){
  const body = document.getElementById("leaderboardBody");
  if(!body) return;
  const ranked = [...state.students].sort((a,b) => portfolioValue(b) - portfolioValue(a));
  body.innerHTML = "";
  ranked.forEach((student, index) => {
    body.insertAdjacentHTML("beforeend", `<tr>
      <td>${index + 1}</td>
      <td>${student.name}</td>
      <td><strong>${portfolioValue(student)}</strong></td>
      <td>${strategyNote(student)}</td>
    </tr>`);
  });
}

function strategyNote(student){
  const shares = shareValue(student,"QH") + shareValue(student,"II") + shareValue(student,"BZ");
  const bank = bankValue(student);
  const spent = (student.spending || []).length;
  if(shares > bank && shares > student.cash) return "Mostly investing";
  if(bank > shares && bank > student.cash) return "Mostly saving";
  if(spent > 1) return "Spending active";
  return "Mixed / developing";
}

function renderLog(){
  const el = document.getElementById("activityLog");
  if(el) el.textContent = state.log.join("\\n");
}

function addStudent(){
  const name = document.getElementById("newStudentName").value.trim();
  const cash = Number(document.getElementById("newStudentCash").value);
  if(!name || Number.isNaN(cash)){
    alert("Please enter a student name and starting tickets.");
    return;
  }
  const student = {
    id: String(Date.now()) + "_" + Math.random().toString(16).slice(2),
    name,
    cash: Math.round(cash),
    shares: {QH:0, II:0, BZ:0},
    deposits: [],
    spending: [],
    history: []
  };
  state.students.push(student);
  saveStudentSnapshot(student, "Start");
  document.getElementById("newStudentName").value = "";
  document.getElementById("newStudentCash").value = "";
  log("Added " + name + " with " + cash + " tickets.");
  render();
}

function removeStudent(id){
  const student = state.students.find(s => s.id === id);
  if(!student) return;
  if(confirm("Remove " + student.name + "?")){
    state.students = state.students.filter(s => s.id !== id);
    log("Removed " + student.name + ".");
    render();
  }
}

function currentStudent(){
  const id = document.getElementById("txStudent").value;
  return state.students.find(s => s.id === id);
}

function renderTransactionFields(updateSummary = true){
  const container = document.getElementById("txFields");
  if(!container) return;
  const typeEl = document.getElementById("txType");
  const type = typeEl ? typeEl.value : "buy";
  if(type === "buy" || type === "sell"){
    container.innerHTML = `
      <label>Company</label>
      <select id="txTicker"><option value="QH">QH</option><option value="II">II</option><option value="BZ">BZ</option></select>
      <label>Number of shares</label>
      <input id="txQty" type="number" min="1" step="1">
    `;
  } else if(type === "deposit"){
    container.innerHTML = `
      <label>Amount deposited</label>
      <input id="txDepositAmount" type="number" min="10" step="10">
      <label>Term</label>
      <select id="txDepositTerm"><option value="1">1 lesson (+10%)</option><option value="2">2 lessons (+20%)</option><option value="3">3 lessons (+30%)</option></select>
    `;
  } else if(type === "spend"){
    container.innerHTML = `
      <label>Reward</label>
      <select id="txReward">${state.rewards.map(r => `<option value="${r.id}">${r.name} - ${r.price} tickets</option>`).join("")}</select>
    `;
  } else {
    container.innerHTML = `
      <label>Cash adjustment (+ or -)</label>
      <input id="txCashAmount" type="number" step="1">
      <label>Reason</label>
      <input id="txCashReason" placeholder="e.g. correction, extra starting tickets">
    `;
  }
  if(updateSummary) renderSelectedStudent();
}

function renderSelectedStudent(){
  const student = currentStudent();
  const el = document.getElementById("selectedStudentSummary");
  if(!el) return;
  if(!student){
    el.innerHTML = "<p>No student selected.</p>";
    return;
  }
  el.innerHTML = `
    <div><strong>Cash</strong><br>${student.cash}</div>
    <div><strong>Portfolio</strong><br>${portfolioValue(student)}</div>
    <div><strong>QH</strong><br>${student.shares.QH} shares = ${shareValue(student,"QH")}</div>
    <div><strong>II</strong><br>${student.shares.II} shares = ${shareValue(student,"II")}</div>
    <div><strong>BZ</strong><br>${student.shares.BZ} shares = ${shareValue(student,"BZ")}</div>
    <div><strong>Bank</strong><br>${bankValue(student)}</div>
  `;
}

function submitTransaction(){
  const student = currentStudent();
  if(!student){
    alert("Please select a student.");
    return;
  }
  const type = document.getElementById("txType").value;
  if(type === "buy") buyShares(student);
  if(type === "sell") sellShares(student);
  if(type === "deposit") addDeposit(student);
  if(type === "spend") buyReward(student);
  if(type === "cash") adjustCash(student);
}

function buyShares(student){
  const ticker = document.getElementById("txTicker").value;
  const qty = Number(document.getElementById("txQty").value);
  const company = state.companies[ticker];
  if(!qty || qty < 1) return alert("Enter number of shares.");
  const cost = qty * company.price;
  if(company.available < qty) return alert("Not enough shares available.");
  if(student.cash < cost) return alert("Student does not have enough cash.");
  student.cash -= cost;
  student.shares[ticker] += qty;
  company.available -= qty;
  saveStudentSnapshot(student, "Bought " + qty + " " + ticker);
  log(student.name + " bought " + qty + " " + ticker + " for " + cost + " tickets.");
  render();
}

function sellShares(student){
  const ticker = document.getElementById("txTicker").value;
  const qty = Number(document.getElementById("txQty").value);
  const company = state.companies[ticker];
  if(!qty || qty < 1) return alert("Enter number of shares.");
  if(student.shares[ticker] < qty) return alert("Student does not own enough shares.");
  const income = qty * company.price;
  student.shares[ticker] -= qty;
  student.cash += income;
  company.available += qty;
  saveStudentSnapshot(student, "Sold " + qty + " " + ticker);
  log(student.name + " sold " + qty + " " + ticker + " for " + income + " tickets.");
  render();
}

function addDeposit(student){
  const amount = Number(document.getElementById("txDepositAmount").value);
  const term = Number(document.getElementById("txDepositTerm").value);
  if(!amount || amount < 10 || amount % 10 !== 0) return alert("Deposits must be at least 10 tickets and in 10-ticket lots.");
  if(student.cash < amount) return alert("Student does not have enough cash.");
  const maturityValue = Math.round(amount * (1 + term * 0.10));
  student.cash -= amount;
  student.deposits.push({
    amount,
    term,
    lessonsRemaining: term,
    maturityValue,
    createdLesson: state.lesson
  });
  saveStudentSnapshot(student, "Deposited " + amount);
  log(student.name + " deposited " + amount + " for " + term + " lesson(s). Expected return: " + maturityValue + ".");
  render();
}

function buyReward(student){
  const id = Number(document.getElementById("txReward").value);
  const reward = state.rewards.find(r => r.id === id);
  if(!reward) return;
  if(student.cash < reward.price) return alert("Student does not have enough cash.");
  student.cash -= reward.price;
  student.spending.push({lesson: state.lesson, item: reward.name, cost: reward.price, time: new Date().toISOString()});
  saveStudentSnapshot(student, "Bought " + reward.name);
  log(student.name + " bought " + reward.name + " for " + reward.price + " tickets.");
  render();
}

function adjustCash(student){
  const amount = Number(document.getElementById("txCashAmount").value);
  const reason = document.getElementById("txCashReason").value || "Cash adjustment";
  if(Number.isNaN(amount)) return alert("Enter a valid amount.");
  student.cash += amount;
  saveStudentSnapshot(student, reason);
  log(student.name + " cash adjusted by " + amount + " (" + reason + ").");
  render();
}

function changeLesson(){
  state.lesson = Number(document.getElementById("lessonSelect").value);
  state.cardIndex = 0;
  log("Changed to Lesson " + state.lesson + ".");
  render();
}

function resetDeck(){
  state.decks[state.lesson] = deepCopy(masterDecks[state.lesson]);
  state.cardIndex = 0;
  log("Reset Lesson " + state.lesson + " deck.");
  render();
}

function shuffleDeck(){
  let deck = deepCopy(masterDecks[state.lesson]);
  if(state.lesson === 2){
    const before = shuffle(deck.slice(0,4));
    const crash = deck[4];
    const after = shuffle(deck.slice(5));
    deck = [...before, crash, ...after];
  } else {
    deck = shuffle(deck);
  }
  state.decks[state.lesson] = deck;
  state.cardIndex = 0;
  log("Shuffled Lesson " + state.lesson + " deck.");
  render();
}

function shuffle(array){
  for(let i=array.length-1; i>0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function drawCard(){
  const deck = state.decks[state.lesson] || masterDecks[state.lesson];
  if(state.cardIndex >= deck.length){
    alert("No cards left in this deck.");
    return;
  }
  const card = deck[state.cardIndex];
  state.cardIndex += 1;
  Object.entries(card.effects).forEach(([ticker, effect]) => {
    const company = state.companies[ticker];
    company.previous = company.price;
    company.price = Math.max(1, company.price + effect);
  });
  state.students.forEach(student => saveStudentSnapshot(student, "L" + state.lesson + " C" + state.cardIndex));
  renderCard(card);
  log("Drew card: " + card.title + ".");
  render();
}

function renderCard(card){
  const el = document.getElementById("currentCard");
  if(!el) return;
  const effects = Object.entries(card.effects).map(([ticker, effect]) => {
    const cls = effect > 0 ? "pos" : effect < 0 ? "neg" : "zero";
    const sign = effect > 0 ? "+" : "";
    return `<div class="effect ${cls}">${ticker}: ${sign}${effect}</div>`;
  }).join("");
  el.innerHTML = `
    <span class="badge">Lesson ${state.lesson} · Card ${state.cardIndex}</span>
    <h2>${card.title}</h2>
    <p>${card.text}</p>
    <h3>Impact on share prices</h3>
    ${effects}
  `;
}

function setRewardPrice(id, value){
  const reward = state.rewards.find(r => r.id === id);
  if(reward){
    reward.price = Math.max(0, Number(value));
    log("Updated " + reward.name + " to " + reward.price + " tickets.");
    render();
  }
}

function applyInflation(){
  state.rewards.forEach(r => r.price += 2);
  log("Applied inflation: +2 tickets to all rewards.");
  render();
}

function openMarketEditor(){
  const editor = document.getElementById("marketEditor");
  editor.innerHTML = "";
  Object.entries(state.companies).forEach(([ticker, company]) => {
    editor.insertAdjacentHTML("beforeend", `
      <h3>${company.name} (${ticker})</h3>
      <label>Price</label>
      <input id="edit_price_${ticker}" type="number" min="1" step="1" value="${company.price}">
      <label>Shares Available</label>
      <input id="edit_available_${ticker}" type="number" min="0" step="1" value="${company.available}">
    `);
  });
  document.getElementById("marketDialog").showModal();
}

function saveMarketEditor(){
  Object.entries(state.companies).forEach(([ticker, company]) => {
    company.previous = company.price;
    company.price = Number(document.getElementById("edit_price_" + ticker).value);
    company.available = Number(document.getElementById("edit_available_" + ticker).value);
  });
  document.getElementById("marketDialog").close();
  log("Edited market prices / available shares.");
  render();
}

function drawGraph(){
  const canvas = document.getElementById("graph");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  const select = document.getElementById("graphStudent");
  const student = state.students.find(s => s.id === (select ? select.value : "")) || state.students[0];
  if(!student || !student.history || student.history.length === 0){
    ctx.fillStyle = "#172033";
    ctx.font = "18px Arial";
    ctx.fillText("No portfolio history yet.", 30, 40);
    return;
  }

  const data = student.history.slice(-25);
  const values = data.map(d => d.value);
  const max = Math.max(...values, 10);
  const min = Math.min(...values, 0);
  const pad = 45;
  const w = canvas.width - pad*2;
  const h = canvas.height - pad*2;

  ctx.strokeStyle = "#d6dfec";
  ctx.lineWidth = 1;
  for(let i=0;i<=4;i++){
    const y = pad + h/4*i;
    ctx.beginPath();
    ctx.moveTo(pad,y);
    ctx.lineTo(canvas.width-pad,y);
    ctx.stroke();
  }

  ctx.strokeStyle = "#0b5cad";
  ctx.lineWidth = 3;
  ctx.beginPath();
  data.forEach((point, i) => {
    const x = pad + (w / Math.max(data.length-1, 1)) * i;
    const y = pad + h - ((point.value - min) / Math.max(max-min, 1)) * h;
    if(i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();

  ctx.fillStyle = "#06214a";
  ctx.font = "18px Arial";
  ctx.fillText(student.name + ": Portfolio value over time", pad, 26);

  ctx.font = "12px Arial";
  data.forEach((point, i) => {
    const x = pad + (w / Math.max(data.length-1, 1)) * i;
    const y = pad + h - ((point.value - min) / Math.max(max-min, 1)) * h;
    ctx.beginPath();
    ctx.arc(x,y,4,0,Math.PI*2);
    ctx.fill();
    ctx.fillText(point.value, x-8, y-10);
  });
}

function exportJson(){
  download("investor-challenge-backup.json", JSON.stringify(state, null, 2), "application/json");
}

function importJsonFile(event){
  const file = event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = JSON.parse(reader.result);
      save();
      render();
      alert("Backup imported.");
    } catch(e) {
      alert("Could not import this JSON file.");
    }
  };
  reader.readAsText(file);
}

function exportCsv(){
  const rows = [["Name","Cash","QH Shares","II Shares","BZ Shares","Bank Value","Portfolio Value","Reward Purchases"]];
  state.students.forEach(student => rows.push([
    student.name,
    student.cash,
    student.shares.QH,
    student.shares.II,
    student.shares.BZ,
    bankValue(student),
    portfolioValue(student),
    (student.spending || []).length
  ]));
  const csv = rows.map(row => row.map(value => '"' + String(value).replaceAll('"','""') + '"').join(",")).join("\\n");
  download("investor-challenge-students.csv", csv, "text/csv");
}

function download(filename, text, type){
  const blob = new Blob([text], {type});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}

function resetAll(){
  if(confirm("Reset all data? This cannot be undone unless you have exported a backup.")){
    localStorage.removeItem(STORAGE_KEY);
    state = initialState();
    render();
  }
}

document.querySelectorAll("nav button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.add("active");
    drawGraph();
  });
});

document.addEventListener("change", event => {
  if(event.target && event.target.id === "txStudent") renderSelectedStudent();
});

render();
