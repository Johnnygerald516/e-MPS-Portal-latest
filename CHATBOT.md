# Migrant Assistant Chatbot

This document provides instructions for setting up and using the Migrant Assistant chatbot in the eMPS Portal.

## Overview

The Migrant Assistant chatbot is designed to answer questions about the eMPS (Electronic Migrant Portal System) and help users with their migration-related queries. It uses a combination of predefined Q&A pairs and OpenAI's API to provide accurate and helpful responses.

## Features

- Predefined Q&A for common questions about the migration process
- Fallback to OpenAI for questions not covered by predefined answers
- Admin interface for managing Q&A pairs
- Conversation history support for context-aware responses

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
    "how to apply"
  ],
  "answer": "To apply for a migrant permit through the eMPS Portal:\n\n1. Create an account or log in\n2. Click on 'Start New Application'\n3. Select the permit type\n4. Fill out the required information\n5. Upload supporting documents\n6. Submit your application"
}
```

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

## Troubleshooting

If the chatbot is not working as expected:

1. Check that the OpenAI API key is correctly set in the `.env` file
2. Verify that the Q&A data file exists and is properly formatted
3. Check the browser console and server logs for any errors
4. Ensure that the API routes are accessible and returning the expected responses

## Future Enhancements

Here are some potential enhancements that could be added to the chatbot in the future:

### 1. User Feedback Collection

Implement a feedback mechanism that allows users to rate the helpfulness of the chatbot's responses. This data can be used to improve the Q&A database and identify areas where the chatbot needs improvement.

### 2. Multi-language Support

Extend the chatbot to support multiple languages to better serve migrants from different countries. This could involve translating the predefined Q&A pairs and using OpenAI's multilingual capabilities.

### 3. Context-Aware Responses

Enhance the chatbot to be aware of the user's current location in the application and provide more contextually relevant responses based on what the user is currently doing.

### 4. Integration with Application Status

Connect the chatbot to the application status system so it can provide personalized updates on the user's application status when asked.

### 5. Rich Media Responses

Extend the chatbot to support rich media responses such as images, links, and formatted text to provide more helpful and engaging responses.
