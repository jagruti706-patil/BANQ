import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appToggleSidePanel]'
})
export class ToggleSidePanelDirective {

  constructor() {
  }

  @HostListener('click', ['$event.target'])

  onClick(btn) {
    $(".side-panel").toggleClass("side-panel-open")

  }
}
