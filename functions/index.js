const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const { defineSecret } = require('firebase-functions/params');
const OpenAI = require('openai');

// Define the OpenAI API key as a Firebase secret
const openaiApiKey = defineSecret('OPENAI_API_KEY');

exports.generateChatResponse = onCall(
  {
    secrets: [openaiApiKey],
    cors: true,
  },
  async (request) => {
    logger.info('Secrets received:', request.secrets);

    try {
      if (request.data.test) {
        return {
          success: true,
          response: 'Service is available',
        };
      }

      const { messages, userId } = request.data;

      if (!messages || !Array.isArray(messages)) {
        throw new HttpsError('invalid-argument', 'Messages array is required');
      }

      if (!userId) {
        throw new HttpsError('invalid-argument', 'User ID is required');
      }

      const apiKey = request.secrets?.OPENAI_API_KEY;

      if (!apiKey) {
        logger.error('OpenAI API key not configured - secret value is empty');
        throw new HttpsError(
          'failed-precondition',
          'AI service not configured. Please set OPENAI_API_KEY secret using: firebase functions:secrets:set OPENAI_API_KEY'
        );
      }

      const openai = new OpenAI({
        apiKey,
      });

      const openaiMessages = [
        {
          role: 'system',
          content: `You are a helpful AI assistant specialized in business development, sales, and client management. You help users with:

- Writing professional proposals and contracts
- Crafting effective cold emails and follow-up sequences
- Analyzing leads and prospects
- Creating pricing strategies
- Generating business content
- Providing sales and marketing advice

Be professional, concise, and actionable in your responses. Format your output clearly with proper structure when appropriate.`,
        },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ];

      logger.info('Calling OpenAI', {
        userId,
        messageCount: messages.length,
        model: 'gpt-4',
      });

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: openaiMessages,
        max_tokens: 2000,
        temperature: 0.7,
      });

      const aiResponse = completion.choices?.[0]?.message?.content;

      if (!aiResponse) {
        logger.error('Invalid OpenAI response:', completion);
        throw new HttpsError('internal', 'Invalid response from AI service');
      }

      logger.info('AI response generated', {
        userId,
        responseLength: aiResponse.length,
        tokensUsed: completion.usage?.total_tokens || 0,
      });

      return {
        success: true,
        response: aiResponse,
        usage: completion.usage,
      };
    } catch (error) {
      logger.error('Error in generateChatResponse', {
        error: error.message,
        stack: error.stack,
        userId: request.data?.userId,
        messageCount: request.data?.messages?.length,
      });

      if (error instanceof HttpsError) {
        throw error;
      }

      if (error?.response?.status === 401) {
        throw new HttpsError('failed-precondition', 'Invalid OpenAI API key.');
      } else if (error?.response?.status === 429) {
        throw new HttpsError('resource-exhausted', 'OpenAI API rate limit exceeded.');
      } else if (error?.response?.status === 400) {
        throw new HttpsError('invalid-argument', error?.response?.data?.error?.message || 'Bad request');
      }

      throw new HttpsError('internal', `Unexpected error: ${error.message}`);
    }
  }
);
