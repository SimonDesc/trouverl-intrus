import { Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[borderFeedback]',
  standalone: true
})
export class BorderFeedbackDirective{
  private currentTimeout: any;
  private readonly ANIMATION_DURATION = 2000;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.addKeyframes();
  }

  ngOnInit() {
    this.initializeStyles();
  }

  private initializeStyles() {
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'border', '1px solid transparent');
  }


  @Input() set borderFeedback(isCorrect: boolean | null) {
    if (isCorrect === undefined || isCorrect === null) {
      this.resetStyles();
      return;
    }

    if (isCorrect) {
      this.setSuccessFeedback();
    } else {
      this.setErrorFeedback();
    }

  }


  private setSuccessFeedback() {
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'border', '3px solid #4CAF50');
    this.renderer.setStyle(element, 'animation', 'correctShake 0.5s ease');

    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }

    this.currentTimeout = setTimeout(() => {
      this.resetStyles();
    }, this.ANIMATION_DURATION);
  }

  private setErrorFeedback() {
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'border', '3px solid #FF5252');
    this.renderer.setStyle(element, 'animation', 'errorShake 0.5s ease');

    setTimeout(() => {
      this.renderer.setStyle(element, 'animation', 'none');
    }, 500);
  }

  private resetStyles() {
    const element = this.el.nativeElement;
    this.renderer.setStyle(element, 'border', '1px solid transparent');
    this.renderer.setStyle(element, 'animation', 'none');
  }

  private addKeyframes() {
    if (!document.querySelector('#feedbackAnimations')) {
      const style = document.createElement('style');
      style.id = 'feedbackAnimations';
      style.textContent = `
        @keyframes correctShake {
          0% { transform: scale(1) rotate(0); }
          25% { transform: scale(1.05) rotate(2deg); }
          50% { transform: scale(1.05) rotate(-2deg); }
          75% { transform: scale(1.05) rotate(2deg); }
          100% { transform: scale(1) rotate(0); }
        }

        @keyframes errorShake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  ngOnDestroy() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }
  }
}
