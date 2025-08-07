import { FastifyInstance } from 'fastify';

export interface OpenAPIConfig {
  title: string;
  version: string;
  description?: string;
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description?: string;
  tags?: string[];
  parameters?: Array<{
    name: string;
    in: 'path' | 'query' | 'header';
    required?: boolean;
    description?: string;
    schema: any;
  }>;
  requestBody?: {
    description?: string;
    required?: boolean;
    content: {
      'application/json': {
        schema: any;
      };
    };
  };
  responses: {
    [statusCode: string]: {
      description: string;
      content?: {
        'application/json': {
          schema: any;
        };
      };
    };
  };
  security?: Array<{
    [securityScheme: string]: string[];
  }>;
}

export class OpenAPIGenerator {
  private config: OpenAPIConfig;
  private endpoints: APIEndpoint[] = [];
  private schemas: Record<string, any> = {};

  constructor(config: OpenAPIConfig) {
    this.config = config;
    this.setupCommonSchemas();
  }

  // Add an API endpoint
  addEndpoint(endpoint: APIEndpoint): void {
    this.endpoints.push(endpoint);
  }

  // Add a schema definition
  addSchema(name: string, schema: any): void {
    this.schemas[name] = schema;
  }

  // Generate OpenAPI specification
  generateSpec(): any {
    const spec = {
      openapi: '3.0.3',
      info: {
        title: this.config.title,
        version: this.config.version,
        description: this.config.description
      },
      servers: this.config.servers || [],
      paths: this.generatePaths(),
      components: {
        schemas: this.schemas,
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    };

    if (this.config.contact) {
      spec.info.contact = this.config.contact;
    }

    if (this.config.license) {
      spec.info.license = this.config.license;
    }

    return spec;
  }

  // Generate paths from endpoints
  private generatePaths(): any {
    const paths: any = {};

    this.endpoints.forEach(endpoint => {
      if (!paths[endpoint.path]) {
        paths[endpoint.path] = {};
      }

      paths[endpoint.path][endpoint.method.toLowerCase()] = {
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags || [],
        parameters: endpoint.parameters || [],
        responses: endpoint.responses
      };

      if (endpoint.requestBody) {
        paths[endpoint.path][endpoint.method.toLowerCase()].requestBody = endpoint.requestBody;
      }

      if (endpoint.security) {
        paths[endpoint.path][endpoint.method.toLowerCase()].security = endpoint.security;
      }
    });

    return paths;
  }

  // Setup common schemas
  private setupCommonSchemas(): void {
    this.addSchema('Error', {
      type: 'object',
      required: ['error'],
      properties: {
        error: {
          type: 'string',
          description: 'Error message'
        },
        details: {
          type: 'object',
          description: 'Additional error details'
        }
      }
    });

    this.addSchema('SuccessResponse', {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          description: 'Response data'
        },
        message: {
          type: 'string',
          description: 'Success message'
        }
      }
    });

    this.addSchema('PaginationQuery', {
      type: 'object',
      properties: {
        page: {
          type: 'integer',
          minimum: 1,
          default: 1,
          description: 'Page number'
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 20,
          description: 'Number of items per page'
        }
      }
    });

    this.addSchema('PaginationResponse', {
      type: 'object',
      required: ['page', 'limit', 'hasMore'],
      properties: {
        page: {
          type: 'integer',
          description: 'Current page number'
        },
        limit: {
          type: 'integer',
          description: 'Items per page'
        },
        hasMore: {
          type: 'boolean',
          description: 'Whether there are more items available'
        }
      }
    });

    this.addSchema('HealthResponse', {
      type: 'object',
      required: ['status', 'service', 'timestamp'],
      properties: {
        status: {
          type: 'string',
          enum: ['healthy', 'unhealthy', 'degraded'],
          description: 'Service health status'
        },
        service: {
          type: 'string',
          description: 'Service name'
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Health check timestamp'
        },
        dependencies: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                enum: ['healthy', 'unhealthy']
              },
              responseTime: {
                type: 'number',
                description: 'Response time in milliseconds'
              }
            }
          },
          description: 'Status of service dependencies'
        }
      }
    });
  }
}

// Pre-configured generators for common services
export class ProfileServiceAPIGenerator extends OpenAPIGenerator {
  constructor() {
    super({
      title: 'Profile Service API',
      version: '1.0.0',
      description: 'API for managing user profiles, goals, and social relationships',
      servers: [
        {
          url: 'http://localhost:4102',
          description: 'Development server'
        }
      ],
      contact: {
        name: 'API Support',
        email: 'support@ziririt.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    });

    this.setupProfileSchemas();
    this.setupProfileEndpoints();
  }

  private setupProfileSchemas(): void {
    this.addSchema('Profile', {
      type: 'object',
      required: ['user_id', 'bio', 'is_private'],
      properties: {
        user_id: {
          type: 'string',
          format: 'uuid',
          description: 'User ID'
        },
        bio: {
          type: 'string',
          maxLength: 500,
          description: 'User biography'
        },
        is_private: {
          type: 'boolean',
          description: 'Whether the profile is private'
        },
        followers_count: {
          type: 'integer',
          minimum: 0,
          description: 'Number of followers'
        },
        following_count: {
          type: 'integer',
          minimum: 0,
          description: 'Number of users being followed'
        },
        goals_count: {
          type: 'integer',
          minimum: 0,
          description: 'Number of goals'
        },
        created_at: {
          type: 'string',
          format: 'date-time',
          description: 'Profile creation timestamp'
        },
        updated_at: {
          type: 'string',
          format: 'date-time',
          description: 'Profile last update timestamp'
        }
      }
    });

    this.addSchema('UpdateProfileRequest', {
      type: 'object',
      properties: {
        bio: {
          type: 'string',
          maxLength: 500,
          description: 'User biography'
        },
        is_private: {
          type: 'boolean',
          description: 'Whether the profile is private'
        }
      }
    });

    this.addSchema('Goal', {
      type: 'object',
      required: ['id', 'user_id', 'title'],
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'Goal ID'
        },
        user_id: {
          type: 'string',
          format: 'uuid',
          description: 'User ID'
        },
        title: {
          type: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Goal title'
        },
        description: {
          type: 'string',
          maxLength: 1000,
          description: 'Goal description'
        },
        is_private: {
          type: 'boolean',
          description: 'Whether the goal is private'
        },
        created_at: {
          type: 'string',
          format: 'date-time',
          description: 'Goal creation timestamp'
        },
        updated_at: {
          type: 'string',
          format: 'date-time',
          description: 'Goal last update timestamp'
        }
      }
    });
  }

  private setupProfileEndpoints(): void {
    // Health endpoint
    this.addEndpoint({
      method: 'GET',
      path: '/health',
      summary: 'Service health check',
      description: 'Check the health status of the profile service',
      tags: ['Health'],
      responses: {
        '200': {
          description: 'Service is healthy',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthResponse' }
            }
          }
        },
        '503': {
          description: 'Service is unhealthy',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/HealthResponse' }
            }
          }
        }
      }
    });

    // Get profile
    this.addEndpoint({
      method: 'GET',
      path: '/profiles/{userId}',
      summary: 'Get user profile',
      description: 'Retrieve a user profile by ID',
      tags: ['Profiles'],
      parameters: [
        {
          name: 'userId',
          in: 'path',
          required: true,
          description: 'User ID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      responses: {
        '200': {
          description: 'Profile retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  profile: { $ref: '#/components/schemas/Profile' }
                }
              }
            }
          }
        },
        '404': {
          description: 'Profile not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    });

    // Update profile
    this.addEndpoint({
      method: 'PUT',
      path: '/profiles/{userId}',
      summary: 'Update user profile',
      description: 'Update a user profile',
      tags: ['Profiles'],
      parameters: [
        {
          name: 'userId',
          in: 'path',
          required: true,
          description: 'User ID',
          schema: {
            type: 'string',
            format: 'uuid'
          }
        }
      ],
      requestBody: {
        description: 'Profile update data',
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateProfileRequest' }
          }
        }
      },
      responses: {
        '200': {
          description: 'Profile updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  profile: { $ref: '#/components/schemas/Profile' }
                }
              }
            }
          }
        },
        '400': {
          description: 'Invalid request data',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '403': {
          description: 'Access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        '404': {
          description: 'Profile not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      },
      security: [{ BearerAuth: [] }]
    });
  }
}

// Helper function to register OpenAPI documentation with Fastify
export function registerOpenAPIDocumentation(
  server: FastifyInstance,
  generator: OpenAPIGenerator,
  path: string = '/docs'
): void {
  const spec = generator.generateSpec();

  // Serve OpenAPI JSON
  server.get(`${path}/openapi.json`, async (request, reply) => {
    reply.type('application/json').send(spec);
  });

  // Serve Swagger UI (simple HTML)
  server.get(path, async (request, reply) => {
    const html = generateSwaggerUI(`${path}/openapi.json`);
    reply.type('text/html').send(html);
  });
}

// Generate simple Swagger UI HTML
function generateSwaggerUI(specUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@3.52.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '${specUrl}',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
  `;
}