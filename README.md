# Life Tracker - Personal Productivity Application

Life Tracker is a modern productivity application built with Angular that helps users manage tasks, habits, and notes in a clean, intuitive interface. The application offers both light and dark modes for enhanced user experience.

## Features

### Task Management
- Create, edit, and delete tasks
- Mark tasks as complete
- Filter tasks by All, Today, or Week
- Prioritize tasks with different priority levels
- Set due dates for better time management

### Habit Tracking
- Create, edit, and delete habits
- Track habit streaks
- Categorize habits
- Filter habits by All, Today, or Week
- Mark habits as complete

### Note Taking
- Create, edit, and delete notes
- Organize notes with categories
- Mark important notes as favorites
- Filter notes by All, Recent, or Favorites

### User Interface
- Clean, modern design
- Responsive layout for different screen sizes
- Light and dark mode support
- Consistent styling across components
- Statically styled elements (no hover effects)

## Technical Architecture

### Frontend
- **Framework**: Angular 18
- **Styling**: Bootstrap 5 with custom CSS variables
- **State Management**: Angular services with RxJS

### Services Architecture
- **CoreApiService**: Handles all HTTP communication
- **Domain Services**: TasksService, HabitsService, NotesService
- See the [Services README](src/app/services/README.md) for detailed information

### Component Structure
- Each feature has its own module and components
- Shared components are used across features
- Consistent styling using global CSS variables

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm (v7 or later)
- Angular CLI (v18 or later)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/life-tracker.git
   cd life-tracker
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```
   Or use Angular CLI directly:
   ```
   ng serve
   ```

4. Open your browser and navigate to `http://localhost:4200`

## Build

To build the project for production:

```
npm run build
```

Or use Angular CLI directly:
```
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Testing

To run the tests:

```
npm test
```

## Additional Commands

- `npm run watch` - Build and watch for changes in development mode
- `ng serve --port 4201` - Run the development server on a specific port

## Technologies Used

- Angular 18
- Bootstrap 5
- RxJS
- Firebase
- NgBootstrap
- CoreUI Components

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
