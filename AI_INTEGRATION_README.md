# AI Integration Setup

This project now includes real AI integration using OpenAI's API for intelligent responses in the QA system.

## Setup Instructions

### 1. Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Generate a new API key
4. Copy the API key

### 2. Configure Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (if not already configured)
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Install Dependencies
Run the following command to install the OpenAI package:

```bash
npm install
```

### 4. Restart Development Server
Restart your development server to load the new environment variables:

```bash
npm run dev
```

## Features

### Real AI Responses
- The QA system now uses OpenAI's GPT-3.5-turbo model
- Responses are contextually aware of conversation history
- Educational-focused responses with practical examples
- Fallback to mock responses if API key is not configured

### Conversation Context
- AI responses consider the full conversation history
- Maintains context across multiple messages
- Provides more coherent and helpful responses

### Error Handling
- Graceful fallback if API is unavailable
- User-friendly error messages
- Automatic retry mechanisms

## Usage

1. Navigate to the QA page in your dashboard
2. Start a new conversation or continue an existing one
3. Ask questions and receive intelligent AI responses
4. The AI will provide educational, helpful responses

## Cost Considerations

- OpenAI charges per token used
- GPT-3.5-turbo is cost-effective for most use cases
- Monitor usage in your OpenAI dashboard
- Consider setting usage limits for production

## Security Notes

- API keys are stored in environment variables
- Never commit API keys to version control
- Use different keys for development and production
- Consider using a backend proxy for production to protect API keys

## Troubleshooting

### No AI Responses
- Check that your API key is correctly set in `.env`
- Verify the API key is valid in OpenAI dashboard
- Check browser console for error messages

### Slow Responses
- This is normal for AI generation
- Responses typically take 2-5 seconds
- Consider using a loading indicator

### API Errors
- Check your OpenAI account balance
- Verify API key permissions
- Check rate limits in OpenAI dashboard 