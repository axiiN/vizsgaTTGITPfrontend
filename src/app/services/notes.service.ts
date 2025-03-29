import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Note } from '../models/note';
import { CoreApiService } from './core-api.service';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  private endpoint = 'notes';

  constructor(private api: CoreApiService) {}

  /**
   * Get all notes
   */
  getNotes(): Observable<Note[]> {
    console.log('Fetching all notes from API');
    return this.api.get<Note[]>(this.endpoint).pipe(
      tap(notes => console.log(`Retrieved ${notes.length} notes`))
    );
  }

  /**
   * Get a specific note by ID
   */
  getNoteById(id: string): Observable<Note> {
    return this.api.getById<Note>(this.endpoint, id).pipe(
      tap(note => console.log('Retrieved note:', note))
    );
  }

  /**
   * Create a new note
   */
  createNote(note: Note): Observable<Note> {
    // Add creation timestamp if not provided
    const newNote = {
      ...note,
      timestamp: note.timestamp || Date.now()
    };
    console.log('Creating note:', newNote);
    return this.api.post<Note>(this.endpoint, newNote).pipe(
      tap(createdNote => console.log('Created note:', createdNote))
    );
  }

  /**
   * Update an existing note
   */
  updateNote(id: string, note: Partial<Note>): Observable<Note> {
    // Update timestamp if updating content
    const updatedNote = {
      ...note,
      timestamp: Date.now()
    };
    console.log(`Updating note ${id}:`, updatedNote);
    return this.api.put<Note>(this.endpoint, id, updatedNote).pipe(
      tap(result => console.log('Update result:', result))
    );
  }

  /**
   * Delete a note
   */
  deleteNote(id: string): Observable<any> {
    console.log(`Deleting note with id: ${id}`);
    return this.api.delete(this.endpoint, id).pipe(
      tap(result => console.log('Delete result:', result))
    );
  }

  /**
   * Toggle the favorite status of a note
   */
  toggleFavorite(id: string): Observable<Note> {
    console.log(`Toggling favorite status for note: ${id}`);
    const togglePath = `${this.endpoint}/${id}/toggle-favorite`;
    return this.api.patchCustomPath<Note>(togglePath, {}).pipe(
      tap(result => console.log('Toggle favorite result:', result))
    );
  }
}
