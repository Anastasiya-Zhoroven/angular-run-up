import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LibraryService } from './library.service';
import { NgStyle } from '@angular/common';
import { Book } from './book.interface';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, FormsModule, NgStyle],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App implements OnInit {
    protected title = 'angular-run-up';
    private libraryService = inject(LibraryService);

    booksList: Book[] = [];
    search: string = '';
    errorMessage: string = '';
    limits = [10, 30, 50, 100];
    selectedLimit: number = this.limits[0];
    fields = [
        { label: 'All', value: 'author_name,title,first_publish_year' },
        { label: 'Title', value: 'title' },
        { label: 'Year', value: 'first_publish_year' },
        { label: 'Author', value: 'author_name' }
    ];
    selectedField: string = this.fields[0].value;


    query = new BehaviorSubject<string>('');
    limit = new BehaviorSubject<number>(this.selectedLimit);
    field = new BehaviorSubject<string>(this.selectedField);

    ngOnInit() {
        const querySubject = this.query.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            filter(value => !!value)
        );

        const limitSubject = this.limit.pipe(
            distinctUntilChanged()
        );

        const fieldSubject = this.field.pipe(
            distinctUntilChanged()
        );

        combineLatest([limitSubject, querySubject, fieldSubject]).subscribe(
            ([limit, search, field]) => {
                if (search.length > 0) {
                    this.getBooks(search, limit, field);
                } else {
                    this.booksList = [];
                }
            }
        );
    }

    getBooks(search: string, limit: number, field: string) {
        this.libraryService.fetchBooks(search, limit, field).subscribe({
            next: bookList => {
                this.booksList = bookList;
                this.errorMessage = '';
            },
            error: err => {
                this.processError(err.error);
            }
        })
    }

    processError(errorMessage: string) {
        this.errorMessage = errorMessage;
        this.booksList = [];
    }

    validateSearchValue() {
        if (this.search) {
            if (this.search.length < 3) {
                this.processError('Value too short, must be at least 3 characters');
                return
            } else if (!(/[a-zA-Z0-9А-Яа-яЁё]{3,}/.test(this.search))) {
                this.processError('Value should contain at least 3 chars');
                return
            }
        }
        this.processError('');
    }

    onSearchChange() {
        this.validateSearchValue()
        if (this.errorMessage) {
            this.query.next('');
        } else {
            this.query.next(this.search);
        }
    }

    onLimitChange() {
        this.limit.next(this.selectedLimit);
    }

    onFieldChange() {
        this.field.next(this.selectedField)
    }
}
