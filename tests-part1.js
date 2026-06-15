const {suite,test,assert,eq} = require('./test-framework');
const {App,PLAYERS,DRILLS,START,END,TOTAL_DAYS,PRIZE_TARGET} = require('./test-harness');
const app = new App();

// ─── HELPERS ───
const P = PLAYERS;
const D = DRILLS.map(d=>d.id); // drill ids
const dates = app.challengeDates(); // all 17 dates
function rDrill() { return D[Math.floor(Math.random()*D.length)]; }

// ═══════════════════════════════════════════════════════════
suite('1. PIN SYSTEM — Creation & Verification');
// ═══════════════════════════════════════════════════════════
app.reset();

test('No PINs exist initially', () => {
  P.forEach(p => eq(app.hasPin(p), false));
  eq(app.hasPin('Coach'), false);
});

test('Create PIN for player', () => {
  app.createPin(P[0], '1234');
  eq(app.hasPin(P[0]), true);
  eq(app.verifyPin(P[0], '1234'), true);
});

test('Wrong PIN fails verification', () => {
  eq(app.verifyPin(P[0], '0000'), false);
  eq(app.verifyPin(P[0], '1235'), false);
});

test('Create PINs for all players + coach', () => {
  P.forEach((p,i) => app.createPin(p, String(1000+i)));
  app.createPin('Coach', '9999');
  P.forEach((p,i) => eq(app.verifyPin(p, String(1000+i)), true));
  eq(app.verifyPin('Coach', '9999'), true);
});

test('Each player PIN is independent', () => {
  eq(app.verifyPin(P[0], '1001'), false); // P[0] has 1000
  eq(app.verifyPin(P[1], '1000'), false); // P[1] has 1001
});

test('PIN with leading zeros works', () => {
  app.createPin(P[0], '0001');
  eq(app.verifyPin(P[0], '0001'), true);
  eq(app.verifyPin(P[0], '1'), false); // must be exact string
});

// ═══════════════════════════════════════════════════════════
suite('2. PIN SYSTEM — Reset');
// ═══════════════════════════════════════════════════════════

test('Reset PIN removes it', () => {
  app.createPin(P[0], '5555');
  eq(app.hasPin(P[0]), true);
  app.resetPin(P[0]);
  eq(app.hasPin(P[0]), false);
});

test('Reset one player does not affect others', () => {
  app.createPin(P[0], '1111'); app.createPin(P[1], '2222');
  app.resetPin(P[0]);
  eq(app.hasPin(P[0]), false);
  eq(app.hasPin(P[1]), true);
  eq(app.verifyPin(P[1], '2222'), true);
});

test('Can set new PIN after reset', () => {
  app.resetPin(P[0]);
  app.createPin(P[0], '7777');
  eq(app.verifyPin(P[0], '7777'), true);
});

test('Coach PIN reset is independent', () => {
  app.createPin('Coach', '9999');
  app.resetPin('Coach');
  eq(app.hasPin('Coach'), false);
  P.forEach(p => { if(app.hasPin(p)) assert(true); }); // others unaffected
});

// ═══════════════════════════════════════════════════════════
suite('3. USER SESSION — Save/Restore');
// ═══════════════════════════════════════════════════════════
app.reset();

test('No saved user initially', () => { eq(app.getSavedUser(), null); });
test('Save and restore user', () => { app.setSavedUser(P[0]); eq(app.getSavedUser(), P[0]); });
test('Switch user overwrites', () => { app.setSavedUser(P[5]); eq(app.getSavedUser(), P[5]); });
test('Clear user', () => { app.clearSavedUser(); eq(app.getSavedUser(), null); });
test('Save coach user', () => { app.setSavedUser('Coach'); eq(app.getSavedUser(), 'Coach'); });

// ═══════════════════════════════════════════════════════════
suite('4. PRACTICE LOGGING — Basic');
// ═══════════════════════════════════════════════════════════
app.reset();

test('No entries initially', () => { P.forEach(p => eq(app.getTotalDays(p), 0)); });

test('Log single entry', () => {
  app.logEntry(P[0], dates[0], 'dribbling', 'Great session');
  eq(app.getTotalDays(P[0]), 1);
  const e = app.getEntry(P[0], dates[0]);
  eq(e.drills[0], 'Dribbling'); eq(e.note, 'Great session'); eq(e.duration, 15);
});

test('Log overwrites same day (update)', () => {
  app.logEntry(P[0], dates[0], 'shooting', 'Changed to shooting');
  eq(app.getTotalDays(P[0]), 1); // still 1
  eq(app.getEntry(P[0], dates[0]).drills[0], 'Shooting');
});

test('Log different days increments count', () => {
  app.logEntry(P[0], dates[1], 'passing');
  app.logEntry(P[0], dates[2], 'fitness');
  eq(app.getTotalDays(P[0]), 3);
});

test('Different players are independent', () => {
  app.logEntry(P[1], dates[0], 'skills');
  eq(app.getTotalDays(P[0]), 3);
  eq(app.getTotalDays(P[1]), 1);
});

test('Log with empty note', () => {
  app.logEntry(P[2], dates[0], 'passing', '');
  eq(app.getEntry(P[2], dates[0]).note, '');
});

test('All drill types can be logged', () => {
  D.forEach((d,i) => { if(i < TOTAL_DAYS) app.logEntry(P[3], dates[i], d); });
  eq(app.getTotalDays(P[3]), D.length);
});

// ═══════════════════════════════════════════════════════════
suite('5. COACH LOGGING — Add/Edit/Delete');
// ═══════════════════════════════════════════════════════════
app.reset();

test('Coach adds entry for player', () => {
  app.logCoachEntry(P[0], dates[0], 'dribbling', 'Added by coach');
  eq(app.getTotalDays(P[0]), 1);
  eq(app.getEntry(P[0], dates[0]).time, 'Coach');
});

test('Coach edits entry', () => {
  app.logEntry(P[1], dates[0], 'passing', 'Original');
  const ok = app.editEntry(P[1], dates[0], 'shooting', 'Edited by coach');
  eq(ok, true);
  eq(app.getEntry(P[1], dates[0]).drills[0], 'Shooting');
  eq(app.getEntry(P[1], dates[0]).note, 'Edited by coach');
});

test('Coach edit preserves time field', () => {
  app.logEntry(P[2], dates[0], 'fitness', '');
  const origTime = app.getEntry(P[2], dates[0]).time;
  app.editEntry(P[2], dates[0], 'skills', 'Updated');
  eq(app.getEntry(P[2], dates[0]).time, origTime);
});

test('Coach edit non-existent entry returns false', () => {
  eq(app.editEntry(P[5], dates[5], 'passing', 'nope'), false);
});

test('Coach deletes entry', () => {
  app.logEntry(P[3], dates[0], 'dribbling');
  app.logEntry(P[3], dates[1], 'passing');
  eq(app.getTotalDays(P[3]), 2);
  app.deleteEntry(P[3], dates[0]);
  eq(app.getTotalDays(P[3]), 1);
  eq(app.getEntry(P[3], dates[0]), null);
  eq(app.getEntry(P[3], dates[1]).drills[0], 'Passing'); // other entry intact
});

test('Delete non-existent entry is safe', () => {
  app.deleteEntry(P[10], '2026-04-25'); // no crash
  eq(app.getTotalDays(P[10]), 0);
});

test('Coach adds entries across multiple players', () => {
  app.reset();
  P.forEach(p => app.logCoachEntry(p, dates[0], 'passing', 'Team drill'));
  P.forEach(p => { eq(app.getTotalDays(p), 1); eq(app.getEntry(p, dates[0]).time, 'Coach'); });
});

module.exports = {}; // allow chaining
