import { Directive, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: 'a[appExternalUrl]'
})
export class ExternalUrlDirective {

  constructor(private el: ElementRef, private router: Router) {}

    @HostListener('click', ['$event'])
    clicked(event: Event) {
        const url = this.el.nativeElement.href;
        // alert(url);
        // const url = 'https://portal.myqone.com/';
        if (!url) {
            return;
        }

        this.router.navigate(['/externalRedirect', { externalUrl: url }], {
            skipLocationChange: true,
        });

        event.preventDefault();
    }

}
