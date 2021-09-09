import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";
import { ActivatedRoute, Router } from "@angular/router";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-setsessionid",
  templateUrl: "./setsessionid.component.html",
  styleUrls: ["./setsessionid.component.css"]
})
export class SetsessionidComponent implements OnInit {
  private clsUtility: Utility;
  UID: string;
  AID: string;

  constructor(
    private cookieService: CookieService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.clsUtility = new Utility(toastr);
    // this.route.params.subscribe(params => console.log(params));
    this.route.params.subscribe(params => params);
  }

  ngOnInit() {
    try {
      //alert('init');
      this.UID = "";
      this.AID = "";
      // console.log("SetsessionidComponent UID: " + this.UID);
      this.route.params.forEach(urlParams => {
        this.UID = urlParams["uid"];
        this.AID = urlParams["aid"];
      });
      
      if (this.route.routeConfig.path.includes("clrSID")) {
        // console.log("clear cookie");
        this.cookieService.delete("UID");
        this.cookieService.delete("AID");
      } else {
        // console.log("set cookie");
        // this.cookieService.set("UID", this.UID);
        // this.cookieService.set("AID", this.AID);
        if (environment.currentEnvironment === "Local") {
          this.cookieService.set(
            "UID",
            this.UID,
            31,
            undefined,
            undefined,
            false,
            "Lax"
          );
          this.cookieService.set(
            "AID",
            this.AID,
            31,
            undefined,
            undefined,
            false,
            "Lax"
          );
        } else {
          this.cookieService.set(
            "UID",
            this.UID,
            31,
            undefined,
            undefined,
            true,
            "None"
          );
          this.cookieService.set(
            "AID",
            this.AID,
            31,
            undefined,
            undefined,
            true,
            "None"
          );
        }
        var loginurl: any = "";
        this.router.navigate([loginurl]);
      }

      // if (this.route.routeConfig.path.includes("clrSID")) {
      //   // console.log("clear cookie setsessionid");
      //   this.cookieService.delete("UID");
      //   this.cookieService.delete("AID");
      // } else {
      //   // console.log("set cookie");
      //   this.cookieService.set("UID", this.UID);
      //   this.cookieService.set("AID", this.AID);
      //   var loginurl: any = "";
      //   this.router.navigate([loginurl]);
      // }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
