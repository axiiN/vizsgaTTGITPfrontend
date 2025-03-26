import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HabitsComponent } from './habits/habits.component';
import { NotesComponent } from './notes/notes.component';
import { AuthGuard } from './services/auth-guard.service';
import { TasksComponent } from './tasks/tasks.component';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: 'auth', 
    redirectTo: '/login',
    pathMatch: 'full'
  },
  { 
    path: 'login', 
    component: LoginComponent,
    data: { title: 'Login' }
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    data: { title: 'Register' }
  },
  { 
    path: 'notes', 
    component: NotesComponent,
    canActivate: [AuthGuard],
    data: { title: 'Notes' }
  },
  { 
    path: 'habits', 
    component: HabitsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Habits' }
  },
  { 
    path: 'tasks', 
    component: TasksComponent,
    canActivate: [AuthGuard],
    data: { title: 'Tasks' }
  },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
