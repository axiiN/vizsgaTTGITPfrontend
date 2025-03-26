import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import { Note } from '../models/note';
import { AuthService } from '../services/auth.service';
import { NotesService } from '../services/notes.service';
import { ConfirmationService } from '../shared/services/confirmation.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
})
export class NotesComponent implements OnInit {
  user: firebase.User | null = null;
  entries: Note[] = [];

  newEntryTitle: string = '';
  newEntryContent: string = '';
  
  // Modal properties
  modalNoteTitle: string = '';
  modalNoteContent: string = '';
  
  // Edit modal properties
  editNoteTitle: string = '';
  editNoteContent: string = '';
  currentEditNote: Note | null = null;
  
  // Delete confirmation properties
  noteToDelete: Note | null = null;

  // Stats calculations
  activeFilter: 'all' | 'recent' | 'favorites' = 'all';

  constructor(
    private notesService: NotesService,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(async (user) => {
      this.user = user;
      if (user) {
        this.loadEntries();
      }
    });
  }

  loadEntries(): void {
    if (this.user) {
      this.notesService.getEntries(this.user.uid).subscribe((entries: any) => {
        this.entries = entries;
      });
    }
  }

  createEntry(): void {
    if (this.user && this.newEntryTitle && this.newEntryContent) {
      const entry: Note = {
        title: this.newEntryTitle,
        content: this.newEntryContent,
        timestamp: Date.now(),
        isFavorite: false
      };
      this.notesService
        .createEntry(this.user.uid, entry)
        .then(() => {
          console.log('Note saved');
          this.newEntryTitle = '';
          this.newEntryContent = '';
        })
        .catch((err:any) => console.error('Error saving note:', err));
    }
  }
  
  createModalEntry(): void {
    if (this.user && this.modalNoteTitle && this.modalNoteContent) {
      const entry: Note = {
        title: this.modalNoteTitle,
        content: this.modalNoteContent,
        timestamp: Date.now(),
        isFavorite: false
      };
      this.notesService
        .createEntry(this.user.uid, entry)
        .then(() => {
          console.log('Note saved');
          this.modalNoteTitle = '';
          this.modalNoteContent = '';
        })
        .catch((err:any) => console.error('Error saving note:', err));
    }
  }
  
  openEditModal(entry: Note): void {
    // Store the current note being edited
    this.currentEditNote = entry;
    
    // Set the edit form fields
    this.editNoteTitle = entry.title;
    this.editNoteContent = entry.content || '';
    
    // Show the modal programmatically using JavaScript
    // We can use Bootstrap's modal method to open the modal
    const modal = document.getElementById('editNoteModal');
    if (modal) {
      const bootstrapModal = new (window as any).bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }
  
  updateCurrentNote(): void {
    if (!this.currentEditNote || !this.currentEditNote.id || !this.user) {
      return;
    }
    
    const updatedEntry: Note = {
      title: this.editNoteTitle,
      content: this.editNoteContent,
      timestamp: Date.now(),
      isFavorite: this.currentEditNote.isFavorite
    };
    
    this.notesService
      .updateEntry(this.user.uid, this.currentEditNote.id, updatedEntry)
      .then(() => {
        console.log('Note updated');
        this.currentEditNote = null;
      })
      .catch((err: any) => console.error('Error updating note:', err));
  }
  
  // Delete confirmation using the service
  openDeleteConfirmation(entry: Note): void {
    this.noteToDelete = entry;
    
    // Use the confirmation service instead of direct modal manipulation
    this.confirmationService.confirm({
      title: 'Delete Note',
      message: `Are you sure you want to delete "${entry.title}"? This action cannot be undone.`,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonClass: 'btn-danger',
      modalId: 'deleteNoteModal',
      data: { noteId: entry.id }
    }).subscribe(result => {
      if (result === true) {
        this.deleteNote(entry);
      }
    });
  }
  
  // Private method to actually delete the note
  private deleteNote(entry: Note): void {
    if (this.user && entry.id) {
      this.notesService
        .deleteEntry(this.user.uid, entry.id)
        .then(() => {
          console.log('Note deleted');
        })
        .catch((err: any) => console.error('Error deleting note:', err));
    }
  }
  
  // Legacy methods - keeping for reference
  editEntry(entry: Note): void {
    const newContent = prompt('Edit note:', entry.content);
    if (newContent !== null && this.user && entry.id) {
      const updatedEntry: Note = {
        title: entry.title,
        content: newContent,
        timestamp: Date.now(),
      };
      this.notesService
        .updateEntry(this.user.uid, entry.id, updatedEntry)
        .then(() => console.log('Note updated'))
        .catch((err: any) =>
          console.error('Error updating note:', err),
        );
    }
  }

  deleteEntry(entry: Note): void {
    if (this.user && entry.id && confirm('Are you sure you want to delete this note?')) {
      this.notesService
        .deleteEntry(this.user.uid, entry.id)
        .then(() => console.log('Note deleted'))
        .catch((err: any) => console.error('Error deleting note:', err));
    }
  }
  
  // Stats calculations
  
  getNotesThisMonth(): number {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return this.entries.filter(note => 
      new Date(note.timestamp).getTime() >= firstDayOfMonth.getTime()
    ).length;
  }
  
  getLastAddedDate(): string {
    if (this.entries.length === 0) return 'None';
    
    const sortedEntries = [...this.entries].sort((a, b) => 
      b.timestamp - a.timestamp
    );
    
    if (sortedEntries.length > 0) {
      const date = new Date(sortedEntries[0].timestamp);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return 'None';
  }
  
  getTotalWords(): number {
    return this.entries.reduce((total, note) => {
      if (!note.content) return total;
      return total + note.content.split(/\s+/).filter(word => word.length > 0).length;
    }, 0);
  }
  
  getRecentNotes(): Note[] {
    const sortedEntries = [...this.entries].sort((a, b) => 
      b.timestamp - a.timestamp
    );
    
    return sortedEntries.slice(0, 3);
  }

  toggleFavorite(entry: Note, event?: MouseEvent): void {
    if (event) {
      // Prevent the event from bubbling up to parent elements
      event.stopPropagation();
      
      // Add animation to the star button
      const target = event.currentTarget as HTMLElement;
      target.classList.add('animate');
      setTimeout(() => {
        target.classList.remove('animate');
      }, 300); // Animation duration
    }
    
    if (!this.user || !entry.id) return;
    
    const updatedEntry: Note = {
      ...entry,
      isFavorite: !entry.isFavorite
    };
    
    this.notesService
      .updateEntry(this.user.uid, entry.id, updatedEntry)
      .then(() => {
        console.log(`Note ${updatedEntry.isFavorite ? 'marked as favorite' : 'removed from favorites'}`);
      })
      .catch((err: any) => console.error('Error updating favorite status:', err));
  }
  
  getFavoriteNotes(): Note[] {
    return this.entries.filter(note => note.isFavorite);
  }
  
  filterNotes(filter: 'all' | 'recent' | 'favorites'): void {
    this.activeFilter = filter;
  }
  
  getFilteredNotes(): Note[] {
    switch(this.activeFilter) {
      case 'recent':
        return this.getRecentNotes();
      case 'favorites':
        return this.getFavoriteNotes();
      case 'all':
      default:
        return this.entries;
    }
  }
}
