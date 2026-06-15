// Test harness - simulates localStorage and app core logic for testing
const K='olm-blues-v1', KP='olm-blues-pins', KU='olm-blues-user';
const PLAYERS=['Sophie','Sylvie','Annie','Eva','Chloe','Esme','Marnie','Hannah','Aminah','Orla','Layla','Rebecca','Collette'];
const DRILLS=[
  {id:'dribbling',name:'Dribbling'},{id:'shooting',name:'Shooting'},
  {id:'passing',name:'Passing'},{id:'fitness',name:'Fitness'},
  {id:'skills',name:'Ball Mastery'},{id:'first-touch',name:'First Touch'},
  {id:'receiving',name:'Receiving'},{id:'goalkeeping',name:'Goalkeeping'},{id:'other',name:'Other'}
];
const START='2026-04-03', END='2026-04-19', TOTAL_DAYS=17, PRIZE_TARGET=10;

// Mock localStorage
class MockStorage {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] ?? null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
  clear() { this.store = {}; }
}

// App logic extracted for testing (mirrors index.html exactly)
class App {
  constructor() {
    this.storage = new MockStorage();
    this._today = START; // controllable "today"
  }
  reset() { this.storage.clear(); this._today = START; }
  setToday(d) { this._today = d; }
  today() { return this._today; }
  ds(d) { return d.toISOString().split('T')[0]; }
  getData() { try { return JSON.parse(this.storage.getItem(K)) || {}; } catch { return {}; } }
  saveData(d) { this.storage.setItem(K, JSON.stringify(d)); }
  getPins() { try { return JSON.parse(this.storage.getItem(KP)) || {}; } catch { return {}; } }
  savePins(d) { this.storage.setItem(KP, JSON.stringify(d)); }
  getSavedUser() { return this.storage.getItem(KU); }
  setSavedUser(u) { this.storage.setItem(KU, u); }
  clearSavedUser() { this.storage.removeItem(KU); }

  getPlayerDays(n) { return Object.keys(this.getData()[n] || {}).sort(); }
  getTotalDays(n) { return this.getPlayerDays(n).length; }

  getStreak(n) {
    const days = this.getPlayerDays(n); if (!days.length) return 0;
    let s = 0, c = new Date(this.today() + 'T12:00:00');
    for (let i = 0; i < TOTAL_DAYS; i++) {
      const cd = this.ds(c); if (cd < START) break;
      if (days.includes(cd)) s++; else if (cd <= this.today()) break;
      c.setDate(c.getDate() - 1);
    } return s;
  }

  // PIN operations
  createPin(name, pin) { const p = this.getPins(); p[name] = pin; this.savePins(p); }
  verifyPin(name, pin) { return this.getPins()[name] === pin; }
  resetPin(name) { const p = this.getPins(); delete p[name]; this.savePins(p); }
  hasPin(name) { return !!this.getPins()[name]; }

  // Practice logging — supports multiple drills + duration
  logEntry(player, date, drillId, note = '', duration = 15) {
    const data = this.getData();
    if (!data[player]) data[player] = {};
    const drill = DRILLS.find(d => d.id === drillId);
    data[player][date] = { drills: [drill.name], drillIds: [drillId], note, duration, time: '10:00' };
    this.saveData(data);
  }
  logMultiEntry(player, date, drillIds, note = '', duration = 15) {
    const data = this.getData();
    if (!data[player]) data[player] = {};
    const names = drillIds.map(id => DRILLS.find(d => d.id === id).name);
    data[player][date] = { drills: names, drillIds: drillIds.slice(), note, duration, time: '10:00' };
    this.saveData(data);
  }
  logCoachEntry(player, date, drillId, note = '', duration = 15) {
    const data = this.getData();
    if (!data[player]) data[player] = {};
    const drill = DRILLS.find(d => d.id === drillId);
    data[player][date] = { drills: [drill.name], drillIds: [drillId], note, duration, time: 'Coach' };
    this.saveData(data);
  }
  deleteEntry(player, date) {
    const data = this.getData();
    if (data[player]) { delete data[player][date]; this.saveData(data); }
  }
  editEntry(player, date, drillId, note) {
    const data = this.getData();
    if (!data[player]?.[date]) return false;
    const drill = DRILLS.find(d => d.id === drillId);
    data[player][date] = { ...data[player][date], drills: [drill.name], drillIds: [drillId], note };
    this.saveData(data); return true;
  }
  getChallengeDays(n) { const sd = START, ed = END; return this.getPlayerDays(n).filter(d => d >= sd && d <= ed); }
  getTotalDays(n) { return this.getChallengeDays(n).length; }
  getEntry(player, date) { return this.getData()[player]?.[date] || null; }
  getTotalMinutes(n) { const data = this.getData()[n] || {}; return Object.entries(data).filter(([d]) => d >= START && d <= END).reduce((s,[,e]) => s + (e.duration || 15), 0); }

  // Leaderboard
  getLeaderboard() {
    return PLAYERS.map(p => ({ name: p, total: this.getTotalDays(p), streak: this.getStreak(p), mins: this.getTotalMinutes(p) }))
      .sort((a, b) => b.total - a.total || b.mins - a.mins);
  }

  // Date helpers
  challengeDates() {
    const dates = []; const d = new Date(START + 'T12:00:00');
    for (let i = 0; i < TOTAL_DAYS; i++) { dates.push(this.ds(d)); d.setDate(d.getDate() + 1); }
    return dates;
  }
  addDays(date, n) { const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate() + n); return this.ds(d); }
}

module.exports = { App, PLAYERS, DRILLS, START, END, TOTAL_DAYS, PRIZE_TARGET, K, KP, KU };
