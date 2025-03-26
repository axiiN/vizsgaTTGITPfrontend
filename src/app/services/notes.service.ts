import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Note } from '../models/note';

@Injectable({
  providedIn: 'root',
})
export class NotesService {
  constructor(private db: AngularFireDatabase) {}

  createEntry(uid: string, entry: Note) {
    return this.db.list(`notes/${uid}`).push(entry);
  }

  getEntries(uid: string): Observable<Note[]> {
    return this.db
      .list(`notes/${uid}`)
      .snapshotChanges()
      .pipe(
        map((changes) =>
          changes.map((c) => ({
            id: c.payload.key ?? undefined,
            ...(c.payload.val() as Note),
          })),
        ),
      );
  }

  // Bejegyzés frissítése
  updateEntry(uid: string, entryId: string, entry: Note) {
    return this.db.object(`notes/${uid}/${entryId}`).update(entry);
  }

  // Bejegyzés törlése
  deleteEntry(uid: string, entryId: string) {
    return this.db.object(`notes/${uid}/${entryId}`).remove();
  }
}
