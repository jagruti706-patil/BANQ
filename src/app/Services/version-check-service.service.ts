import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class VersionCheckServiceService {
  private clsUtility: Utility;
  public currentHash;
  public baseEndpoint = environment.baseServiceUrl;
  public currentversion: any = "";
  public oldversion: any = "";
  public hashChanged: boolean = false;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {
    this.clsUtility = new Utility(toastr);
  }

  public checkVersion() {
    // console.log("checkVersion start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    try {
      this.http.get(this.baseEndpoint + "GetReleaseHistoryId").subscribe(
        (response: any) => {
          // console.log("checkVersion.subscribe start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
          this.currentversion = response;
          this.oldversion = localStorage.getItem("version");

          if (this.oldversion != null) {
            this.hashChanged = this.hasHashChanged(
              this.currentversion,
              this.oldversion
            );
          } else {
            // console.log("Local Storage Set start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
            localStorage.setItem("version", this.currentversion);
            location.reload();
            // console.log("Local Storage Set end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
          }

          if (this.hashChanged) {
            // console.log("Version Changed start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
            // alert("Version Changed");
            location.reload();
            localStorage.setItem("version", this.currentversion);
            // console.log("Version Changed end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
          }
          // console.log("checkVersion.subscribe end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
        },
        (err) => {
          console.error(err, "Could not get version");
        }
      );
      // console.log("checkVersion end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public hasHashChanged(currentHash, newHash) {
    try {
      if (
        currentHash != null &&
        currentHash != undefined &&
        newHash != null &&
        newHash != undefined
      ) {
        if (currentHash == newHash) {
          return false;
        } else {
          return true;
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
