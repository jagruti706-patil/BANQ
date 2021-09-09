import { Api } from "src/app/Services/api";
import {
  clsPermission,
  permissionlist,
} from "./../../Services/settings/clspermission";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MasterdataService } from "src/app/Services/masterdata.service";
import { environment } from "src/environments/environment";
import { CookieService } from "ngx-cookie-service";
import { CoreauthService } from "src/app/Services/coreauth.service";
import { Utility, enumNavbarLinks } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Navbarlinks } from "src/app/Model/navbarlinks";
import { AuthUserDetails } from "src/app/Model/login";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse
} from "@angular/common/http";
// import {
//   Http,
//   RequestOptions,
//   URLSearchParams,
//   HttpModule,
//   Headers,
// } from "@angular/http";
import { SubSink } from "subsink";
import { isNullOrUndefined } from "util";
import { VersionCheckServiceService } from "../../Services/version-check-service.service";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit, OnDestroy {
  private clsUtility: Utility;
  loadinglogin = false;
  queryparams: any;
  localstoragevalue: any;
  localstorageToken: string;
  private subscription = new SubSink();
  Storage = new AuthUserDetails();

  result: any;
  georesult: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private AuthService: CoreauthService,
    private cookieService: CookieService,
    private toastr: ToastrService,
    private masterService: MasterdataService,
    private dataservice: DatatransaferService,    
    private httpClient: HttpClient,
    // public http: Http,
    private datatransfer: DatatransaferService,
    public api: Api,
    public versioncheck: VersionCheckServiceService,
    private datePipe: DatePipe
  ) {
    this.clsUtility = new Utility(toastr);
  }

  ngOnInit() {
    try {
      // console.log("Login start ngOnInit() : ", this.datePipe.transform( this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ")));
      this.getIdealTimer();
      this.getversion();
      this.getIP();
      // console.log("Login end ngOnInit() : ", this.datePipe.transform( this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ")));
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  GetUserRoleName(roleid: any) {
    try {
      this.subscription.add(
        this.masterService.getRoleName(roleid.toString()).subscribe((data) => {
          // console.log(data);
        })
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getIP(){
    try {    
      this.subscription.add(
        this.httpClient
          .get("https://extreme-ip-lookup.com/json/")
          .map((res3) => res3)
          .subscribe(
            (res3) => {
              // console.log("Getting IP.subscribe start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
              this.georesult = res3;
              if (this.georesult === undefined) {
                this.Storage.visitorip = "";
                this.Storage.continent = "";
                this.Storage.country = "";
                this.Storage.countryCode = "";
                this.Storage.city = "";
                this.Storage.region = "";
  
                this.AuthLogin();
              } else {
                if (this.georesult.query !== undefined) {
                  this.Storage.visitorip = this.georesult.query;
                  this.Storage.continent = this.georesult.continent;
                  this.Storage.country = this.georesult.country;
                  this.Storage.countryCode = this.georesult.countryCode;
                  this.Storage.city = this.georesult.city;
                  this.Storage.region = this.georesult.region;

                  this.AuthLogin();
                } else {
                  this.Storage.visitorip = "";
                  this.Storage.continent = "";
                  this.Storage.country = "";
                  this.Storage.countryCode = "";
                  this.Storage.city = "";
                  this.Storage.region = "";

                  this.AuthLogin();
                }
              }
            },
            (err) => {
              this.AuthLogin();
            }
          )
      );
    } catch (error) {
      this.AuthLogin();
    }
  }

  AuthLogin(): any {
    // console.log("AuthLogin start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));    
    try {
      var uid: string = this.cookieService.get("UID");
      this.subscription.add(
        this.AuthService.getAuthorizeUserForApp(uid).subscribe((data) => {
          // console.log("AuthLogin.subscribe start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
          // console.log(data);
          this.loadinglogin = true;
          if (data != null) {
            // console.log("get AuthUserDetails : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
            // this.getIdealTimer();           
            this.Storage.firstname = data.firstname;
            this.Storage.lastname = data.lastname;
            this.Storage.userid = data.userid;
            this.Storage.username = data.username;

            this.Storage.roles = data.roles;
            this.Storage.defaultnavigation = this.GetDafaultNavigation(
              data.rolename
            );
            this.dataservice.defaultNavigation.next(
              this.GetDafaultNavigation(data.rolename)
            );

            this.dataservice.SelectedUserid = data.userid.toString();
            this.dataservice.SelectedGCPUserid = data.userid;

            if (data.roles.length > 0) {
              this.dataservice.SelectedRoleid = data.roles[0].roleid;
              this.dataservice.SelectedRoleName = data.roles[0].rolename;
            }

            this.dataservice.applicationCode = 1;
            this.dataservice.applicationName = "HUB";
            this.dataservice.loginUserName = data.username;

            this.Storage.visitorbrowser = this.getbroweser();
            
            localStorage.setItem(
              "currentUser",
              JSON.stringify(this.Storage)
            );
            // console.log("currentUser set localstorage end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
            this.logforlogin();
            //localStorage.setItem("currentUser", JSON.stringify(Storage));
            // console.log("getUserPermission : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
            this.getUserPermission(this.dataservice.SelectedUserid);

            this.loadinglogin = false;

            return;
          } else {
            // Storage details
            // console.log("Login else");
            this.loadinglogin = false;
            return;
          }
        })
      );
      // console.log("Getting IP end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
      // console.log("AuthLogin end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
      // console.log("Login Component : " + JSON.stringify(data));
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getIdealTimer() {
    // console.log("getIdealTimer start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    try {
      // this.subscription.add

      let timer: { idealtime: string; timeouttime: string } = {
        idealtime: "300",
        timeouttime: "60",
      };
      this.AuthService.getIdleTimer().subscribe((datatimer) => {
        // console.log("getIdealTimer.subscribe start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
        if (datatimer != null && datatimer != undefined ) {
          datatimer.forEach((element) => {
            // console.log("getIdealTimer.forEach start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
            if (element["settingname"] == "idletime") {
              // this.dataservice.IdleTime = timer["idealtime"];
              timer.idealtime = element["settingvalue"];
            }
            if (element["settingname"] == "timeouttime") {
              // this.dataservice.TimeOutTime = timer["timeouttime"];
              timer.timeouttime = element["settingvalue"];
            }
          });
        }
        // console.log("timer set localstorage : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
        localStorage.setItem("timer", JSON.stringify(timer));
        // console.log("getIdealTimer.subscribe end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
      });
    } catch (error) {
      this.clsUtility.LogError(error);
    }
    // console.log("getIdealTimer end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
  }

  logforlogin() {
    // console.log("logforlogin start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    try {
      this.localstoragevalue = localStorage.getItem("currentUser");
      if (this.localstoragevalue != null && this.localstorageToken != null) {
        const user = JSON.parse(this.localstoragevalue);
        this.datatransfer.loginName.next(user.firstname + " " + user.lastname);
        this.datatransfer.gcpUseremail.next(user.username);
        this.datatransfer.visitor_ip.next(user.visitorip);
        this.datatransfer.visitor_browser.next(user.visitorbrowser);
        this.datatransfer.visitor_continent.next(user.continent);
        this.datatransfer.visitor_country.next(user.country);
        this.datatransfer.visitor_countryCode.next(user.countryCode);
        this.datatransfer.visitor_city.next(user.city);
        this.datatransfer.visitor_region.next(user.region);
      }
      this.api.insertActivityLog("User Logged in", "Login", "Login");
      // console.log("logforlogin end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  GetDafaultNavigation(arg0: any): string {
    // console.log("GetDafaultNavigation start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    try {
      var navigation = "";
      // console.log(this.datatransfer.SelectedRoleName);
      switch (arg0) {
        case "System Admin":
          navigation = "Summary";
          break;
        default:
          navigation = "Summary";
          break;
      }
      // console.log("GetDafaultNavigation end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
      return navigation;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getUserPermission(userid: string): any {
    try {
      // console.log("getUserPermission start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
      var navbarlinks = new Navbarlinks();
      this.subscription.add(
        this.AuthService.getUserPermission(userid).subscribe((data) => {
          // console.log("getUserPermission.subscribe start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
          var objtemppermission = data;
          if (
            typeof objtemppermission !== "undefined" &&
            objtemppermission !== null
          ) {
            // console.log("getUserPermission get clsPermission : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
            var objPerm = new clsPermission();
            if (data.length > 0) {
              for (const permission of data) {
                // console.log("check users Permission start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                switch (permission.permissioncode.toLowerCase()) {
                  case permissionlist.dashboardmenu:
                    objPerm.dashboardmenu = true;
                    break;
                  case permissionlist.filedatamenu:
                    objPerm.filedatamenu = true;
                    break;
                  case permissionlist.filesaccessmenu:
                    objPerm.filesaccessmenu = true;
                    break;
                  case permissionlist.servicecontrollermenu:
                    objPerm.servicecontrollermenu = true;
                    break;
                  case permissionlist.summarymenu:
                    objPerm.summarymenu = true;
                    break;
                  case permissionlist.configurationmenu:
                    objPerm.configurationmenu = true;
                    break;
                  case permissionlist.clientconfiguration:
                    objPerm.clientconfiguration = true;
                    break;
                  case permissionlist.providerconfiguration:
                    objPerm.providerconfiguration = true;
                    break;
                  case permissionlist.providermappingconfiguration:
                    objPerm.providermappingconfiguration = true;
                    break;
                  case permissionlist.subclientconfiguration:
                    objPerm.subclientconfiguration = true;
                    break;
                  case permissionlist.userclientconfiguration:
                    objPerm.userclientconfiguration = true;
                    break;
                  case permissionlist.emailconfiguration:
                    objPerm.emailconfiguration = true;
                    break;
                  case permissionlist.fileunprocesslogs:
                    objPerm.fileunprocesslogs = true;
                    break;
                  case permissionlist.allunmatchedclaims:
                    objPerm.allunmatchedclaims = true;
                    break;
                  case permissionlist.unprocessmenu:
                    objPerm.unprocessmenu = true;
                    break;
                  case permissionlist.masterfilesunprocessmenu:
                    objPerm.masterfilesunprocessmenu = true;
                    break;
                  case permissionlist.splitfilesunprocessmenu:
                    objPerm.splitfilesunprocessmenu = true;
                    break;
                  case permissionlist.divisionalsplitfilesmenu:
                    objPerm.divisionalsplitfilesmenu = true;
                    break;
                  case permissionlist.reprocessaccess:
                    objPerm.reprocessaccess = true;
                    break;
                  case permissionlist.reftpaccess:
                    objPerm.reftpaccess = true;
                    break;
                  case permissionlist.splitparameters:
                    objPerm.splitparameters = true;
                    break;
                  case permissionlist.allclaims:
                    objPerm.allclaims = true;
                    break;
                  case permissionlist.payeridentifierconfiguration:
                    objPerm.payeridentifierconfiguration = true;
                    break;
                  case permissionlist.providerothermappingconfiguration:
                    objPerm.providerothermappingconfiguration = true;
                    break;
                  case permissionlist.summarysystemadmincards:
                    objPerm.summarysystemadmincards = true;
                    break;
                  case permissionlist.summaryfilter:
                    objPerm.summaryfilter = true;
                    break;
                  case permissionlist.summarygroupsummarycards:
                    objPerm.summarygroupsummarycards = true;
                    break;
                  case permissionlist.summarypracticesummarycards:
                    objPerm.summarypracticesummarycards = true;
                    break;
                  case permissionlist.summarypracticedetailscards:
                    objPerm.summarypracticedetailscards = true;
                    break;
                  case permissionlist.summarypracticesummaryFTPcard:
                    objPerm.summarypracticesummaryFTPcard = true;
                    break;
                  case permissionlist.allunmatchedplbs:
                    objPerm.allunmatchedplbs = true;
                    break;
                  case permissionlist.unmatchmenu:
                    objPerm.unmatchmenu = true;
                    break;
                  case permissionlist.myfilesmenu:
                    objPerm.myfilesmenu = true;
                    break;
                  case permissionlist.pendingdownloaded:
                    objPerm.pendingdownloaded = true;
                    break;
                  case permissionlist.downloaded:
                    objPerm.downloaded = true;
                    break;
                  case permissionlist.myaccountmenu:
                    objPerm.myaccountmenu = true;
                    break;
                  case permissionlist.practicefilesummary:
                    objPerm.practicefilesummary = true;
                    break;
                  case permissionlist.sendemail:
                    objPerm.sendemail = true;
                    break;
                  case permissionlist.addgroup:
                    objPerm.addgroup = true;
                    break;
                  case permissionlist.editgroup:
                    objPerm.editgroup = true;
                    break;
                  case permissionlist.statusofgroup:
                    objPerm.statusofgroup = true;
                    break;
                  case permissionlist.addpractice:
                    objPerm.addpractice = true;
                    break;
                  case permissionlist.editpractice:
                    objPerm.editpractice = true;
                    break;
                  case permissionlist.statusofpractice:
                    objPerm.statusofpractice = true;
                    break;
                  case permissionlist.addusermapping:
                    objPerm.addusermapping = true;
                    break;
                  case permissionlist.editusermapping:
                    objPerm.editusermapping = true;
                    break;
                  case permissionlist.statusofusermapping:
                    objPerm.statusofusermapping = true;
                    break;
                  case permissionlist.addprovidermapping:
                    objPerm.addprovidermapping = true;
                    break;
                  case permissionlist.editprovidermapping:
                    objPerm.editprovidermapping = true;
                    break;
                  case permissionlist.statusofprovidermapping:
                    objPerm.statusofprovidermapping = true;
                    break;
                  case permissionlist.deleteprovidermapping:
                    objPerm.deleteprovidermapping = true;
                    break;
                  case permissionlist.addemailconfig:
                    objPerm.addemailconfig = true;
                    break;
                  case permissionlist.editemailconfig:
                    objPerm.editemailconfig = true;
                    break;
                  case permissionlist.addplbconfig:
                    objPerm.addplbconfig = true;
                    break;
                  case permissionlist.editplbconfig:
                    objPerm.editplbconfig = true;
                    break;
                  case permissionlist.statusofplbconfig:
                    objPerm.statusofplbconfig = true;
                    break;
                  case permissionlist.addproviderothermapping:
                    objPerm.addproviderothermapping = true;
                    break;
                  case permissionlist.editproviderothermapping:
                    objPerm.editproviderothermapping = true;
                    break;
                  case permissionlist.statusofproviderothermapping:
                    objPerm.statusofproviderothermapping = true;
                    break;
                  case permissionlist.deleteusermapping:
                    objPerm.deleteusermapping = true;
                    break;
                  case permissionlist.deleteplbconfig:
                    objPerm.deleteplbconfig = true;
                    break;
                  case permissionlist.claimsearchsplitparameterfilter:
                    objPerm.claimsearchsplitparameterfilter = true;
                    break;
                  case permissionlist.unmatchedselectpractice:
                    objPerm.unmatchedselectpractice = true;
                    break;
                  case permissionlist.pendingdownloaddownloadselected:
                    objPerm.pendingdownloaddownloadselected = true;
                    break;
                  case permissionlist.pendingdownloaddownloadselectedzip:
                    objPerm.pendingdownloaddownloadselectedzip = true;
                    break;
                  case permissionlist.pendingdownloaddownloadall:
                    objPerm.pendingdownloaddownloadall = true;
                    break;
                  case permissionlist.pendingdownloaddownloadallzip:
                    objPerm.pendingdownloaddownloadallzip = true;
                    break;
                  case permissionlist.downloadeddownloadselected:
                    objPerm.downloadeddownloadselected = true;
                    break;
                  case permissionlist.exporttopdfpracticefilesummary:
                    objPerm.exporttopdfpracticefilesummary = true;
                    break;
                  case permissionlist.erafilesummaryreport:
                    objPerm.erafilesummaryreport = true;
                    break;
                  case permissionlist.exporttopdfvieweob:
                    objPerm.exporttopdfvieweob = true;
                    break;
                  case permissionlist.viewepassword:
                    objPerm.viewepassword = true;
                    break;
                  case permissionlist.ftptransfer:
                    objPerm.ftptransfer = true;
                    break;
                  case permissionlist.ftptransferdownloadselected:
                    objPerm.ftptransferdownloadselected = true;
                    break;
                  case permissionlist.downloadsummarymenu:
                    objPerm.downloadsummarymenu = true;
                    break;
                  case permissionlist.downloadsummaryhubpendingfiles:
                    objPerm.downloadsummaryhubpendingfiles = true;
                    break;
                  case permissionlist.downloadsummaryftppendingfiles:
                    objPerm.downloadsummaryftppendingfiles = true;
                    break;
                  case permissionlist.downloadsummaryexportexcel:
                    objPerm.downloadsummaryexportexcel = true;
                    break;
                  case permissionlist.allunmatchedclaimsexportexcel:
                    objPerm.allunmatchedclaimsexportexcel = true;
                    break;
                  case permissionlist.allunmatchedplbsexportexcel:
                    objPerm.allunmatchedplbsexportexcel = true;
                    break;
                  case permissionlist.manuallymatchedclaim:
                    objPerm.manuallymatchedclaim = true;
                    break;
                  case permissionlist.manuallymatchedclaimexporttoexcel:
                    objPerm.manuallymatchedclaimexporttoexcel = true;
                    break;
                  case permissionlist.allunmatchedclaimsprobablepractice:
                    objPerm.allunmatchedclaimsprobablepractice = true;
                    break;
                  case permissionlist.manuallymatchedclaimrematchedclaim:
                    objPerm.manuallymatchedclaimrematchedclaim = true;
                    break;
                  case permissionlist.manuallymatchedclaimviewhistory:
                    objPerm.manuallymatchedclaimviewhistory = true;
                    break;
                  case permissionlist.viewerrorcontext:
                    objPerm.viewerrorcontext = true;
                    break;
                  case permissionlist.pendingdownloaddownloadviewcheckwiseeob:
                    objPerm.pendingdownloaddownloadviewcheckwiseeob = true;
                    break;
                  case permissionlist.practicefileviewcheckwiseeob:
                    objPerm.practicefileviewcheckwiseeob = true;
                    break;
                  case permissionlist.downloadeddownloadviewcheckwiseeob:
                    objPerm.downloadeddownloadviewcheckwiseeob = true;
                    break;
                  case permissionlist.ftptransferdownloadviewcheckwiseeob:
                    objPerm.ftptransferdownloadviewcheckwiseeob = true;
                    break;
                  case permissionlist.holdpaymentaccess:
                    objPerm.holdpaymentaccess = true;
                    break;
                  case permissionlist.holdpaymentreprocessaccess:
                    objPerm.holdpaymentreprocessaccess = true;
                    break;
                  case permissionlist.reprocessaccessoverride:
                    objPerm.reprocessaccessoverride = true;
                    break;
                  case permissionlist.exporttopdfcheckvieweob:
                    objPerm.exporttopdfcheckvieweob = true;
                    break;
                  case permissionlist.viewholdpaymenthistory:
                    objPerm.viewholdpaymenthistory = true;
                    break;
                  case permissionlist.practicereportingconfiguration:
                    objPerm.practicereportingconfiguration = true;
                    break;
                  case permissionlist.addpracticereporting:
                    objPerm.addpracticereporting = true;
                    break;
                  case permissionlist.deletepracticereporting:
                    objPerm.deletepracticereporting = true;
                    break;
                  case permissionlist.practicesendfilecopyto:
                    objPerm.practicesendfilecopyto = true;
                    break;
                  case permissionlist.rematchclaim:
                    objPerm.rematchclaim = true;
                    break;
                  case permissionlist.rematchclaimrematchedclaim:
                    objPerm.rematchclaimrematchedclaim = true;
                    break;
                  case permissionlist.rematchclaimviewhistory:
                    objPerm.rematchclaimviewhistory = true;
                    break;
                  case permissionlist.overridecontexterroraccess:
                    objPerm.overridecontexterroraccess = true;
                    break;
                  case permissionlist.practicefileexportexcel:
                    objPerm.practicefileexportexcel = true;
                    break;
                  case permissionlist.inprocessmenu:
                    objPerm.inprocessmenu = true;
                    break;
                  case permissionlist.masterfilesinprocessmenu:
                    objPerm.masterfilesinprocessmenu = true;
                    break;
                  case permissionlist.splitfilesinprocessmenu:
                    objPerm.splitfilesinprocessmenu = true;
                    break;
                  case permissionlist.filedataexportexcel:
                    objPerm.filedataexportexcel = true;
                    break; 
                  case permissionlist.reportmenu:
                    objPerm.reportmenu = true;
                    break; 
                  case permissionlist.filedistributionreportmenu:
                    objPerm.filedistributionreportmenu = true;
                    break; 
                  case permissionlist.filedistributionstatuschange:
                    objPerm.filedistributionstatuschange = true;
                    break; 
                  case permissionlist.filedistributionviewnotes:
                    objPerm.filedistributionviewnotes = true;
                    break;  
                }
                // console.log("check users Permission end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
              }
              // console.log("set permission localstorage : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
              localStorage.setItem("links", JSON.stringify(objPerm));
              this.dataservice.newpermission.next(objPerm);

              //// If menu added in Nav Bar then add it in below condition as well.
              // console.log("set users landing page start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
              if (
                objPerm.dashboardmenu == false &&
                objPerm.summarymenu == false &&
                objPerm.filesaccessmenu == false &&
                objPerm.filedatamenu == false &&
                objPerm.unmatchmenu == false &&
                objPerm.divisionalsplitfilesmenu == false &&
                objPerm.myfilesmenu == false &&
                objPerm.splitparameters == false &&
                objPerm.unprocessmenu == false &&
                objPerm.myaccountmenu == false &&
                objPerm.practicefilesummary == false &&
                objPerm.configurationmenu == false &&
                objPerm.servicecontrollermenu == false &&
                objPerm.downloadsummarymenu == false
              ) {
                this.dataservice.nopermission = true;
                // console.log("set users landing page nomenupermission : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["nomenupermission"]);
              }

              // if (objPerm.dashboardmenu) {
              //   this.router.navigate(["Dashboard"]);
              // } else
              if (
                objPerm.myfilesmenu &&
                objPerm.pendingdownloaded &&
                objPerm.downloaded
              ) {
                // console.log("set users landing page pendingdownload : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["pendingdownload"]);
              } else if (
                objPerm.myfilesmenu &&
                objPerm.pendingdownloaded &&
                !objPerm.downloaded
              ) {
                // console.log("set users landing page pendingdownload : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["pendingdownload"]);
              } else if (
                objPerm.myfilesmenu &&
                !objPerm.pendingdownloaded &&
                objPerm.downloaded
              ) {
                // console.log("set users landing page downloaded : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["downloaded"]);
              } else if (objPerm.summarymenu) {
                // console.log("set users landing page Summary : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["Summary"]);
              } else if (objPerm.filesaccessmenu) {
                // console.log("set users landing page Files : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["Files"]);
              } else if (objPerm.filedatamenu) {
                // console.log("set users landing page filedata : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["filedata"]);
              } else if (
                objPerm.unmatchmenu &&
                objPerm.allunmatchedclaims &&
                objPerm.allunmatchedplbs
              ) {
                // console.log("set users landing page allunmatchedclaimdetails : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["allunmatchedclaimdetails"]);
              } else if (
                objPerm.unmatchmenu &&
                objPerm.allunmatchedclaims &&
                !objPerm.allunmatchedplbs
              ) {
                // console.log("set users landing page allunmatchedclaimdetails : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["allunmatchedclaimdetails"]);
              } else if (
                objPerm.unmatchmenu &&
                objPerm.allunmatchedplbs &&
                !objPerm.allunmatchedclaims
              ) {
                // console.log("set users landing page allunmatchedplbdetails : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["allunmatchedplbdetails"]);
              }
              // else if (
              //   objPerm.unmatchmenu &&
              //   !objPerm.allunmatchedclaims &&
              //   !objPerm.allunmatchedplbs
              // ) {
              //   this.router.navigate(["tabunmatch"]);
              // }
              else if (objPerm.divisionalsplitfilesmenu) {
                // console.log("set users landing page divisionalsplitFiles : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["divisionalsplitFiles"]);
              } else if (objPerm.allclaims) {
                // console.log("set users landing page allclaims : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["allclaims"]);
              } else if (
                objPerm.unprocessmenu &&
                objPerm.masterfilesunprocessmenu &&
                objPerm.splitfilesunprocessmenu
              ) {
                // console.log("set users landing page masterfilesunprocess : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["masterfilesunprocess"]);
              } else if (
                objPerm.unprocessmenu &&
                objPerm.masterfilesunprocessmenu &&
                !objPerm.splitfilesunprocessmenu
              ) {
                // console.log("set users landing page masterfilesunprocess : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["masterfilesunprocess"]);
              } else if (
                objPerm.unprocessmenu &&
                objPerm.splitfilesunprocessmenu &&
                !objPerm.masterfilesunprocessmenu
              ) {
                // console.log("set users landing page unprocesssplitfiles : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["unprocesssplitfiles"]);
              } else if (objPerm.configurationmenu) {
                // console.log("set users landing page Configuration : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["Configuration"]);
              } else if (objPerm.myaccountmenu) {
                // console.log("set users landing page MyAccount : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["MyAccount"]);
              } else if (objPerm.practicefilesummary) {
                // console.log("set users landing page practicefilesummary : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["practicefilesummary"]);
              } else if (objPerm.servicecontrollermenu) {
                // console.log("set users landing page ServiceController : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["ServiceController"]);
              } else if (
                objPerm.downloadsummarymenu &&
                objPerm.downloadsummaryhubpendingfiles &&
                objPerm.downloadsummaryftppendingfiles
              ) {
                // console.log("set users landing page hubpendingsummary : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["hubpendingsummary"]);
              } else if (
                objPerm.downloadsummarymenu &&
                objPerm.downloadsummaryhubpendingfiles &&
                !objPerm.downloadsummaryftppendingfiles
              ) {
                // console.log("set users landing page hubpendingsummary : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["hubpendingsummary"]);
              } else if (
                objPerm.downloadsummarymenu &&
                objPerm.downloadsummaryftppendingfiles &&
                !objPerm.downloadsummaryhubpendingfiles
              ) {
                // console.log("set users landing page ftppendingsummary : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.router.navigate(["ftppendingsummary"]);
              } else {
                // console.log("set users landing page nomenupermission : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
                this.dataservice.nopermission = true;
                this.router.navigate(["nomenupermission"]);
              }
            } else {
              // console.log("Unable to read permission objtemppermission");
              // console.log("set users landing page nomenupermission : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
              this.dataservice.nopermission = true;
              this.router.navigate(["nomenupermission"]);
            }
          } else {
            // console.log("set users landing page nomenupermission : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
            // console.log("Unable to read permission objtemppermission");
            this.dataservice.nopermission = true;
            this.router.navigate(["nomenupermission"]);
          }
          // console.log("set users landing page end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
          // console.log("getUserPermission.subscribe end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
        })
      );
      // console.log("getUserPermission end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public getbroweser() {
    // console.log("getbroweser start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    let browserName;
    try {
      const agent = window.navigator.userAgent.toLowerCase();
      // console.log("agent");
      // console.log(agent);
      //console.log(agent);  Trigger Build
      if (agent.indexOf("edge") > -1) {
        // console.log("edge");
        browserName = "edge";
      } else if (agent.indexOf("opr") > -1 && !!(<any>window).opr) {
        // console.log("opera");
        browserName = "Opera";
      } else if (agent.indexOf("chrome") > -1 && !!(<any>window).chrome) {
        // console.log("chrome");
        browserName = "Chrome";
      } else if (agent.indexOf("trident") > -1 && !!(<any>window).ie) {
        // console.log("ie");
        browserName = "Internet  Explorer";
      } else if (agent.indexOf("firefox") > -1 && !!(<any>window).firefox) {
        // console.log("firefox");
        browserName = "Firefox";
      }
      if (agent.indexOf("safari") > -1 && !!(<any>window).safari) {
        // console.log("safari");
        browserName = "Safari";
      }
      // console.log("browserName", browserName);
    } catch (error) {
      browserName = "";
    }
    // console.log("getbroweser end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    return browserName;
  }
  ngOnDestroy() {
    try {
      // console.log("ngOnDestroy start : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
      this.subscription.unsubscribe();
      // console.log("ngOnDestroy end : ", this.datePipe.transform( Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ"));
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getversion() {
    try {
      // console.log(
      //   "getversion start : ",
      //   this.datePipe.transform(Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ")
      // );
      this.versioncheck.checkVersion();
      // console.log(
      //   "getversion end : ",
      //   this.datePipe.transform(Date.now(), "dd-MM-yyyy hh:mm:ssZZZZZ")
      // );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
