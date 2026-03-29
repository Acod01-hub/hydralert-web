require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Log = require('./models/Log');

/**
 * Seed demo data: 3 demo users with realistic hydration histories.
 * Profiles:
 *   1. Eleanor (elderly, 72yo, low activity)
 *   2. Marcus (athlete, 28yo, high activity)
 *   3. Sarah (parent, 38yo, medium + child dependent)
 *   4. Emma (Sarah's child, 8yo, low)
 */
async function seedDemoData() {
  // Remove existing demo users
  await User.deleteMany({ isDemo: true });
  await Log.deleteMany({});

  // ─── Create demo users ────────────────────────────────
  const eleanor = await User.create({
    name: 'Eleanor Thompson',
    email: 'eleanor@demo.hydralert.app',
    passwordHash: 'Demo1234!',
    age: 72,
    weightKg: 62,
    sex: 'female',
    activityLevel: 'low',
    dailyGoalMl: 1500,
    isDemo: true
  });

  const marcus = await User.create({
    name: 'Marcus Rivera',
    email: 'marcus@demo.hydralert.app',
    passwordHash: 'Demo1234!',
    age: 28,
    weightKg: 82,
    sex: 'male',
    activityLevel: 'high',
    dailyGoalMl: 3500,
    isDemo: true
  });

  const emma = await User.create({
    name: 'Emma Chen',
    email: 'emma@demo.hydralert.app',
    passwordHash: 'Demo1234!',
    age: 8,
    weightKg: 28,
    sex: 'female',
    activityLevel: 'low',
    dailyGoalMl: 1200,
    isDemo: true
  });

  const sarah = await User.create({
    name: 'Sarah Chen',
    email: 'sarah@demo.hydralert.app',
    passwordHash: 'Demo1234!',
    age: 38,
    weightKg: 65,
    sex: 'female',
    activityLevel: 'medium',
    dailyGoalMl: 2000,
    isCaregiver: true,
    caregiverOf: [emma._id],
    isDemo: true
  });

  // ─── Generate 14 days of logs ─────────────────────────
  const logs = [];
  const users = [
    { user: eleanor, intakeRange: [800, 1600] },   // Often under goal (elderly)
    { user: marcus, intakeRange: [2800, 4200] },    // Usually meets goal (athlete)
    { user: sarah, intakeRange: [1500, 2200] },     // Mostly meets goal (parent)
    { user: emma, intakeRange: [900, 1400] }        // Variable (child)
  ];

  for (let dayOffset = 13; dayOffset >= 0; dayOffset--) {
    for (const { user, intakeRange } of users) {
      const date = new Date();
      date.setDate(date.getDate() - dayOffset);

      const totalIntake = intakeRange[0] + Math.floor(Math.random() * (intakeRange[1] - intakeRange[0]));
      const numLogs = 3 + Math.floor(Math.random() * 4); // 3–6 logs per day

      let remaining = totalIntake;
      for (let i = 0; i < numLogs; i++) {
        const isLast = i === numLogs - 1;
        const amount = isLast
          ? remaining
          : Math.min(remaining - 100, 100 + Math.floor(Math.random() * 500));
        remaining -= amount;

        const logTime = new Date(date);
        logTime.setHours(7 + i * 2 + Math.floor(Math.random() * 2));
        logTime.setMinutes(Math.floor(Math.random() * 60));

        logs.push({ userId: user._id, amountMl: Math.max(amount, 100), timestamp: logTime });
      }
    }
  }

  await Log.insertMany(logs);

  // ─── Set streaks ──────────────────────────────────────
  await User.findByIdAndUpdate(marcus._id, { currentStreakDays: 12 });
  await User.findByIdAndUpdate(sarah._id, { currentStreakDays: 5 });
  await User.findByIdAndUpdate(eleanor._id, { currentStreakDays: 2 });

  console.log('✅ Demo data seeded!');
  return {
    users: [
      { email: 'eleanor@demo.hydralert.app', password: 'Demo1234!', role: 'Elderly user' },
      { email: 'marcus@demo.hydralert.app', password: 'Demo1234!', role: 'Athlete' },
      { email: 'sarah@demo.hydralert.app', password: 'Demo1234!', role: 'Parent (caregiver)' },
      { email: 'emma@demo.hydralert.app', password: 'Demo1234!', role: "Sarah's child" }
    ],
    logsCreated: logs.length
  };
}

// Run directly: node src/seed.js
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => seedDemoData())
    .then(() => process.exit(0))
    .catch(err => { console.error(err); process.exit(1); });
}

module.exports = { seedDemoData };
