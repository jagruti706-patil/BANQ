import { clsPermission } from "./settings/clspermission";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { CookieService } from "ngx-cookie-service";
import { Navbarlinks } from "src/app/Model/navbarlinks";

@Injectable({
  providedIn: "root",
})
export class DatatransaferService {
  EditClientid: string = "0";
  nopermission: boolean = false;
  IdleTime: string;
  TimeOutTime: string;
  SelectedUserid: string;
  SelectedGCPUserid: number;
  SelectedRoleid: number;
  SelectedRoleName: string;
  defaultNavigation: BehaviorSubject<string> = new BehaviorSubject<string>("");
  applicationCode: number;
  applicationName: string;
  loginUserName: string;
  loginUserID: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  loginGCPUserID: BehaviorSubject<string> = new BehaviorSubject<string>("");

  loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFilesProcessing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  loginName: BehaviorSubject<string> = new BehaviorSubject<string>("");
  roleName: BehaviorSubject<string> = new BehaviorSubject<string>("");
  navigation: BehaviorSubject<string> = new BehaviorSubject<string>("");

  gcpUseremail: BehaviorSubject<string> = new BehaviorSubject<string>("");
  visitor_ip: BehaviorSubject<string> = new BehaviorSubject<string>("");
  visitor_browser: BehaviorSubject<string> = new BehaviorSubject<string>("");

  visitor_continent: BehaviorSubject<string> = new BehaviorSubject<string>("");
  visitor_country: BehaviorSubject<string> = new BehaviorSubject<string>("");
  visitor_countryCode: BehaviorSubject<string> = new BehaviorSubject<string>(
    ""
  );
  visitor_city: BehaviorSubject<string> = new BehaviorSubject<string>("");
  visitor_region: BehaviorSubject<string> = new BehaviorSubject<string>("");

  navbarLinkspermission: Navbarlinks = new Navbarlinks();
  testnav: Navbarlinks = new Navbarlinks();
  navSubject: BehaviorSubject<Navbarlinks> = new BehaviorSubject<Navbarlinks>(
    this.testnav
  );

  objPermission: clsPermission = new clsPermission();
  public newpermission: BehaviorSubject<clsPermission> = new BehaviorSubject<
    clsPermission
  >(this.objPermission);

  currentclientftpid: Subject<string> = new Subject<string>();
  currentclientid: Subject<string> = new Subject<string>();
  currentclientcode: Subject<string> = new Subject<string>();
  currentclientname: Subject<string> = new Subject<string>();
  clientnewftpcode: Subject<string> = new Subject<string>();

  clientftpnotsaved: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  clientftpsaved: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  mastererafileid: string = "0";
  clientid: string = "0";
  TS835id: string = "0";
  mastererafilename: string = "";
  filecheckno: string = "";
  spliterafileid: string = "0";
  spliteflag: boolean = false;
  splitplbfileid: string = "0";

  public unmatchedclaimcount: number = 0;
  public totalunmatchedcount: number = 0;
  public totalunprocesscount: number = 0;
  public totalunprocessmastercount: number = 0;
  public totalunprocesssplitcount: number = 0;
  public holdpaymentcount: number = 0;
  public displayrematchclaimtab: boolean = false;
  public totalinprocesscount: number = 0;
  public totalinprocessmastercount: number = 0;
  public totalinprocesssplitcount: number = 0;

  constructor(private router: Router, private cookieService: CookieService) {}

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  logout() {
    // console.log("logout()  dataservice");

    this.cookieService.delete("UID");
    this.cookieService.delete("AID");
    this.loggedIn.next(false);

    window.location.assign(environment.ssoServiceLogoutUrl);
  }
}
