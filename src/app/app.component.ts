import {Component, inject} from '@angular/core';
import {Image} from './models/image.model';
import {DataService} from './services/data.service';
import {AsyncPipe} from '@angular/common';
import {filter, finalize, Observable, take} from 'rxjs';
import { BorderFeedbackDirective } from './directives/border-feedback.directive';
import {GameService} from './services/game.service';
import {ProgressionService} from './services/progression.service';
import {UserProgression} from './models/progression.model';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, BorderFeedbackDirective],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent {
  dataService = inject(DataService);
  gameService = inject(GameService);
  progressionService = inject(ProgressionService);

  images$!: Observable<Image[]>;
  progression$!: Observable<UserProgression>;
  loading = false;
  message: string = '';
  selectedImageId: number | null = null;
  feedbackState: { [key: number]: boolean | null } = {};
  currentDifferentCategory: string = '';
  successMessage: string = '';
  showFooter: { [key: string]: boolean } = {};


  constructor() {
  }

  ngOnInit() {
    this.progression$ = this.progressionService.getProgression();
    this.startNewGame();
  }

  onTypeChange(event: Event) {
    const type = (event.target as HTMLSelectElement).value;
    this.dataService.setSelectedType(type);
    this.dataService.getCategoriesLoaded$()
      .pipe(
        filter(loaded => loaded),
        take(1)
      )
      .subscribe(() => {
        this.startNewGame()
      })
  }

  startNewGame() {
    this.showFooter = {};
    this.loading = true;
    this.message = '';
    this.selectedImageId = null;
    this.feedbackState = {};

    this.gameService.getRandomCategories().subscribe(([mainCategory, differentCategory]) => {
      this.currentDifferentCategory = differentCategory;
      this.images$ = this.gameService.getGameImages(mainCategory, differentCategory)
        .pipe(
          finalize(() => {
            this.loading = false;
          })
        );
    });
  }

  checkImage(image: Image) {
    this.showFooter[image.id] = true;

    const isCorrect = image.category === this.currentDifferentCategory;
    this.feedbackState[image.id] = isCorrect;

    if (isCorrect) {
      setTimeout(()=> {
        this.successMessage = 'Bravo ! C\'est la bonne réponse !';
      }, 1000)

      this.progressionService.addXP(1);
      setTimeout(() => {
        this.startNewGame();
        this.successMessage = '';
      }, 3000);
    }
  }
}
