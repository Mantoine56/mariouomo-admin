# Mariouomo Admin Dashboard Overview

## Project Description
This is the admin backend for mariouomo.com, a men's retail and ecommerce clothing store. The project is built using the Dashcode template, which provides a robust foundation for creating modern admin interfaces.

## Tech Stack
- **Framework**: Next.js 14
- **UI Framework**: React 18
- **Styling**: 
  - Tailwind CSS
  - SCSS
  - HeadlessUI
- **State Management**: Redux Toolkit
- **Form Handling**: 
  - React Hook Form
  - Yup (validation)
- **Data Visualization**:
  - ApexCharts
  - Chart.js
  - Recharts
- **Additional Features**:
  - Full Calendar integration
  - React Beautiful DnD (Drag and Drop)
  - React Quill (Rich Text Editor)
  - React Leaflet (Maps)
  - File Upload capabilities
  - Date picking and handling

## Project Structure

### Core Directories
- `/app`: Next.js app directory (App Router)
  - `/(dashboard)`: Dashboard-related pages
  - `/(auth)`: Authentication-related pages
  - `/scss`: Global SCSS styles
  - `[...not-found]`: 404 handling

- `/components`: Reusable UI components
  - `/partials`: Partial components
  - `/skeleton`: Loading skeleton components
  - `/ui`: Core UI components

- `/configs`: Configuration files
- `/constant`: Constant values and definitions
- `/hooks`: Custom React hooks
- `/store`: Redux store configuration
- `/public`: Static assets

## Key Features
1. **Modern Architecture**
   - Uses Next.js 14 with the App Router
   - Server and Client Components support
   - Optimized for performance

2. **Rich UI Components**
   - Comprehensive set of pre-built components
   - Responsive design
   - Modern UI/UX patterns

3. **Data Management**
   - Redux integration for state management
   - Form handling with validation
   - Data visualization tools

4. **Authentication**
   - Dedicated auth routes
   - Secure authentication flow

5. **Developer Experience**
   - ESLint configuration
   - PostCSS and Tailwind setup
   - Modern JavaScript features (ES6+)

## Development Guidelines
1. **Getting Started**
   ```bash
   # Install dependencies
   yarn install

   # Run development server
   yarn dev

   # Build for production
   yarn build
   ```

2. **File Structure Best Practices**
   - Keep components modular and reusable
   - Follow the established directory structure
   - Use appropriate Next.js patterns (App Router)

3. **Styling**
   - Utilize Tailwind CSS classes
   - Custom styles in SCSS when needed
   - Follow the existing design system

4. **State Management**
   - Use Redux for global state
   - Local state with React hooks
   - Follow established patterns for data flow

## Integration Points
- **Migration from Shopify**
  - Planned migration path from Shopify to custom Next.js solution
  - Data migration strategy for products, customers, and orders
  - Temporary dual-system operation during transition
  - Shopify API integration for historical data access

- **Custom E-commerce Backend**
  - Complete product management system
  - Order processing and fulfillment
  - Inventory management and tracking
  - Customer relationship management (CRM)
  - Advanced reporting and analytics

- **Frontend Integration**
  - Seamless integration with new Next.js frontend (mariouomo.com)
  - RESTful API endpoints for all e-commerce operations
  - Real-time inventory and pricing updates
  - Customer authentication and profile management
  - Shopping cart and checkout process

- **Business Operations**
  - Sales and revenue reporting
  - Customer segmentation and analytics
  - Marketing campaign management
  - Promotional tools and discount management
  - Order status tracking and notifications

- **Data Synchronization**
  - Real-time inventory sync across platforms during migration
  - Customer data migration and profile merging
  - Order history preservation and continuation
  - Seamless transition for existing customers

## Performance Considerations
- Optimized bundle sizing
- Image optimization through Next.js
- Code splitting and lazy loading
- Server-side rendering where appropriate

## Security Considerations
- Authentication and authorization
- Data validation
- Secure API handling
- Environment variable management

## Future Considerations
- Regular updates to Next.js and dependencies
- Scalability planning
- Performance monitoring
- Feature expansion based on business needs 