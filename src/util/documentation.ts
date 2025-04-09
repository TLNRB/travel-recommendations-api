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
            url: 'https://travel-recommendations-api.onrender.com/api/',
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
            },
            Place: {
               type: 'object',
               properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  images: {
                     type: 'array',
                     items: { type: 'string' }
                  },
                  location: {
                     type: 'object',
                     properties: {
                        continent: { type: 'string' },
                        country: { type: 'string' },
                        city: { type: 'string' },
                        street: { type: 'string' },
                        streetNumber: { type: 'string' }
                     }
                  },
                  upvotes: { type: 'number' },
                  tags: {
                     type: 'array',
                     items: { type: 'string' }
                  },
                  approved: { type: 'boolean' },
                  _createdBy: { type: 'string' }
               }
            },
            Recommendation: {
               type: 'object',
               properties: {
                  _createdBy: { type: 'string' },
                  place: { type: 'string' },
                  title: { type: 'string' },
                  content: { type: 'string' },
                  dateOfVisit: { type: 'string' },
                  dateOfWriting: { type: 'string' },
                  rating: { type: 'number' },
                  upvotes: { type: 'number' }
               }
            },
            Collection: {
               type: 'object',
               properties: {
                  _createdBy: { type: 'string' },
                  name: { type: 'string' },
                  places: {
                     type: 'array',
                     items: { type: 'string' }
                  },
                  visible: { type: 'boolean' }
               }
            },
            CityImages: {
               type: 'object',
               properties: {
                  name: { type: 'string' },
                  country: { type: 'string' },
                  images: {
                     type: 'array',
                     items: {
                        type: 'object',
                        properties: {
                           url: { type: 'string' },
                           alt: { type: 'string' }
                        }
                     }
                  }
               }
            },
            CountryImages: {
               type: 'object',
               properties: {
                  name: { type: 'string' },
                  images: {
                     type: 'array',
                     items: {
                        type: 'object',
                        properties: {
                           url: { type: 'string' },
                           alt: { type: 'string' }
                        }
                     }
                  }
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