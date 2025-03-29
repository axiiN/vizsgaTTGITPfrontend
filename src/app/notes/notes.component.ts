import { Component, OnInit } from '@angular/core';
import { Note } from '../models/note';
import { NotesService } from '../services/notes.service';
import { ConfirmationService } from '../shared/services/confirmation.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
})
export class NotesComponent implements OnInit {
  entries: Note[] = [];
  isLoading: boolean = false;

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
  activeFilter: 'all' | 'recent' | 'favorites' = 'recent';

  constructor(
    private notesService: NotesService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  loadEntries(): void {
    this.isLoading = true;
    this.notesService.getNotes().subscribe({
      next: (notes) => {
        this.entries = notes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notes:', error);
        this.isLoading = false;
      }
    });
  }

  createEntry(): void {
    if (this.newEntryTitle && this.newEntryContent) {
      this.isLoading = true;
      const entry: Note = {
        title: this.newEntryTitle,
        content: this.newEntryContent,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFavorite: false
      };
      
      this.notesService.createNote(entry).subscribe({
        next: (newNote) => {
          this.entries.push(newNote);
          this.newEntryTitle = '';
          this.newEntryContent = '';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating note:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  createModalEntry(): void {
    if (this.modalNoteTitle && this.modalNoteContent) {
      this.isLoading = true;
      const entry: Note = {
        title: this.modalNoteTitle,
        content: this.modalNoteContent,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isFavorite: false
      };
      
      this.notesService.createNote(entry).subscribe({
        next: (newNote) => {
          this.entries.push(newNote);
          this.modalNoteTitle = '';
          this.modalNoteContent = '';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating note from modal:', error);
          this.isLoading = false;
        }
      });
    }
  }
  
  openEditModal(entry: Note): void {
    if (!entry.id) {
      console.error('Cannot edit note without ID');
      return;
    }
    
    this.currentEditNote = entry;
    this.editNoteTitle = entry.title;
    this.editNoteContent = entry.content;
    
    // The modal is opened via the template with data-bs-toggle
  }
  
  updateCurrentNote(): void {
    if (!this.currentEditNote || !this.currentEditNote.id) {
      return;
    }
    
    this.isLoading = true;
    const updatedEntry: Partial<Note> = {
      title: this.editNoteTitle,
      content: this.editNoteContent,
      updatedAt: Date.now()
    };
    
    this.notesService.updateNote(this.currentEditNote.id, updatedEntry).subscribe({
      next: (updatedNote) => {
        // Find and update the note in the array
        const index = this.entries.findIndex(n => n.id === this.currentEditNote?.id);
        if (index !== -1) {
          this.entries[index] = updatedNote;
        }
        this.currentEditNote = null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error updating note:', error);
        this.isLoading = false;
      }
    });
  }
  
  openDeleteConfirmation(entry: Note): void {
    if (!entry.id) {
      console.error('Cannot delete note without ID');
      return;
    }
    
    this.noteToDelete = entry;
    
    this.confirmationService.confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete the note "${entry.title}"?`,
      confirmButtonText: 'Delete',
      confirmButtonClass: 'btn-danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.deleteNote(entry);
      }
      this.noteToDelete = null;
    });
  }
  
  private deleteNote(entry: Note): void {
    if (!entry.id) {
      return;
    }
    
    this.isLoading = true;
    this.notesService.deleteNote(entry.id).subscribe({
      next: () => {
        // Remove the note from the array
        this.entries = this.entries.filter(n => n.id !== entry.id);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting note:', error);
        this.isLoading = false;
      }
    });
  }
  
  toggleFavorite(entry: Note, event?: MouseEvent): void {
    // If click event was triggered by a button, prevent event propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!entry.id) {
      console.error('Cannot toggle favorite on note without ID');
      return;
    }
    
    this.notesService.toggleFavorite(entry.id).subscribe({
      next: (updatedNote) => {
        // Find and update the note in the array
        const index = this.entries.findIndex(n => n.id === entry.id);
        if (index !== -1) {
          this.entries[index] = updatedNote;
        }
      },
      error: (error) => {
        console.error('Error toggling favorite status:', error);
      }
    });
  }

  getNotesThisMonth(): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return this.entries.filter(entry => (entry.createdAt || 0) >= startOfMonth).length;
  }

  getLastAddedDate(): string {
    if (this.entries.length === 0) return 'Never';
    
    // Sort entries by createdAt (newest first)
    const sortedEntries = [...this.entries].sort((a, b) => 
      (b.createdAt || 0) - (a.createdAt || 0)
    );
    if (sortedEntries.length === 0) return 'Never';
    
    try {
      const latestEntry = sortedEntries[0];
      if (!latestEntry.createdAt) return 'Unknown';
      
      const date = new Date(latestEntry.createdAt);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Unknown';
      
      // Format date as dd/mm/yy
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString().slice(-2);
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  }

  getTotalWords(): number {
    return this.entries.reduce((total, entry) => {
      const wordCount = entry.content.split(/\s+/).filter(word => word.length > 0).length;
      return total + wordCount;
    }, 0);
  }
  
  getRecentNotes(): Note[] {
    const sortedEntries = [...this.entries].sort((a, b) => 
      (b.createdAt || 0) - (a.createdAt || 0)
    );
    
    return sortedEntries.slice(0, 3);
  }
  
  getFavoriteNotes(): Note[] {
    return this.entries.filter(entry => entry.isFavorite);
  }
  
  filterNotes(filter: 'all' | 'recent' | 'favorites'): void {
    this.activeFilter = filter;
  }
  
  getFilteredNotes(): Note[] {
    if (this.activeFilter === 'recent') {
      return this.getRecentNotes();
    } else if (this.activeFilter === 'favorites') {
      return this.getFavoriteNotes();
    } else {
      // Return all notes sorted by createdAt (newest first)
      return [...this.entries].sort((a, b) => 
        (b.createdAt || 0) - (a.createdAt || 0)
      );
    }
  }
}
