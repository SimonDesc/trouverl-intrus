import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BehaviorSubject, filter, forkJoin, map, Observable, switchMap, take} from 'rxjs';
import {Image} from '../models/image.model'

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private readonly http = inject(HttpClient);
  private readonly DATA_API_URL = 'https://api.pexels.com/v1/search';
  private readonly API_KEY = 'JDntakeK8Uhg1wOIn04u1GK4NZLwCth51PBJLQkchBnoe8f21NaEuBKT';
  private categories: string[] = [];
  private categoriesLoaded$ = new BehaviorSubject<boolean>(false);
  private selectedType = new BehaviorSubject<string>('animals');

  constructor() {
    this.loadCategories();
  }

  getImagesByQuery(query: string, count: number): Observable<Image[]> {
    const headers = new HttpHeaders({
      'Authorization': this.API_KEY
    });

    const params = {
      query: query,
      per_page: count.toString()
    }

    return this.http.get<any>(this.DATA_API_URL, {
      headers,
      params
    }).pipe(
      map(response => response.photos.map((photo: any) => ({
        id: photo.id,
        url: photo.src.medium,
        alt: photo.alt || 'image',
        category: query
      })))
    );
  }

  private loadCategories() {
    this.selectedType.pipe(
      switchMap(type => {
        this.categoriesLoaded$.next(false);
        return this.http.get<{ categories: string[] }>(`assets/categories/${type}.json`);
      })
    ).subscribe(data => {
      this.categories = data.categories;
      this.categoriesLoaded$.next(true);
    });
  }

  setSelectedType(type: string) {
    this.selectedType.next(type);
  }

  getCategoriesLoaded$(): Observable<boolean> {
    return this.categoriesLoaded$.asObservable();
  }

  getCategories(): string[] {
    return [...this.categories];
  }


}
