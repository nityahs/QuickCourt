# QuickCourt Facility Owner Dashboard

A comprehensive React TypeScript dashboard system for sports facility owners to manage their venues, courts, bookings, and business operations.

## 🚀 Features

### Dashboard Overview
- **KPI Cards**: Total Bookings, Active Courts, Monthly Earnings, Court Occupancy
- **Interactive Charts**: Booking trends, earnings by sport, monthly revenue, peak hours
- **Recent Activity**: Real-time updates on bookings and facility activities
- **Responsive Design**: Mobile-first approach with collapsible sidebar

### Facility Management
- **Add/Edit Facilities**: Comprehensive form with validation
- **Facility Cards**: Visual representation with status indicators
- **Search & Filtering**: Find facilities by name, sport type, or approval status
- **Image Management**: Support for multiple facility photos

### Court Management
- **Individual Court Settings**: Name, sport type, pricing, operating hours
- **Status Management**: Active/Inactive court states
- **Bulk Operations**: Edit multiple courts simultaneously

### Booking Overview
- **Comprehensive Table**: Customer details, court information, timing, pricing
- **Advanced Filtering**: By status, date, customer, or court
- **Status Management**: Confirmed, cancelled, completed bookings
- **Action Buttons**: View details, edit, or manage bookings

### Time Slot Management
- **Interactive Calendar**: Visual availability management
- **Time Slot Grid**: Hour-by-hour availability for each court
- **Blocking System**: Block time slots for maintenance or events
- **Bulk Operations**: Quick blocking and editing of multiple slots

### Profile Management
- **Personal Information**: Name, email, phone, company details
- **Address Management**: Complete location information
- **Bio & Preferences**: Professional description and settings
- **Account Statistics**: Facility count, court count, member since

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography
- **Build Tool**: Vite for fast development

## 🎨 Design System

### Color Scheme
- **Primary**: Green (#10b981) and Blue (#22d3ee) gradients
- **Background**: Subtle radial gradients with green/blue tints
- **Glass Effect**: rgba(255, 255, 255, 0.6) with backdrop blur

### Animation System
- **Transitions**: Smooth page transitions with AnimatePresence
- **Hover Effects**: Scale and elevation changes
- **Loading States**: Shimmer animations and skeleton screens

### Component Patterns
- **Glass Morphism**: Consistent backdrop blur and transparency
- **Rounded Corners**: xl and lg border radius throughout
- **Shadow System**: Layered shadows with hover states
- **Responsive Grid**: Mobile-first responsive layouts

## 📁 File Structure

```
src/components/FacilityOwner/
├── Dashboard/
│   ├── Dashboard.tsx          # Main dashboard component
│   ├── KPICards.tsx          # KPI metrics display
│   ├── ChartsSection.tsx     # Charts and analytics
│   └── RecentActivity.tsx    # Recent activities table
├── Facilities/
│   ├── FacilityList.tsx      # Facilities overview
│   ├── FacilityCard.tsx      # Individual facility card
│   └── FacilityForm.tsx      # Add/edit facility form
├── Courts/
│   └── CourtManagement.tsx   # Court management interface
├── Bookings/
│   └── BookingOverview.tsx   # Bookings management
├── TimeSlots/
│   └── AvailabilityCalendar.tsx # Time slot management
├── Profile/
│   └── UserProfile.tsx       # Profile management
├── Layout/
│   ├── FacilityOwnerLayout.tsx # Main layout wrapper
│   ├── Sidebar.tsx           # Navigation sidebar
│   └── FacilityHeader.tsx    # Header with breadcrumbs
└── index.ts                  # Component exports
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- React 18+ and TypeScript knowledge

### Installation
```bash
cd client
npm install
```

### Running the Dashboard
```bash
npm run dev
```

Navigate to `/facility-owner` to access the dashboard.

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the client directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=QuickCourt
```

### Tailwind Configuration
The dashboard uses custom Tailwind classes defined in `tailwind.config.js`:
- Custom color palette
- Extended spacing and shadows
- Custom animations and transitions

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px - Stacked layout, collapsible sidebar
- **Tablet**: 640px - 1024px - Sidebar overlay, grid adjustments
- **Desktop**: > 1024px - Full sidebar, multi-column layouts

### Mobile Features
- Touch-friendly buttons and interactions
- Swipe gestures for sidebar
- Optimized table layouts for small screens
- Collapsible sections and accordions

## 🎯 Key Components

### KPI Cards
- Animated counters with Framer Motion
- Trend indicators (up/down/neutral)
- Color-coded metrics by category
- Hover effects with elevation

### Charts Section
- **Line Chart**: Booking trends over time
- **Pie Chart**: Earnings breakdown by sport
- **Bar Chart**: Monthly revenue comparison
- **Area Chart**: Peak booking hours heatmap

### Data Tables
- Sortable columns
- Pagination support
- Search and filter capabilities
- Status badges with color coding
- Action buttons for each row

### Forms
- Multi-step facility creation
- Dynamic field management
- Real-time validation
- Error states and success feedback

## 🔐 Authentication & Security

### Role-Based Access
- Facility owner role verification
- Protected routes and components
- User context integration
- Secure logout functionality

### Data Validation
- Client-side form validation
- TypeScript type safety
- Input sanitization
- Error boundary protection

## 📊 Data Management

### State Management
- React hooks for local state
- Context API for global state
- Optimistic updates for better UX
- Error handling and loading states

### API Integration
- RESTful API endpoints
- Axios for HTTP requests
- Request/response interceptors
- Error handling and retry logic

## 🧪 Testing

### Component Testing
```bash
npm run test
```

### Testing Strategy
- Unit tests for utility functions
- Component testing with React Testing Library
- Integration tests for complex workflows
- E2E tests for critical user journeys

## 🚀 Performance Optimization

### Code Splitting
- Lazy loading of dashboard sections
- Dynamic imports for heavy components
- Route-based code splitting

### Bundle Optimization
- Tree shaking for unused code
- Image optimization and lazy loading
- CSS purging for unused styles
- Gzip compression support

## 🔧 Customization

### Theme System
- CSS custom properties for colors
- Configurable component variants
- Dark mode support (planned)
- Custom animation presets

### Component Library
- Reusable UI components
- Consistent prop interfaces
- Accessibility features
- Internationalization support

## 📈 Future Enhancements

### Planned Features
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: React Native companion app
- **Real-time Updates**: WebSocket integration
- **Multi-language**: Internationalization support
- **Advanced Reporting**: Custom report builder
- **Integration APIs**: Third-party service connections

### Performance Improvements
- Virtual scrolling for large datasets
- Service worker for offline support
- Progressive web app features
- Advanced caching strategies

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use consistent naming conventions
3. Implement proper error handling
4. Write comprehensive documentation
5. Add unit tests for new features

### Code Style
- Prettier for code formatting
- ESLint for code quality
- Husky for pre-commit hooks
- Conventional commits for version control

## 📄 License

This project is part of the QuickCourt platform. See the main project license for details.

## 🆘 Support

For technical support or questions:
- Check the main project documentation
- Review component examples in the codebase
- Open an issue for bugs or feature requests
- Contact the development team

---

**QuickCourt Facility Owner Dashboard** - Empowering sports facility owners with powerful management tools.
