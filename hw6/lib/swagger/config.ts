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
            status: {
              type: 'string',
              enum: ['active', 'paused', 'completed', 'timeout'],
              description: 'Session status',
            },
            flowStage: {
              type: 'string',
              enum: ['greeting', 'question', 'discussion', 'closing', 'unknown'],
              description: 'Current flow stage of the conversation',
            },
            messageCount: {
              type: 'number',
              description: 'Number of messages in conversation',
            },
            lastActivityAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last activity timestamp',
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
                stateMachine: {
                  type: 'object',
                  properties: {
                    currentState: {
                      type: 'string',
                    },
                    transitions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          from: {
                            type: 'string',
                          },
                          to: {
                            type: 'string',
                          },
                          timestamp: {
                            type: 'string',
                            format: 'date-time',
                          },
                        },
                      },
                    },
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
            users: {
              type: 'object',
              properties: {
                total: {
                  type: 'number',
                  description: 'Total number of unique users',
                },
                active: {
                  type: 'number',
                  description: 'Number of active users (last 7 days)',
                },
                new: {
                  type: 'number',
                  description: 'Number of new users (first message in last 7 days)',
                },
                engagement: {
                  type: 'object',
                  properties: {
                    avgMessagesPerUser: {
                      type: 'number',
                      description: 'Average messages per user',
                    },
                    maxMessagesPerUser: {
                      type: 'number',
                      description: 'Maximum messages by a single user',
                    },
                    minMessagesPerUser: {
                      type: 'number',
                      description: 'Minimum messages by a single user',
                    },
                  },
                },
                topUsers: {
                  type: 'array',
                  description: 'Top 10 most active users',
                  items: {
                    type: 'object',
                    properties: {
                      lineUserId: {
                        type: 'string',
                      },
                      messageCount: {
                        type: 'number',
                      },
                      lastActivity: {
                        type: 'string',
                        format: 'date-time',
                      },
                    },
                  },
                },
                growthTrend: {
                  type: 'array',
                  description: 'User growth trend (last 30 days)',
                  items: {
                    type: 'object',
                    properties: {
                      date: {
                        type: 'string',
                        format: 'date',
                      },
                      newUsers: {
                        type: 'number',
                      },
                    },
                  },
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
              enum: ['healthy', 'degraded', 'unhealthy'],
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
            performance: {
              type: 'object',
              properties: {
                avgResponseTime: {
                  type: 'number',
                  description: 'Average response time in milliseconds',
                },
                p95ResponseTime: {
                  type: 'number',
                  description: '95th percentile response time in milliseconds',
                },
                p99ResponseTime: {
                  type: 'number',
                  description: '99th percentile response time in milliseconds',
                },
                failureRate: {
                  type: 'number',
                  description: 'Failure rate percentage',
                },
                requestsPerMinute: {
                  type: 'number',
                  description: 'Average requests per minute (last hour)',
                },
                totalRequests: {
                  type: 'number',
                  description: 'Total requests in last 24 hours',
                },
                errorCount: {
                  type: 'number',
                  description: 'Number of errors in last 24 hours',
                },
              },
            },
            errors: {
              type: 'object',
              description: 'Error messages for services with issues',
              additionalProperties: {
                type: 'string',
              },
            },
          },
        },
        CategoryStatsResponse: {
          type: 'object',
          properties: {
            overview: {
              type: 'object',
              properties: {
                total: {
                  type: 'number',
                  description: 'Total number of user messages',
                },
                categorized: {
                  type: 'number',
                  description: 'Number of categorized messages',
                },
                uncategorized: {
                  type: 'number',
                  description: 'Number of uncategorized messages',
                },
                categorizationRate: {
                  type: 'number',
                  description: 'Percentage of messages that are categorized',
                },
              },
            },
            byMainCategory: {
              type: 'object',
              description: 'Statistics grouped by main category',
              additionalProperties: {
                type: 'object',
                properties: {
                  count: {
                    type: 'number',
                  },
                  percentage: {
                    type: 'number',
                  },
                },
              },
            },
            bySubCategory: {
              type: 'object',
              description: 'Statistics grouped by subcategory',
              additionalProperties: {
                type: 'object',
                properties: {
                  count: {
                    type: 'number',
                  },
                  percentage: {
                    type: 'number',
                  },
                  mainCategory: {
                    type: 'string',
                  },
                },
              },
            },
            trends: {
              type: 'array',
              description: 'Daily trends for each category (last 7 days)',
              items: {
                type: 'object',
                properties: {
                  date: {
                    type: 'string',
                    format: 'date',
                  },
                  categories: {
                    type: 'object',
                    description: 'Category counts for this date',
                    additionalProperties: {
                      type: 'number',
                    },
                  },
                },
              },
            },
            categoryDefinitions: {
              type: 'array',
              description: 'Category definitions with display names',
              items: {
                type: 'object',
                properties: {
                  mainCategory: {
                    type: 'string',
                  },
                  subCategory: {
                    type: 'string',
                  },
                  displayName: {
                    type: 'object',
                    properties: {
                      zh: {
                        type: 'string',
                      },
                      en: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        BotConfig: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            systemPrompt: {
              type: 'string',
              description: 'System prompt for the LLM',
            },
            personality: {
              type: 'string',
              description: 'Personality description',
            },
            responseRules: {
              type: 'object',
              properties: {
                enableFallback: {
                  type: 'boolean',
                },
                maxResponseLength: {
                  type: 'number',
                },
                temperature: {
                  type: 'number',
                },
                customInstructions: {
                  type: 'string',
                },
              },
            },
            isActive: {
              type: 'boolean',
            },
            version: {
              type: 'number',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        BotConfigResponse: {
          type: 'object',
          properties: {
            config: {
              $ref: '#/components/schemas/BotConfig',
            },
          },
        },
        WebhookHealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'degraded', 'unhealthy'],
            },
            lastRequestTime: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            last24Hours: {
              type: 'object',
              properties: {
                totalRequests: {
                  type: 'number',
                },
                successfulRequests: {
                  type: 'number',
                },
                failedRequests: {
                  type: 'number',
                },
                errorRate: {
                  type: 'number',
                },
              },
            },
            lastHour: {
              type: 'object',
              properties: {
                totalRequests: {
                  type: 'number',
                },
                successfulRequests: {
                  type: 'number',
                },
                failedRequests: {
                  type: 'number',
                },
              },
            },
            signatureValidation: {
              type: 'object',
              properties: {
                enabled: {
                  type: 'boolean',
                },
                status: {
                  type: 'string',
                },
              },
            },
          },
        },
        BatchDeleteResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            deleted: {
              type: 'number',
              description: 'Number of conversations deleted',
            },
            messagesDeleted: {
              type: 'number',
              description: 'Number of messages deleted',
            },
            requested: {
              type: 'number',
              description: 'Number of IDs requested',
            },
            valid: {
              type: 'number',
              description: 'Number of valid IDs',
            },
          },
        },
        SessionsResponse: {
          type: 'object',
          properties: {
            sessions: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Conversation',
              },
            },
            total: {
              type: 'number',
            },
            status: {
              type: 'string',
              enum: ['active', 'paused', 'completed', 'timeout'],
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

