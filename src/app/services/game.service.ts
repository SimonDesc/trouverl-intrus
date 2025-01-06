import {DataService} from './data.service';
import {Injectable} from '@angular/core';
import {filter, forkJoin, map, Observable, take} from 'rxjs';
import {Image} from '../models/image.model';
import {ProgressionService} from './progression.service';

@Injectable({
  providedIn: 'root'
})

export class GameService {

  constructor(private dataService: DataService, private progressionService: ProgressionService
  ) {
  }

  getRandomCategories(): Observable<[string, string]> {
    return this.dataService.getCategoriesLoaded$().pipe(
      filter(loaded => loaded),
      map((): [string, string] => {
        const availableCategories = [...this.dataService.getCategories()];

        const index1 = Math.floor(Math.random() * availableCategories.length);
        const category1 = availableCategories[index1];
        availableCategories.splice(index1, 1);

        const index2 = Math.floor(Math.random() * availableCategories.length);
        const category2 = availableCategories[index2];

        return [category1, category2];
      }),
      take(1)
    );
  }

  getGameImages(mainCategory: string, differentCategory: string): Observable<Image[]> {
    return forkJoin({
      main: this.dataService.getImagesByQuery(mainCategory, 5),
      different: this.dataService.getImagesByQuery(differentCategory, 1)
    }).pipe(
      map(({main, different}) => {
        return [...main, ...different].sort(() => Math.random() - 0.5);
      })
    );
  }
}
