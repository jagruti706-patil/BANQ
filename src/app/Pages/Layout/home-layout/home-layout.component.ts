import { Component, OnInit } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { Idle, DEFAULT_INTERRUPTSOURCES } from "@ng-idle/core";
import { Keepalive } from "@ng-idle/keepalive";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Api } from "src/app/Services/api";
import { isNullOrUndefined } from "util";

// declare let gtag: Function;
declare var $: any;

@Component({
  selector: "app-home-layout",
  templateUrl: "./home-layout.component.html",
  styleUrls: ["./home-layout.component.css"],
})
export class HomeLayoutComponent implements OnInit {
  idleState = "Not started.";
  timedOut = false;
  lastPing?: Date = null;
  username: string;
  counter: string;
  hideIdleModal: boolean = true;
  percent: number = 0;
  percentIncrease: number = 0;
  idletime: number = 0;
  timeouttime: number = 0;
  constructor(
    private route: Router,
    private idle: Idle,
    private keepalive: Keepalive,
    private router: Router,
    private datatransfer: DatatransaferService,
    private api: Api
  ) {
    const navEndEvent$ = route.events.pipe(
      filter((e) => e instanceof NavigationEnd)
    );

    // navEndEvent$.subscribe((e: NavigationEnd) => {
    //   gtag("config", "UA-108651057-6", { page_path: e.urlAfterRedirects });
    //   // gtag('set', {'user_id': 'USER_ID'});
    // });
    this.username = this.datatransfer.loginUserName;
    // console.log(this.datatransfer.IdleTime);
    // console.log(this.datatransfer.TimeOutTime);
    // idle.setIdle(+this.datatransfer.IdleTime);
    this.idletime = +Number(
      (this.datatransfer.IdleTime != null && this.datatransfer.IdleTime != undefined)
        ? this.datatransfer.IdleTime
        : 1800
    );
    this.timeouttime = +Number(
      !isNullOrUndefined(this.datatransfer.TimeOutTime)
        ? this.datatransfer.TimeOutTime
        : 3600
    );
    idle.setIdle(this.idletime);
    // idle.setIdle(5);
    idle.setTimeout(this.timeouttime);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.percentIncrease = 100 / this.timeouttime;

    idle.onIdleEnd.subscribe(() => {
      // alert("in No longer idle");
      if (!this.hideIdleModal) {
        this.idleState = "No longer idle.";
        // console.log(this.idleState);
        this.reset();
      }
    });

    idle.onTimeout.subscribe(() => {
      if (!this.hideIdleModal) {
        this.idleState = "Timed out!";
        this.timedOut = true;
        // console.log(this.idleState);
        this.logout();
      }
      // this.router.navigate(["/"]);
    });

    idle.onIdleStart.subscribe(() => {
      if (!this.hideIdleModal) {
        this.idleState = "You've gone idle!";
        // console.log(this.idleState);
        $("#idleModel").modal("show");
      }
    });

    idle.onTimeoutWarning.subscribe((countdown) => {
      this.counter = countdown;
      this.percent = this.percent + this.percentIncrease;
      this.idleState = "You will time out in " + countdown + " seconds!";
      // console.log(this.idleState);
    });

    // sets the ping interval to 15 seconds
    keepalive.interval(15);

    // keepalive.onPing.subscribe(() => (this.lastPing = new Date()));

    this.reset();
  } //constructor

  ngOnInit() {
    this.datatransfer.isFilesProcessing.subscribe((downloadInProgress) => {
      this.hideIdleModal = downloadInProgress;
      if (!downloadInProgress) {
        this.reset();
      }
    });
  }

  reset() {
    // console.log("in reset");
    this.idle.watch();
    //xthis.idleState = 'Started.';
    this.timedOut = false;
    this.percent = 0;
    this.counter = "" + this.timeouttime;
  }

  hideChildModal(): void {
    $("#idleModel").modal("hide");
  }

  stay() {
    $("#idleModel").modal("hide");
    this.reset();
  }

  logout() {
    $("#idleModel").modal("hide");
    this.api.insertActivityLog("Idle Time logged out", "Logout", "Logout");
    setTimeout(() => {
      localStorage.clear();
      this.datatransfer.loginGCPUserID.next("");
      this.datatransfer.SelectedRoleid = 0;
      this.datatransfer.logout();
    }, 1500);
  }
}
