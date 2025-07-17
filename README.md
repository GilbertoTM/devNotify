# DevNotify - Unified Developer Notification Hub

A comprehensive notification management system for development teams to monitor and manage alerts from various development tools and services.

## Features

- **Unified Dashboard**: Centralized view of all notifications from different services
- **Project Management**: Organize notifications by projects and teams
- **Real-time Updates**: Live notifications with WebSocket support
- **Pattern Analysis**: AI-powered pattern detection for recurring issues
- **Role-based Access**: Admin, Developer, and Viewer roles with appropriate permissions
- **Integration Support**: Connect with GitHub, AWS, Kubernetes, databases, and more

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Icons**: Lucide React + Heroicons
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd devnotify
   npm install
   ```

2. **Supabase Setup**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project
   - Go to Settings > API and copy your credentials

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Database Setup**
   - The database schema is already defined in `supabase/migrations/`
   - Run migrations in your Supabase dashboard or using the CLI
   - The schema includes tables for users, projects, teams, integrations, and notifications

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Database Schema

### Core Tables

- **profiles**: User profiles extending Supabase auth
- **teams**: Team management with role-based access
- **projects**: Development projects with status tracking
- **integrations**: Service integrations per project
- **notifications**: All notifications with metadata and categorization
- **notification_patterns**: AI-detected patterns and insights

### Security Features

- Row Level Security (RLS) enabled on all tables
- Role-based access control (admin, developer, viewer)
- Team and project-based data isolation
- Automatic ownership assignment via triggers

## User Roles

- **Admin**: Full system access, user management, all projects
- **Developer**: Can create projects/teams, manage assigned resources
- **Viewer**: Read-only access to assigned projects and teams

## Integration Types Supported

- **Version Control**: GitHub, GitLab
- **Cloud Providers**: AWS, Azure, GCP
- **Containers**: Docker, Kubernetes
- **Databases**: PostgreSQL, MongoDB, Redis
- **CI/CD**: Jenkins, GitHub Actions, GitLab CI
- **Monitoring**: Datadog, New Relic, Sentry
- **Communication**: Slack

## API Usage Examples

### Authentication
```typescript
import { useAuth } from './hooks/useAuth';

const { user, login, signUp, logout } = useAuth();

// Login
await login('user@example.com', 'password');

// Sign up
await signUp('user@example.com', 'password', 'Full Name');
```

### Data Management
```typescript
import { useSupabaseData } from './hooks/useSupabaseData';

const {
  projects,
  notifications,
  createProject,
  markNotificationAsRead
} = useSupabaseData(user?.id);

// Create project
await createProject({
  name: 'My Project',
  description: 'Project description',
  color: '#3B82F6'
});

// Mark notification as read
await markNotificationAsRead(notificationId);
```

## Development

### Project Structure
```
src/
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── styles/             # CSS and styling

supabase/
├── migrations/         # Database migrations
└── config.toml        # Supabase configuration
```

### Key Components

- **LoginForm**: Authentication interface
- **AdminPanel**: System administration
- **ProjectNotifications**: Project-specific notification view
- **IntegrationSetup**: Service integration configuration
- **PatternAnalysis**: AI pattern detection display

### Custom Hooks

- **useAuth**: Authentication state management
- **useNotifications**: Notification data and operations
- **useSupabaseData**: Real-time data synchronization

## Deployment

1. **Build for Production**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**
   - Connect your repository
   - Add environment variables
   - Deploy automatically on push

3. **Supabase Production**
   - Upgrade to Supabase Pro if needed
   - Configure custom domain
   - Set up backup policies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Contact the development team

---

Built with ❤️ for developer productivity