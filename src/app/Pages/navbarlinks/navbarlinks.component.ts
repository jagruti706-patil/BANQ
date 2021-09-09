import { clsPermission } from "./../../Services/settings/clspermission";
import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { Navbarlinks } from "src/app/Model/navbarlinks";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Router, NavigationEnd } from "@angular/router";
import { SubSink } from "subsink";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { DatePipe } from "@angular/common";
import { Api } from "src/app/Services/api";
import { isNullOrUndefined } from "util";
import { Client } from "src/app/Model/client";
@Component({
  selector: "app-navbarlinks",
  templateUrl: "./navbarlinks.component.html",
  styleUrls: ["./navbarlinks.component.css"],
})
export class NavbarlinksComponent implements OnInit, OnDestroy {
  currenturl: string = "";
  private subscription = new SubSink();
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public masterfileresponse: any = [];
  public masterfilecount: number = 0;
  public splitfileresponse: any = [];
  public splitfilecount: number = 0;
  public totalcount: number = 0;
  public nopermission: boolean = false;

  public unmatchedclaimresponse: any = [];
  public unmatchedclaimcount: number = 0;
  public unmatchedplbresponse: any = [];
  public unmatchedplbcount: number = 0;
  public totalunmatchedcount: number = 0;
  public clickunmatchedclaim: boolean = false;
  public varunmatchedclaim: string = "";
  public holdpaymentresponse: any = [];  

  public clickunprocess: boolean = false;
  public clickinprocess: boolean = false;
  public varunprocess: string = "";
  private currentuserid: string = "0";
  private sSelectedClientID: string = "0";
  public sClientId: string;

  constructor(
    public dataService: DatatransaferService,
    private toastr: ToastrService,
    private router: Router,
    private filedetailService: FileDetailsService,
    private datePipe: DatePipe,
    public api: Api
  ) {
    this.clsUtility = new Utility(toastr);

    this.subscription.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.currenturl = this.router.url;

          if (
            !this.currenturl.toLowerCase().includes("/allunmatchedclaimdetails")
          ) {
            this.clickunmatchedclaim = false;
          } else {
            if (this.varunmatchedclaim != this.currenturl.toLowerCase()) {
              this.varunmatchedclaim = this.currenturl.toLowerCase();
              this.clickunmatchedclaim = false;
            }
          }
          if (
            !(
              this.currenturl.toLowerCase().includes("/masterfilesunprocess") ||
              this.currenturl.toLowerCase().includes("/unprocesssplitfiles")
            )
          ) {
            this.clickunprocess = false;
          } else {
            if (this.varunprocess != this.currenturl.toLowerCase()) {
              this.varunprocess = this.currenturl.toLowerCase();
              this.clickunprocess = false;
            }
          }
          if (
            !(
              this.currenturl.toLowerCase().includes("/inprocessmasterfiles") ||
              this.currenturl.toLowerCase().includes("/inprocesssplitfiles")
            )
          ) {
            this.clickinprocess = false;
          } else {
            if (this.varunprocess != this.currenturl.toLowerCase()) {
              this.varunprocess = this.currenturl.toLowerCase();
              this.clickinprocess = false;
            }
          }
        }
      })
    );
  }

  private clsUtility: Utility;

  vwHome = false;
  vwAllClients = false;
  vwDashboard = false;
  vwConfiguration = false;
  vwServiceController = false;
  vwClientchartDashboard = false;
  vwRemitFiles = false;
  vwServiceLogs = false;
  ChangePasswordClick = false;
  homeNavigation: string;
  clsPermission: clsPermission;

  ngOnInit() {
    var testnavlinks: Navbarlinks;
    try {
      this.startDate.setMonth(this.startDate.getMonth() - 3);
      this.currentuserid = this.dataService.SelectedUserid;
      this.dataService.unmatchedclaimcount = 0;
      this.dataService.totalunmatchedcount = 0;

      this.nopermission = this.dataService.nopermission;
      this.subscription.add(
        this.dataService.defaultNavigation.subscribe((data) => {
          this.homeNavigation = data;
        })
      );

      this.subscription.add(
        this.dataService.navSubject.subscribe((data) => {
          if (data != null || data != undefined) {
            testnavlinks = data;

            // console.log("data  navSubject");
            // console.log(data);

            // console.log("testnavlinks" + JSON.stringify(testnavlinks));
            // this.vwHome = testnavlinks.viewHome;
            // this.vwDashboard = testnavlinks.viewDashboard;
            // this.vwServiceController = testnavlinks.viewServiceController;
            // this.vwClientchartDashboard =testnavlinks.viewClientchartDashboard
            // this.vwRemitFiles = testnavlinks.viewRemitFiles;
            // this.vwServiceLogs = testnavlinks.viewServiceLogs;
          }
        })
      );

      this.subscription.add(
        this.dataService.newpermission.subscribe((data) => {
          // console.log("data newpermission");
          // console.log(data);
        })
      );

      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );
      this.RetriveAllClient();
      this.getHoldPaymentCount();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllClient() {
    try {
      let sAllClients;
      let getclient: {
        clientid: string;
        clientstatus: boolean;
        v_userid: string;
      } = {
        clientid: "0",
        clientstatus: true,
        v_userid: this.currentuserid,
      };
      let seq = this.api.post("GetClient", getclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            sAllClients = res;
            if (!isNullOrUndefined(sAllClients) && sAllClients.length > 0) {
              if (sAllClients[0]["nclientcount"] == sAllClients.length) {
                this.sSelectedClientID = "0";
              } else {
                this.sSelectedClientID = sAllClients[0]["clientid"];
              }
              sAllClients.forEach((x) => {
                if (!isNullOrUndefined(this.sClientId)) {
                  this.sClientId =
                    this.sClientId.toString() + "," + x.clientid.toString();
                } else {
                  this.sClientId = x.clientid.toString();
                }
              });
            } else {
              this.sSelectedClientID = "0";
            }
            this.getUnmatchedClaimsCount();
            this.getUnprocessedMasterCount();  
            this.getInprocessedMasterCount();         
            // this.getUnprocessedMasterFile();
            // this.getUnmatchedClaims();
          },
          (err) => {
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getUnmatchedClaimsCount() {
    try {
      if (this.clickunmatchedclaim == false) {
        this.totalunmatchedcount = 0;
        this.unmatchedclaimcount = 0;

        this.dataService.unmatchedclaimcount = 0;
        this.dataService.totalunmatchedcount = 0;

        this.subscription.add(
          this.filedetailService
            .getBadgesUnmatchedClaimsCount(
              this.datePipe.transform(this.startDate, "yyyyMMdd"),
              this.datePipe.transform(this.endDate, "yyyyMMdd"),
              this.sClientId
            )
            .subscribe((data) => {
              this.sClientId = null;
              this.unmatchedclaimresponse = data;
              if (
                this.unmatchedclaimresponse != null &&
                this.unmatchedclaimresponse != undefined
              ) {
                if (this.unmatchedclaimresponse["ncount"] != null) {
                  // console.log(this.unmatchedclaimresponse["ncount"]);

                  this.unmatchedclaimcount = this.unmatchedclaimresponse[
                    "ncount"
                  ];
                  if (this.unmatchedclaimcount != null) {
                    this.dataService.unmatchedclaimcount = this.unmatchedclaimcount;
                    this.dataService.totalunmatchedcount = this.dataService.unmatchedclaimcount;
                  }
                } else {
                  this.unmatchedclaimcount = 0;
                  this.dataService.unmatchedclaimcount = this.unmatchedclaimcount;
                }
              }
            })
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getUnprocessedMasterCount() {
    try {
      if (this.clickunprocess == false) {
        this.dataService.totalunprocesscount = 0;
        this.dataService.totalunprocessmastercount = 0;
        this.dataService.totalunprocesssplitcount = 0;

        this.subscription.add(
          this.filedetailService
            .getBadgesUnprocessMasterCount(
              this.datePipe.transform(this.startDate, "yyyyMMdd"),
              this.datePipe.transform(this.endDate, "yyyyMMdd"),
              this.currentuserid
            )
            .subscribe(
              (data) => {
                this.masterfileresponse = data;
                if (
                  this.masterfileresponse != null &&
                  this.masterfileresponse != undefined
                ) {

                  if(this.clsPermission.unprocessmenu && this.clsPermission.masterfilesunprocessmenu) {
                    this.dataService.totalunprocessmastercount = this.masterfileresponse[
                      "nmastercount"
                    ];
                  } else {
                    this.dataService.totalunprocessmastercount = 0;
                  }

                  if(this.clsPermission.unprocessmenu && this.clsPermission.splitfilesunprocessmenu) {
                    this.dataService.totalunprocesssplitcount = this.masterfileresponse[
                      "nsplitcount"
                    ];
                  } else {
                    this.dataService.totalunprocesssplitcount = 0;
                  }

                  if(this.clsPermission.unprocessmenu && this.clsPermission.masterfilesunprocessmenu && this.clsPermission.splitfilesunprocessmenu) {
                    this.dataService.totalunprocesscount = this.masterfileresponse[
                      "ntotalcount"
                    ];
                  } else {
                    this.dataService.totalunprocesscount = (Number(this.dataService.totalunprocessmastercount) + Number(this.dataService.totalunprocesssplitcount));
                  }
                } else {
                  this.dataService.totalunprocessmastercount = 0;
                  this.dataService.totalunprocesssplitcount = 0;
                  this.dataService.totalunprocesscount = 0;
                }
              },
              (err) => {
                this.clsUtility.LogError(err);
              }
            )
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getHoldPaymentCount(){
    this.holdpaymentresponse = [];
    this.dataService.holdpaymentcount = 0;
    try {           
      this.subscription.add(
        this.filedetailService
          .getBadgesHoldPayment(
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),           
            this.currentuserid                      
          )
          .subscribe(
            (data) => {
              if (data != null) {                                
                this.holdpaymentresponse = data;
                if(this.holdpaymentresponse != null && this.holdpaymentresponse != undefined){
                  if(this.holdpaymentresponse["ncount"] != null && this.holdpaymentresponse["ncount"] != undefined)
                  this.dataService.holdpaymentcount = this.holdpaymentresponse["ncount"];
                } else {
                  this.dataService.holdpaymentcount = 0;                 
                }
              }                          
            },
            (err) => {                         
            }
          )
      );
    } catch (error) {     
      this.clsUtility.LogError(error);
    }
  }

  getInprocessedMasterCount() {
    try {
      if (this.clickinprocess == false) {
        this.dataService.totalinprocesscount = 0;
        this.dataService.totalinprocessmastercount = 0;
        this.dataService.totalinprocesssplitcount = 0;

        this.subscription.add(
          this.filedetailService
            .getBadgesInprocessMasterCount(
              this.datePipe.transform(this.startDate, "yyyyMMdd"),
              this.datePipe.transform(this.endDate, "yyyyMMdd"),
              this.currentuserid
            )
            .subscribe(
              (data) => {
                this.masterfileresponse = data;
                if (
                  this.masterfileresponse != null &&
                  this.masterfileresponse != undefined
                ) {

                  if(this.clsPermission.inprocessmenu && this.clsPermission.masterfilesinprocessmenu) {
                    this.dataService.totalinprocessmastercount = this.masterfileresponse[
                      "nmastercount"
                    ];
                  } else {
                    this.dataService.totalinprocessmastercount = 0;
                  }

                  if(this.clsPermission.inprocessmenu && this.clsPermission.splitfilesinprocessmenu) {
                    this.dataService.totalinprocesssplitcount = this.masterfileresponse[
                      "nsplitcount"
                    ];
                  } else {
                    this.dataService.totalinprocesssplitcount = 0;
                  }

                  if(this.clsPermission.inprocessmenu && this.clsPermission.masterfilesinprocessmenu && this.clsPermission.splitfilesinprocessmenu) {
                    this.dataService.totalinprocesscount = this.masterfileresponse[
                      "ntotalcount"
                    ];
                  } else {
                    this.dataService.totalinprocesscount = (Number(this.dataService.totalinprocessmastercount) + Number(this.dataService.totalinprocesssplitcount));
                  }
                } else {
                  this.dataService.totalinprocessmastercount = 0;
                  this.dataService.totalinprocesssplitcount = 0;
                  this.dataService.totalinprocesscount = 0;
                }
              },
              (err) => {
                this.clsUtility.LogError(err);
              }
            )
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
