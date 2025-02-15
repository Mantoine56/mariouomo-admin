# Project Structure

```
.
├── app/                          # Next.js 14 app directory (App Router implementation)
│   ├── (auth)/                  # Authentication related pages and components
│   │   ├── coming-soon/        # Coming soon page implementation
│   │   ├── forgot-password/    # Password recovery flows
│   │   ├── login2,3/          # Multiple login page variations
│   │   ├── register/          # User registration pages
│   │   └── under-construction/ # Maintenance page
│   │
│   ├── (dashboard)/            # Main dashboard components and pages
│   │   ├── (app)/             # Core application features
│   │   │   ├── calender/      # Calendar implementation
│   │   │   ├── chat/         # Messaging system
│   │   │   ├── email/        # Email management
│   │   │   ├── kanban/       # Project management board
│   │   │   ├── projects/     # Project management features
│   │   │   └── todo/         # Task management
│   │   │
│   │   ├── (chart)/          # Data visualization components
│   │   ├── (components)/     # Reusable UI components
│   │   ├── (forms)/          # Form components and validations
│   │   ├── (table)/          # Table implementations
│   │   └── (utility)/        # Utility pages (FAQ, Settings, etc.)
│   │
│   ├── scss/                  # Global SCSS styling
│   └── theme-provider.jsx     # Theme configuration provider

├── components/                 # Shared React components
│   ├── partials/             # Partial components for specific features
│   │   ├── app/             # Application-specific components
│   │   ├── auth/            # Authentication components
│   │   ├── chart/           # Chart components
│   │   ├── footer/          # Footer components
│   │   ├── header/          # Header components
│   │   └── sidebar/         # Sidebar navigation components
│   │
│   ├── skeleton/            # Loading placeholder components
│   └── ui/                  # Core UI components (buttons, forms, etc.)

├── configs/                   # Configuration files
│   └── themeConfig.js       # Theme configuration

├── constant/                  # Constants and static data
│   ├── data.js             # Application data
│   └── table-data.js       # Table mock data

├── hooks/                     # Custom React hooks
│   ├── useDarkMode.js      # Dark mode functionality
│   ├── useMenuLayout.js    # Menu layout management
│   └── various hooks       # Other utility hooks

├── public/                    # Static assets
│   └── assets/              # Images, icons, and other media
│       ├── images/         # Image assets
│       └── svg/            # SVG assets

├── store/                     # Redux store configuration
│   ├── index.js            # Store initialization
│   └── rootReducer.js      # Root reducer

├── next.config.js            # Next.js configuration
├── package.json              # Project dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
└── overview.md               # Project documentation
```

## Key Directories Explained

### `/app`
The core of the Next.js application using the App Router. Contains all pages and layouts organized by feature.

### `/components`
Reusable React components organized by type and functionality. Includes both UI components and feature-specific implementations.

### `/configs`
Configuration files for theming, API endpoints, and other app-wide settings.

### `/constant`
Static data, mock data, and configuration constants used throughout the application.

### `/hooks`
Custom React hooks for shared functionality like theme management, layout control, and other utilities.

### `/public`
Static assets including images, icons, and other media files.

### `/store`
Redux store configuration and state management setup.

## Special Directories

### `/app/(auth)`
Authentication-related pages including login, registration, and password recovery flows.

### `/app/(dashboard)`
Main application features including:
- Core business logic components
- Data visualization
- Form handling
- Table implementations
- Utility pages

### `/components/partials`
Feature-specific components that are used in multiple places but are not generic enough to be core UI components.

### `/components/ui`
Core UI components that form the building blocks of the application's interface. 