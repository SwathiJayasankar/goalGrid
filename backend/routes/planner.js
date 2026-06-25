const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET api/planner/sync
// @desc    Get user's full task planner data
// @access  Private
router.get('/sync', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      goals: user.goals || [],
      fixedRoutine: user.fixedRoutine || [],
      calendarTasks: user.calendarTasks || {},
      calendarNotes: user.calendarNotes || {},
      completedRoadmapTasks: user.completedRoadmapTasks || {},
      addedAiTasks: user.addedAiTasks || {},
      journalEntries: user.journalEntries || {},
      journalReflections: user.journalReflections || {},
      journalMoods: user.journalMoods || {}
    });
  } catch (err) {
    console.error('Fetch sync error:', err);
    res.status(500).json({ message: 'Server error during data sync fetch' });
  }
});

// @route   POST api/planner/trends
// @access  Private
router.post('/trends', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const journalEntries = user.journalEntries || {};
    const journalMoods = user.journalMoods || {};
    const calendarTasks = user.calendarTasks || {};

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'AI API key not configured' });

    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const historyContext = dates.reverse().map(date => {
      const tasks = calendarTasks[date] || [];
      const completed = Array.isArray(tasks) ? tasks.filter(t => t.completed).length : 0;
      const total = Array.isArray(tasks) ? tasks.length : 0;
      return {
        date,
        mood: journalMoods[date] || 'Not recorded',
        journal: journalEntries[date] ? journalEntries[date].substring(0, 150) + '...' : 'No entry',
        productivity: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });

    const systemPrompt = `You are a Well-Being Data Analyst. Analyze the user's data.
    1. Identify "Common Barriers".
    2. Estimate "Energy Levels" (0-100) for each date.
    3. Provide Mood/Productivity Correlation.
    OUTPUT STRUCTURE (STRICT JSON):
    {
      "commonBarriers": ["Barrier 1"],
      "energyTrends": [{"date": "YYYY-MM-DD", "level": 85}],
      "moodProductivityInsight": "Insight text"
    }`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(historyContext) }
        ],
        temperature: 0.1
      })
    });

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('No AI content');

    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    res.json(JSON.parse(content.substring(start, end + 1)));
  } catch (err) {
    res.status(500).json({ message: 'Error analyzing trends: ' + err.message });
  }
});

// @route   POST api/planner/sync
// @desc    Persist/save user's full task planner data
// @access  Private
router.post('/sync', auth, async (req, res) => {
  const { goals, fixedRoutine, calendarTasks, calendarNotes, completedRoadmapTasks, addedAiTasks, journalEntries, journalReflections, journalMoods } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (goals !== undefined) user.goals = goals;
    if (fixedRoutine !== undefined) user.fixedRoutine = fixedRoutine;
    if (calendarTasks !== undefined) user.calendarTasks = calendarTasks;
    if (calendarNotes !== undefined) user.calendarNotes = calendarNotes;
    if (completedRoadmapTasks !== undefined) user.completedRoadmapTasks = completedRoadmapTasks;
    if (addedAiTasks !== undefined) user.addedAiTasks = addedAiTasks;
    if (journalEntries !== undefined) user.journalEntries = journalEntries;
    if (journalReflections !== undefined) user.journalReflections = journalReflections;
    if (journalMoods !== undefined) user.journalMoods = journalMoods;

    await user.save();

    res.json({ message: '✓ Data successfully synced to cloud' });
  } catch (err) {
    console.error('Update sync error:', err);
    res.status(500).json({ message: 'Server error during data sync save' });
  }
});

// @route   POST api/planner/generate-plan
// @desc    Generate personalized plan using Groq API securely
// @access  Private
router.post('/generate-plan', auth, async (req, res) => {
  const { goal, feedback, fixedRoutine, calendarTasks } = req.body;

  if (!goal) {
    return res.status(400).json({ message: 'Goal is required' });
  }

  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      return res.status(500).json({ message: 'Server configuration error: Groq API key is missing.' });
    }

    // Compile upcomingTasks context
    const upcomingTasks = Object.entries(calendarTasks || {})
      .filter(([dateKey]) => new Date(dateKey) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 15) // Next 15 days of specific tasks
      .map(([date, tasks]) => {
        const taskDetails = tasks.map(t => `${t.startTime || 'All day'}${t.endTime ? '-' + t.endTime : ''}: ${t.text}`).join('; ');
        return `${date}: ${taskDetails}`;
      })
      .join('\n');

    // Compile routine context
    const routineContext = (fixedRoutine || []).map(r => `${r.time}: ${r.text}`).join('\n');

    const systemPrompt = `You are a High-Performance Strategy Consultant and Task Architect. Your objective is to transform a goal into a Lean, High-Impact Execution Plan.
      
      CORE PRINCIPLES:
      1. ABSOLUTELY NO FILLER OR ROUTINE TASKS: Forbid the inclusion of ANY routine, maintenance, or preparation tasks. 
         - PROHIBITED: Breakfast, meals, showers, resting, sleeping, "preparing for [task]", "reviewing plans", "organizing workspace", "general planning", or "checking emails".
         - MANDATORY: Only include the actual high-value execution blocks (e.g. "Evening workout (lower body)", "Code core API modules", "Write Chapter 1 summary").
      2. WORK/EXECUTION ONLY: Assume the user handles their own life logistics. Your output is ONLY for the specific, goal-directed work sessions.
      3. HIGH-DENSITY, LOW-FREQUENCY: Do not fill the day with many small tasks. Aim for 1-3 significant "Mission Critical" sessions per day.
      4. DIRECT ROADMAP MAPPING: Every time slot in the "weeklySchedule" must correspond to a specific, difficult milestone from the "ROADMAP" section. 
      5. SLOT AWARENESS: Respect the "Daily Routine" and "Existing Tasks" as hard blocks. Do not double-book.
      6. DEADLINE ENFORCEMENT (STRICT): If the goal mentions a specific date or deadline (e.g., "May 20th", "this Wednesday", "by Friday"), your planning MUST STOP at that deadline. Do not provide a generic full-week schedule. The "roadmap" and "weeklySchedule" should only cover the time leading up to and including the deadline day.
      7. focus more on doing the tasks and not on planning or reviewing them
      
      STRUCTURE RULES:
      - ROADMAP: The strategic high-level milestones.
      - WEEKLY SCHEDULE: The PURE EXECUTION of those milestones. No prep, no rest, no fluff.
      - DEADLINE: If a deadline is mentioned (e.g., 'by Friday'), the plan MUST terminate at that deadline. 
      - FORMAT: Strict JSON. No conversational text outside the JSON block.

      JSON STRUCTURE:
      {
        "title": "Strategy: [Goal Name]",
        "overview": "Strategic summary of the approach and why this sequence works.",
        "timeline": "Duration of focus",
        "roadmap": [
          {
            "phase": "Strategic Phase (e.g. 'Phase 1: Foundation')",
            "milestone": "Critical success factor for this phase",
            "tasks": ["High-impact roadmap task 1", "High-impact roadmap task 2"]
          }
        ],
        "weeklySchedule": [
          {
            "week": 1,
            "focus": "Core execution target",
            "days": [
              {
                "day": "DayName",
                "morning": ["Time: Specific ROADMAP task"],
                "afternoon": ["Time: Specific ROADMAP task"],
                "evening": ["Time: Specific ROADMAP task"]
              }
            ],
            "weeklyTasks": ["Goal-critical milestones"]
          }
        ],
        "dailyCheckpoints": ["Critical metrics or outputs for each day"],
        "keyMetrics": ["KPIs for success"],
        "tips": ["Strategic advice on avoiding specific blockers related to this goal"]
      }`;

    const userContent = `Current Date/Time: ${new Date().toLocaleString()} (Today is a ${new Date().toLocaleDateString('en-US', { weekday: 'long' })})
              
Goal: "${goal.goal}"
${feedback ? `\nUSER SPECIFIC REFINEMENT REQUEST: "${feedback}"\n` : ''}

USER'S DAILY ROUTINE (NON-NEGOTIABLE):
${routineContext}

EXISTING TASKS & APPOINTMENTS (DO NOT OVERLAP):
${upcomingTasks || 'No specific appointments yet.'}

Task: ${feedback ? 'Update and refine the existing plan based on my feedback. ' : 'Generate a plan for the new goal that integrates SEAMLESSLY with my existing schedule. '} Do not double-book me. 

CALENDAR CONTEXT:
${(() => {
        const d = new Date();
        const tomorrow = new Date(d); tomorrow.setDate(d.getDate() + 1);
        const nextMon = new Date(d); nextMon.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
        return `Today is ${d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
Tomorrow is ${tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
Upcoming Monday is ${nextMon.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`;
      })()}
Please ensure your schedule logic follows this calendar correctly.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 4000,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const planText = data?.choices?.[0]?.message?.content;
    if (!planText) {
      throw new Error('Groq API returned an empty response.');
    }

    let planData;
    try {
      const start = planText.indexOf('{');
      const end = planText.lastIndexOf('}');
      if (start === -1 || end === -1) {
        throw new Error("No JSON found in response");
      }
      const jsonStr = planText.substring(start, end + 1);
      planData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse plan JSON on backend:', parseError);
      planData = {
        error: 'Could not parse plan',
        content: planText,
        message: parseError.message
      };
    }

    res.json(planData);
  } catch (err) {
    console.error('AI plan generation error:', err);
    res.status(500).json({ message: 'Error generating AI plan on server', error: err.message });
  }
});

router.post('/reflect', auth, async (req, res) => {
  const { journalEntry, mood, date, goals, calendarTasks, journalEntries, journalMoods, journalReflections, fixedRoutine, reflectionMode } = req.body;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      return res.status(500).json({ message: 'Server configuration error: Groq API key is missing.' });
    }

    // Role and Field adjustment based on mode
    let modeInstruction = "";
    switch (reflectionMode) {
      case 'stoic':
        modeInstruction = `Adopt a Stoic philosopher's lens. 
        - reflectionSummary: Summarize the day focusing on what was within vs. outside the user's control.
        - behavioralInsights: Analyze the user's emotional reactions vs. rational responses. Identify moments of over-attachment to outcomes.
        - reflectionQuestions: Ask about virtue, equanimity, and preparation for future hardships.`;
        break;
      case 'rose':
        modeInstruction = `Use the ROSE method strictly.
        - reflectionSummary: Structure this clearly as: ROSE (Highlight), THORN (Challenge), BUD (Potential/Hope).
        - behavioralInsights: Analyze why the Rose was successful and how the Thorn can be handled next time.
        - reflectionQuestions: Ask about how to nurture the 'Bud' into a full 'Rose'.`;
        break;
      case 'productivity':
        modeInstruction = `Adopt a High-Performance Productivity Coach lens.
        - reflectionSummary: Summarize primarily based on roadmap momentum and task completion quality.
        - behavioralInsights: Identify specific friction points, time-leaks, and energy-drainers. Compare current behavior to long-term goals.
        - reflectionQuestions: Ask about specific schedule optimizations and deep work periods.`;
        break;
      case 'eq':
        modeInstruction = `Adopt an Emotional Intelligence lens.
        - reflectionSummary: Focus on the emotional arc of the day and quality of social interactions.
        - behavioralInsights: Identify emotional triggers, stress patterns, and moments of high/low empathy or self-awareness.
        - reflectionQuestions: Ask about underlying feelings and how they impacted productivity.`;
        break;
      default:
        modeInstruction = `Adopt a balanced Well-Being and Productivity Coach lens.
        - reflectionSummary: A cohesive look at both mood and accomplishments.
        - behavioralInsights: General patterns between emotional state and task execution.
        - reflectionQuestions: Broad introspective questions for overall growth.`;
    }

    // Context preparation
    const taskHistory = Object.entries(calendarTasks || {})
      .sort(([a], [b]) => b.localeCompare(a)) // Recent first
      .slice(0, 7) // Last 7 days
      .map(([date, tasks]) => {
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        const details = tasks.map(t => `[${t.completed ? 'X' : ' '}] ${t.text}`).join(', ');
        return `${date}: ${completed}/${total} tasks completed. (${details})`;
      })
      .join('\n');

    const goalsContext = (goals || []).map(g => `- ${g.goal}`).join('\n');
    const recentJournals = Object.entries(journalEntries || {})
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3)
      .map(([d, entry]) => `${d}: [Mood: ${journalMoods?.[d] || 'Unknown'}] ${entry}`)
      .join('\n\n');

    const systemPrompt = `You are a professional AI Reflection Coach. ${modeInstruction}

CORE CAPABILITIES:
1. Analyze journal entries and MOOD alongside task behavior to identify patterns.
2. Detect signs of burnout, overload, or inconsistent routines.
3. Provide personalized encouragement and accountability.
4. Recommend schedule or habit adjustments based on your specific mode lens.

OUTPUT STRUCTURE (STRICT JSON):
{
  "reflectionSummary": "A concise summary based on your mode lens.",
  "behavioralInsights": "Observations about patterns, energy levels, mood correlations, or productivity behaviors.",
  "suggestedAdjustments": "Practical, gentle suggestions for schedule or habits.",
  "reflectionQuestions": ["Question 1", "Question 2"],
  "personalizedEncouragement": "A supportive, non-judgmental closing statement."
}

TONE: Supportive, non-judgmental, insightful, and practical.`;

    const userContent = `Current Date: ${date}
CURRENT MOOD: ${mood || 'Not specified'}
    
NEW JOURNAL ENTRY:
"${journalEntry}"

USER'S GOALS:
${goalsContext || 'No goals set yet.'}

TASK HISTORY (Last 7 Days):
${taskHistory || 'No task history available.'}

PREVIOUS ENTRIES:
${recentJournals || 'No previous journal entries.'}

Analyze this data and provide your reflection coaching output.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const reflectText = data?.choices?.[0]?.message?.content;

    let reflectData;
    try {
      const start = reflectText.indexOf('{');
      const end = reflectText.lastIndexOf('}');
      const jsonStr = reflectText.substring(start, end + 1);
      reflectData = JSON.parse(jsonStr);
    } catch (e) {
      reflectData = {
        reflectionSummary: reflectText,
        behavioralInsights: "Analysis in progress...",
        suggestedAdjustments: "Keep tracking your tasks!",
        reflectionQuestions: ["How did today feel compared to yesterday?"],
        personalizedEncouragement: "You're making great progress!"
      };
    }

    res.json(reflectData);
  } catch (err) {
    console.error('Reflection analysis error:', err);
    res.status(500).json({ message: 'Error generating reflection analysis', error: err.message });
  }
});

// @route   POST api/planner/generate-journal
// @desc    Generate a journal draft based on daily activities
// @access  Private
router.post('/generate-journal', auth, async (req, res) => {
  const { date, goals, calendarTasks, fixedRoutine } = req.body;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    const tasks = calendarTasks[date] || [];
    const completedTasks = tasks.filter(t => t.completed).map(t => t.text).join(', ');
    const pendingTasks = tasks.filter(t => !t.completed).map(t => t.text).join(', ');
    const goalsList = (goals || []).map(g => g.goal).join(', ');

    const systemPrompt = `You are a helpful assistant that drafts personalized daily reflection journals.
Your goal is to look at the user's completed and pending tasks for the day, their goals, and create a thoughtful journal draft that they can edit.

Draft should include:
1. A summary of what was accomplished.
2. A mention of what's still pending.
3. How these activities relate to their long-term goals.
4. An inviting opening to encourage them to add their own feelings and notes.

Keep it relatively short (2-3 paragraphs) and conversational.`;

    const userContent = `Date: ${date}
Goals: ${goalsList || 'Not specified'}
Completed Tasks: ${completedTasks || 'None'}
Pending Tasks: ${pendingTasks || 'None'}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ]
      })
    });

    const data = await response.json();
    const draft = data?.choices?.[0]?.message?.content;
    res.json({ draft });
  } catch (err) {
    res.status(500).json({ message: 'Error generating journal draft' });
  }
});

router.post('/chat', auth, async (req, res) => {
  const { message, chatHistory, journalEntry, mood, date, goals, calendarTasks, journalEntries, journalMoods, fixedRoutine } = req.body;

  try {
    const apiKey = process.env.GROQ_API_KEY;
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

    if (!apiKey) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const systemPrompt = `You are the AI Reflection & Well-Being Coach in a deep-dive conversation with the user.
You have full context of their goals, tasks, mood, and reflections. 

YOUR CONTEXT:
- Date: ${date}
- Mood Today: ${mood || 'Not specified'}
- Current Journal Entry: "${journalEntry}"
- Goals: ${(goals || []).map(g => g.goal).join(', ')}
- Task History: ${Object.entries(calendarTasks || {}).slice(0, 3).map(([d, t]) => `${d}: [Mood: ${journalMoods?.[d] || 'Unknown'}] ${t.map(x => x.text).join('; ')}`).join(' | ')}

YOUR MISSION:
- Answer the user's follow-up questions about their day, productivity, mood, or well-being.
- Be insightful, supportive, and practical.
- Use their mood data to provide better correlations.
- If they ask to rewrite a routine or schedule, provide specific, actionable suggestions.
- Keep the conversation flowing and helpful.

RULES:
- Maintain a supportive, coaching tone.
- Do not give medical or psychological advice.
- Refer back to their journal or tasks whenever relevant.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: 1000,
        temperature: 0.5
      })
    });

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: 'Error in AI chat' });
  }
});

// Trends route moved higher for reliability


module.exports = router;

