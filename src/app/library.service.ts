import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Book, BookResponse } from './book.interface';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LibraryService {
    http = inject(HttpClient);
    url = 'https://openlibrary.org/search.json';

    fetchBooks(search?: string, limit?: number, fields?: string): Observable<Book[]> {
        let params = new HttpParams();
        if (search) {
            params = params.set('q', search);
        }
        if (limit) {
            params = params.set('limit', limit.toString());
        }
        if (fields) {
            params = params.set('fields', fields);
        }

        return this.http.get<{ docs: BookResponse[] }>(
            this.url, { params }
        ).pipe(
            map(resp => resp.docs.map(rawBook => ({
                title: rawBook.title,
                firstPublishYear: rawBook.first_publish_year,
                authorName: rawBook.author_name
            }))),
            catchError(err => {
                return throwError(() => err.error);
            })
        )
    }
}