const express = require('express');
const app = express();
app.use(express.json());

const users = {}; // In-memory user+snippet store

// Create/Update Snippet
app.post('/users/:user_str_id/snippets', (req, res) => {
  const { user_str_id } = req.params;
  const { snippet_name, language, code_content } = req.body;
  const now = new Date().toISOString();

  if (!snippet_name || !language || !code_content) {
    return res.status(400).json({ message: "All fields required." });
  }
  if (!users[user_str_id]) users[user_str_id] = { snippets: {} };
  const userSnippets = users[user_str_id].snippets;

  let snippet = userSnippets[snippet_name];
  if (snippet) {
    snippet.language = language;
    snippet.code_content = code_content;
    snippet.updated_at = now;
  } else {
    snippet = {
      snippet_name,
      language,
      code_content,
      created_at: now,
      updated_at: now
    };
    userSnippets[snippet_name] = snippet;
  }
  res.json(snippet);
});

// Get snippet by name
app.get('/users/:user_str_id/snippets/:snippet_name', (req, res) => {
  const { user_str_id, snippet_name } = req.params;
  if (!users[user_str_id] || !users[user_str_id].snippets[snippet_name]) {
    return res.status(404).json({ message: "Snippet not found." });
  }
  res.json(users[user_str_id].snippets[snippet_name]);
});

// List all snippets for a user
app.get('/users/:user_str_id/snippets', (req, res) => {
  const { user_str_id } = req.params;
  if (!users[user_str_id]) return res.json([]);
  res.json(Object.values(users[user_str_id].snippets));
});

// Keyword Search
app.get('/users/:user_str_id/snippets/search', (req, res) => {
  const { user_str_id } = req.params;
  const { q } = req.query;
  if (!users[user_str_id] || !q) return res.json([]);
  const snippets = Object.values(users[user_str_id].snippets);
  const results = snippets.filter(s =>
    s.snippet_name.toLowerCase().includes(q.toLowerCase()) ||
    s.code_content.toLowerCase().includes(q.toLowerCase())
  );
  res.json(results);
});

// Delete a snippet by name
app.delete('/users/:user_str_id/snippets/:snippet_name', (req, res) => {
  const { user_str_id, snippet_name } = req.params;
  if (!users[user_str_id] || !users[user_str_id].snippets[snippet_name]) {
    return res.status(404).json({ message: "Snippet not found." });
  }
  delete users[user_str_id].snippets[snippet_name];
  res.json({ message: "Deleted successfully." });
});

// Server start
const port = 3000;
app.listen(port, () => {
  console.log(`Snippet API listening at http://localhost:${port}`);
});
