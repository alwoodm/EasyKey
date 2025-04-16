# EasyKey Security Guide

## API Key Security

The current implementation uses environment variables for storing API keys, which is a good start but not sufficient for a production application. Here are the recommended steps to properly secure your API keys:

### 1. Server-side Proxy (Recommended)

Create a server-side proxy that makes API calls on behalf of your client application:

- Set up a simple server using Express, Flask, or a serverless function
- Store your API keys securely on the server (environment variables, secrets manager)
- Create endpoints that your client application can call without requiring API keys
- Make the actual API calls from your server

Example server implementation (Node.js/Express):

```javascript
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Secure API endpoint
app.post('/api/proxy/generate-text', async (req, res) => {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [{ parts: [{ text: req.body.data.prompt }] }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: process.env.GEMINI_API_KEY
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error calling API:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
```

### 2. Environment Variables

For development:
- Create a `.env` file in your project root (and add it to `.gitignore`)
- Add your API keys: `REACT_APP_GEMINI_API_KEY=your_api_key_here`
- Use `process.env.REACT_APP_GEMINI_API_KEY` in your code

For production:
- Set environment variables on your hosting platform (Vercel, Netlify, etc.)
- Never include API keys in your code repository

### 3. Rate Limiting and Request Validation

- Implement rate limiting to prevent abuse
- Validate all incoming requests before processing
- Consider using JWT tokens for authenticated API access

### 4. HTTPS

- Always use HTTPS for all API communication
- Configure proper CORS settings on your server

## Additional Security Measures

1. Regular security audits
2. Keep all dependencies updated
3. Implement CSP (Content Security Policy)
4. Use Subresource Integrity for external scripts
