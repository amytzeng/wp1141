/**
 * Type declarations for swagger-jsdoc
 * This module does not have official TypeScript definitions,
 * so we provide a minimal type declaration here.
 */

declare module 'swagger-jsdoc' {
  export interface SwaggerDefinition {
    openapi?: string;
    swagger?: string;
    info?: {
      title?: string;
      version?: string;
      description?: string;
      contact?: {
        name?: string;
        email?: string;
        url?: string;
      };
      license?: {
        name?: string;
        url?: string;
      };
    };
    servers?: Array<{
      url?: string;
      description?: string;
    }>;
    components?: {
      securitySchemes?: Record<string, any>;
      schemas?: Record<string, any>;
    };
    [key: string]: any;
  }

  export interface SwaggerOptions {
    definition: SwaggerDefinition;
    apis: string[];
    [key: string]: any;
  }

  function swaggerJsdoc(options: SwaggerOptions): any;
  export default swaggerJsdoc;
}

