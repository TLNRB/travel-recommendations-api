import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
import { Application } from 'express';

export function setupDocs(app: Application): void {
   // Swagger definition
   const swaggerDefinition = {
      openapi: '3.0.0',
      info: {
         title: 'Travel Recommendation REST API',
         version: '1.0.0',
         description: 'API documentation for a travel recommendation database',
      },
      servers: [
         {
            url: 'http://localhost:4000/api/',
            description: 'Local development server',
         },
         {
            url: 'url',
            description: 'Production server',
         }
      ],
      components: {
         securitySchemes: {
            ApiKeyAuth: {
               type: 'apiKey',
               in: 'header',
               name: 'auth-token'
            }
         },
         schemas: {
            Permission: {
               type: 'object',
               properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
               }
            },
            RoleUnpopulated: {
               type: 'object',
               properties: {
                  name: { type: 'string' },
                  permissions: {
                     type: 'array',
                     items: { type: 'string' }
                  }
               }
            },
            RolePopulated: {
               type: 'object',
               properties: {
                  name: { type: 'string' },
                  permissions: {
                     type: 'array',
                     items: { $ref: '#/components/schemas/Permission' }
                  }
               }
            },
            CreateUser: {
               type: 'object',
               properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' }
               }
            },
            ExistingUser: {
               type: 'object',
               properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  passwordHash: { type: 'string' },
                  profilePicture: { type: 'string' },
                  bio: { type: 'string' },
                  country: { type: 'string' },
                  city: { type: 'string' },
                  socials: {
                     type: 'array',
                     items: {
                        type: 'object',
                        properties: {
                           name: { type: 'string' },
                           link: { type: 'string' },
                           icon: { type: 'string' }
                        }
                     }
                  },
                  role: { $ref: '#/components/schemas/Role' },
                  registerDate: { type: 'string' }
               }
            }
         }
      }
   };

   // Swagger options
   const options = {
      swaggerDefinition,
      apis: ['**/*.ts'] // Path to the files containing OpenAPI definitions
   }

   // Swagger specidfication
   const swaggerSpec = swaggerJSDoc(options);

   // Create docs route
   app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}