import React, { useState, useRef, useEffect, useCallback } from 'react';


// Modular Component Imports
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DailyTab from './components/DailyTab';
import WeeklyTab from './components/WeeklyTab';
import CalendarTab from './components/CalendarTab';
import PlannerTab from './components/PlannerTab';
import WeeklyScheduleTab from './components/WeeklyScheduleTab';
import AnalyticsTab from './components/AnalyticsTab';
import JournalTab from './components/JournalTab';

// Shared Utilities
import { categories, formatDate } from './utils/plannerHelpers';

export default function TaskPlannerDashboard() {
  const [goals, setGoals] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [apiError, setApiError] = useState('');
  const [activeTab, setActiveTab] = useState('daily');
  const [planFeedback, setPlanFeedback] = useState('');
  const [integrationFilter, setIntegrationFilter] = useState('');
  const [addedAiTasks, setAddedAiTasks] = useState({});
  const [completedRoadmapTasks, setCompletedRoadmapTasks] = useState({});
  const [journalEntries, setJournalEntries] = useState({});
  const [journalReflections, setJournalReflections] = useState({});
  const [journalMoods, setJournalMoods] = useState({});
  const [goalError, setGoalError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('x-auth-token') || '');
  const [userEmail, setUserEmail] = useState(localStorage.getItem('user-email') || '');
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'saving' | 'error' | 'none'
  const [showAuthModal, setShowAuthModal] = useState(!localStorage.getItem('x-auth-token'));
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarTasks, setCalendarTasks] = useState({});
  const [calendarNotes, setCalendarNotes] = useState({});
  const [manualTaskInput, setManualTaskInput] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    text: '',
    startTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    endTime: '',
    category: 'casual',
    recurrence: 'once',
    deadline: ''
  });
  const [editingTask, setEditingTask] = useState(null);
  const [editingTaskDateKey, setEditingTaskDateKey] = useState(null);
  const [reminderNotifications, setReminderNotifications] = useState([]);
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    const sunday = new Date(d.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    return sunday;
  });
  const inputRef = useRef(null);

  const [fixedRoutine, setFixedRoutine] = useState([
    { id: 1, text: 'Wake up & Morning Ritual', time: '06:00 AM', category: 'health' },
    { id: 2, text: 'Breakfast', time: '08:00 AM', category: 'health' },
    { id: 3, text: 'Work/Study Session 1', time: '09:00 AM', category: 'work' },
    { id: 4, text: 'Lunch Break', time: '01:00 PM', category: 'casual' },
    { id: 5, text: 'Evening Workout', time: '06:00 PM', category: 'health' },
    { id: 6, text: 'Wind down', time: '10:00 PM', category: 'health' }
  ]);
  const [showRoutineEditor, setShowRoutineEditor] = useState(false);

  // Base API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('x-auth-token');
    localStorage.removeItem('user-email');
    setToken('');
    setUserEmail('');
    setGoals([]);
    setFixedRoutine([
      { id: 1, text: 'Wake up & Morning Ritual', time: '06:00 AM', category: 'health' },
      { id: 2, text: 'Breakfast', time: '08:00 AM', category: 'health' },
      { id: 3, text: 'Work/Study Session 1', time: '09:00 AM', category: 'work' },
      { id: 4, text: 'Lunch Break', time: '01:00 PM', category: 'casual' },
      { id: 5, text: 'Evening Workout', time: '06:00 PM', category: 'health' },
      { id: 6, text: 'Wind down', time: '10:00 PM', category: 'health' }
    ]);
    setCalendarTasks({});
    setCalendarNotes({});
    setCompletedRoadmapTasks({});
    setJournalEntries({});
    setJournalReflections({});
    setJournalMoods({});
    setSelectedGoal(null);
    setSyncStatus('none');
    setShowAuthModal(true);
  };

  // Auth Submit handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password) {
      setAuthError('Please fill in all fields');
      return;
    }

    setAuthLoading(true);
    setAuthError('');

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/signup';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('x-auth-token', data.token);
      localStorage.setItem('user-email', data.user.email);
      setToken(data.token);
      setUserEmail(data.user.email);
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '' });

      await fetchUserData(data.token);
    } catch (err) {
      setAuthError(err.message || 'An error occurred. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch planner data from cloud
  const fetchUserData = async (authToken = token) => {
    if (!authToken) return;
    setIsInitialLoad(true);
    try {
      const response = await fetch(`${API_URL}/planner/sync`, {
        method: 'GET',
        headers: { 'x-auth-token': authToken }
      });
      const data = await response.json();

      if (response.ok) {
        setGoals(data.goals || []);
        setFixedRoutine(data.fixedRoutine || []);
        setCalendarTasks(data.calendarTasks || {});
        setCalendarNotes(data.calendarNotes || {});
        setCompletedRoadmapTasks(data.completedRoadmapTasks || {});
        setAddedAiTasks(data.addedAiTasks || {});
        setJournalEntries(data.journalEntries || {});
        setJournalReflections(data.journalReflections || {});
        setJournalMoods(data.journalMoods || {});
        setSyncStatus('synced');
      } else {
        console.error('Failed to fetch user data:', data.message);
        if (response.status === 401) {
          handleLogout();
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      setSyncStatus('error');
    } finally {
      setIsInitialLoad(false);
    }
  };

  // Cloud Sync Save handler (autosave)
  const saveUserData = useCallback(async (currentState) => {
    if (!token) return;
    setSyncStatus('saving');
    try {
      const response = await fetch(`${API_URL}/planner/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(currentState)
      });
      if (response.ok) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (err) {
      console.error('Autosave error:', err);
      setSyncStatus('error');
    }
  }, [token]);

  // Load user data on startup
  useEffect(() => {
    if (token) {
      fetchUserData(token);
    } else {
      setIsInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Debounced Autosave Trigger
  useEffect(() => {
    if (!token || isInitialLoad) return;

    setSyncStatus('saving');
    const delayDebounce = setTimeout(() => {
      saveUserData({
        goals,
        fixedRoutine,
        calendarTasks,
        calendarNotes,
        completedRoadmapTasks,
        addedAiTasks,
        journalEntries,
        journalReflections,
        journalMoods
      });
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [goals, fixedRoutine, calendarTasks, calendarNotes, completedRoadmapTasks, addedAiTasks, journalEntries, journalReflections, journalMoods, token, isInitialLoad, saveUserData]);

  // Get all tasks for a specific date
  const getTasksForDate = (date) => {
    const dateKey = formatDate(date);
    return calendarTasks[dateKey] || [];
  };

  const requestNotificationPermission = useCallback(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => setNotificationPermission(permission));
    } else {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const parseTaskTimeToDate = (time, date = new Date()) => {
    if (!time) return null;
    const normalized = time.trim();
    const ampmMatch = normalized.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let hours;
    let minutes;

    if (ampmMatch) {
      hours = parseInt(ampmMatch[1], 10);
      minutes = parseInt(ampmMatch[2], 10);
      const ampm = ampmMatch[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    } else {
      const parts = normalized.split(':');
      if (parts.length !== 2) return null;
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    }

    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };

  const sendBrowserNotification = (title, message) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (notificationPermission !== 'granted') return;
    try {
      new Notification(title, { body: message });
    } catch (err) {
      console.error('Notification failed:', err);
    }
  };

  const getReminderNotifications = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowKey = formatDate(tomorrow);

    const todayTasks = getTasksForDate(now);
    const incompleteTodayTasks = todayTasks.filter(t => !t.completed);

    const upcomingSoonTask = incompleteTodayTasks
      .map(task => ({ task, startDate: parseTaskTimeToDate(task.startTime, now) }))
      .filter(item => item.startDate && item.startDate > now)
      .sort((a, b) => a.startDate - b.startDate)
      .find(item => item.startDate - now <= 30 * 60 * 1000);

    const deadlineTasks = Object.values(calendarTasks).flat().filter(task => {
      if (task.completed || !task.deadline || !task.isDeadlineEntry) return false;
      return task.deadline === tomorrowKey;
    });

    const reminders = [];

    if (upcomingSoonTask) {
      const minutesUntil = Math.round((upcomingSoonTask.startDate - now) / 60000);
      reminders.push({
        title: 'Upcoming Task',
        message: `${upcomingSoonTask.task.text} starts in ${minutesUntil} minutes.`,
        type: 'task'
      });
    }

    deadlineTasks.forEach(task => {
      reminders.push({
        title: 'Deadline Tomorrow',
        message: `${task.text} is due tomorrow.`,
        type: 'deadline'
      });
    });

    return reminders;
  };

  const lastNotificationRef = useRef('');
  useEffect(() => {
    requestNotificationPermission();
  }, [requestNotificationPermission]);

  useEffect(() => {
    const reminders = getReminderNotifications();
    setReminderNotifications(reminders);
    if (notificationPermission === 'granted' && reminders.length > 0) {
      const topMessage = reminders[0].message;
      if (topMessage && lastNotificationRef.current !== topMessage) {
        sendBrowserNotification(reminders[0].title, topMessage);
        lastNotificationRef.current = topMessage;
      }
    }
  }, [calendarTasks, notificationPermission]);

  // Add or Update comprehensive task
  const addDetailedTask = () => {
    if (!taskForm.text.trim()) return;
    
    const editingId = editingTask ? String(editingTask.id) : null;
    const baseId = editingId ? editingId.replace(/-\d+$/, '') : Date.now().toString();
    const datesToPopulate = [];
    const effectiveDeadline = taskForm.deadline || editingTaskDateKey || (editingTask && editingTask.deadline) || '';
    const startDate = effectiveDeadline 
      ? new Date(`${effectiveDeadline}T00:00:00`) 
      : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    if (taskForm.recurrence === 'once') {
      datesToPopulate.push(startDate);
    } else if (taskForm.recurrence === 'daily') {
      for (let i = 0; i < 30; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        datesToPopulate.push(d);
      }
    } else if (taskForm.recurrence === 'weekly') {
      for (let i = 0; i < 12; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + (i * 7));
        datesToPopulate.push(d);
      }
    }

    const newCalendarTasks = { ...calendarTasks };
    
    if (editingTask) {
      Object.keys(newCalendarTasks).forEach(dateKey => {
        newCalendarTasks[dateKey] = newCalendarTasks[dateKey].filter(t => {
          const taskId = String(t.id);
          return taskId === baseId || taskId.startsWith(`${baseId}-`) ? false : true;
        });
      });
    }

    datesToPopulate.forEach((date, index) => {
      const dateKey = formatDate(date);
      let fullStartTime = '';
      if (taskForm.startTime) {
        let [h, m] = taskForm.startTime.split(':');
        h = parseInt(h);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        fullStartTime = `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
      }

      let fullEndTime = '';
      if (taskForm.endTime) {
        let [h, m] = taskForm.endTime.split(':');
        h = parseInt(h);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        fullEndTime = `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
      }

      const newTask = {
        id: `${baseId}-${index}`,
        text: taskForm.text,
        startTime: fullStartTime,
        endTime: fullEndTime,
        category: taskForm.category,
        recurrence: taskForm.recurrence,
        deadline: taskForm.deadline,
        completed: editingTask ? editingTask.completed : false
      };

      newCalendarTasks[dateKey] = [...(newCalendarTasks[dateKey] || []), newTask];
    });

    setCalendarTasks(newCalendarTasks);
    setTaskForm({ text: '', startTime: '', endTime: '', category: 'casual', recurrence: 'once', deadline: '' });
    setShowTaskForm(false);
    setEditingTask(null);
    setEditingTaskDateKey(null);
  };

  const startEditingTask = (task, dateKey = null) => {
    let startTime24 = '';
    if (task.startTime) {
      const match = task.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let [, h, m, p] = match;
        h = parseInt(h);
        if (p === 'PM' && h !== 12) h += 12;
        if (p === 'AM' && h === 12) h = 0;
        startTime24 = `${h.toString().padStart(2, '0')}:${m}`;
      }
    }

    let endTime24 = '';
    if (task.endTime) {
      const match = task.endTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (match) {
        let [, h, m, p] = match;
        h = parseInt(h);
        if (p === 'PM' && h !== 12) h += 12;
        if (p === 'AM' && h === 12) h = 0;
        endTime24 = `${h.toString().padStart(2, '0')}:${m}`;
      }
    }

    setTaskForm({
      text: task.text,
      startTime: startTime24,
      endTime: endTime24,
      category: task.category || 'casual',
      recurrence: task.recurrence || 'once',
      deadline: dateKey || task.deadline || ''
    });
    setEditingTask(task);
    setEditingTaskDateKey(dateKey);
    setShowTaskForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add manual task to calendar
  const addManualTask = (date) => {
    if (!manualTaskInput.trim()) return;
    const dateKey = formatDate(date);
    setCalendarTasks(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), { id: Date.now().toString(), text: manualTaskInput, category: 'casual', completed: false }]
    }));
    setManualTaskInput('');
  };

  // Delete manual task
  const deleteManualTask = (date, taskId) => {
    const dateKey = formatDate(date);
    const taskToDelete = calendarTasks[dateKey]?.find(t => t.id === taskId);
    if (taskToDelete && taskToDelete.aiKey) {
      setAddedAiTasks(prev => {
        const newState = { ...prev };
        delete newState[taskToDelete.aiKey];
        return newState;
      });
    }

    setCalendarTasks(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter(t => t.id !== taskId)
    }));
  };

  // Toggle task completion
  const toggleTaskCompletion = (date, taskId) => {
    const dateKey = formatDate(date);
    setCalendarTasks(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const calculatePlanDate = (weekNum, dayName, generatedAt) => {
    if (!generatedAt) return '';
    const genDate = new Date(generatedAt);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = dayNames.indexOf(dayName.toLowerCase());
    if (targetDayIndex === -1) return '';

    const startOfPlan = new Date(genDate);
    const dayOfWeek = startOfPlan.getDay();
    const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    startOfPlan.setDate(startOfPlan.getDate() - diffToMonday);
    startOfPlan.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(startOfPlan);
    const adjDayIndex = (targetDayIndex + 6) % 7;
    
    targetDate.setDate(targetDate.getDate() + (weekNum - 1) * 7 + adjDayIndex);
    
    if (weekNum === 1 && targetDate < new Date(genDate.setHours(0,0,0,0))) {
      targetDate.setDate(targetDate.getDate() + 7);
    }
    
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const inferTaskCategory = (text) => {
    const normalized = (text || '').toLowerCase();
    const studyKeywords = ['study', 'learn', 'read', 'review', 'practice', 'course', 'lecture', 'exam', 'assignment', 'prep', 'prepare'];
    const healthKeywords = ['health', 'exercise', 'workout', 'yoga', 'run', 'meditation', 'stretch', 'diet', 'sleep', 'meal', 'walk', 'gym', 'wellness'];
    const workKeywords = ['work', 'project', 'client', 'meeting', 'research', 'email', 'design', 'build', 'develop', 'deliver', 'update', 'plan', 'strategy'];
    const importantKeywords = ['deadline', 'submit', 'due', 'urgent', 'critical', 'review', 'final', 'important'];

    if (studyKeywords.some(keyword => normalized.includes(keyword))) return 'study';
    if (healthKeywords.some(keyword => normalized.includes(keyword))) return 'health';
    if (workKeywords.some(keyword => normalized.includes(keyword))) return 'work';
    if (importantKeywords.some(keyword => normalized.includes(keyword))) return 'important';
    return 'casual';
  };

  const addSingleAiTaskToSchedule = (taskStr, weekNum, dayName, generatedAt, goalId) => {
    const fullDate = calculatePlanDate(weekNum, dayName, generatedAt);
    if (!fullDate) return;

    const dateObj = new Date(`${fullDate}, ${new Date().getFullYear()}`);
    const dateKey = formatDate(dateObj);

    const timeMatch = taskStr.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M):\s*(.*)/i);
    let startTime = '';
    let endTime = '';
    let text = taskStr;

    if (timeMatch) {
      startTime = timeMatch[1];
      endTime = timeMatch[2];
      text = timeMatch[3];
    }

    const newTask = {
      id: `ai-goal-${goalId}-${Date.now()}`,
      text: text,
      startTime: startTime,
      endTime: endTime,
      category: inferTaskCategory(text),
      recurrence: 'once',
      completed: false,
      goalId: goalId,
      aiKey: `${weekNum}-${dayName}-${taskStr}`
    };

    setAddedAiTasks(prev => ({ ...prev, [`${weekNum}-${dayName}-${taskStr}`]: true }));
    setCalendarTasks(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newTask]
    }));
  };

  const removeSingleAiTaskFromSchedule = (taskStr, weekNum, dayName, generatedAt, goalId) => {
    const fullDate = calculatePlanDate(weekNum, dayName, generatedAt);
    if (!fullDate) return;

    const dateObj = new Date(`${fullDate}, ${new Date().getFullYear()}`);
    const dateKey = formatDate(dateObj);
    
    const timeMatch = taskStr.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M):\s*(.*)/i);
    const searchText = timeMatch ? timeMatch[3] : taskStr;

    setCalendarTasks(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(t => 
        !(String(t.id).startsWith(`ai-goal-${goalId}`) && t.text === searchText)
      )
    }));

    setAddedAiTasks(prev => {
      const newState = { ...prev };
      delete newState[`${weekNum}-${dayName}-${taskStr}`];
      return newState;
    });
  };

  const integratePlanToSchedule = (goal, filter = '') => {
    if (!goal || !goal.plan || !goal.plan.weeklySchedule) return;

    const newCalendarTasks = { ...calendarTasks };
    const newAddedState = { ...addedAiTasks };
    const baseId = Date.now();
    const filterLower = filter.toLowerCase().trim().replace(/st|nd|rd|th/g, '');

    let addedCount = 0;

    goal.plan.weeklySchedule.forEach((week) => {
      if (filterLower.includes('week') && !filterLower.includes(`week ${week.week}`)) return;

      week.days.forEach((dayData) => {
        const fullDate = calculatePlanDate(week.week, dayData.day, goal.generatedAt);
        if (!fullDate) return;

        const dateLower = fullDate.toLowerCase();
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const dayMatch = daysOfWeek.find(d => filterLower.includes(d));
        const isDayMatch = dayMatch && dayData.day.toLowerCase() === dayMatch;
        const isDateMatch = filterLower.length > 3 && dateLower.includes(filterLower);
        
        if ((dayMatch || (filterLower.length > 3 && !filterLower.includes('week') && !filterLower.includes('morning') && !filterLower.includes('afternoon') && !filterLower.includes('evening'))) && !isDayMatch && !isDateMatch) return;

        const dateObj = new Date(`${fullDate}, ${new Date().getFullYear()}`);
        const dateKey = formatDate(dateObj);

        const hasMorning = filterLower.includes('morning');
        const hasAfternoon = filterLower.includes('afternoon');
        const hasEvening = filterLower.includes('evening');
        const hasAnyPeriod = hasMorning || hasAfternoon || hasEvening;

        const periods = {
          morning: dayData.morning || [],
          afternoon: dayData.afternoon || [],
          evening: dayData.evening || []
        };

        Object.entries(periods).forEach(([periodName, tasks]) => {
          if (hasAnyPeriod) {
            if (periodName === 'morning' && !hasMorning) return;
            if (periodName === 'afternoon' && !hasAfternoon) return;
            if (periodName === 'evening' && !hasEvening) return;
          }

          tasks.forEach((taskStr, idx) => {
            const taskKey = `${week.week}-${dayData.day}-${taskStr}`;
            if (newAddedState[taskKey]) return;

            const timeMatch = taskStr.match(/(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*(\d{1,2}:\d{2}\s*[AP]M):\s*(.*)/i);
            let startTime = '';
            let endTime = '';
            let text = taskStr;

            if (timeMatch) {
              startTime = timeMatch[1];
              endTime = timeMatch[2];
              text = timeMatch[3];
            }

            newAddedState[taskKey] = true;
            const newTask = {
              id: `ai-goal-${goal.id}-${baseId}-${week.week}-${dayData.day}-${idx}-${periodName}`,
              text: text,
              startTime: startTime,
              endTime: endTime,
              category: inferTaskCategory(text),
              recurrence: 'once',
              completed: false,
              goalId: goal.id,
              aiKey: taskKey
            };

            newCalendarTasks[dateKey] = [...(newCalendarTasks[dateKey] || []), newTask];
            addedCount++;
          });
        });
      });
    });

    if (addedCount > 0) {
      setCalendarTasks(newCalendarTasks);
      setAddedAiTasks(newAddedState);
      alert(`${addedCount} tasks integrated into your schedule!`);
    } else {
      alert(`No new tasks found matching "${filter}".`);
    }
  };

  const clearGoalTasksFromSchedule = (goalId) => {
    if (!window.confirm('Are you sure you want to remove all tasks related to this goal from your schedule?')) return;

    const newCalendarTasks = { ...calendarTasks };
    Object.keys(newCalendarTasks).forEach(dateKey => {
      newCalendarTasks[dateKey] = newCalendarTasks[dateKey].filter(task => task.goalId !== goalId && !String(task.id).startsWith(`ai-goal-${goalId}`));
    });

    const newAddedState = { ...addedAiTasks };
    const goal = goals.find(g => g.id === goalId);
    if (goal && goal.plan && goal.plan.weeklySchedule) {
      goal.plan.weeklySchedule.forEach(w => {
        w.days.forEach(d => {
          [...(d.morning || []), ...(d.afternoon || []), ...(d.evening || [])].forEach(taskStr => {
            delete newAddedState[`${w.week}-${d.day}-${taskStr}`];
          });
        });
      });
    }

    setCalendarTasks(newCalendarTasks);
    setAddedAiTasks(newAddedState);
    alert('All goal tasks have been removed from your schedule.');
  };

  const generatePlan = async (goalId, feedback = '') => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal || (goal.plan && !feedback)) return;

    setLoadingPlan(goalId);
    setApiError('');

    try {
      const response = await fetch(`${API_URL}/planner/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          goal,
          feedback,
          fixedRoutine,
          calendarTasks
        })
      });

      if (!response.ok) {
        let errorText = await response.text();
        try {
          const payload = JSON.parse(errorText);
          errorText = payload?.message || errorText;
        } catch {}
        throw new Error(errorText || `Failed to generate plan: ${response.status}`);
      }

      const planData = await response.json();
      setGoals(goals.map(g => 
        g.id === goalId ? { ...g, plan: planData, generatedAt: new Date() } : g
      ));
    } catch (error) {
      setApiError(error.message || 'Error generating plan');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      activeTab === 'calendar' ? addManualTask(selectedCalendarDate) : addGoal();
    }
  };

  const isGoalClear = (text) => {
    const trimmed = text.trim();
    if (trimmed.length < 12) return false;
    if (trimmed.split(/\s+/).length < 3) return false;

    const genericPattern = /^(get|be|feel|stay|improve|do|work|learn|finish|complete|build|stay motivated|be better|be productive)\b/i;
    const specificEnough = /\d|by\s+\d+|in\s+\d+|within\s+\d+|for\s+\d+|\b(in|by|within|for)\b.*\b(day|week|month|year|hours?|minutes?)\b|\b(launch|build|finish|complete|pass|score|create|develop|publish|ship|design|study|practice|master|certify|prepare)\b/i;

    if (genericPattern.test(trimmed) && !specificEnough.test(trimmed)) {
      return false;
    }
    return true;
  };

  const addGoal = () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) {
      setGoalError('Please enter a valid goal so the AI can generate a plan.');
      return;
    }

    if (!isGoalClear(trimmedInput)) {
      setGoalError('That goal is too vague. Please provide more detail so the AI can create a clear plan.');
      return;
    }

    const newGoal = {
      id: Date.now(),
      goal: trimmedInput,
      plan: null,
      generatedAt: null
    };
    setGoals([newGoal, ...goals]);
    setInputValue('');
    setSelectedGoal(newGoal.id);
    setGoalError('');
    inputRef.current?.focus();
  };

  const deleteGoal = (goalId) => {
    setGoals(goals.filter(g => g.id !== goalId));
    if (selectedGoal === goalId) {
      setSelectedGoal(null);
    }
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f4b 100%)', minHeight: '100vh' }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Poppins:wght@300;400;500;600;700&display=swap');

        .container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 40px 20px;
          min-height: 100vh;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          animation: slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-left h1 {
          font-family: 'JetBrains Mono', monospace;
          font-size: 3rem;
          color: white;
          margin-bottom: 4px;
          font-weight: 700;
          letter-spacing: -2px;
        }

        .header-left p {
          color: #a0aec0;
          font-size: 0.95rem;
        }

        .tab-navigation {
          display: flex;
          gap: 12px;
          margin-bottom: 30px;
          background: rgba(255, 255, 255, 0.05);
          padding: 8px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: fit-content;
          animation: slideInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          color: #a0aec0;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .tab-button:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-button.active {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .tab-button.ai-tab:hover {
          background: rgba(124, 58, 237, 0.15);
        }

        .tab-button.ai-tab.active {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%) !important;
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4);
        }

        .content {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 40px;
          animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .main-content {
          background: var(--bg-card);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .sidebar-section {
          background: var(--bg-card);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }

        .section-title {
          font-family: 'Poppins', sans-serif;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        textarea {
          width: 100%;
          height: 100px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px;
          color: white;
          font-family: 'Poppins', sans-serif;
          font-size: 0.9rem;
          resize: none;
          outline: none;
          transition: all 0.3s ease;
        }

        textarea:focus {
          border-color: rgba(124, 58, 237, 0.5);
          background: rgba(255, 255, 255, 0.08);
        }

        .add-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          border: none;
          color: white;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 14px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px var(--primary-glow);
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }

        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .goal-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 18px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .goal-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateX(4px);
        }

        .goal-item.active {
          background: rgba(124, 58, 237, 0.12);
          border-color: var(--primary);
          box-shadow: 0 0 20px var(--primary-glow);
        }

        .goal-text {
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .goal-status {
          font-size: 0.75rem;
          color: #10b981;
          margin-top: 4px;
        }

        .delete-btn {
          background: transparent;
          border: none;
          color: #a0aec0;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .delete-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        /* AI Planner Styles */
        .plan-title {
          font-size: 1.8rem;
          color: white;
          margin-bottom: 24px;
          font-weight: 700;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #a0aec0;
          text-align: center;
        }

        .generate-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
          border: none;
          color: white;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          padding: 14px 28px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
        }

        .generate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 40px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left-color: #7c3aed;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        /* Daily Timetable Styles */
        .daily-todos {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .section-header h3 {
          color: white;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .section-header p {
          color: #a0aec0;
          font-size: 0.85rem;
          margin-top: 2px;
        }

        .todos-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 24px;
        }

        .todo-item {
          display: flex;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 16px 20px;
          border-radius: 14px;
          transition: all 0.3s ease;
        }

        .todo-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .todo-checkbox {
          width: 20px;
          height: 20px;
          border-radius: 6px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          accent-color: #7c3aed;
        }

        .todo-text {
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .todo-text.completed {
          color: #64748b;
          text-decoration: line-through;
        }

        .todo-delete {
          color: #64748b;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .todo-delete:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }

        /* Calendar Styles */
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 10px;
          margin-top: 24px;
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .calendar-nav {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          padding: 10px 12px;
        }

        .nav-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-button:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }

        .calendar-month {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-width: 170px;
          padding: 10px 14px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .today-button {
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.85), rgba(59, 130, 246, 0.85));
          color: white;
          padding: 10px 18px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .today-button:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .calendar-day-name {
          text-align: center;
          color: #64748b;
          font-weight: 600;
          font-size: 0.85rem;
          padding: 10px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .calendar-day {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          aspect-ratio: 1.2;
          border-radius: 12px;
          padding: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .calendar-day:hover:not(.empty) {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .calendar-day.selected {
          background: rgba(124, 58, 237, 0.1);
          border-color: rgba(124, 58, 237, 0.3);
          box-shadow: 0 0 15px rgba(124, 58, 237, 0.15);
        }

        .calendar-day.empty {
          background: transparent;
          border: none;
          cursor: default;
        }

        .calendar-day-number {
          color: white;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .selected-date-tasks {
          margin-top: 40px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 24px;
        }

        .selected-date-title {
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .task-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          margin-bottom: 8px;
        }

        .task-row input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #7c3aed;
        }

        .weekly-overview {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .week-section {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 30px;
        }

        .week-header {
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 16px;
        }

        .week-title {
          font-size: 1.5rem;
          color: white;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .week-focus {
          color: #a0aec0;
          font-size: 0.95rem;
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .day-schedule {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .day-name {
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 10px;
        }

        .time-blocks {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .time-period {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .time-period-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #93c5fd;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .time-slots {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .time-slot {
          background: rgba(255, 255, 255, 0.02);
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #cbd5e1;
        }

        .weekly-goals {
          background: rgba(134, 239, 172, 0.05);
          border: 1px solid rgba(134, 239, 172, 0.1);
          padding: 16px;
          border-radius: 12px;
          margin-top: auto;
        }

        .weekly-goal-item {
          color: #cbd5e1;
          font-size: 0.85rem;
          margin-bottom: 6px;
        }

        .weekly-goal-item:last-child {
          margin-bottom: 0;
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 1200px) {
          .content {
            grid-template-columns: 1fr;
          }

          .daily-todos {
            grid-template-columns: 1fr;
          }

          .days-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="container">
        <Header 
          token={token}
          syncStatus={syncStatus}
          userEmail={userEmail}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handleLogout={handleLogout}
          setShowAuthModal={setShowAuthModal}
          setAuthMode={setAuthMode}
        />

        <div className="content">
          <div className="main-content">
            
            {showTaskForm && (
              <div className="task-form-overlay" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '30px', animation: 'slideInDown 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: 'white', margin: 0 }}>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                  <button 
                    onClick={() => {
                      setEditingTask(null);
                      setEditingTaskDateKey(null);
                      setTaskForm({ text: '', startTime: '', endTime: '', category: 'casual', recurrence: 'once', deadline: '' });
                      setShowTaskForm(false);
                    }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.2rem' }}
                  >✕</button>
                </div>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Task Name</label>
                    <input 
                      type="text" 
                      placeholder="What needs to be done?"
                      value={taskForm.text}
                      onChange={e => setTaskForm({...taskForm, text: e.target.value})}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '10px', color: 'white' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Start Time (HH:MM)</label>
                    <input 
                      type="time" 
                      value={taskForm.startTime}
                      onChange={e => setTaskForm({...taskForm, startTime: e.target.value})}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '10px', color: 'white', colorScheme: 'dark' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>End Time (HH:MM)</label>
                    <input 
                      type="time" 
                      value={taskForm.endTime}
                      onChange={e => setTaskForm({...taskForm, endTime: e.target.value})}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '10px', color: 'white', colorScheme: 'dark' }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Category</label>
                    <select 
                      value={taskForm.category}
                      onChange={e => setTaskForm({...taskForm, category: e.target.value})}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '10px', color: 'white' }}
                    >
                      {Object.entries(categories).map(([val, info]) => (
                        <option key={val} value={val} style={{ background: '#1a1f4b' }}>{info.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ color: '#cbd5e1', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Recurrence</label>
                    <select 
                      value={taskForm.recurrence}
                      onChange={e => setTaskForm({...taskForm, recurrence: e.target.value})}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '10px', color: 'white' }}
                    >
                      <option value="once" style={{ background: '#1a1f4b' }}>Once</option>
                      <option value="daily" style={{ background: '#1a1f4b' }}>Daily</option>
                      <option value="weekly" style={{ background: '#1a1f4b' }}>Weekly</option>
                    </select>
                  </div>

                  <div className="form-actions" style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '10px' }}>
                    <button 
                      className="add-btn" 
                      onClick={addDetailedTask}
                      style={{ padding: '10px 24px' }}
                    >
                      {editingTask ? 'Update Task' : 'Save Task'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'daily' && (
              <DailyTab 
                calendarTasks={calendarTasks}
                getTasksForDate={getTasksForDate}
                showTaskForm={showTaskForm}
                setShowTaskForm={setShowTaskForm}
                toggleTaskCompletion={toggleTaskCompletion}
                deleteManualTask={deleteManualTask}
                startEditingTask={startEditingTask}
                categories={categories}
                fixedRoutine={fixedRoutine}
                setFixedRoutine={setFixedRoutine}
                showRoutineEditor={showRoutineEditor}
                setShowRoutineEditor={setShowRoutineEditor}
                reminderNotifications={reminderNotifications}
              />
            )}

            {activeTab === 'weeklyToDo' && (
              <WeeklyTab 
                currentWeekStart={currentWeekStart}
                setCurrentWeekStart={setCurrentWeekStart}
                getTasksForDate={getTasksForDate}
                categories={categories}
                toggleTaskCompletion={toggleTaskCompletion}
                deleteManualTask={deleteManualTask}
                startEditingTask={startEditingTask}
                setTaskForm={setTaskForm}
                taskForm={taskForm}
                setShowTaskForm={setShowTaskForm}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarTab 
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                selectedCalendarDate={selectedCalendarDate}
                setSelectedCalendarDate={setSelectedCalendarDate}
                manualTaskInput={manualTaskInput}
                setManualTaskInput={setManualTaskInput}
                calendarTasks={calendarTasks}
                setCalendarTasks={setCalendarTasks}
                calendarNotes={calendarNotes}
                setCalendarNotes={setCalendarNotes}
                categories={categories}
                getTasksForDate={getTasksForDate}
                toggleTaskCompletion={toggleTaskCompletion}
                deleteManualTask={deleteManualTask}
              />
            )}

            {activeTab === 'planner' && (
              <PlannerTab 
                goals={goals}
                selectedGoal={selectedGoal}
                loadingPlan={loadingPlan}
                apiError={apiError}
                generatePlan={generatePlan}
                completedRoadmapTasks={completedRoadmapTasks}
                setCompletedRoadmapTasks={setCompletedRoadmapTasks}
                integratePlanToSchedule={integratePlanToSchedule}
                planFeedback={planFeedback}
                setPlanFeedback={setPlanFeedback}
                categories={categories}
              />
            )}

            {activeTab === 'weekly' && (
              <WeeklyScheduleTab 
                goals={goals}
                selectedGoal={selectedGoal}
                integrationFilter={integrationFilter}
                setIntegrationFilter={setIntegrationFilter}
                integratePlanToSchedule={integratePlanToSchedule}
                clearGoalTasksFromSchedule={clearGoalTasksFromSchedule}
                addedAiTasks={addedAiTasks}
                removeSingleAiTaskFromSchedule={removeSingleAiTaskFromSchedule}
                addSingleAiTaskToSchedule={addSingleAiTaskToSchedule}
                calculatePlanDate={calculatePlanDate}
                planFeedback={planFeedback}
                setPlanFeedback={setPlanFeedback}
                generatePlan={generatePlan}
                loadingPlan={loadingPlan}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab 
                goals={goals}
                calendarTasks={calendarTasks}
                completedRoadmapTasks={completedRoadmapTasks}
              />
            )}

            {activeTab === 'journal' && (
              <JournalTab 
                journalEntries={journalEntries}
                setJournalEntries={setJournalEntries}
                journalReflections={journalReflections}
                setJournalReflections={setJournalReflections}
                journalMoods={journalMoods}
                setJournalMoods={setJournalMoods}
                token={token}
                goals={goals}
                calendarTasks={calendarTasks}
                fixedRoutine={fixedRoutine}
                API_URL={API_URL}
                formatDate={formatDate}
              />
            )}

          </div>

          <Sidebar 
            goals={goals}
            selectedGoal={selectedGoal}
            setSelectedGoal={setSelectedGoal}
            inputValue={inputValue}
            setInputValue={setInputValue}
            inputRef={inputRef}
            addGoal={addGoal}
            deleteGoal={deleteGoal}
            setActiveTab={setActiveTab}
            handleKeyPress={handleKeyPress}
            goalError={goalError}
            setGoalError={setGoalError}
          />
        </div>

      <AuthModal 
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        token={token}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        setAuthError={setAuthError}
        authLoading={authLoading}
        handleAuthSubmit={handleAuthSubmit}
      />
    </div>
  </div>
  );
}