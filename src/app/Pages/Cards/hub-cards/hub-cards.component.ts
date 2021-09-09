import { Component, OnInit, OnDestroy } from "@angular/core";
import { Validators, FormBuilder } from "@angular/forms";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { Client } from "src/app/Model/client";
import { Api } from "src/app/Services/api";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { DatePipe } from "@angular/common";
import { BehaviorSubject } from "rxjs";
import { SubSink } from "subsink";
import { isNullOrUndefined } from "util";

@Component({
  selector: "app-hub-cards",
  templateUrl: "./hub-cards.component.html",
  styleUrls: ["./hub-cards.component.css"],
})
export class HubCardsComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    public api: Api,
    private datePipe: DatePipe,
    private dataService: DatatransaferService
  ) {
    this.clsUtility = new Utility(toastr);
  }
  public subscription = new SubSink();
  public clsUtility: Utility;
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  lstClients: any;
  public SelectAllClients: any;
  selectedClientID: number = 0;
  lstSubClients: any;
  public SelectAllSubClients: any;
  selectedSubClientID: number = 0;
  // public ClientDefaultValue = { clientid: 0, clientname: "All" };
  public SubClientDefaultValue = { subclientid: 0, subclientname: "All" };
  public currentuserid: string = "0";
  public isGroupuser: boolean = false;
  loading: boolean = false;
  loadingGroupCards: boolean = false;
  loadingFTP: boolean = false;
  loadingFTPdetails: boolean = false;
  public disablegroup: boolean = true;
  public disablepractice: boolean = true;
  public disabledate: boolean = true;
  public disablebtn: boolean = true;

  showFilters: boolean = false;
  showGroupSummaryCards: boolean = false;
  showPracticeSummaryCards: boolean = false;
  showPracticeDetailsCards: boolean = false;
  showPracticeSummaryFTPCard: boolean = false;
  DropDownGroup = this.fb.group({
    fcClientName: ["", Validators.required],
    fcSubClientName: ["", Validators.required],
    // fcFromDate: ["", Validators.required],
    // fcToDate: ["", Validators.required]
  });
  get fbcClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  get fbcSubClientName() {
    return this.DropDownGroup.get("fcSubClientName");
  }
  // get fbcFromDate() {
  //   return this.DropDownGroup.get("fcFromDate");
  // }
  // get fbcToDate() {
  //   return this.DropDownGroup.get("fcToDate");
  // }

  ngOnInit() {
    try {
      //Permission session Start
      this.subscription.add(
        this.dataService.newpermission.subscribe((data) => {
          if (data != null || data != undefined) {
            this.showFilters = data.summaryfilter;
            this.showGroupSummaryCards = data.summarygroupsummarycards;
            this.showPracticeSummaryCards = data.summarypracticesummarycards;
            this.showPracticeDetailsCards = data.summarypracticedetailscards;
            this.showPracticeSummaryFTPCard =
              data.summarypracticesummaryFTPcard;
          }
        })
      );

      //Permission session End

      this.startDate.setDate(this.startDate.getDate() - 1);
      // this.fbcFromDate.setValue(new Date(this.startDate));
      // this.fbcToDate.setValue(this.endDate);
      this.currentuserid = this.dataService.SelectedUserid;

      this.RetriveAllClient();
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

  RetriveUserStatus() {
    this.loading = true;
    try {
      let getuserstatus: {
        clientid: string;
        userid: string;
      } = {
        clientid: this.fbcClientName.value,
        userid: this.currentuserid,
      };
      let seq = this.api.post("UserClientMapping/UserStatus", getuserstatus);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.isGroupuser = res["groupuser"];
          },
          (err) => {
            this.loading = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }
  RetriveAllClient() {
    this.loading = true;
    try {
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
            this.lstClients = res;
            if (this.lstClients != null && this.lstClients.length > 0) {
              this.fbcClientName.setValue(this.lstClients[0].clientid);
              this.selectedClientID = this.lstClients[0].clientid;
              this.RetriveSubClient();
              if (this.lstClients[0].clientid != 0) {
                this.RetriveUserStatus();
              } else {
                this.isGroupuser = true;
              }
              this.applyFilters();

              this.SelectAllClients = this.lstClients;
              this.loading = false;
            } else {
              this.lstClients = [];
              this.loading = false;
              this.clsUtility.showInfo("No group is active");
            }
          },
          (err) => {
            this.loading = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }

  handleClientFilter(value) {
    this.lstClients = this.SelectAllClients.filter(
      (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
  onClientChange(event: any) {
    try {
      this.selectedClientID = event.clientid;
      this.selectedSubClientID = 0;
      this.RetriveSubClient();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSubClientChange(event: any) {
    try {
      this.selectedSubClientID = event.subclientid;
      // this.getCardsData(1);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient() {
    // this.loading = true;
    this.disablepractice = false;
    try {
      this.lstSubClients = [];
      this.fbcSubClientName.setValue(0);
      let getsubclient: {
        userid: string;
        status: boolean;
        v_clientid: string;
        v_divisioncode: string;
      } = {
        userid: this.currentuserid,
        status: true,
        // v_clientid: this.selectedClientID.getValue().toString(),
        v_clientid: this.selectedClientID.toString(),
        v_divisioncode: "All",
      };
      let seq = this.api.post("SubClient/GetSubClientByUserId", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.lstSubClients = res;
            if (this.lstSubClients != null && this.lstSubClients.length > 0) {
              this.SelectAllSubClients = this.lstSubClients;
              // this.selectedSubClientID.next(0);
            } else {
              this.disablepractice = true;
              this.lstSubClients = [];
              this.clsUtility.showInfo("No practice is active");
            }
            // this.getCardsData(0);
            // this.getCardsData(1);
            // this.loading = false;
          },
          (err) => {
            this.disablepractice = true;
            this.loading = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.disablepractice = true;
      this.loading = false;
      this.clsUtility.LogError(error);
    }
  }

  public onDateChange(value: Date, date: string): void {
    try {
      // alert(value);
      if (value != null) {
        if (date == "start date" && value > this.endDate) {
          this.clsUtility.showWarning("Start date must be less than end date");
          this.startDate = new Date();
        } else if (date == "end date" && value < this.startDate) {
          this.clsUtility.showWarning(
            "End date must be greater than start date"
          );
          this.endDate = new Date();
        }
      } else {
        if (date == "start date") {
          this.startDate = new Date();
        } else if (date == "end date") {
          this.endDate = new Date();
        }

        this.clsUtility.LogError("Select valid date");
      }
      // this.getCardsData(0);
      // this.getCardsData(1);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clientCards: clientCards = new clientCards();
  practicecards: subClientTotalCount = new subClientTotalCount();
  practiceCardDetails: any;
  async getCardsData(type: number) {
    this.loading = true;
    this.loadingGroupCards = true;
    this.fbcSubClientName.updateValueAndValidity();
    try {
      let getClientCards: {
        userid: string;
        clientid: number;
        subclientid: number;
        dtstartdate: string;
        dtenddate: string;
        type: number;
        divisioncode: "All";
      } = {
        userid: this.currentuserid,
        clientid: this.selectedClientID,
        subclientid: this.selectedSubClientID,
        dtstartdate: this.datePipe.transform(this.startDate, "yyyyMMdd"),
        dtenddate: this.datePipe.transform(this.endDate, "yyyyMMdd"),
        type: type,
        divisioncode: "All",
      };
      // var seq;

      // seq = this.api.post_edi(
      //   "api/Dashboard/getFilesDashboardSummary",
      //   getClientCards
      // );
      // this.subscription.add(
      //   seq.subscribe(
      //     res => {
      //       if (res) {
      //         switch (type) {
      //           case 0:
      //             this.clientCards = <clientCards>res;
      //             this.loadingGroupCards = false;
      //             break;
      //           case 1:
      //             this.practicecards = res.subclienttotalcount;
      //             if (this.showPracticeSummaryFTPCard) {
      //               this.practiceCardDetails = res.subclientdetailcount;
      //               this.getSFTPCounts(res.subclientdetailcount);
      //               this.loading = false;
      //             } else {
      //               this.practiceCardDetails = res.subclientdetailcount;
      //               this.loading = false;
      //             }
      //             break;
      //         }
      //       }
      //     },
      //     err => {
      //       this.loading = false;
      //       this.loadingGroupCards = false;
      //       this.clsUtility.LogError(err);
      //     }
      //   )
      // );
      await this.api
        .post_edi("api/Dashboard/getFilesDashboardSummary", getClientCards)
        .toPromise()
        .then(
          async (res) => {
            if (res) {
              switch (type) {
                case 0:
                  this.clientCards = <clientCards>res;
                  this.loadingGroupCards = false;
                  break;
                case 1:
                  this.practicecards = res["subclienttotalcount"];
                  if (this.showPracticeSummaryFTPCard) {
                    this.practiceCardDetails = res["subclientdetailcount"];
                    this.loading = false;
                    await this.getSFTPCounts(res["subclientdetailcount"]);
                  } else {
                    this.practiceCardDetails = res["subclientdetailcount"];
                    this.loading = false;
                  }
                  break;
              }
            }
          },
          (err) => {
            this.loading = false;
            this.loadingGroupCards = false;
            this.clsUtility.LogError(err);
          }
        );
    } catch (error) {
      this.loading = false;
      this.loadingGroupCards = false;
      this.clsUtility.LogError(error);
    }
  }
  // getSFTPCounts(arr: any) {
  //   // this.loading = true;
  //   this.loadingFTP = true;
  //   try {
  //     let getftpcount: {
  //       nclientid: number;
  //       nsubclientid: number;
  //     } = {
  //       nclientid: this.selectedClientID,
  //       nsubclientid: this.selectedSubClientID
  //     };
  //     let seq = this.api.post_edi("GetUploadedSplitFileCount", getftpcount);
  //     this.subscription.add(
  //       seq.subscribe(
  //         res => {
  //           // this.practicecards.totalftpfiles = <number>res["ftptotalfilecount"];
  //           if (res != null && res["ftpfilecountdetails"].length > 0) {
  //             let arrpracticeFTP: any = res["ftpfilecountdetails"];
  //             let arrfinal = [];
  //             let totalFTPCount = 0;
  //             for (let index = 0; index < arr.length; index++) {
  //               const element = <subClientDetailCount>arr[index];
  //               let subclientftp = arrpracticeFTP.find(
  //                 x => x.subclientcode == element.subclientcode
  //               );
  //               if (subclientftp) {
  //                 element.ftpfiles = subclientftp["filecount"];
  //                 totalFTPCount = totalFTPCount + subclientftp["filecount"];
  //                 arrfinal.push(element);
  //               }
  //             }
  //             this.practiceCardDetails = arrfinal;
  //             this.practicecards.totalftpfiles = totalFTPCount;
  //           } else {
  //             this.practicecards.totalftpfiles = 0;
  //           }
  //           // this.loading = false;
  //           this.loadingFTP = false;
  //         },
  //         err => {
  //           // this.loading = false;
  //           this.loadingFTP = false;
  //           this.clsUtility.LogError(err);
  //         }
  //       )
  //     );
  //   } catch (error) {
  //     // this.loading = false;
  //     this.loadingFTP = false;
  //     this.clsUtility.LogError(error);
  //   }
  // }

  async getSFTPCounts(arr: any) {
    try {
      this.loadingFTP = true;
      this.disablegroup = true;
      this.disablepractice = true;
      this.disablebtn = true;
      this.disabledate = true;
      let totalFTPCount = 0;
      let arrsubclient = [];

      if (this.selectedSubClientID != 0) {
        let element = this.lstSubClients.find(
          (x) => x.subclientid == this.selectedSubClientID && x.ftpoption == 1
        );

        if (!isNullOrUndefined(element)) {
          let getftpcount: {
            nclientid: number;
            nsubclientid: number;
          } = {
            nclientid: this.selectedClientID,
            nsubclientid: element.subclientid,
          };
          await this.api
            .post_edi("GetUploadedSplitFileCount", getftpcount)
            .toPromise()
            .then(
              async (res) => {
                let ftpcount: number = 0;

                if (res != null && res["ftpfilecountdetails"].length > 0) {
                  let arrpracticeFTP: any = res["ftpfilecountdetails"];
                  arrsubclient.push(arrpracticeFTP[0]);
                  ftpcount = arrpracticeFTP[0]["filecount"];
                  // console.log(ftpcount);
                }
                // else {
                //   this.practicecards.totalftpfiles = 0;
                // }
                let subclientftp = arr.findIndex(
                  (x) => x.subclientcode == element.subclientcode
                );
                // console.log(subclientftp);
                totalFTPCount = totalFTPCount + ftpcount;
                if (subclientftp >= 0) {
                  this.practiceCardDetails[subclientftp]["ftpfiles"] = ftpcount;
                }
              },
              (err) => {
                this.loadingFTP = false;
                this.disablegroup = false;
                this.disablepractice = false;
                this.disablebtn = false;
                this.disabledate = false;
                this.clsUtility.LogError(err);
              }
            );
        }
      } else {
        for (let index = 0; index < this.lstSubClients.length; index++) {
          // const element = this.lstSubClients[index];
          let element: any;
          if (this.lstSubClients[index]["ftpoption"] == 1)
            element = this.lstSubClients[index];

          if (!isNullOrUndefined(element)) {
            let getftpcount: {
              nclientid: number;
              nsubclientid: number;
            } = {
              nclientid: this.selectedClientID,
              nsubclientid: element.subclientid,
            };
            await this.api
              .post_edi("GetUploadedSplitFileCount", getftpcount)
              .toPromise()
              .then(
                async (res) => {
                  let ftpcount: number = 0;

                  if (res != null && res["ftpfilecountdetails"].length > 0) {
                    let arrpracticeFTP: any = res["ftpfilecountdetails"];
                    arrsubclient.push(arrpracticeFTP[0]);
                    ftpcount = arrpracticeFTP[0]["filecount"];
                    // console.log(ftpcount);
                  }
                  // else {
                  //   this.practicecards.totalftpfiles = 0;
                  // }
                  let subclientftp = arr.findIndex(
                    (x) => x.subclientcode == element.subclientcode
                  );
                  console.log(subclientftp);
                  totalFTPCount = totalFTPCount + ftpcount;
                  if (subclientftp >= 0) {
                    this.practiceCardDetails[subclientftp][
                      "ftpfiles"
                    ] = ftpcount;
                  }
                },
                (err) => {
                  this.loadingFTP = false;
                  this.disablegroup = false;
                  this.disablepractice = false;
                  this.disablebtn = false;
                  this.disabledate = false;
                  this.clsUtility.LogError(err);
                }
              );
            // console.log(totalFTPCount);
          }
        }
      }
      this.practicecards.totalftpfiles = totalFTPCount;
      this.loadingFTP = false;
      this.disablegroup = false;
      this.disablepractice = false;
      this.disablebtn = false;
      this.disabledate = false;
    } catch (error) {
      this.loadingFTP = false;
      this.disablegroup = false;
      this.disablepractice = false;
      this.disablebtn = false;
      this.disabledate = false;
      this.clsUtility.LogError(error);
    }
  }

  applyFilters() {
    try {
      this.getCardsData(0);
      this.getCardsData(1);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  clearFilters() {
    try {
      let dtstartDate: Date = new Date();
      let dtendDate: Date = new Date();
      dtstartDate.setDate(dtendDate.getDate() - 1);
      this.fbcClientName.setValue(this.lstClients[0].clientid);
      this.fbcSubClientName.setValue(0);
      this.startDate = dtstartDate;
      this.endDate = dtendDate;
      // this.fbcFromDate.setValue(this.startDate);
      // this.fbcFromDate.updateValueAndValidity();
      // this.fbcToDate.setValue(this.endDate);
      // this.fbcToDate.updateValueAndValidity();
      this.selectedClientID = this.lstClients[0].clientid;
      this.selectedSubClientID = 0;
      this.RetriveSubClient();
      this.getCardsData(0);
      this.getCardsData(1);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}

export class clientCards {
  receivedfiles: number = 0;
  processedcount: number = 0;
  inprocessedcount: number = 0;
  unprocessedcount: number = 0;
}

export class subclientCards {
  subclienttotalcount: subClientTotalCount;
  subclientdetailcount: subClientDetailCount[];
}

export class subClientTotalCount {
  totalsplitfiles: number = 0;
  totalhuppendingfiles: number = 0;
  totalhubdownloadedfiles: number = 0;
  totalftpfiles: number = 0;
}

export class subClientDetailCount {
  subclientname: string;
  subclientcode: string;
  splitfiles: number = 0;
  hubpendingfiles: number = 0;
  hubdownloadfiles: number = 0;
  ftpfiles: number = 0;
}
