import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserProgression} from '../models/progression.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressionService {
  private readonly STORAGE_KEY = 'user_progression';
  private readonly XP_PER_CORRECT_ANSWER = 25;
  private readonly XP_MULTIPLIER = 1.2; // Chaque niveau suivant demande 20% plus d'XP

  private progression$ = new BehaviorSubject<UserProgression>(this.loadProgression());

  constructor() {
  }

  private loadProgression(): UserProgression {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      level: 1,
      currentXP: 0,
      nextLevelXP: 50
    };
  }

  private saveProgression(progression: UserProgression): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progression));
    this.progression$.next(progression);
  }

  getProgression(): Observable<UserProgression> {
    return this.progression$.asObservable();
  }

  addXP(correctAnswers: number): void {
    const currentProgression = this.progression$.value;
    const xpGained = correctAnswers * this.XP_PER_CORRECT_ANSWER;

    let {level, currentXP, nextLevelXP} = currentProgression;
    currentXP += xpGained;

    // Vérification du passage de niveau
    while (currentXP >= nextLevelXP) {
      level++;
      currentXP -= nextLevelXP;
      nextLevelXP = Math.floor(nextLevelXP * this.XP_MULTIPLIER);
    }

    this.saveProgression({level, currentXP, nextLevelXP});
  }

}
