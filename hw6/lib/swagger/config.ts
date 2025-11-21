import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Line AI Chatbot API',
      version: '1.0.0',
      description:
        'API documentation for the Line AI Chatbot system. This API handles Line webhook events, manages conversations, and provides admin endpoints for monitoring and statistics.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        // Add security schemes if needed in the future
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Conversation ID',
            },
            lineUserId: {
              type: 'string',
              description: 'Line user ID',
            },
            sessionId: {
              type: 'string',
              description: 'Session ID',
            },
            messageCount: {
              type: 'number',
              description: 'Number of messages in conversation',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
            metadata: {
              type: 'object',
              properties: {
                lastTopic: {
                  type: 'string',
                },
                context: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        Message: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Message ID',
            },
            conversationId: {
              type: 'string',
              description: 'Conversation ID',
            },
            lineUserId: {
              type: 'string',
              description: 'Line user ID',
            },
            type: {
              type: 'string',
              enum: ['user', 'bot'],
              description: 'Message type',
            },
            content: {
              type: 'string',
              description: 'Message content',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            metadata: {
              type: 'object',
              properties: {
                messageId: {
                  type: 'string',
                },
                replyToken: {
                  type: 'string',
                },
                llmProvider: {
                  type: 'string',
                },
                llmModel: {
                  type: 'string',
                },
                tokensUsed: {
                  type: 'number',
                },
                error: {
                  type: 'string',
                },
                processingTime: {
                  type: 'number',
                },
              },
            },
          },
        },
        ConversationListResponse: {
          type: 'object',
          properties: {
            conversations: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Conversation',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'number',
                },
                limit: {
                  type: 'number',
                },
                total: {
                  type: 'number',
                },
                totalPages: {
                  type: 'number',
                },
              },
            },
          },
        },
        ConversationDetailResponse: {
          type: 'object',
          properties: {
            conversation: {
              $ref: '#/components/schemas/Conversation',
            },
            messages: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Message',
              },
            },
            messageCount: {
              type: 'number',
            },
          },
        },
        StatsResponse: {
          type: 'object',
          properties: {
            overview: {
              type: 'object',
              properties: {
                totalMessages: {
                  type: 'number',
                },
                totalUsers: {
                  type: 'number',
                },
                totalConversations: {
                  type: 'number',
                },
                todayMessages: {
                  type: 'number',
                },
                successRate: {
                  type: 'number',
                },
              },
            },
            llmUsage: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: {
                    type: 'string',
                  },
                  count: {
                    type: 'number',
                  },
                  totalTokens: {
                    type: 'number',
                  },
                  errors: {
                    type: 'number',
                  },
                },
              },
            },
            dailyTrend: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: {
                    type: 'string',
                  },
                  count: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
            services: {
              type: 'object',
              properties: {
                database: {
                  type: 'string',
                },
                line: {
                  type: 'string',
                },
                llm: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    './app/api/**/*.ts', // Path to the API files
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

