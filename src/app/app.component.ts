import { Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  constructor(private route: Router) {
    const navEndEvent$ = route.events.pipe(
      filter(e => e instanceof NavigationEnd)
    );    
  } //constructor

  title = "HUB";

  ngOnInit() {}
}
