const User = require('../models/User');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Normalizes 24h format (e.g. 14:30) to AM/PM format (e.g. 02:30 PM) for scheduler continuity
const normalizeTimeToAMPM = (timeStr) => {
  if (!timeStr) return '';
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  let ampm = match[3];

  if (!ampm) {
    ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
  }
  return `${String(hours).padStart(2, '0')}:${minutes} ${ampm.toUpperCase()}`;
};

// Simple search utility that combines Wikipedia APIs + DuckDuckGo HTML parser (no keys required)
async function searchWeb(query) {
  try {
    let results = '';
    
    // 1. Fetch Wikipedia search results
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
      const wikiRes = await fetch(wikiUrl);
      const wikiData = await wikiRes.json();
      if (wikiData?.query?.search?.length > 0) {
        results += `Wikipedia Factual Results for "${query}":\n`;
        results += wikiData.query.search.slice(0, 3).map(r => `- ${r.title}: ${r.snippet.replace(/<[^>]*>/g, '')}`).join('\n') + '\n\n';
      }
    } catch (e) {
      console.error('Wikipedia search error:', e);
    }

    // 2. Fetch general web snippets from DuckDuckGo HTML 
    try {
      const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (ddgRes.ok) {
        const html = await ddgRes.text();
        const snippets = [];
        const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
        let match;
        let count = 0;
        while ((match = snippetRegex.exec(html)) !== null && count < 3) {
          const text = match[1].replace(/<[^>]*>/g, '').trim();
          if (text) {
            snippets.push(text);
            count++;
          }
        }
        if (snippets.length > 0) {
          results += `DuckDuckGo Web Search Results for "${query}":\n`;
          results += snippets.map(s => `- ${s}`).join('\n');
        }
      }
    } catch (e) {
      console.error('DuckDuckGo search error:', e);
    }

    return results || `No real-time web results found for: "${query}".`;
  } catch (err) {
    return `Failed to search the web: ${err.message}`;
  }
}

// Tool Declaration List for Groq API
const agentTools = [
  {
    type: "function",
    function: {
      name: "search_web",
      description: "Search the web for general advice, research, tips, articles, or productivity advice.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keywords to search the web" }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_user_data",
      description: "Retrieves details of the user's workspace profile including active goals, daily routine slots, scheduled tasks, and journals.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "create_local_task",
      description: "Schedules a new task on the user's GoalGrid calendar.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "The content/title of the task" },
          dateKey: { type: "string", description: "The target date in YYYY-MM-DD format" },
          startTime: { type: "string", description: "Optional starting time (e.g. '09:00 AM' or '15:20')" },
          endTime: { type: "string", description: "Optional ending time (e.g. '10:30 AM')" },
          category: { type: "string", enum: ["study", "health", "casual", "work", "important"], description: "The category" }
        },
        required: ["text", "dateKey"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_local_task",
      description: "Deletes a specific task from the user's calendar schedule.",
      parameters: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "The task unique ID" },
          dateKey: { type: "string", description: "The date of the task in YYYY-MM-DD format" }
        },
        required: ["taskId", "dateKey"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "toggle_local_task",
      description: "Toggles completion status of a specific task (check/uncheck).",
      parameters: {
        type: "object",
        properties: {
          taskId: { type: "string", description: "The task unique ID" },
          dateKey: { type: "string", description: "The date of the task in YYYY-MM-DD format" }
        },
        required: ["taskId", "dateKey"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_local_goal",
      description: "Adds a new goal to the goals panel.",
      parameters: {
        type: "object",
        properties: {
          goalText: { type: "string", description: "Detailed description of the goal" }
        },
        required: ["goalText"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_daily_routine",
      description: "Appends a new recurring slot (e.g. sleep hour, work shifts) to the user's fixed daily routine. This routine repeats daily.",
      parameters: {
        type: "object",
        properties: {
          routineText: { type: "string", description: "Detail of the routine element" },
          time: { type: "string", description: "Standard time slot (e.g. '07:30 AM' or '22:00')" },
          category: { type: "string", enum: ["work", "health", "casual", "important", "study"], description: "Category of the routine" }
        },
        required: ["routineText", "time"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_journal_entry",
      description: "Logs a reflection journal entry into the user's workspace.",
      parameters: {
        type: "object",
        properties: {
          dateKey: { type: "string", description: "Target date in YYYY-MM-DD format" },
          entryText: { type: "string", description: "The content detail of the journal" },
          mood: { type: "string", description: "User's current mood classification (e.g. 'productive', 'tired', 'creative')" }
        },
        required: ["dateKey", "entryText"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_user_files",
      description: "Lists all files, PDFs, images, and notes stored in the user's workspace.",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "read_user_file",
      description: "Reads the content, note body, or text description of a specific file by its file ID.",
      parameters: {
        type: "object",
        properties: {
          fileId: { type: "string", description: "The unique ID of the file or note." }
        },
        required: ["fileId"]
      }
    }
  }
];

// Handles execution of agentic loops
async function runAgent(userId, userMessage, chatHistory = []) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    throw new Error('Groq API Key is not configured on the server.');
  }

  // 1. Fetch User Document from DB
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found in system databases.');
  }

  // 2. Build Context Prompt
  const currentDateKey = new Date().toISOString().split('T')[0];
  const systemPrompt = `You are "GoalGrid Copilot", the personalized, agentic AI productivity advisor integrated on this dashboard.
Your goal is to help user succeed, balance daily routines, handle tasks, reflect through diaries, and navigate challenges.

You have direct access to user's local database and can execute workspace modifications using your tools.
Current Date: ${currentDateKey} (Today is a ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}).

Here is a general snapshot of the user's workspace for quick context:
- Goals count: ${user.goals?.length || 0}
- Routine items count: ${user.fixedRoutine?.length || 0}
- Active task dates: ${Object.keys(user.calendarTasks || {}).slice(-5).join(', ') || 'No tasks started'}
- Active journal dates: ${Object.keys(user.journalEntries || {}).slice(-3).join(', ') || 'No entries logged'}

CORE ACTIONS POLICY:
1. USE YOUR TOOLS whenever requested to add/toggle/delete tasks, create goals, adjust routines, write journal reflections, or look up information.
2. If the user asks you to write reflection drafts, research morning guidelines, or schedule an study session, do NOT just say you will do it—ACTUALLY call the appropriate tool.
3. Keep answers friendly, succinct and coaching-focused. Refrain from listing JSON traces in your final answer; instead summarize what actions were completed.
4. Normalize times (like "14:00" to "02:00 PM") to avoid scheduler crashes.
5. If the user asks you to do something complex, you can invoke multiple tools in succession. For example, search the web first, then write a task based on findings.
`;

  // 3. Assemble message arrays
  const messages = [
    { role: 'system', content: systemPrompt },
    ...chatHistory.slice(-15).map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
      // If there were tool calls, we preserve them
      ...(m.tool_calls ? { tool_calls: m.tool_calls } : {})
    })),
    { role: 'user', content: userMessage }
  ];

  const steps = [];
  let isThinking = true;
  let iterations = 0;
  const maxIterations = 5; // prevent infinite recursion
  let finalReply = '';

  while (isThinking && iterations < maxIterations) {
    iterations++;
    
    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1500,
        temperature: 0.4,
        messages: messages,
        tools: agentTools,
        tool_choice: 'auto'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned status ${response.status}: ${errText}`);
    }

    const resData = await response.json();
    const assistantMessage = resData?.choices?.[0]?.message;

    if (!assistantMessage) {
      throw new Error('Groq API returned an empty completion response.');
    }

    // Add assistant's response to history (contains tool_calls if requested)
    messages.push(assistantMessage);

    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      for (const call of assistantMessage.tool_calls) {
        const toolName = call.function.name;
        const toolArgs = JSON.parse(call.function.arguments || '{}');
        
        let toolOutput = '';
        let stepText = '';

        try {
          switch (toolName) {
            case 'search_web':
              stepText = `Searching web for: "${toolArgs.query}"`;
              toolOutput = await searchWeb(toolArgs.query);
              break;

            case 'get_user_data':
              stepText = 'Retrieving full user workspace details...';
              toolOutput = JSON.stringify({
                goals: user.goals || [],
                fixedRoutine: user.fixedRoutine || [],
                calendarTasks: user.calendarTasks || {},
                journalEntries: user.journalEntries || {},
                journalMoods: user.journalMoods || {}
              });
              break;

            case 'create_local_task':
              const startN = normalizeTimeToAMPM(toolArgs.startTime);
              const endN = normalizeTimeToAMPM(toolArgs.endTime);
              const taskId = `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              stepText = `Scheduling Calendar Task: "${toolArgs.text}" on ${toolArgs.dateKey} at ${startN || 'anytime'}`;
              
              const newTask = {
                id: taskId,
                text: toolArgs.text,
                startTime: startN,
                endTime: endN,
                category: toolArgs.category || 'casual',
                recurrence: 'once',
                deadline: toolArgs.dateKey,
                completed: false
              };
              
              if (!user.calendarTasks[toolArgs.dateKey]) {
                user.calendarTasks[toolArgs.dateKey] = [];
              }
              user.calendarTasks[toolArgs.dateKey].push(newTask);
              user.markModified('calendarTasks');
              toolOutput = `✓ Task successfully created with ID: ${taskId}`;
              break;

            case 'delete_local_task':
              stepText = `Deleting task ID: ${toolArgs.taskId} from date: ${toolArgs.dateKey}`;
              if (user.calendarTasks[toolArgs.dateKey]) {
                const initialLen = user.calendarTasks[toolArgs.dateKey].length;
                user.calendarTasks[toolArgs.dateKey] = user.calendarTasks[toolArgs.dateKey].filter(
                  t => t.id !== toolArgs.taskId
                );
                user.markModified('calendarTasks');
                const wasDeleted = user.calendarTasks[toolArgs.dateKey].length < initialLen;
                toolOutput = wasDeleted ? '✓ Task successfully deleted' : 'Warning: Task not found on that date';
              } else {
                toolOutput = 'Warning: No tasks scheduled on that target date';
              }
              break;

            case 'toggle_local_task':
              stepText = `Toggling completion state for task ID: ${toolArgs.taskId} on date: ${toolArgs.dateKey}`;
              if (user.calendarTasks[toolArgs.dateKey]) {
                let found = false;
                user.calendarTasks[toolArgs.dateKey] = user.calendarTasks[toolArgs.dateKey].map(t => {
                  if (t.id === toolArgs.taskId) {
                    found = true;
                    return { ...t, completed: !t.completed };
                  }
                  return t;
                });
                user.markModified('calendarTasks');
                toolOutput = found ? '✓ Task completion status toggled' : 'Warning: Task not found';
              } else {
                toolOutput = 'Warning: No tasks found for that date';
              }
              break;

            case 'create_local_goal':
              const goalId = Date.now();
              stepText = `Creating high-level roadmap goal: "${toolArgs.goalText}"`;
              const newGoal = {
                id: goalId,
                goal: toolArgs.goalText,
                plan: null,
                generatedAt: null
              };
              if (!Array.isArray(user.goals)) user.goals = [];
              user.goals.unshift(newGoal);
              user.markModified('goals');
              toolOutput = `✓ Goal successfully added with ID: ${goalId}`;
              break;

            case 'update_daily_routine':
              const routineId = Date.now();
              const routineTime = normalizeTimeToAMPM(toolArgs.time);
              stepText = `Adding fixed routine block: "${toolArgs.routineText}" at ${routineTime}`;
              const newRoutine = {
                id: routineId,
                text: toolArgs.routineText,
                time: routineTime,
                category: toolArgs.category || 'health'
              };
              if (!Array.isArray(user.fixedRoutine)) user.fixedRoutine = [];
              user.fixedRoutine.push(newRoutine);
              user.markModified('fixedRoutine');
              toolOutput = `✓ Routine block registered with ID: ${routineId}`;
              break;

            case 'add_journal_entry':
              stepText = `Recording Reflection Journal for ${toolArgs.dateKey}`;
              if (!user.journalEntries) user.journalEntries = {};
              if (!user.journalMoods) user.journalMoods = {};
              
              user.journalEntries[toolArgs.dateKey] = toolArgs.entryText;
              if (toolArgs.mood) {
                user.journalMoods[toolArgs.dateKey] = toolArgs.mood;
              }
              
              user.markModified('journalEntries');
              user.markModified('journalMoods');
              toolOutput = '✓ Journal entry and mood rating recorded';
              break;

            case 'list_user_files':
              stepText = 'Listing files, PDFs, and notes in the workspace...';
              toolOutput = JSON.stringify((user.files || []).map(f => ({
                id: f.id,
                name: f.name,
                type: f.type,
                size: f.size,
                createdAt: f.createdAt,
                description: f.description || ''
              })));
              break;

            case 'read_user_file':
              stepText = `Reading file content for ID: ${toolArgs.fileId}`;
              const foundFile = (user.files || []).find(f => f.id === toolArgs.fileId);
              if (foundFile) {
                toolOutput = JSON.stringify({
                  id: foundFile.id,
                  name: foundFile.name,
                  type: foundFile.type,
                  content: foundFile.type === 'note' ? foundFile.content : `[File: ${foundFile.name}, Type: ${foundFile.type}, Description: ${foundFile.description || 'none'}, Size: ${foundFile.size || 0} bytes]`,
                  extractedText: foundFile.extractedText || foundFile.content || ''
                });
              } else {
                toolOutput = 'Warning: File not found with the specified ID.';
              }
              break;

            default:
              stepText = `Unknown tool: ${toolName}`;
              toolOutput = 'Error: The requested tool is not defined in agent specifications.';
          }
        } catch (toolError) {
          console.error(`Error running tool ${toolName}:`, toolError);
          toolOutput = `Error occurred executing tool: ${toolError.message}`;
        }

        steps.push({
          tool: toolName,
          stepText: stepText,
          args: toolArgs,
          result: toolOutput.substring(0, 1500) // cap size
        });

        // Append tool completion msg back to assistant loop
        messages.push({
          role: 'tool',
          name: toolName,
          tool_call_id: call.id,
          content: toolOutput
        });
      }
    } else {
      isThinking = false;
      finalReply = assistantMessage.content || '';
    }
  }

  // 4. Save any DB changes state
  let workspaceMutated = steps.some(s => s.tool !== 'search_web' && s.tool !== 'get_user_data');
  if (workspaceMutated) {
    await user.save();
  }

  return {
    reply: finalReply || 'Agent processing finished.',
    steps: steps,
    workspaceMutated: workspaceMutated
  };
}

module.exports = {
  runAgent
};
