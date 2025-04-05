import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { OpenAPIObject, PathItemObject, OperationObject } from 'openapi3-ts/oas31';
import listEndpoints from 'express-list-endpoints';
import config from './config';

export const setupSwagger = async (app: Express): Promise<void> => {
  try {
    console.log('Generating OpenAPI documentation...');
    
    // Extract all Express routes
    const endpoints = listEndpoints(app);
    
    // Create OpenAPI specification object
    const openApiSpec: OpenAPIObject = {
      openapi: '3.0.0',
      info: {
        title: 'POS API Documentation',
        description: 'API documentation for the POS API',
        version: '1.0.0',
      },
      servers: [{
        // Ensure proper URL formatting with protocol
        url: `${config.useHttps ? 'https' : 'http'}://localhost:${config.port}`
      }],
      paths: {} as Record<string, PathItemObject>,
      components: {
        schemas: {},
        responses: {
          Success: {
            description: 'Successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object'
                }
              }
            }
          },
          Error: {
            description: 'Error response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string'
                    },
                    status: {
                      type: 'integer'
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    // Process all endpoints to build paths
    endpoints.forEach(endpoint => {
      // Convert Express path format to OpenAPI path format
      // e.g. /api/products/:id to /api/products/{id}
      const path = endpoint.path.replace(/:([^\/]+)/g, '{$1}');
      
      if (!openApiSpec.paths[path]) {
        openApiSpec.paths[path] = {};
      }
      
      // Add each HTTP method
      endpoint.methods.forEach(method => {
        const lowerCaseMethod = method.toLowerCase();
        if (lowerCaseMethod === 'head') return;
        
        const operation: OperationObject = {
          summary: `${method} ${endpoint.path}`,
          responses: {
            '200': {
              $ref: '#/components/responses/Success'
            },
            '400': {
              $ref: '#/components/responses/Error'
            },
            '500': {
              $ref: '#/components/responses/Error'
            }
          }
        };
        
        // Add parameters for path variables
        const pathParams = endpoint.path.match(/:([^\/]+)/g);
        if (pathParams) {
          operation.parameters = pathParams.map(param => {
            const paramName = param.substring(1);
            return {
              name: paramName,
              in: 'path',
              required: true,
              schema: {
                type: 'string'
              }
            };
          });
        }
        
        // Add the operation to the path
        (openApiSpec.paths[path] as PathItemObject)[lowerCaseMethod] = operation;
      });
    });
    
    // Configure SwaggerUI options with proper CORS settings
    const swaggerUiOptions = {
      explorer: true,
      swaggerOptions: {
        url: `/swagger.json`,  // Relative URL to avoid CORS issues
        docExpansion: 'list',
        persistAuthorization: true
      }
    };
    
    // Setup Swagger UI with options
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, swaggerUiOptions));
    
    // Serve OpenAPI JSON with proper headers
    app.get('/swagger.json', (req, res) => {
      // Set CORS headers to allow browser access
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.json(openApiSpec);
    });
    
    console.log(`📚 Swagger documentation available at /api-docs`);
  } catch (error) {
    console.error('Failed to setup Swagger:', error);
    throw error;
  }
};
