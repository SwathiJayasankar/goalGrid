/**
 * One-off seed: college CSE student goals + calendar tasks
 * Run: node seed-cse-student.js
 */
require('dotenv').config();

const API = 'http://localhost:5000/api';
const EMAIL = 'cse.student@college.edu';
const PASSWORD = 'CseStudent2026!';

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const addDays = (base, n) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
};

async function main() {
  let token;
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD })
  });
  if (loginRes.ok) {
    const data = await loginRes.json();
    token = data.token;
  } else {
    console.log('Login failed, attempting signup...');
    const signupRes = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });
    if (!signupRes.ok) {
      const err = await signupRes.text();
      throw new Error(`Login and Signup failed: ${err}`);
    }
    const data = await signupRes.json();
    token = data.token;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const goals = [
    {
      id: Date.now(),
      goal: 'Complete Data Structures lab on binary search trees and submit on Canvas by Friday May 29, 2026',
      plan: null,
      generatedAt: null
    },
    {
      id: Date.now() + 1,
      goal: 'Score at least 85% on the Operating Systems mid-term exam by June 12, 2026',
      plan: null,
      generatedAt: null
    },
    {
      id: Date.now() + 2,
      goal: 'Build and demo the semester DBMS mini-project (library management CRUD app) by June 20, 2026',
      plan: null,
      generatedAt: null
    }
  ];

  const calendarTasks = {
    [formatDate(today)]: [
      {
        id: 'cse-1',
        text: 'Attend Algorithms lecture (AVL trees)',
        startTime: '09:00 AM',
        endTime: '10:30 AM',
        category: 'study',
        recurrence: 'once',
        completed: false
      },
      {
        id: 'cse-2',
        text: 'Review lecture notes + solve 3 practice problems',
        startTime: '02:00 PM',
        endTime: '04:00 PM',
        category: 'study',
        recurrence: 'once',
        completed: false
      }
    ],
    [formatDate(addDays(today, 1))]: [
      {
        id: 'cse-3',
        text: 'OS lab: implement producer-consumer with semaphores',
        startTime: '11:00 AM',
        endTime: '01:30 PM',
        category: 'study',
        recurrence: 'once',
        completed: false
      },
      {
        id: 'cse-4',
        text: 'DBMS study group — normalize to 3NF examples',
        startTime: '05:00 PM',
        endTime: '06:30 PM',
        category: 'study',
        recurrence: 'once',
        completed: false
      }
    ],
    [formatDate(addDays(today, 2))]: [
      {
        id: 'cse-5',
        text: 'Work on mini-project: design ER diagram + schema',
        startTime: '10:00 AM',
        endTime: '12:30 PM',
        category: 'work',
        recurrence: 'once',
        completed: false
      },
      {
        id: 'cse-6',
        text: 'Submit weekly programming assignment (Python)',
        category: 'important',
        recurrence: 'once',
        deadline: formatDate(addDays(today, 2)),
        completed: false
      }
    ],
    [formatDate(addDays(today, 3))]: [
      {
        id: 'cse-7',
        text: 'Mock interview prep: arrays, linked lists, stacks',
        startTime: '03:00 PM',
        endTime: '05:00 PM',
        category: 'study',
        recurrence: 'once',
        completed: false
      }
    ],
    [formatDate(addDays(today, 4))]: [
      {
        id: 'cse-8',
        text: 'Finish DSA lab report + push code to GitHub',
        startTime: '09:30 AM',
        endTime: '12:00 PM',
        category: 'important',
        recurrence: 'once',
        deadline: formatDate(addDays(today, 4)),
        completed: false
      },
      {
        id: 'cse-9',
        text: 'Campus hackathon team sync (API integration)',
        startTime: '06:00 PM',
        endTime: '08:00 PM',
        category: 'work',
        recurrence: 'once',
        completed: false
      }
    ],
    [formatDate(addDays(today, 5))]: [
      {
        id: 'cse-10',
        text: 'Weekend revision: OS scheduling algorithms',
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        category: 'study',
        recurrence: 'once',
        completed: false
      }
    ]
  };

  const fixedRoutine = [
    { id: 1, text: 'Wake up & morning routine', time: '07:00 AM', category: 'health' },
    { id: 2, text: 'Breakfast + check campus email', time: '08:00 AM', category: 'casual' },
    { id: 3, text: 'Morning classes / lab block', time: '09:00 AM', category: 'study' },
    { id: 4, text: 'Lunch break', time: '01:00 PM', category: 'health' },
    { id: 5, text: 'Afternoon study / assignments', time: '02:30 PM', category: 'study' },
    { id: 6, text: 'Evening workout or walk', time: '06:30 PM', category: 'health' },
    { id: 7, text: 'Wind down — no screens', time: '11:00 PM', category: 'health' }
  ];

  const syncRes = await fetch(`${API}/planner/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      goals,
      fixedRoutine,
      calendarTasks,
      calendarNotes: {
        [formatDate(today)]: 'Focus day: Algorithms + DSA practice'
      },
      completedRoadmapTasks: {},
      addedAiTasks: {}
    })
  });

  if (!syncRes.ok) {
    throw new Error(`Sync failed: ${await syncRes.text()}`);
  }

  const verifyRes = await fetch(`${API}/planner/sync`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await verifyRes.json();

  console.log('✓ Seeded CSE student account:', EMAIL);
  console.log(`  Goals: ${data.goals?.length ?? 0}`);
  console.log(`  Calendar days with tasks: ${Object.keys(data.calendarTasks || {}).length}`);
  console.log(`  Total tasks: ${Object.values(data.calendarTasks || {}).flat().length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
