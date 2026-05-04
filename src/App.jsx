// Mobile-Friendly PWA with Reminders + Weekly Schedule + Progress Tracking
// Setup:
// 1) React (Vite/CRA). Replace App.jsx with this file
// 2) Add manifest + service-worker (below)
// 3) Enable notifications on first load
// 4) Open in Chrome → Add to Home Screen

import React, { useState, useEffect } from "react";

const DEFAULT_TASKS = [
  { id: 1, name: "Morning Deep Work", done: false },
  { id: 2, name: "Workout / Movement", done: false },
  { id: 3, name: "E Language Study", done: false },
  { id: 4, name: "System Design / C++", done: false },
  { id: 5, name: "10-min Minimum Rule", done: false },
  { id: 6, name: "Protect Energy", done: false }
];

const WEEK = [
  { day: "Mon", focus: "C++", evening: "Workout" },
  { day: "Tue", focus: "System Design", evening: "Music" },
  { day: "Wed", focus: "E (light)", evening: "League" },
  { day: "Thu", focus: "System Design", evening: "Workout" },
  { day: "Fri", focus: "E Language", evening: "Rest" },
  { day: "Sat", focus: "E Deep (60–90m)", evening: "Optional" },
  { day: "Sun", focus: "Reset + Review", evening: "Light" }
];

const SKILLS = ["E", "System Design", "C++", "Python/AI", "Workout"];

export default function DisciplineApp() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem("tasks") || "null") || DEFAULT_TASKS);
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("streak") || 0));
  const [tab, setTab] = useState("today"); // today | schedule | progress
  const [notifEnabled, setNotifEnabled] = useState(false);

  const [hours, setHours] = useState(() => JSON.parse(localStorage.getItem("hours") || "null") || {
    "E": 0,
    "System Design": 0,
    "C++": 0,
    "Python/AI": 0,
    "Workout": 0
  });

  const [selectedSkill, setSelectedSkill] = useState("E");
  const [minutes, setMinutes] = useState(30);

  useEffect(() => localStorage.setItem("tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("streak", streak), [streak]);
  useEffect(() => localStorage.setItem("hours", JSON.stringify(hours)), [hours]);

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  useEffect(() => {
    if (tasks.every((t) => t.done)) {
      setStreak((p) => p + 1);
      setTasks(DEFAULT_TASKS);
    }
  }, [tasks]);

  // ----- Notifications -----
  const requestNotifications = async () => {
    if (!("Notification" in window)) return alert("Notifications not supported");
    const perm = await Notification.requestPermission();
    setNotifEnabled(perm === "granted");
    if (perm === "granted") new Notification("Reminders enabled", { body: "Show up daily." });
  };

  useEffect(() => {
    if (!notifEnabled) return;
    const tick = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      if (h === 6 && m === 30) new Notification("Start Deep Work", { body: "No negotiation." });
      if (h === 19 && m === 45) new Notification("Workout", { body: "10 min counts." });
      if (h === 21 && m === 30) new Notification("Wind Down", { body: "Protect sleep." });
    }, 60000);
    return () => clearInterval(tick);
  }, [notifEnabled]);

  // ----- Progress -----
  const addTime = () => {
    const hrs = minutes / 60;
    setHours({ ...hours, [selectedSkill]: +(hours[selectedSkill] + hrs).toFixed(2) });
  };

  const ProgressView = () => (
    <div>
      <h2 className="text-lg font-semibold mb-3">Progress Tracking</h2>

      <div className="space-y-2 mb-4">
        {SKILLS.map((s) => (
          <div key={s} className="flex justify-between p-2 border rounded-xl">
            <span>{s}</span>
            <span className="text-sm">{hours[s]} hrs</span>
          </div>
        ))}
      </div>

      <div className="border p-3 rounded-xl">
        <div className="mb-2 text-sm">Log Session</div>
        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        >
          {SKILLS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full mb-2 p-2 border rounded"
          placeholder="Minutes"
        />

        <button onClick={addTime} className="w-full bg-black text-white py-2 rounded">
          Add Time
        </button>
      </div>
    </div>
  );

  const TodayView = () => (
    <div>
      <div className="flex justify-between mb-3">
        <h2 className="text-lg font-semibold">Today</h2>
        <button onClick={requestNotifications} className="text-xs px-2 py-1 rounded bg-gray-200">
          Enable Reminders
        </button>
      </div>

      <p className="mb-3 text-sm">🔥 Streak: {streak}</p>

      {tasks.map((t) => (
        <div key={t.id} className="flex justify-between p-3 border rounded-xl mb-2">
          <span>{t.name}</span>
          <button onClick={() => toggleTask(t.id)} className="px-3 py-1 rounded bg-gray-200">
            {t.done ? "Done" : "Mark"}
          </button>
        </div>
      ))}
    </div>
  );

  const ScheduleView = () => (
    <div>
      <h2 className="text-lg font-semibold mb-3">Weekly Schedule</h2>
      {WEEK.map((d) => (
        <div key={d.day} className="p-3 border rounded-xl mb-2">
          <div className="flex justify-between">
            <span>{d.day}</span>
            <span className="text-xs">Evening: {d.evening}</span>
          </div>
          <div className="text-sm">Morning: {d.focus}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl p-4">
        <h1 className="text-xl font-bold text-center mb-3">Discipline Tracker</h1>

        <div className="flex mb-4">
          {['today','schedule','progress'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 ${tab===t?'bg-black text-white':'bg-gray-200'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'today' && <TodayView />}
        {tab === 'schedule' && <ScheduleView />}
        {tab === 'progress' && <ProgressView />}
      </div>
    </div>
  );
}

// manifest + SW same as before

