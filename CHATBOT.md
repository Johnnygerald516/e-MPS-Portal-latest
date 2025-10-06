# Migrant Assistant Chatbot

This document provides instructions for setting up and using the Migrant Assistant chatbot in the eMPS Portal.

## Overview

The Migrant Assistant chatbot is designed to answer questions about the eMPS (Electronic Migrant Portal System) and help users with their migration-related queries. It uses a combination of predefined Q&A pairs and OpenAI's API to provide accurate and helpful responses.

## Features

- Advanced pattern matching for common migration questions
- Multilingual support with English and Swahili patterns
- Fallback to OpenAI for questions not covered by predefined answers
- Conversation history support for context-aware responses
- Scoring system to find the most relevant answers
- Comprehensive Q&A database with migration-specific topics
- User feedback collection for response quality improvement
- Typing animation for a more natural conversation experience
- Help command to guide users on available topics

## Setup Instructions

### 1. Environment Configuration

Add the following to your `.env` file:

```
# OpenAI API Key for the chatbot
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Accessing the Chatbot

The chatbot is available as a floating button in the bottom-right corner of the portal. Users can click on this button to open the chat interface and start asking questions.

### 3. Managing Q&A Content

The predefined Q&A content is stored in a JSON file at `src/data/chatbot/qa-data.json`. To update the Q&A content, you can edit this file directly.

## Q&A Structure

Each Q&A pair consists of:

- **ID**: A unique identifier for the Q&A pair
- **Patterns**: An array of phrases or keywords that trigger this answer
- **Answer**: The response to provide when a matching question is asked

Example:

```json
{
  "id": "application-process",
  "patterns": [
    "how do I apply",
    "application process",
    "how to apply",
    "start application",
    "apply for permit",
    "jaza ombi",
    "namna ya kujaza"
  ],
  "answer": "To apply for a migrant permit through the eMPS Portal:\n\n1. Create an account or log in\n2. Click on 'Start New Application'\n3. Select the permit type\n4. Fill out the required information\n5. Upload supporting documents\n6. Submit your application"
}
```

### Pattern Matching Algorithm

The chatbot uses a sophisticated matching algorithm that:

1. **Direct Matching**: Checks if the user's query contains any pattern exactly
2. **Reverse Matching**: Checks if any pattern contains the user's query
3. **Word-level Matching**: Breaks down both the query and patterns into words and finds overlapping terms
4. **Scoring System**: Assigns a relevance score (0-1) to each potential match
5. **Threshold Filtering**: Only returns matches above a minimum relevance threshold (0.5)

This approach ensures that even partially matching or differently phrased questions can find the appropriate answer.

## Technical Implementation

The chatbot is implemented using the following components:

- `src/components/chatbot/chat-ui.tsx`: The chat interface component
- `src/components/chatbot/floating-chat.tsx`: The floating button component
- `src/lib/chat-service.ts`: Service for handling chat requests
- `src/lib/qa-service.ts`: Service for handling predefined Q&A
- `src/lib/openai-service.ts`: Service for connecting to OpenAI
- `src/app/api/chat/route.ts`: API route for handling chat requests
- `src/data/chatbot/qa-data.json`: JSON file containing predefined Q&A pairs

## Customization Options

### System Prompt

The system prompt defines the chatbot's personality and knowledge base. You can customize it by editing the `SYSTEM_PROMPT` constant in `src/lib/openai-service.ts`.

### Chatbot Appearance

You can customize the appearance of the chatbot by modifying the following files:

- `src/components/chatbot/chat-ui.tsx`: The main chat interface component
- `src/components/chatbot/floating-chat.tsx`: The floating button component

The chatbot uses the UI components from your design system, so it will automatically match your application's theme.

### Q&A Matching Logic

The pattern matching logic for finding relevant answers can be customized in the `qaService.findMatchingQuestion` function in `src/lib/qa-service.ts`. You can adjust the matching algorithm to be more or less strict based on your needs.

### OpenAI Model

By default, the chatbot uses the GPT-4o model. You can change this by modifying the `model` parameter in the `openai.chat.completions.create` call in `src/lib/openai-service.ts`.

## Security Considerations

- The OpenAI API key should be kept secret and not exposed to the client
- Input validation should be implemented to prevent injection attacks

## Performance Considerations

### OpenAI API Usage

The chatbot uses the OpenAI API when it cannot find a matching answer in the predefined Q&A data. This can incur costs based on your OpenAI API usage. To optimize costs:

1. Add more comprehensive Q&A pairs to cover common questions
2. Adjust the matching algorithm to be more lenient to increase the chance of finding a match
3. Consider using a less expensive model like GPT-3.5-turbo instead of GPT-4o

### Response Time

The response time of the chatbot depends on several factors:

1. The speed of matching against predefined Q&A (typically very fast)
2. The latency of the OpenAI API (can vary)
3. The complexity of the user's query

To improve response times, consider:

1. Optimizing the Q&A matching algorithm
2. Using a model with lower latency
3. Implementing caching for common queries

## Testing the Chatbot

A test script is provided to verify the chatbot's pattern matching capabilities:

```bash
# Run the test script
node scripts/test-chatbot.js
```

This script tests a variety of queries against the Q&A database and reports:
- Which patterns were matched
- The matching score for each query
- The overall match rate
- A preview of the answers

You can also use the test script programmatically:

```typescript
import { runChatbotTest } from '@/lib/test-chatbot';

// Run the test and see results in the console
runChatbotTest();
```

## Troubleshooting

If the chatbot is not working as expected:

1. Check that the OpenAI API key is correctly set in the `.env` file
2. Verify that the Q&A data file exists and is properly formatted
3. Check the browser console and server logs for any errors
4. Run the test script to verify pattern matching is working correctly
5. Ensure that the API routes are accessible and returning the expected responses

## Feedback Mechanism

The chatbot includes a feedback collection system that allows users to rate responses and provide comments on unhelpful answers:

### How It Works

1. **Rating Interface**: After each assistant message, users can rate the response as helpful or unhelpful
2. **Comment Collection**: For unhelpful responses, users can provide detailed feedback
3. **Data Storage**: Feedback is stored both locally and sent to an API endpoint
4. **Analytics**: Feedback data includes message ID, helpfulness rating, optional comment, and answer source (custom Q&A or OpenAI)

### API Endpoint

Feedback is sent to the `/api/chat/feedback` endpoint with the following structure:

```json
{
  "messageId": "unique-message-id",
  "isHelpful": true,
  "comment": "Optional user comment for unhelpful responses",
  "source": "custom_qa",
  "timestamp": "2025-10-06T20:32:59.123Z"
}
```

### Using Feedback Data

The collected feedback can be used to:

1. Identify patterns of unhelpful responses
2. Improve the Q&A database with better answers
3. Adjust the pattern matching algorithm
4. Train custom models based on user interactions

## Future Enhancements

Here are some potential enhancements that could be added to the chatbot in the future:

### 2. Multi-language Support

Extend the chatbot to support multiple languages to better serve migrants from different countries. This could involve translating the predefined Q&A pairs and using OpenAI's multilingual capabilities.

### 3. Context-Aware Responses

Enhance the chatbot to be aware of the user's current location in the application and provide more contextually relevant responses based on what the user is currently doing.

### 4. Integration with Application Status

Connect the chatbot to the application status system so it can provide personalized updates on the user's application status when asked.

### 5. Rich Media Responses

Extend the chatbot to support rich media responses such as images, links, and formatted text to provide more helpful and engaging responses.
