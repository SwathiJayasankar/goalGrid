const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { runAgent } = require('../utils/agentExecutor');

// @route   POST api/assistant/chat
// @desc    Interact with personalized agentic AI assistant
// @access  Private
router.post('/chat', auth, async (req, res) => {
  const { message, chatHistory } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Input message is required.' });
  }

  try {
    const result = await runAgent(req.user.id, message, chatHistory || []);
    res.json(result);
  } catch (err) {
    console.error('Agent chat route error:', err);
    res.status(500).json({ 
      message: err.message || 'Error occurred running the AI Agent Copilot',
      error: true
    });
  }
});

module.exports = router;
