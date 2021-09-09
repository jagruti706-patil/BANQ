import { Api } from "src/app/Services/api";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MasterdataService } from "src/app/Services/masterdata.service";
import { environment } from "src/environments/environment";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { CookieService } from "ngx-cookie-service";
import { Utility } from "../Model/utility";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
  public UserName = "";
  public UserRole = "";
  localstoragevalue: any;
  localstoragelinks: string;
  localstorageToken: string;

  loginName: string;
  roleName: string;
  navigation: string;

  SelectedRoleid: number;
  SelectedRoleName: string;
  clsUtility: Utility;
  appEnvironment: any = environment.currentEnvironment;

  public currentversion: any = "";

  constructor(
    private masterService: MasterdataService,
    private route: ActivatedRoute,
    private router: Router,
    private datatransfer: DatatransaferService,
    private cookieService: CookieService,  
    private api: Api
  ) {
    this.clsUtility = new Utility();
  }

  ngOnInit() {
    if (this.cookieService.check("UID") && this.cookieService.check("AID")) {
      // console.log("ngOnInit() : navbar");

      this.localstoragevalue = localStorage.getItem("currentUser");
      this.localstorageToken = this.cookieService.get("AID");
      if (this.localstoragevalue != null && this.localstorageToken != null) {
        const user = JSON.parse(this.localstoragevalue);
        // console.log("user : " + user);

        this.datatransfer.loginName.next(user.firstname + " " + user.lastname);

        this.datatransfer.gcpUseremail.next(user.username);
        this.datatransfer.visitor_ip.next(user.visitorip);
        this.datatransfer.visitor_browser.next(user.visitorbrowser);

        this.datatransfer.visitor_continent.next(user.continent);
        this.datatransfer.visitor_country.next(user.country);
        this.datatransfer.visitor_countryCode.next(user.countryCode);
        this.datatransfer.visitor_city.next(user.city);
        this.datatransfer.visitor_region.next(user.region);

        if (user.roles.lenght > 0) {
          this.datatransfer.roleName.next(user.roles[0].rolename);
        }
        // this.datatransfer.navigation.next(user.defaultnavigation);

        this.datatransfer.loginName.subscribe(data => {
          this.loginName = data;
        });
        this.datatransfer.roleName.subscribe(data => {
          this.roleName = data;
        });

        this.datatransfer.SelectedUserid = user.userid;
        this.datatransfer.loginGCPUserID.next(this.datatransfer.SelectedUserid);

        this.datatransfer.SelectedGCPUserid = user.gcpuserid;

        this.datatransfer.loginUserID.next(this.datatransfer.SelectedGCPUserid);

        this.datatransfer.loginUserName = user.username;

        if (user.applications.length > 0) {
          this.datatransfer.loginName.next(
            user.firstname + " " + user.lastname
          );
          this.datatransfer.roleName.next(user.roles[0].rolename);
          this.datatransfer.navigation.next(user.defaultnavigation);

          // this.datatransfer.roleName.next(user.roles[0].rolename);
          // // this.datatransfer.roleName.next(user.roles.rolename);
          // this.datatransfer.navigation.next(user.defaultnavigation);

          this.datatransfer.loginName.subscribe(data => {
            this.loginName = data;
          });
          this.datatransfer.roleName.subscribe(data => {
            this.roleName = data;
          });
          this.datatransfer.navigation.subscribe(data => {
            this.navigation = data;
          });

          this.datatransfer.roleName.next(user.roles[0].rolename);
          this.datatransfer.SelectedRoleid = user.roles[0].roleid;
          this.datatransfer.SelectedRoleName = user.roles[0].rolename;
          this.datatransfer.applicationCode =
            user.applications[0].applicationcode;
          this.datatransfer.applicationName =
            user.applications[0].applicationname;
          this.datatransfer.defaultNavigation.next(user.defaultnavigation);
        }

        if (localStorage.getItem("links") != null) {
          this.datatransfer.navbarLinkspermission = JSON.parse(
            localStorage.getItem("links")
          );
          if (this.datatransfer.navbarLinkspermission !== undefined) {
            this.datatransfer.navSubject.next(
              this.datatransfer.navbarLinkspermission
            );
          }
        }

        // this.datatransfer.loginName.next(user.username);
        // this.datatransfer.roleName.next(user.rolename);
        // this.datatransfer.navigation.next(user.defaultnavigation);

        // this.datatransfer.loginName.subscribe(data => {
        //   this.loginName = data;
        // });
        // this.datatransfer.roleName.subscribe(data => {
        //   this.roleName = data;
        // });
        // this.datatransfer.navigation.subscribe(data => {
        //   this.navigation = data;
        // });

        // this.datatransfer.SelectedUserid = user.userid;
        // this.datatransfer.SelectedGCPUserid = user.userid;
        // this.datatransfer.SelectedRoleid = user.roleid;
        // this.datatransfer.SelectedRoleName = user.rolename;
        // this.datatransfer.applicationCode = 1;
        // this.datatransfer.applicationName = "BANQ";
        // this.datatransfer.defaultNavigation.next(user.defaultnavigation);
        // this.datatransfer.loginUserName = user.username;
        // this.datatransfer.loginUserID.next(this.datatransfer.SelectedGCPUserid);
        // this.datatransfer.loginGCPUserID.next(this.datatransfer.SelectedUserid);
      }
    } else {
      window.location.assign(environment.ssoServiceLoginUrl);
    }

    // this.route.queryParams.subscribe(params => {
    //   this.localstoragevalue = localStorage.getItem('currentUser');

    //   if (this.localstoragevalue == null) {
    //     // this.UserName = 'null';

    //     // Save the encrypted data in local storage
    //     // window.location.href = environment.myQOneUrl;
    //     this.router.navigate(['Dashboard']);
    //   } else {
    //     // alert('is else null');
    //     const user = JSON.parse(this.localstoragevalue);

    //     // Save the encrypted data in local storage
    //     // console.log("window.atob(this.localstoragevalue): " + window.atob(this.localstoragevalue));
    //     // const user = JSON.parse(window.atob(this.localstoragevalue));

    //     // console.log('navbar user: '+JSON.stringify(user));
    //     // console.log('navbar user: '+JSON.stringify(user.username));

    //     if (user.roleid > 0) {
    //       this.GetUserRoleName(user.roleid);
    //       this.UserName = user.fullname;
    //     }
    //   }
    // });
  }

  GetUserRoleName(roleid: any) {
    this.masterService.getRoleName(roleid.toString()).subscribe(data => {
      this.UserRole = data;
    });
  }

  onLogout() {
    this.api.insertActivityLog("User logged out", "Logout", "Logout");
    setTimeout(() => {
      if (localStorage.getItem("version") != null) {  
        this.currentversion = localStorage.getItem("version");        
      }
      localStorage.clear();
      this.datatransfer.loginGCPUserID.next("");
      this.datatransfer.SelectedRoleid = 0;
      this.datatransfer.logout();
      localStorage.setItem("version", this.currentversion);
    }, 1500);

    // this.gserve.eventEmitter(
    //   "Logout",
    //   "Sign-out",
    //   "userlogout",
    //   this.loginName,
    //   1
    // );
  }
}
