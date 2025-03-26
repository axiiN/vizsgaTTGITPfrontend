# API Service Architecture

This project follows a layered service architecture for API communication, separating concerns between core HTTP functionality and domain-specific services.

## Overview

The architecture consists of:

1. **CoreApiService**: Handles all HTTP communication with generic methods
2. **Domain-specific Services**: Task and Habit services that use the CoreApiService

## Core API Service

`CoreApiService` is a reusable service that:

- Handles HTTP requests (GET, POST, PUT, PATCH, DELETE)
- Manages error handling consistently across the application
- Handles authentication headers
- Provides a single point for HTTP configuration

```typescript
// Example usage of CoreApiService
this.api.get<Task[]>('tasks');
this.api.post<Task>('tasks', newTask);
this.api.put<Task>('tasks', id, updatedTask);
```

## Domain-Specific Services

### TasksService

Manages task-related operations:
- Getting all tasks
- Getting a task by ID
- Creating, updating, and deleting tasks
- Toggling task completion

The service adds business logic such as timestamps and uses CoreApiService for API calls.

### HabitsService

Manages habit-related operations:
- Getting all habits
- Getting a habit by ID
- Creating, updating, and deleting habits
- Toggling habit completion
- Handling streaks

## Benefits of this Architecture

1. **Separation of Concerns**: Each service has a clear responsibility
2. **Code Reuse**: Common HTTP logic is centralized in CoreApiService
3. **Consistent Error Handling**: All API calls use the same error handling logic
4. **Maintainability**: Changes to API endpoints only need to be updated in one place
5. **Testability**: Each layer can be tested independently

## Example Flow

1. Component calls a domain service (e.g., `TasksService.getTasks()`)
2. Domain service applies business logic (e.g., timestamps)
3. Domain service calls CoreApiService (e.g., `api.get<Task[]>('tasks')`)
4. CoreApiService makes the HTTP request and handles errors
5. Response flows back up through the layers to the component 