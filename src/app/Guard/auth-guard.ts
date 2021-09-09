import { clsPermission } from "./../Services/settings/clspermission";
import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { CookieService } from "ngx-cookie-service";
import { environment } from "src/environments/environment";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { DatePipe } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  localstoragevalue: any;
  localstorageToken: string;

  clsUtility: Utility;
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private cookieService: CookieService,
    private dataservice: DatatransaferService,
    private datePipe: DatePipe
  ) {
    this.clsUtility = new Utility(toastr);
  }
  public isAuthenticate = false;
  // private cookieService: CookieService
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // console.log(
    //   "canActivate start : ",
    //   this.datePipe.transform(Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ")
    // );
    if (this.cookieService.check("UID") && this.cookieService.check("AID")) {
      // console.log("canactivate in if");
      // alert("canactivate");
      this.getIdealTimer();
      this.isAuthenticate = true;
      return true;
    }
    // alert("canactivate no UID and AID");
    this.isAuthenticate = false;
    window.location.assign(environment.ssoServiceLoginUrl);
    // console.log(
    //   "canActivate end : ",
    //   this.datePipe.transform(Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ")
    // );
    return false;
  }

  loginuser: number;
  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // console.log(
    //   "canActivateChild start : ",
    //   this.datePipe.transform(Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ")
    // );
    // console.log("canactivatechild");
    if (this.cookieService.check("UID") && this.cookieService.check("AID")) {
      // console.log("canactivatechild if");
      this.checklogin();
      this.getIdealTimer();
      var defaultURL: string = "";

      // this.dataservice.defaultNavigation.subscribe(data => {
      //   defaultURL = data;
      // });

      this.dataservice.loginUserID.subscribe(
        (userid) => (this.loginuser = userid)
      );

      if (next.routeConfig.path.toString() != "nomenupermission") {
        if (this.CheckPermission(next.routeConfig.path.toString())) {
          this.clsUtility.showInfo(
            "User does not have permission to access '" +
              next.routeConfig.path.toString() +
              "'."
          );
          this.router.navigate(["/nomenupermission"]);
        }
      }

      this.isAuthenticate = true;
      return true;
    }
    // console.log("canactivatechild return false");
    this.isAuthenticate = false;
    window.location.assign(environment.ssoServiceLoginUrl);
    // console.log(
    //   "canActivateChild end : ",
    //   this.datePipe.transform(Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ")
    // );
    return false;
  }

  checklogin() {
    // console.log(
    //   "checklogin start : ",
    //   this.datePipe.transform(Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ")
    // );
    // console.log("CheckLogin : " + localStorage.getItem("currentUser"));
    this.localstoragevalue = localStorage.getItem("currentUser");
    this.localstorageToken = this.cookieService.get("AID");

    if (this.localstoragevalue != null && this.localstorageToken != null) {
      const user = JSON.parse(this.localstoragevalue);
      this.dataservice.loginName.next(user.firstname + " " + user.lastname);

      // if (user.applications.length > 0) {
      //   this.dataservice.loginName.next(user.firstname + " " + user.lastname);
      //   this.dataservice.roleName.next(user.roles[0].rolename);
      //   // this.dataservice.roleName.next(user.roles.rolename);
      //   this.dataservice.navigation.next(user.defaultnavigation);
      // }

      var links = localStorage.getItem("links");
      if (typeof links !== "undefined" && links !== null) {
        this.dataservice.newpermission.next(JSON.parse(links));
        this.dataservice.objPermission = JSON.parse(links);
      }
    } else {
      window.location.assign(environment.ssoServiceLoginUrl);
    }
    // console.log("checklogin end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
  }

  public userpermission = new clsPermission();
  CheckPermission(clickedLink: string): boolean {
    // console.log("CheckPermission start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    var IsHavingPermission: boolean = false;
    // console.log("clickedLink", clickedLink);

    switch (clickedLink) {
      case "Dashboard":
        if (!this.dataservice.objPermission.dashboardmenu) {
          IsHavingPermission = true;
        }
        break;
      case "Summary":
        if (!this.dataservice.objPermission.summarymenu) {
          IsHavingPermission = true;
        }
        break;
      case "Files":
        if (!this.dataservice.objPermission.filesaccessmenu) {
          IsHavingPermission = true;
        }
        break;
      case "filesummary":
        if (!this.dataservice.objPermission.filedatamenu) {
          IsHavingPermission = true;
        }
        break;
      case "Configuration":
        if (!this.dataservice.objPermission.configurationmenu) {
          IsHavingPermission = true;
        }
        break;
      case "ServiceController":
        if (!this.dataservice.objPermission.servicecontrollermenu) {
          IsHavingPermission = true;
        }
        break;
      case "clientlist":
        if (!this.dataservice.objPermission.clientconfiguration) {
          IsHavingPermission = true;
        }
        break;
      case "subclientlist":
        if (!this.dataservice.objPermission.subclientconfiguration) {
          IsHavingPermission = true;
        }
        break;
      case "userclientmappinglist":
        if (!this.dataservice.objPermission.userclientconfiguration) {
          IsHavingPermission = true;
        }
        break;
      case "providermappinglist":
        if (!this.dataservice.objPermission.providermappingconfiguration) {
          IsHavingPermission = true;
        }
        break;
      case "emailconfigurationlist":
        if (!this.dataservice.objPermission.emailconfiguration) {
          IsHavingPermission = true;
        }
        break;
      case "allunmatchedclaimdetails":
        if (!this.dataservice.objPermission.allunmatchedclaims) {
          IsHavingPermission = true;
        }
        break;
      case "unprocess":
        if (!this.dataservice.objPermission.unprocessmenu) {
          IsHavingPermission = true;
        }
        break;
      case "masterfilesunprocess":
        if (!this.dataservice.objPermission.masterfilesunprocessmenu) {
          IsHavingPermission = true;
        }
        break;
      case "unprocesssplitfiles":
        if (!this.dataservice.objPermission.splitfilesunprocessmenu) {
          IsHavingPermission = true;
        }
        break;
      case "divisionalsplitFiles":
        if (!this.dataservice.objPermission.divisionalsplitfilesmenu) {
          IsHavingPermission = true;
        }
        break;
      case "splitparameters":
        if (!this.dataservice.objPermission.splitparameters) {
          IsHavingPermission = true;
        }
        break;
      case "allclaims":
        if (!this.dataservice.objPermission.allclaims) {
          IsHavingPermission = true;
        }
        break;
      case "payeridentifier":
        if (!this.dataservice.objPermission.payeridentifierconfiguration) {
          IsHavingPermission = true;
        }
        break;
      case "providerothermapping":
        if (!this.dataservice.objPermission.providerothermappingconfiguration) {
          IsHavingPermission = true;
        }
        break;
      case "allunmatchedplbdetails":
        if (!this.dataservice.objPermission.allunmatchedplbs) {
          IsHavingPermission = true;
        }
        break;
      case "tabunmatch":
        if (!this.dataservice.objPermission.unmatchmenu) {
          IsHavingPermission = true;
        }
        break;
      case "myfiles":
        if (!this.dataservice.objPermission.myfilesmenu) {
          IsHavingPermission = true;
        }
        break;
      case "pendingdownloaded":
        if (!this.dataservice.objPermission.pendingdownloaded) {
          IsHavingPermission = true;
        }
        break;
      case "downloaded":
        if (!this.dataservice.objPermission.downloaded) {
          IsHavingPermission = true;
        }
        break;
      case "MyAccount":
        if (!this.dataservice.objPermission.myaccountmenu) {
          IsHavingPermission = true;
        }
        break;
      case "practicefilesummary":
        if (!this.dataservice.objPermission.practicefilesummary) {
          IsHavingPermission = true;
        }
        break;
      case "manuallymatchedclaimdetails":
        if (!this.dataservice.objPermission.manuallymatchedclaim) {
          IsHavingPermission = true;
        }
        break;
      case "holdpayment":
        if (!this.dataservice.objPermission.holdpaymentaccess) {
          IsHavingPermission = true;
        }
        break;
      case "practicereportingconfiguration":
        if (!this.dataservice.objPermission.practicereportingconfiguration) {
          IsHavingPermission = true;
        }
        break;
      case "rematchclaim":
        if (!this.dataservice.objPermission.rematchclaim || !this.dataservice.displayrematchclaimtab) {
          IsHavingPermission = true;
        }
        break;
      case "inprocess":
        if (!this.dataservice.objPermission.inprocessmenu) {
          IsHavingPermission = true;
        }
        break;
      case "inprocessmasterfiles":
        if (!this.dataservice.objPermission.masterfilesinprocessmenu) {
          IsHavingPermission = true;
        }
        break;
      case "inprocesssplitfiles":
        if (!this.dataservice.objPermission.splitfilesinprocessmenu) {
          IsHavingPermission = true;
        }
        break;
    }

    // console.log("CheckPermission end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    return IsHavingPermission;
  }
  getIdealTimer() {
    try {
      // console.log("getIdealTimer start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
      // this.subscription.add
      this.localstoragevalue = localStorage.getItem("timer");
      if (this.localstoragevalue != null && this.localstorageToken != null) {
        const timer = JSON.parse(this.localstoragevalue);
        this.dataservice.IdleTime = timer["idealtime"];
        this.dataservice.TimeOutTime = timer["timeouttime"];
      }
      // console.log("getIdealTimer end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
