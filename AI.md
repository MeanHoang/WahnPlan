# WahnPlan - AI Project Analysis

## Project Overview

**WahnPlan** is a comprehensive project management platform built as a modern full-stack application. It's designed as a task management and collaboration tool with workspace-based organization, similar to tools like Trello or Asana but with enhanced features specifically tailored for software development teams. The platform emphasizes agile development practices, comprehensive task tracking, and team collaboration with rich content editing capabilities.

### Core Business Logic

- **Multi-tenant Architecture**: Workspace-based organization where each workspace can have multiple boards
- **Role-based Access Control**: Four distinct roles (owner, manager, member, guest) with granular permissions
- **Agile Development Focus**: Built-in support for sprints, story points, test cases, and development workflow tracking
- **Rich Collaboration**: Advanced commenting system with mentions, reactions, and file attachments
- **Comprehensive Audit Trail**: Complete task history tracking for compliance and debugging
- **Real-time Updates**: Optimistic UI updates with proper error handling and rollback mechanisms

## Architecture & Technology Stack

### Monorepo Structure

- **Package Manager**: pnpm (v9.0.0)
- **Build System**: Turborepo for efficient monorepo management
- **Node Version**: >=18
- **TypeScript**: 5.8.3

### Applications

#### 1. Web Application (`apps/web/`)

- **Framework**: Next.js 15.4.2 with App Router
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS with custom components
- **Component Library**: Radix UI primitives with custom styling
- **Rich Text Editor**: TipTap for task descriptions and comments
- **Drag & Drop**: @dnd-kit for task management
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Context (AuthContext)
- **File Upload**: Cloudinary integration
- **Port**: 3000

#### 2. API Backend (`apps/api/`)

- **Framework**: NestJS 11.0.1
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **File Upload**: Multer with Cloudinary
- **Email**: Nodemailer for notifications
- **Validation**: Class-validator and class-transformer
- **Security**: bcrypt for password hashing

#### 3. Documentation (`apps/docs/`)

- **Framework**: Next.js (documentation site)
- **Purpose**: Project documentation and guides

### Shared Packages (`packages/`)

- **eslint-config**: Shared ESLint configurations
- **typescript-config**: Shared TypeScript configurations
- **ui**: Shared UI components library

## Database Schema Analysis

### Core Entities

#### User Management

- **User**: Complete user profiles with authentication, profile data, and preferences
- **WorkspaceMember**: Role-based access control (owner, manager, member, guest)
- **Notification**: Comprehensive notification system with multiple types

#### Workspace & Organization

- **Workspace**: Main organizational unit with visibility controls
- **Board**: Project boards within workspaces
- **TaskStatus**: Customizable task status columns (e.g., To Do, In Progress, Done)
- **TaskPriority**: Priority levels with color coding
- **TaskInitiative**: Initiative/epic categorization

#### Task Management

- **Task**: Core task entity with extensive fields:
  - Basic info (title, description, due date)
  - Assignment (assignee, reviewer, tester, BA)
  - Development tracking (story points, sprint, MR links)
  - Rich content (JSON descriptions, attachments)
  - Status tracking (isDone flag, status progression)

#### Collaboration Features

- **TaskComment**: Rich text comments with TipTap editor
- **CommentReaction**: Emoji reactions on comments
- **CommentMention**: User mentions in comments
- **CommentAttachment**: File attachments in comments
- **TaskMember**: Additional task collaborators
- **TaskHistory**: Complete audit trail of task changes

### Key Database Features

- **Audit Trail**: Complete task history tracking with version control
- **Rich Content**: JSON storage for rich text with plain text fallbacks for search
- **File Management**: Attachment system for comments with metadata tracking
- **Notification System**: Comprehensive notification types for all activities
- **Role-Based Access**: Granular permissions system with workspace-level isolation
- **Data Integrity**: Foreign key constraints and cascade deletes for data consistency
- **Performance Optimization**: Proper indexing on frequently queried fields
- **Soft Deletes**: Preserved data for audit purposes where appropriate

### Database Relationships & Constraints

#### User-Workspace Relationships

- Users can belong to multiple workspaces with different roles
- Workspace ownership can be transferred between users
- Invitation system with pending/active states

#### Task Hierarchy & Dependencies

- Tasks belong to boards within workspaces
- Tasks can have multiple assignees (assignee, reviewer, tester, BA)
- Task status progression with custom status columns
- Task priority and initiative categorization

#### Collaboration Features

- Comments support rich text with TipTap editor
- Comment reactions with emoji support
- User mentions in comments with notification triggers
- File attachments with metadata (size, type, mime type)

#### Notification System

- 15+ notification types covering all user activities
- Notification status tracking (unread, read, archived)
- JSON data field for flexible notification payloads
- User-specific notification preferences

## API Architecture

### Authentication System

- JWT-based authentication with refresh tokens
- Email verification system
- Password reset functionality
- Profile management

### Module Structure

The API follows NestJS modular architecture with dedicated modules for:

1. **Auth Module**: Authentication, registration, JWT handling
2. **Users Module**: User profile management
3. **Workspaces Module**: Workspace CRUD operations
4. **WorkspaceMembers Module**: Member management and invitations
5. **Boards Module**: Board management within workspaces
6. **Tasks Module**: Core task operations with filtering and search
7. **TaskStatus/Priority/Initiative Modules**: Task attribute management
8. **TaskMembers Module**: Task collaboration management
9. **TaskComments Module**: Comment system with rich text
10. **Upload Module**: File upload handling with Cloudinary

### API Patterns

- RESTful API design with consistent endpoint naming
- DTO-based request/response validation with class-validator
- Comprehensive error handling with standardized error responses
- Pagination support with cursor-based and offset-based options
- Query filtering and search capabilities with advanced operators
- JWT authentication with refresh token rotation
- Rate limiting and request validation
- CORS configuration for cross-origin requests
- Request/response logging and monitoring

### API Endpoint Structure

#### Authentication Endpoints

- `POST /auth/register` - User registration with email verification
- `POST /auth/login` - User authentication with JWT tokens
- `POST /auth/refresh` - Token refresh mechanism
- `GET /auth/me` - Get current user profile
- `POST /auth/verify-email` - Email verification
- `POST /auth/resend-verification` - Resend verification email

#### Workspace Management

- `GET /workspaces` - List user's workspaces
- `POST /workspaces` - Create new workspace
- `GET /workspaces/:id` - Get workspace details
- `PUT /workspaces/:id` - Update workspace
- `DELETE /workspaces/:id` - Delete workspace

#### Board Management

- `GET /workspaces/:workspaceId/boards` - List workspace boards
- `POST /workspaces/:workspaceId/boards` - Create new board
- `GET /boards/:id` - Get board details with tasks
- `PUT /boards/:id` - Update board
- `DELETE /boards/:id` - Delete board

#### Task Management

- `GET /boards/:boardId/tasks` - List board tasks with filtering
- `POST /boards/:boardId/tasks` - Create new task
- `GET /tasks/:id` - Get task details with comments
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/assign` - Assign task to user
- `POST /tasks/:id/status` - Update task status

#### Comment System

- `GET /tasks/:taskId/comments` - List task comments
- `POST /tasks/:taskId/comments` - Add comment
- `PUT /comments/:id` - Update comment
- `DELETE /comments/:id` - Delete comment
- `POST /comments/:id/reactions` - Add reaction
- `DELETE /comments/:id/reactions` - Remove reaction

## Frontend Architecture

### Component Structure

```
components/
├── auth/           # Authentication components
├── boards/         # Board management components
├── layout/         # Layout and navigation components
├── task-detail/    # Task detail view components
├── ui/             # Reusable UI components (shadcn/ui)
└── workspaces/     # Workspace management components
```

### State Management

- **AuthContext**: Global authentication state
- **Local State**: React hooks for component-level state
- **API Integration**: Custom hooks for API calls

### Custom Hooks System

The project uses a sophisticated hook system for API interactions:

- **useFetchApi**: Generic GET requests with caching, loading states, and error handling
- **useCreateApi**: Generic POST requests with optimistic updates and success/error callbacks
- **useUpdateApi**: Generic PATCH/PUT requests with optimistic updates and rollback on error
- **useDeleteApi**: Generic DELETE requests with confirmation and optimistic removal
- **useApi**: Legacy API hook (being phased out in favor of generic hooks)
- **useBoardApi**: Specialized hook for board operations with drag-and-drop support
- **useTaskDragDrop**: Custom hook for task drag-and-drop functionality
- **useUploadApi**: Specialized hook for file upload operations with progress tracking
- **useToast**: Hook for managing toast notifications across the application

### Hook Implementation Details

#### useFetchApi Features

- Automatic loading state management
- Error handling with retry mechanisms
- Conditional fetching based on dependencies
- Query parameter support
- Response caching with stale-while-revalidate pattern
- Automatic refetch on window focus

#### useCreateApi Features

- Optimistic updates for immediate UI feedback
- Error rollback with user notification
- Success callbacks for navigation or state updates
- Loading states during request processing
- Form integration with React Hook Form

#### useUpdateApi Features

- Partial update support with merge strategies
- Optimistic updates with rollback capability
- Conflict resolution for concurrent updates
- Validation before update submission
- Real-time UI updates

### State Management Patterns

#### Context Usage

- **AuthContext**: Global authentication state with token management
- **WorkspaceContext**: Current workspace and board selection
- **TaskContext**: Task detail view state and operations
- **NotificationContext**: Toast notifications and alerts

#### Local State Management

- React hooks for component-level state
- Custom hooks for complex state logic
- Optimistic updates for better UX
- Error boundaries for graceful error handling

### UI/UX Features

- **Drag & Drop**: Task reordering and status changes with @dnd-kit
- **Rich Text Editing**: TipTap editor for descriptions and comments with extensions
- **Real-time Updates**: Optimistic updates with error handling and rollback
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Toast Notifications**: User feedback system with multiple notification types
- **File Upload**: Drag-and-drop file uploads with preview and progress tracking
- **Keyboard Navigation**: Full keyboard accessibility support
- **Loading States**: Skeleton loaders and progress indicators
- **Error Boundaries**: Graceful error handling with user-friendly messages
- **Theme Support**: Dark/light mode with system preference detection

### Component Architecture Details

#### Layout Components

- **Sidebar**: Collapsible navigation with workspace and board selection
- **Header**: User profile, notifications, and workspace switcher
- **Main Content**: Dynamic content area with breadcrumbs
- **Modal System**: Reusable modal components for forms and confirmations

#### Board Components

- **BoardView**: Main kanban board with drag-and-drop columns
- **TaskCard**: Individual task cards with status, assignee, and priority indicators
- **ColumnHeader**: Status column headers with task counts and actions
- **TaskFilters**: Advanced filtering and search functionality
- **BoardSettings**: Board configuration and customization options

#### Task Detail Components

- **TaskDetailModal**: Comprehensive task view with all details
- **TaskComments**: Comment system with rich text editor
- **TaskHistory**: Audit trail with change tracking
- **TaskAssignees**: Multi-role assignment interface
- **TaskAttachments**: File management with preview capabilities

#### Form Components

- **TaskForm**: Create/edit task with validation
- **CommentForm**: Rich text comment creation
- **WorkspaceForm**: Workspace creation and settings
- **UserProfileForm**: User profile management
- **InviteForm**: Workspace member invitation system

## Development Workflow

### Scripts

```bash
# Development
pnpm dev              # Start all applications
pnpm dev:web          # Start web app only
pnpm dev:api          # Start API only
pnpm dev:docs         # Start docs only

# Building
pnpm build            # Build all applications
pnpm lint             # Lint all code
pnpm format           # Format code with Prettier
pnpm check-types      # TypeScript type checking
```

### Code Quality

- **ESLint**: Comprehensive linting rules
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Husky**: Git hooks for quality gates

## Key Features

### Project Management

- **Workspace-based Organization**: Multi-tenant architecture
- **Board Management**: Kanban-style task boards
- **Task Tracking**: Comprehensive task lifecycle management
- **Sprint Management**: Agile development support
- **Role-based Access**: Granular permission system

### Collaboration

- **Real-time Comments**: Rich text commenting system
- **User Mentions**: @mention functionality
- **File Sharing**: Attachment system
- **Notification System**: Comprehensive activity notifications
- **Task Assignment**: Multiple assignment types (assignee, reviewer, tester, BA)

### Development Features

- **Story Points**: Agile estimation with Fibonacci sequence support
- **Sprint Tracking**: Sprint-based organization with goal setting
- **MR Integration**: Merge request linking with status tracking
- **Test Case Management**: Test case documentation and execution tracking
- **Go-live Tracking**: Release date management with deployment status
- **Development Workflow**: Complete dev-to-production pipeline tracking
- **Code Review Process**: Reviewer assignment and approval workflow
- **Testing Process**: Tester assignment and test case execution
- **Business Analysis**: BA assignment for requirement validation
- **Feature Categorization**: Feature grouping and epic management

### User Experience

- **Responsive Design**: Mobile and desktop optimized
- **Dark/Light Mode**: Theme support (implied by UI components)
- **Drag & Drop**: Intuitive task management
- **Rich Text Editing**: Professional content creation
- **File Upload**: Seamless file sharing

## Security Considerations

### Authentication

- JWT tokens with refresh mechanism
- Password hashing with bcrypt
- Email verification system
- Secure token storage

### Authorization

- Role-based access control
- Workspace-level permissions
- Task-level access control
- API endpoint protection

### Data Protection

- Input validation with DTOs
- SQL injection prevention via Prisma
- XSS protection through React
- CSRF protection via SameSite cookies

## Scalability & Performance

### Frontend

- Next.js App Router for optimal performance
- Component-based architecture for reusability
- Optimistic updates for better UX
- Image optimization with Next.js

### Backend

- NestJS modular architecture
- Prisma ORM for efficient database queries
- Connection pooling for database
- File upload optimization with Cloudinary

### Database

- PostgreSQL for ACID compliance
- Proper indexing strategy
- Relationship optimization
- Audit trail for compliance

## Development Guidelines

### Code Style

- TypeScript strict mode
- ESLint with custom rules
- Prettier for consistent formatting
- Component-based architecture

### API Design

- RESTful principles
- Consistent error handling
- Comprehensive validation
- Proper HTTP status codes

### Database Design

- Normalized schema
- Proper relationships
- Audit trails
- Soft deletes where appropriate

## Environment Setup

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Email
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# API
API_BASE_URL=http://localhost:3001
```

### Development Setup

1. Install pnpm globally
2. Run `pnpm install` in root
3. Set up PostgreSQL database
4. Configure environment variables
5. Run `pnpm dev` to start all services

## Future Considerations

### Potential Enhancements

- Real-time collaboration with WebSockets
- Advanced reporting and analytics
- Mobile application
- Third-party integrations (GitHub, Slack, etc.)
- Advanced notification preferences
- Time tracking features
- Advanced search and filtering

### Technical Debt

- Migration from legacy API hooks to new generic hooks
- Enhanced error handling and user feedback
- Performance optimization for large datasets
- Comprehensive testing suite (unit, integration, e2e)
- API documentation with OpenAPI/Swagger
- Real-time collaboration features with WebSockets
- Advanced caching strategies for better performance
- Database query optimization for large workspaces
- Mobile app development for iOS/Android
- Advanced analytics and reporting features

## Implementation Details

### File Structure Deep Dive

#### Frontend Structure (`apps/web/`)

```
app/                          # Next.js App Router
├── (auth)/                   # Auth route group
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── verify-email/page.tsx
├── dashboard/page.tsx        # Main dashboard
├── workspace/[id]/          # Dynamic workspace routes
│   ├── page.tsx             # Workspace overview
│   ├── boards/page.tsx      # Board list
│   ├── boards/[boardId]/page.tsx  # Board view
│   └── settings/page.tsx    # Workspace settings
├── profile/page.tsx         # User profile
└── layout.tsx               # Root layout

components/                   # Reusable components
├── auth/                    # Authentication components
├── boards/                  # Board-related components
├── layout/                  # Layout components
├── task-detail/            # Task detail components
├── ui/                     # Base UI components (shadcn/ui)
└── workspaces/             # Workspace components

hooks/                       # Custom React hooks
├── use-api-examples.ts     # API hook examples
├── use-board-api.ts        # Board-specific API hooks
├── use-create-api.ts       # Generic create hook
├── use-delete-api.ts       # Generic delete hook
├── use-fetch-api.ts        # Generic fetch hook
├── use-task-drag-drop.ts   # Drag-and-drop hook
├── use-toast.ts            # Toast notification hook
├── use-update-api.ts       # Generic update hook
└── use-upload-api.ts       # File upload hook

lib/                         # Utility libraries
├── api-request.ts          # API request wrapper
├── api-service.ts          # Legacy API service
├── task-attribute-helpers.ts # Task utility functions
├── time-helpers.ts         # Date/time utilities
├── utils.ts                # General utilities
└── validations.ts          # Zod validation schemas

types/                       # TypeScript type definitions
├── api.ts                  # API response types
├── auth.ts                 # Authentication types
├── board-core.ts           # Board entity types
├── board-requests.ts       # Board request types
├── task-attributes.ts      # Task attribute types
├── task.ts                 # Task entity types
├── workspace-core.ts       # Workspace entity types
└── workspace-requests.ts   # Workspace request types
```

#### Backend Structure (`apps/api/`)

```
src/
├── modules/                 # Feature modules
│   ├── auth/               # Authentication module
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── guards/         # Auth guards
│   │   ├── strategies/     # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/              # User management
│   ├── workspaces/         # Workspace management
│   ├── workspace-members/  # Member management
│   ├── boards/             # Board management
│   ├── tasks/              # Task management
│   ├── task-status/        # Task status management
│   ├── task-priority/      # Task priority management
│   ├── task-initiative/    # Task initiative management
│   ├── task-members/       # Task member management
│   ├── task-comments/      # Comment system
│   └── upload/             # File upload handling
├── shared/                 # Shared modules
│   ├── prisma/             # Database service
│   └── email/              # Email service
├── app.controller.ts       # Root controller
├── app.module.ts           # Root module
├── app.service.ts          # Root service
└── main.ts                 # Application entry point
```

### Database Migration Strategy

#### Current Migrations

- `20250915134510_add_tester_and_is_done_fields` - Added tester assignment and completion tracking
- `20250915140433_add_notifications_table` - Added comprehensive notification system

#### Migration Patterns

- Incremental schema changes with backward compatibility
- Data migration scripts for existing data
- Index optimization for performance
- Constraint additions for data integrity

### Performance Considerations

#### Frontend Optimization

- Next.js App Router for optimal loading
- Component lazy loading for large lists
- Image optimization with Next.js Image component
- Bundle splitting for reduced initial load
- Service worker for offline capabilities

#### Backend Optimization

- Database connection pooling
- Query optimization with Prisma
- Caching strategies for frequently accessed data
- Rate limiting for API endpoints
- File upload optimization with streaming

#### Database Optimization

- Proper indexing on foreign keys and search fields
- Query optimization for complex joins
- Pagination for large result sets
- Connection pooling configuration
- Read replica support for scaling

This project represents a well-architected, modern full-stack application with comprehensive project management capabilities, built using industry best practices and modern technologies.
