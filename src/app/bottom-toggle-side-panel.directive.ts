import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[appBottomToggleSidePanel]",
})
export class BottomToggleSidePanelDirective {
  constructor() {}

  @HostListener("click", ["$event.target"])
  onClick(btn) {
    $(".side-panel-bottom").toggleClass("side-panel-open-bottom");
  }
}
