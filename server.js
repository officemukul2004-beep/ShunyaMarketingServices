import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const IS_VERCEL = !!process.env.VERCEL;
const ORIGINAL_DB_FILE = path.resolve(__dirname, 'db.json');
const DB_FILE = IS_VERCEL ? '/tmp/db.json' : ORIGINAL_DB_FILE;

// Ensure db.json exists in /tmp if on Vercel
if (IS_VERCEL && !fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(ORIGINAL_DB_FILE, 'utf8');
    fs.writeFileSync(DB_FILE, data, 'utf8');
  } catch (err) {
    console.error('Failed to initialize temporary database:', err);
  }
}

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Database Helpers
const readDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading database file:', error);
  }
  return { seo: [], blogs: [], submissions: [] };
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing to database file:', error);
    return false;
  }
};

// SEO ENDPOINTS
app.get('/api/seo', (req, res) => {
  const db = readDB();
  res.json(db.seo || []);
});

app.get('/api/seo/:page', (req, res) => {
  const db = readDB();
  const page = req.params.page.toLowerCase();
  const seoEntry = (db.seo || []).find(s => s.page.toLowerCase() === page);
  if (seoEntry) {
    res.json(seoEntry);
  } else {
    res.status(404).json({ error: 'SEO config not found for this page' });
  }
});

app.post('/api/seo/:page', (req, res) => {
  const db = readDB();
  const page = req.params.page.toLowerCase();
  const { title, description, keywords } = req.body;

  if (!db.seo) db.seo = [];
  
  let entryIndex = db.seo.findIndex(s => s.page.toLowerCase() === page);
  const updatedEntry = { page, title, description, keywords };

  if (entryIndex >= 0) {
    db.seo[entryIndex] = updatedEntry;
  } else {
    db.seo.push(updatedEntry);
  }

  writeDB(db);
  res.json({ success: true, data: updatedEntry });
});

// BLOG ENDPOINTS
app.get('/api/blogs', (req, res) => {
  const db = readDB();
  res.json(db.blogs || []);
});

app.get('/api/blogs/:id', (req, res) => {
  const db = readDB();
  const blog = (db.blogs || []).find(b => b.id === req.params.id);
  if (blog) {
    res.json(blog);
  } else {
    res.status(404).json({ error: 'Blog not found' });
  }
});

app.get('/api/blogs/slug/:slug', (req, res) => {
  const db = readDB();
  const blog = (db.blogs || []).find(b => b.slug === req.params.slug);
  if (blog) {
    res.json(blog);
  } else {
    res.status(404).json({ error: 'Blog not found' });
  }
});

app.post('/api/blogs', (req, res) => {
  const db = readDB();
  const { title, category, readTime, author, image, summary, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const id = Date.now().toString();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const newBlog = {
    id,
    title,
    slug,
    category: category || 'Strategy',
    readTime: readTime || '5 min read',
    author: author || 'Shunya Writer',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    image: image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
    summary: summary || title,
    content
  };

  if (!db.blogs) db.blogs = [];
  db.blogs.push(newBlog);
  writeDB(db);

  res.status(211).json({ success: true, data: newBlog });
});

app.put('/api/blogs/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { title, category, readTime, author, image, summary, content } = req.body;

  if (!db.blogs) db.blogs = [];
  const index = db.blogs.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Blog not found' });
  }

  const slug = title
    ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    : db.blogs[index].slug;

  db.blogs[index] = {
    ...db.blogs[index],
    title: title || db.blogs[index].title,
    slug,
    category: category || db.blogs[index].category,
    readTime: readTime || db.blogs[index].readTime,
    author: author || db.blogs[index].author,
    image: image || db.blogs[index].image,
    summary: summary || db.blogs[index].summary,
    content: content || db.blogs[index].content
  };

  writeDB(db);
  res.json({ success: true, data: db.blogs[index] });
});

app.delete('/api/blogs/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;

  if (!db.blogs) db.blogs = [];
  const filteredBlogs = db.blogs.filter(b => b.id !== id);

  if (db.blogs.length === filteredBlogs.length) {
    return res.status(404).json({ error: 'Blog not found' });
  }

  db.blogs = filteredBlogs;
  writeDB(db);
  res.json({ success: true, message: 'Blog deleted successfully' });
});

// FORM SUBMISSIONS
app.get('/api/submissions', (req, res) => {
  const db = readDB();
  res.json(db.submissions || []);
});

app.post('/api/submissions', (req, res) => {
  const db = readDB();
  const { name, phone, bizType, message } = req.body;

  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone number, and message are required' });
  }

  const newSubmission = {
    id: 'submission-' + Date.now(),
    name,
    phone,
    bizType: bizType || 'Other',
    message,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    resolved: false
  };

  if (!db.submissions) db.submissions = [];
  db.submissions.unshift(newSubmission);
  writeDB(db);

  res.status(211).json({ success: true, data: newSubmission });
});

app.post('/api/submissions/:id/resolve', (req, res) => {
  const db = readDB();
  const { id } = req.params;

  if (!db.submissions) db.submissions = [];
  const index = db.submissions.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  db.submissions[index].resolved = !db.submissions[index].resolved;
  writeDB(db);
  res.json({ success: true, data: db.submissions[index] });
});

app.delete('/api/submissions/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;

  if (!db.submissions) db.submissions = [];
  const filteredSubmissions = db.submissions.filter(s => s.id !== id);

  if (db.submissions.length === filteredSubmissions.length) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  db.submissions = filteredSubmissions;
  writeDB(db);
  res.json({ success: true, message: 'Submission deleted successfully' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Shunya Backend running at http://localhost:${PORT}`);
  });
}

export default app;
