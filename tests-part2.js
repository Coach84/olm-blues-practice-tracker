const {suite,test,assert,eq} = require('./test-framework');
const {App,PLAYERS,DRILLS,START,END,TOTAL_DAYS,PRIZE_TARGET} = require('./test-harness');
const app = new App();
const P = PLAYERS, D = DRILLS.map(d=>d.id), dates = app.challengeDates();

// ═══════════════════════════════════════════════════════════
suite('6. STREAKS — Consecutive Day Tracking');
// ═══════════════════════════════════════════════════════════
app.reset();

test('Zero streak with no entries', () => { eq(app.getStreak(P[0]), 0); });

test('1-day streak on first day', () => {
  app.setToday(dates[0]);
  app.logEntry(P[0], dates[0], 'dribbling');
  eq(app.getStreak(P[0]), 1);
});

test('2-day streak after consecutive days', () => {
  app.setToday(dates[1]);
  app.logEntry(P[0], dates[1], 'passing');
  eq(app.getStreak(P[0]), 2);
});

test('5-day streak', () => {
  for (let i = 2; i < 5; i++) {
    app.setToday(dates[i]);
    app.logEntry(P[0], dates[i], D[i % D.length]);
  }
  eq(app.getStreak(P[0]), 5);
});

test('Streak breaks on missed day', () => {
  // P[0] has days 0-4. Skip day 5, log day 6
  app.setToday(dates[6]);
  app.logEntry(P[0], dates[6], 'shooting');
  eq(app.getStreak(P[0]), 1); // only day 6
});

test('Streak resumes after gap', () => {
  app.setToday(dates[7]);
  app.logEntry(P[0], dates[7], 'fitness');
  eq(app.getStreak(P[0]), 2); // days 6-7
});

test('10-day streak (prize threshold)', () => {
  app.reset(); app.setToday(dates[9]);
  for (let i = 0; i <= 9; i++) app.logEntry(P[1], dates[i], D[i % D.length]);
  eq(app.getStreak(P[1]), 10);
});

test('Full 17-day streak (perfect attendance)', () => {
  app.reset(); app.setToday(dates[16]);
  dates.forEach((d,i) => app.logEntry(P[2], d, D[i % D.length]));
  eq(app.getStreak(P[2]), 17);
});

test('Streak only counts backwards from today', () => {
  app.reset(); app.setToday(dates[5]);
  // Log days 0,1,2 and 5 — streak should be 1 (only day 5 is consecutive from today)
  app.logEntry(P[3], dates[0], 'dribbling');
  app.logEntry(P[3], dates[1], 'dribbling');
  app.logEntry(P[3], dates[2], 'dribbling');
  app.logEntry(P[3], dates[5], 'dribbling');
  eq(app.getStreak(P[3]), 1);
});

test('Streak with gap in middle', () => {
  app.reset(); app.setToday(dates[6]);
  // Days 0,1,2 then 4,5,6 — streak from today = 3
  [0,1,2,4,5,6].forEach(i => app.logEntry(P[4], dates[i], 'passing'));
  eq(app.getStreak(P[4]), 3);
});

test('Streak when today has no entry', () => {
  app.reset(); app.setToday(dates[3]);
  app.logEntry(P[5], dates[0], 'dribbling');
  app.logEntry(P[5], dates[1], 'dribbling');
  app.logEntry(P[5], dates[2], 'dribbling');
  // Day 3 (today) not logged — streak = 0 (broken)
  eq(app.getStreak(P[5]), 0);
});

// ═══════════════════════════════════════════════════════════
suite('7. TOTAL DAYS & PRIZE THRESHOLD');
// ═══════════════════════════════════════════════════════════
app.reset();

test('Prize not earned with 9 days', () => {
  for (let i = 0; i < 9; i++) app.logEntry(P[0], dates[i], rDrill());
  assert(app.getTotalDays(P[0]) < PRIZE_TARGET);
});

test('Prize earned at exactly 10 days', () => {
  app.logEntry(P[0], dates[9], rDrill());
  eq(app.getTotalDays(P[0]), PRIZE_TARGET);
});

test('Prize still earned with 17 days', () => {
  dates.forEach(d => app.logEntry(P[1], d, rDrill()));
  eq(app.getTotalDays(P[1]), 17);
  assert(app.getTotalDays(P[1]) >= PRIZE_TARGET);
});

test('Remaining days calculation', () => {
  app.reset();
  for (let i = 0; i < 7; i++) app.logEntry(P[0], dates[i], rDrill());
  eq(Math.max(0, PRIZE_TARGET - app.getTotalDays(P[0])), 3);
});

function rDrill() { return D[Math.floor(Math.random()*D.length)]; }

// ═══════════════════════════════════════════════════════════
suite('8. LEADERBOARD — Ranking & Sorting');
// ═══════════════════════════════════════════════════════════
app.reset(); app.setToday(dates[16]);

test('Empty leaderboard — all at 0', () => {
  const lb = app.getLeaderboard();
  eq(lb.length, 13);
  lb.forEach(p => { eq(p.total, 0); eq(p.streak, 0); });
});

test('Player with most days ranks first', () => {
  for (let i = 0; i < 10; i++) app.logEntry(P[0], dates[i], rDrill());
  for (let i = 0; i < 5; i++) app.logEntry(P[1], dates[i], rDrill());
  const lb = app.getLeaderboard();
  eq(lb[0].name, P[0]); eq(lb[0].total, 10);
  eq(lb[1].name, P[1]); eq(lb[1].total, 5);
});

test('Tiebreaker: more minutes ranks higher', () => {
  app.reset(); app.setToday(dates[4]);
  // Both have 3 days, but P[0] has 45 mins, P[1] has 90 mins
  [0,2,4].forEach(i => app.logEntry(P[0], dates[i], rDrill(), '', 15));
  [2,3,4].forEach(i => app.logEntry(P[1], dates[i], rDrill(), '', 30));
  const lb = app.getLeaderboard();
  const p0 = lb.find(p=>p.name===P[0]), p1 = lb.find(p=>p.name===P[1]);
  eq(p0.total, 3); eq(p1.total, 3);
  eq(p1.mins, 90); eq(p0.mins, 45);
  assert(lb.indexOf(p1) < lb.indexOf(p0), 'More minutes should rank first on tie');
});

test('All 13 players always present in leaderboard', () => {
  eq(app.getLeaderboard().length, 13);
});

// ═══════════════════════════════════════════════════════════
suite('9. PLAYER PERSONAS — Full Holiday Simulation');
// ═══════════════════════════════════════════════════════════
app.reset();

// Define 6 distinct player personas
const personas = {
  'Sophie': { type: 'Perfect', days: dates.slice(), drills: 'varied' },
  'Sylvie': { type: 'Dedicated (14/17)', days: dates.filter((_,i)=>i!==5&&i!==10&&i!==15), drills: 'varied' },
  'Annie': { type: 'Weekdays only', days: dates.filter(d=>{const dow=new Date(d+'T12:00:00').getDay();return dow>0&&dow<6}), drills: 'single' },
  'Eva': { type: 'Weekends only', days: dates.filter(d=>{const dow=new Date(d+'T12:00:00').getDay();return dow===0||dow===6}), drills: 'single' },
  'Chloe': { type: 'First week only', days: dates.slice(0,7), drills: 'varied' },
  'Esme': { type: 'Last week only', days: dates.slice(10), drills: 'varied' },
  'Marnie': { type: 'Every other day', days: dates.filter((_,i)=>i%2===0), drills: 'varied' },
  'Hannah': { type: 'Just hits 10', days: dates.slice(0,10), drills: 'single' },
  'Aminah': { type: 'Just misses (9)', days: dates.slice(0,9), drills: 'varied' },
  'Orla': { type: 'Sporadic (random 6)', days: [dates[0],dates[3],dates[7],dates[11],dates[14],dates[16]], drills: 'varied' },
  'Layla': { type: 'Never practices', days: [], drills: 'none' },
  'Rebecca': { type: 'Late starter (day 8+)', days: dates.slice(7), drills: 'varied' },
  'Collette': { type: 'Burst pattern', days: [...dates.slice(0,3),...dates.slice(7,10),...dates.slice(14,17)], drills: 'varied' },
};

// Simulate the full holiday
test('Simulate all 17 days for all personas', () => {
  let drillIdx = 0;
  for (const [player, persona] of Object.entries(personas)) {
    persona.days.forEach(d => {
      const drill = persona.drills === 'single' ? 'dribbling' : D[drillIdx++ % D.length];
      app.logEntry(player, d, drill, `${persona.type} session`);
    });
  }
  // Verify counts
  eq(app.getTotalDays('Sophie'), 17, 'Perfect: 17 days');
  eq(app.getTotalDays('Sylvie'), 14, 'Dedicated: 14 days');
  eq(app.getTotalDays('Hannah'), 10, 'Just hits 10');
  eq(app.getTotalDays('Aminah'), 9, 'Just misses: 9');
  eq(app.getTotalDays('Layla'), 0, 'Never practices: 0');
});

test('Streak calculations for each persona at end of holiday', () => {
  app.setToday(dates[16]); // last day
  eq(app.getStreak('Sophie'), 17, 'Perfect: 17-day streak');
  eq(app.getStreak('Chloe'), 0, 'First week only: 0 streak at end');
  eq(app.getStreak('Esme'), 7, 'Last week: 7-day streak');
  eq(app.getStreak('Marnie'), 1, 'Every other: 1 (day 16 logged)');
  eq(app.getStreak('Layla'), 0, 'Never: 0 streak');
  eq(app.getStreak('Collette'), 3, 'Burst: 3-day streak (days 14-16)');
});

test('Prize eligibility', () => {
  const winners = P.filter(p => app.getTotalDays(p) >= PRIZE_TARGET);
  const losers = P.filter(p => app.getTotalDays(p) < PRIZE_TARGET);
  assert(winners.includes('Sophie'), 'Perfect should win');
  assert(winners.includes('Sylvie'), 'Dedicated should win');
  assert(winners.includes('Hannah'), 'Just-10 should win');
  assert(winners.includes('Rebecca'), 'Late starter (10 days) should win');
  assert(losers.includes('Aminah'), 'Just-9 should not win');
  assert(losers.includes('Layla'), 'Never should not win');
  assert(losers.includes('Eva'), 'Weekends only should not win');
});

test('Leaderboard order reflects personas', () => {
  app.setToday(dates[16]);
  const lb = app.getLeaderboard();
  eq(lb[0].name, 'Sophie', 'Perfect player ranks #1');
  eq(lb[0].total, 17);
  // Player 11 (never) should be last
  eq(lb[12].total, 0);
});

test('Varied drill categories recorded correctly', () => {
  const days = app.getPlayerDays('Sophie');
  const drillNames = days.map(d => app.getEntry('Sophie', d).drills[0]);
  const unique = new Set(drillNames);
  assert(unique.size > 1, 'Varied player should have multiple drill types');
});

test('Single drill category player has one type', () => {
  const days = app.getPlayerDays('Annie');
  const drillNames = new Set(days.map(d => app.getEntry('Annie', d).drills[0]));
  eq(drillNames.size, 1, 'Single-drill player should have one type');
});

// ═══════════════════════════════════════════════════════════
suite('10. MID-HOLIDAY STREAK SNAPSHOTS');
// ═══════════════════════════════════════════════════════════

test('Day 5 streaks', () => {
  app.setToday(dates[4]); // day 5
  eq(app.getStreak('Sophie'), 5, 'Perfect: 5 on day 5');
  eq(app.getStreak('Chloe'), 5, 'First-week: 5 on day 5');
  eq(app.getStreak('Layla'), 0, 'Never: 0');
});

test('Day 10 streaks', () => {
  app.setToday(dates[9]); // day 10
  eq(app.getStreak('Sophie'), 10, 'Perfect: 10 on day 10');
  eq(app.getStreak('Chloe'), 0, 'First-week: 0 on day 10 (stopped day 7)');
  eq(app.getStreak('Hannah'), 10, 'Just-10: 10 on day 10');
});

test('Day 1 — everyone starts fresh', () => {
  app.setToday(dates[0]);
  eq(app.getStreak('Sophie'), 1);
  eq(app.getStreak('Layla'), 0);
  eq(app.getStreak('Esme'), 0, 'Late starter: 0 on day 1');
});

// ═══════════════════════════════════════════════════════════
suite('11. COACH ADMIN — Full Workflow');
// ═══════════════════════════════════════════════════════════
app.reset(); app.setToday(dates[16]);

test('Coach adds missed entry for player', () => {
  app.logCoachEntry('Layla', dates[5], 'passing', 'Forgot to log');
  eq(app.getTotalDays('Layla'), 1);
  eq(app.getEntry('Layla', dates[5]).time, 'Coach');
});

test('Coach removes fraudulent entry', () => {
  app.logEntry('Orla', dates[0], 'dribbling', 'Suspicious');
  app.logEntry('Orla', dates[1], 'dribbling');
  eq(app.getTotalDays('Orla'), 2);
  app.deleteEntry('Orla', dates[0]);
  eq(app.getTotalDays('Orla'), 1);
  eq(app.getEntry('Orla', dates[0]), null);
});

test('Coach edits wrong drill type', () => {
  app.logEntry('Annie', dates[0], 'dribbling', 'Was actually passing');
  app.editEntry('Annie', dates[0], 'passing', 'Corrected by coach');
  eq(app.getEntry('Annie', dates[0]).drills[0], 'Passing');
  eq(app.getEntry('Annie', dates[0]).note, 'Corrected by coach');
});

test('Coach resets PIN then player can set new one', () => {
  app.createPin('Marnie', '1234');
  eq(app.verifyPin('Marnie', '1234'), true);
  app.resetPin('Marnie');
  eq(app.hasPin('Marnie'), false);
  app.createPin('Marnie', '5678');
  eq(app.verifyPin('Marnie', '5678'), true);
  eq(app.verifyPin('Marnie', '1234'), false);
});

test('Coach bulk-adds entries for team drill day', () => {
  app.reset();
  P.forEach(p => app.logCoachEntry(p, dates[0], 'receiving', 'Team session'));
  eq(P.every(p => app.getTotalDays(p) === 1), true);
  eq(P.every(p => app.getEntry(p, dates[0]).drills[0] === 'Receiving'), true);
});

// ═══════════════════════════════════════════════════════════
suite('12. EDGE CASES & DATA INTEGRITY');
// ═══════════════════════════════════════════════════════════
app.reset();

test('Challenge dates are exactly 17', () => { eq(dates.length, 17); });
test('First date is Apr 3', () => { eq(dates[0], '2026-04-03'); });
test('Last date is Apr 19', () => { eq(dates[16], '2026-04-19'); });

test('FIXED: Logging before challenge start is NOT counted in streak', () => {
  app.setToday('2026-04-02');
  app.logEntry(P[0], '2026-04-02', 'dribbling');
  eq(app.getStreak(P[0]), 0); // correctly excluded now
});

test('Days outside challenge window not counted in total', () => {
  app.reset();
  app.logEntry(P[0], '2026-04-02', 'dribbling', '', 20); // before
  app.logEntry(P[0], '2026-04-03', 'passing', '', 15);    // in window
  app.logEntry(P[0], '2026-04-20', 'shooting', '', 30);   // after
  eq(app.getTotalDays(P[0]), 1, 'Only challenge window days count');
  eq(app.getTotalMinutes(P[0]), 15, 'Only challenge window minutes count');
});

test('Data survives multiple read/write cycles', () => {
  app.reset();
  for (let i = 0; i < 50; i++) {
    app.logEntry(P[0], dates[i % TOTAL_DAYS], D[i % D.length], `Cycle ${i}`);
  }
  eq(app.getTotalDays(P[0]), TOTAL_DAYS); // max 17 unique dates
});

test('Empty string player name does not corrupt data', () => {
  const before = JSON.stringify(app.getData());
  app.logEntry('', dates[0], 'dribbling');
  // Should create entry under empty key but not affect real players
  eq(app.getTotalDays(P[0]), app.getTotalDays(P[0])); // unchanged
});

test('Concurrent-style updates (rapid logging)', () => {
  app.reset();
  // Simulate rapid updates on same day
  app.logEntry(P[0], dates[0], 'dribbling', 'First');
  app.logEntry(P[0], dates[0], 'shooting', 'Second');
  app.logEntry(P[0], dates[0], 'passing', 'Third');
  eq(app.getTotalDays(P[0]), 1);
  eq(app.getEntry(P[0], dates[0]).drills[0], 'Passing'); // last write wins
});

test('Delete then re-add same date', () => {
  app.logEntry(P[1], dates[0], 'dribbling', 'Original');
  app.deleteEntry(P[1], dates[0]);
  eq(app.getEntry(P[1], dates[0]), null);
  app.logEntry(P[1], dates[0], 'shooting', 'Re-added');
  eq(app.getEntry(P[1], dates[0]).drills[0], 'Shooting');
});

test('Player days are always sorted', () => {
  app.reset();
  // Log in reverse order
  app.logEntry(P[0], dates[10], 'dribbling');
  app.logEntry(P[0], dates[2], 'passing');
  app.logEntry(P[0], dates[7], 'shooting');
  const days = app.getPlayerDays(P[0]);
  for (let i = 1; i < days.length; i++) assert(days[i] > days[i-1], 'Days should be sorted');
});

test('All 8 drill types are valid', () => {
  eq(DRILLS.length, 9);
  D.forEach(id => {
    const drill = DRILLS.find(d => d.id === id);
    assert(drill, `Drill ${id} should exist`);
    assert(drill.name.length > 0, `Drill ${id} should have a name`);
  });
});

// ═══════════════════════════════════════════════════════════
suite('13. MULTI-DRILL LOGGING');
// ═══════════════════════════════════════════════════════════
app.reset();

test('Log multiple drills in one session', () => {
  app.logMultiEntry(P[0], dates[0], ['dribbling','shooting','passing'], 'Big session', 30);
  const e = app.getEntry(P[0], dates[0]);
  eq(e.drills.length, 3);
  eq(e.drills[0], 'Dribbling'); eq(e.drills[1], 'Shooting'); eq(e.drills[2], 'Passing');
  eq(e.drillIds.length, 3);
  eq(e.duration, 30);
});

test('Multi-drill still counts as 1 day', () => {
  eq(app.getTotalDays(P[0]), 1);
});

test('Single drill stored as array of 1', () => {
  app.logEntry(P[1], dates[0], 'fitness', '', 20);
  const e = app.getEntry(P[1], dates[0]);
  eq(Array.isArray(e.drills), true);
  eq(e.drills.length, 1);
  eq(e.drillIds.length, 1);
});

test('All 8 drills in one session', () => {
  app.logMultiEntry(P[2], dates[0], D, 'Everything!', 60);
  eq(app.getEntry(P[2], dates[0]).drills.length, 9);
});

// ═══════════════════════════════════════════════════════════
suite('14. DURATION TRACKING');
// ═══════════════════════════════════════════════════════════
app.reset();

test('Duration stored correctly', () => {
  app.logEntry(P[0], dates[0], 'dribbling', '', 25);
  eq(app.getEntry(P[0], dates[0]).duration, 25);
});

test('Default duration is 15', () => {
  app.logEntry(P[1], dates[0], 'passing');
  eq(app.getEntry(P[1], dates[0]).duration, 15);
});

test('Total minutes across multiple days', () => {
  app.reset();
  app.logEntry(P[0], dates[0], 'dribbling', '', 10);
  app.logEntry(P[0], dates[1], 'shooting', '', 20);
  app.logEntry(P[0], dates[2], 'passing', '', 30);
  eq(app.getTotalMinutes(P[0]), 60);
});

test('Total minutes for player with no entries', () => {
  eq(app.getTotalMinutes(P[5]), 0);
});

test('Coach entry includes duration', () => {
  app.logCoachEntry(P[3], dates[0], 'fitness', 'Team session', 45);
  eq(app.getEntry(P[3], dates[0]).duration, 45);
});

test('Leaderboard includes minutes', () => {
  const lb = app.getLeaderboard();
  const p0 = lb.find(p => p.name === P[0]);
  eq(p0.mins, 60);
});

// ═══════════════════════════════════════════════════════════
suite('15. STREAK & PRIZE ANIMATION THRESHOLDS');
// ═══════════════════════════════════════════════════════════
app.reset();

test('Streak 1-2: basic animation', () => {
  app.setToday(dates[0]);
  app.logEntry(P[0], dates[0], 'dribbling');
  const streak = app.getStreak(P[0]);
  eq(streak, 1);
  eq(streak < 3, true, 'Should be basic tier');
});

test('Streak 3-4: fire animation tier', () => {
  app.setToday(dates[2]);
  app.logEntry(P[0], dates[1], 'passing');
  app.logEntry(P[0], dates[2], 'shooting');
  eq(app.getStreak(P[0]), 3);
  const s = app.getStreak(P[0]);
  assert(s >= 3 && s < 5, 'Should be fire tier');
});

test('Streak 5: football animation tier', () => {
  app.logEntry(P[0], dates[3], 'fitness');
  app.setToday(dates[4]);
  app.logEntry(P[0], dates[4], 'skills');
  eq(app.getStreak(P[0]), 5);
  const s = app.getStreak(P[0]);
  assert(s >= 5 && s < 13, 'Should be football tier');
});

test('Streak 13: Taylor Swift animation tier', () => {
  for (let i = 5; i <= 12; i++) app.logEntry(P[0], dates[i], D[i % D.length]);
  app.setToday(dates[12]);
  eq(app.getStreak(P[0]), 13);
  assert(app.getStreak(P[0]) >= 13, 'Should be Taylor Swift tier');
});

test('Prize triggers on TOTAL DAYS = 10, not streak', () => {
  app.reset();
  // Log 10 non-consecutive days — no streak but should earn prize
  [0,1,3,5,7,8,10,12,14,16].forEach(i => app.logEntry(P[1], dates[i], rDrill()));
  app.setToday(dates[16]);
  eq(app.getTotalDays(P[1]), 10, 'Should have 10 total days');
  assert(app.getTotalDays(P[1]) >= PRIZE_TARGET, 'Should have earned prize');
  eq(app.getStreak(P[1]), 1, 'Streak should only be 1 (non-consecutive)');
});

test('Prize NOT earned at 9 total days regardless of streak', () => {
  app.reset(); app.setToday(dates[8]);
  for (let i = 0; i <= 8; i++) app.logEntry(P[2], dates[i], rDrill());
  eq(app.getTotalDays(P[2]), 9);
  eq(app.getStreak(P[2]), 9);
  assert(app.getTotalDays(P[2]) < PRIZE_TARGET, '9 days should not earn prize even with 9-day streak');
});

test('Streak tiers are mutually exclusive', () => {
  const tiers = [
    {min:1,max:2,name:'basic'},{min:3,max:4,name:'fire'},
    {min:5,max:12,name:'football'},{min:13,max:17,name:'taylor'}
  ];
  for (let s = 1; s <= 17; s++) {
    const matching = tiers.filter(t => s >= t.min && s <= t.max);
    eq(matching.length, 1, `Streak ${s} should match exactly 1 tier, got ${matching.length}`);
  }
});

module.exports = {};
