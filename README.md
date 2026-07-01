# GoalGrid: AI-Powered Personalized Task Planner

GoalGrid is a high-performance task planning workspace that blends AI strategic planning, calendar management, introspective reflection and performance analytics into one polished dashboard.

## 🚀 What GoalGrid Can Do

- Generate AI-powered execution plans and roadmaps from your goals
- Focus on high-impact tasks with a strict "No-Fluff" execution schedule
- Reflect on your day in the **AI Reflection Space** with multiple coaching modes
- Trace your progress with **Well-Being Trend Analytics** (Energy, Barriers, and Correlation)
- Batch-add tasks to the calendar via the **Smart Schedule Integration**
- Track deadlines directly inside the calendar form
- Reminder/Notification system for tasks, upcoming deadlines, and streak alerts
- Keep everything synced with cloud authentication and persistence


## ✨ Core Features

### AI Goal Planning
- Enter a goal like "Complete a client project in 3 weeks" and receive a structured roadmap.
- AI plans are aware of your existing schedule and available time.
- Supports phase-based milestone checklists for deeper progress tracking.

### Routine-Friendly Scheduling
- Define fixed daily routine blocks such as waking up, meals, study time, or workouts.
- The AI scheduler avoids these non-negotiable time slots when generating plans.

### Smart Calendar
- Full monthly calendar view with selectable days and task summaries.
- Adds deadline tasks with a dedicated deadline toggle.
- Displays task categories and notes per day.
- Select a day to see tasks, add events, and edit daily notes.

### Task Management & Tracking
- Supports manual task creation with time slot and category assignment.
- Allows task completion toggles in calendar and daily views.
- Shows deadline labels for important due-date entries.

### AI Reflection Space (Journaling)
- Choosable "Coaching Modes": Stoic, EQ, ROSE, Productivity, or Balanced.
- AI-driven behavioral insights based on your entries and task history.
- "Reflect with AI" follow-up chat to dive deeper into your day.
- Draft-generation tool to jumpstart your daily reflections.

### Well-Being Trend Analytics
- Automated analysis of energy levels and common barriers to productivity.
- Mood-productivity correlation tracking over 7-day windows.
- Trends auto-refresh upon journal submission for real-time growth tracking.

### Analytics & Progress
- Calculates completed calendar tasks, roadmap progress, and goal completion.
- Displays XP-style progress and streak tracking.
- Visualizes energy heatmaps and behavioral patterns.


## 🧱 Project Structure

- `src/` - Frontend React application
- `src/components/` - UI tabs, planner, calendar, analytics, and sidebar components
- `backend/` - Express backend for auth and user data persistence
- `backend/routes/planner.js` - Sync endpoint for saving planner state
- `backend/models/User.js` - User schema and planner data storage

## ⚙️ Installation

### Frontend
1. Clone the repository:
   ```bash
   cd productive
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory:
   ```env
   REACT_APP_GROQ_API_KEY=your_api_key_here
   REACT_APP_GROQ_MODEL=llama-3.3-70b-versatile
   ```
4. Start the frontend:
   ```bash
   npm start
   ```

### Backend
1. Open a second terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a backend `.env` file if required for auth or DB config.
4. Start the backend service:
   ```bash
   npm start
   ```

## 📌 Usage Flow

1. Log in or sign up via the authentication modal.
2. Define your **Daily Routine** so the AI can build plans around your life.
3. Add a new goal and generate a **Strategic Execution Plan**.
4. Use **Quick Add** tags to integrate tasks into your calendar (e.g. "Week 1 Mornings").
5. Execute your deep work sessions and mark milestones complete.
6. Open the **Reflection Space** in the evening to journal with your chosen coaching lens.
7. Review your **Trends Dashboard** to optimize your performance for the next day.

## 💡 Tips

- Use goal descriptions with a specific outcome and deadline.
- Mark time-critical items as deadlines to keep them visible.
- Keep your routine updated so the AI can schedule realistically.
- Use the Analytics tab to stay motivated with progress summaries.

## 🤝 Contributing

Contributions and improvements are welcome. Open an issue or send a pull request to add new features, improve planning logic, or polish the interface.

