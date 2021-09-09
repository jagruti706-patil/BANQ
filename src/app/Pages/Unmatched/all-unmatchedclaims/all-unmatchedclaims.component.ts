import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FileDetailsService } from "src/app/Services/file-details.service";
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings,
  SelectAllCheckboxState,
  GridComponent,
} from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { Api } from "src/app/Services/api";
import { BreadcrumbService } from "src/app/Services/breadcrumb.service";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Router } from "@angular/router";
import { FormBuilder, Validators } from "@angular/forms";
import { isNullOrUndefined } from "util";
import { Observable } from "rxjs";
import * as moment from "moment";

declare var $: any;
import { Workbook } from "@progress/kendo-angular-excel-export";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { MailSend } from "../../Configurations/emailconfiguration/clsemail";
import { CoreauthService } from "src/app/Services/coreauth.service";
import { SubSink } from "subsink";
import { SelectsubclientComponent } from "../../selectsubclient/selectsubclient.component";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { EobreportComponent } from "../../eobreport/eobreport.component";
import { parseNumber } from "@progress/kendo-angular-intl";
import { Client } from "src/app/Model/client";

@Component({
  selector: "app-all-unmatchedclaims",
  templateUrl: "./all-unmatchedclaims.component.html",
  styleUrls: ["./all-unmatchedclaims.component.css"],
})
export class AllUnmatchedclaimsComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private filedetailService: FileDetailsService,
    private datePipe: DatePipe,
    private coreService: CoreoperationsService,
    private toastr: ToastrService,
    public api: Api,
    private breadcrumbService: BreadcrumbService,
    private dataService: DatatransaferService,
    private router: Router,
    private authService: CoreauthService,
    public searchfiltersvr: SearchfiltersService
  ) {
    this.clsUtility = new Utility(toastr);
    this.UnmatchedClaimsPageSize = this.clsUtility.pagesize;
    this.allData = this.allData.bind(this);
    this.ExportData = this.ExportData.bind(this);
  }

  private clsUtility: Utility;
  private subscription = new SubSink();

  public emailloading = false;
  loading = false;
  loadingUnmatchedFilesGrid = false;
  neraMasterFileid: any = "0";
  nclientid: any = "0";
  public sUnmatchedclaims: any;
  public nSelectedClientID: string = "0";

  public UnmatchedClaimsGridData: {};
  public UnmatchedClaimsGridView: GridDataResult;
  private UnmatchedClaimsItems: any[] = [];
  private UnmatchedClaimsResponse: any[] = [];
  public UnmatchedClaimsSkip = 0;
  public UnmatchedClaimsPageSize = 0;
  public ExportUnmatchedClaimsGridView: GridDataResult;
  public ExportExcelDownloadConfirmationMessage: any;

  public stitleUnmatchedclaim = "UnMatched Claims";
  public sUnmatchedClaimsBreadCrumb: string = "UnMatchedClaims";
  public UnmatchedClaimsdisplaytotalrecordscount: number = 0;
  public sSearchText: string = "";

  claimSVClinearray = [];
  public gridData: any = [];
  public EOBReportItems: any[] = [];
  public EOBReportSVC: any[] = [];
  public EOBReportSVCGridView: GridDataResult;
  public EOBReportSVClineSkip = 0;
  public EOBReportSVClinepagesize: number = 50;
  public loadingClaimsDetailsGrid: boolean = false;
  public sclaimno: string = "";
  result: any = [];
  resultarray: any = [];
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public exportFilename: string =
    "UnmatchedClaimsList_" + this.datePipe.transform(new Date(), "MMddyyyy");
  selectedFiles: File;

  public sAllClients: any;
  public SelectAllClients: any;
  public sSelectedClientID: string = "0";

  public disabledsearchBy: boolean = false;
  public disabledclient: boolean = false;
  public disabledstartdate: boolean = false;
  public disabledenddate: boolean = false;
  public disabledapplybtn: boolean = false;
  public disabledclearbtn: boolean = false;
  public disabledsearch: boolean = false;
  public clsPermission: clsPermission;
  private bOninit = false;
  public bHidebtn = false;

  public sUnmatchedSearchBy: any = [
    { value: "Filename", text: "Filename" },
    { value: "Claim", text: "Claim" },
    { value: "Check", text: "Check" },
    {
      value: "Rendering provider firstname",
      text: "Rendering provider firstname",
    },
    {
      value: "Rendering provider lastname",
      text: "Rendering provider lastname",
    },
    { value: "Rendering provider npi", text: "Rendering provider npi" },
    { value: "Payer", text: "Payer" },
  ];
  public sSelectedUnmatchedSearchBy: string = "Filename";

  public mySelection: any[] = [];
  public selectedCallback = (args) => args.dataItem.clpid;
  public selectAllState: SelectAllCheckboxState = "unchecked";
  public selectableSettings: SelectableSettings = {
    enabled: true,
  };
  public checkboxOnly = false;
  public mode = "multiple";
  public selectallflag: boolean = false;
  public currentuserid: string = "0";
  public currentusername: string = "";
  public exportresponse: any = [];
  public exportgridresult: GridDataResult;
  public recordslist: {
    tsid: any;
    clpid: any;
    fileid: any;
  } = {
    tsid: 0,
    clpid: 0,
    fileid: 0,
  };
  public sSendemailfilter: any = [
    { value: "All", text: "All" },
    { value: "Send", text: "Send" },
    { value: "Unsend", text: "Unsend" },
  ];
  public sSelectedsendemailfilter: string = "All";
  public disabledsendemail: boolean = false;
  public recordselectioncount: number = 0;
  public myremove: any[] = [];

  public Inputclientid: any;
  public InputGenerateUnmatchedClaim: any;
  @ViewChild("SelectsubclientChild")
  private SelectsubclientChild: SelectsubclientComponent;
  public InputAllClaimno: string = "";
  public bprobablepractice: boolean = false;

  public sortUnmatchedClaims: SortDescriptor[] = [
    {
      field: "dtcreateddate",
      dir: "desc",
    },
  ];
  public sortMaster: SortDescriptor[] = [
    {
      field: "clientid",
      dir: "asc",
    },
  ];

  DropDownGroup = this.fb.group({
    fcSearch: [""],
    fcUnmatchedSearchBy: [""],
    fcSendEmailfilter: [""],
    fcClientName: [""],
  });

  public exportfilename: string = "";
  public echeckno: string = "";
  public eclaimno: string = "";
  public displayreport: boolean = false;
  public disabledbutton: boolean = false;
  public matchedtopractice: boolean = false;
  private sClientId: string;

  get fbcFilterSearch() {
    return this.DropDownGroup.get("fcSearch");
  }

  get UnmatchedSearchBy() {
    return this.DropDownGroup.get("fcUnmatchedSearchBy");
  }

  get SendEmailFilter() {
    return this.DropDownGroup.get("fcSendEmailfilter");
  }

  get ClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  @ViewChild("EobreportChild")
  private EobreportChild: EobreportComponent;
  public inputmastererafileid: any;
  public inputtsid: any;
  public inputclpid: any;
  public inputsplitfileid: any;
  public inputcomponentname: any = "All Unmatched Claim";

  ngOnInit() {
    try {
      this.bOninit = true;
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );
      this.bprobablepractice = this.clsPermission.allunmatchedclaimsprobablepractice;

      if(this.bprobablepractice){
        this.sUnmatchedSearchBy.push({value: "Probable Practice", text: "Probable Practice"});
      } 

      this.startDate.setMonth(this.startDate.getMonth() - 3);
      this.currentuserid = this.dataService.SelectedUserid;
      this.currentusername = this.dataService.loginName["_value"];
      //this.neraMasterFileid = this.dataService.mastererafileid;
      this.nclientid = this.dataService.clientid;
      if (
        this.neraMasterFileid != null &&
        this.neraMasterFileid != undefined &&
        this.neraMasterFileid != ""
      ) {
        if (this.searchfiltersvr.alluclaimsfilter == true) {
          this.searchfiltersvr.files_mastererafileid = this.neraMasterFileid;
          this.sSearchText = this.searchfiltersvr.getalluclaimssSearchText();
          this.sSelectedUnmatchedSearchBy = this.searchfiltersvr.getalluclaimssSearchBy();
          this.fbcFilterSearch.setValue(this.sSearchText);
        }

        this.UnmatchedClaimsdisplaytotalrecordscount = 0;
        this.loadingUnmatchedFilesGrid = true;
        this.Enabledisablebtn(true);
        this.RetriveAllClient();
        // this.RetriveUnmatchedClaims_v2();
        this.api.insertActivityLog(
          "All Unmatched Claim Viewed",
          "Files",
          "READ",
          this.neraMasterFileid
        );
      }
      // else {
      //   this.router.navigate(["/Files"]);
      // }
      this.breadcrumbService.showhideFilesbreadcrumb(
        true,
        this.sUnmatchedClaimsBreadCrumb
      );
    } catch (error) {
      this.loadingUnmatchedFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllClient() {
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
            this.sAllClients = res;
            if (
              !isNullOrUndefined(this.sAllClients) &&
              this.sAllClients.length > 0
            ) {
              if (
                this.sAllClients[0]["nclientcount"] == this.sAllClients.length
              ) {
                const Allclt = new Client();
                Allclt.clientid = "0";
                Allclt.clientcode = "";
                Allclt.clientname = "All";
                this.sAllClients.unshift(Allclt);
                this.SelectAllClients = this.sAllClients;

                this.sSelectedClientID = "0";
              } else {
                this.SelectAllClients = this.sAllClients;
                this.sSelectedClientID = this.sAllClients[0]["clientid"];
              }

              this.sAllClients.forEach((x) => {
                if (!isNullOrUndefined(this.sClientId)) {
                  this.sClientId =
                    this.sClientId.toString() + "," + x.clientid.toString();
                } else {
                  this.sClientId = x.clientid.toString();
                }
              });

              if (this.sSelectedClientID != "0") {
                this.bHidebtn = true;
              } else {
                this.bHidebtn = false;
              }

              if (this.bOninit) {
                this.RetriveUnmatchedClaims_v2();
                this.bOninit = false;
              } else {
                this.Enabledisablebtn(false);
              }
            } else {
              this.sAllClients = [];
              this.Enabledisablebtn(true);
              this.bOninit = false;

              this.UnmatchedClaimsResponse = [];
              this.UnmatchedClaimsItems = [];
              this.loading = false;
              this.loadingUnmatchedFilesGrid = false;
              this.neraMasterFileid = "0";
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
      this.loadingUnmatchedFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onClientChange(event: any) {
    try {
      if (this.ClientName.value == undefined || this.ClientName.value == "") {
        this.toastr.warning("Please Select Group");
      } else {
        this.mySelection = [];
        this.myremove = [];
        this.selectallflag = false;
        this.selectAllState = "unchecked";
        this.Enabledisablebtn(true);
        this.sSelectedClientID = event;
        if (this.sSelectedClientID != "0") {
          this.bHidebtn = true;
        } else {
          this.bHidebtn = false;
        }
        this.UnmatchedClaimsSkip = 0;
        this.UnmatchedClaimsdisplaytotalrecordscount = 0;
        this.RetriveUnmatchedClaims_v2();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleClientFilter(value) {
    this.sAllClients = this.SelectAllClients.filter(
      (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  RetriveUnmatchedClaims() {
    try {
      this.UnmatchedClaimsdisplaytotalrecordscount = 0;
      this.loadingUnmatchedFilesGrid = true;
      this.subscription.add(
        this.filedetailService
          .getUnmatchedClaimsList(this.neraMasterFileid)
          .subscribe(
            (data) => {
              if (data != null && data != undefined) {
                this.UnmatchedClaimsGridData = data.content;
                this.UnmatchedClaimsItems = data.content;
                this.UnmatchedClaimsdisplaytotalrecordscount = this.UnmatchedClaimsItems.length;
                this.loadItemsUnmatchedClaims();
                this.loading = false;
              }
              this.loadingUnmatchedFilesGrid = false;
            },
            (err) => {
              this.loadingUnmatchedFilesGrid = false;
            }
          )
      );
    } catch (error) {
      this.loadingUnmatchedFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  public UnmatchedClaimsclose() {
    try {
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsUnmatchedClaims(): void {
    try {
      this.UnmatchedClaimsGridView = {
        data: orderBy(this.UnmatchedClaimsItems, this.sortUnmatchedClaims),
        total: this.UnmatchedClaimsItems.length,
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeUnmatchedClaims(event: PageChangeEvent): void {
    try {
      this.UnmatchedClaimsSkip = event.skip;
      this.RetriveUnmatchedClaims_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortUnmatchedClaimsChange(sort: SortDescriptor[]): void {
    try {
      this.sortUnmatchedClaims = sort;
      this.loadItemsUnmatchedClaims_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.breadcrumbService.showhideFilesbreadcrumb();
      this.searchfiltersvr.clearalluclaimsilter();
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveUnmatchedClaims_v2() {
    this.UnmatchedClaimsGridView = null;
    this.UnmatchedClaimsItems = [];
    try {
      this.loadingUnmatchedFilesGrid = true;
      this.subscription.add(
        this.filedetailService
          .getUnmatchedClaimsList(
            this.neraMasterFileid,
            this.UnmatchedClaimsSkip,
            this.UnmatchedClaimsPageSize,
            this.sSelectedUnmatchedSearchBy,
            this.sSearchText,
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),
            this.sSelectedsendemailfilter,
            this.sSelectedClientID,
            this.bprobablepractice
          )
          .subscribe(
            (data) => {
              this.UnmatchedClaimsResponse = data;
              this.UnmatchedClaimsItems =
                this.UnmatchedClaimsResponse != null
                  ? this.UnmatchedClaimsResponse["content"]
                  : null;
              if (this.UnmatchedClaimsItems != null) {
                if (this.UnmatchedClaimsItems.length > 0) {
                  this.UnmatchedClaimsdisplaytotalrecordscount = this.UnmatchedClaimsResponse[
                    "totalelements"
                  ];

                  this.UnmatchedClaimsItems.map((obj) => {
                    obj["billedamount"] = parseNumber(
                      !isNullOrUndefined(obj["billedamount"])
                        ? obj["billedamount"].replace("$", "").replace(",", "")
                        : "$0.00"
                    );
                    obj["paidamount"] = parseNumber(
                      !isNullOrUndefined(obj["paidamount"])
                        ? obj["paidamount"].replace("$", "").replace(",", "")
                        : "$0.00"
                    );
                  });

                  // if(this.matchedtopractice == true){
                  //   this.dataService.unmatchedclaimcount = this.UnmatchedClaimsdisplaytotalrecordscount;
                  //   this.dataService.totalunmatchedcount = this.dataService.unmatchedclaimcount + this.dataService.unmatchedplbcount;
                  //   this.matchedtopractice = false;
                  // }
                  this.loadItemsUnmatchedClaims_v2();
                  this.loadingUnmatchedFilesGrid = false;
                  this.Enabledisablebtn(false);

                  if (
                    (this.selectallflag == true &&
                      this.selectAllState == "checked") ||
                    (this.selectallflag == false &&
                      this.selectAllState == "indeterminate" &&
                      this.recordselectioncount > 0)
                  ) {
                    this.mySelection = [];
                    this.UnmatchedClaimsItems.forEach((item) => {
                      // if(this.mySelection.indexOf(item.clpid) === -1) {
                      //   this.mySelection.push(item.clpid);

                      //   this.recordslist.clpid = item.clpid;
                      //   this.recordslist.fileid = item.fileid;
                      //   this.recordslist.tsid = item.tsid;
                      //   this.exportresponse.push(this.recordslist);
                      // }
                      if (this.myremove.length > 0) {
                        let rdata = this.myremove.find((x) => x == item.clpid);
                        if (rdata == null || rdata == undefined) {
                          this.mySelection.push(item.clpid);

                          // this.recordslist.clpid = item.clpid;
                          // this.recordslist.fileid = item.fileid;
                          // this.recordslist.tsid = item.tsid;
                          // this.exportresponse.push(this.recordslist);
                        }
                      } else {
                        let ldata = this.mySelection.find(
                          (obj) => obj === item.clpid
                        );
                        if (ldata == null || ldata == undefined) {
                          this.mySelection.push(item.clpid);

                          // this.recordslist.clpid = item.clpid;
                          // this.recordslist.fileid = item.fileid;
                          // this.recordslist.tsid = item.tsid;
                          // this.exportresponse.push(this.recordslist);
                        }
                      }
                    });
                  } else if (
                    this.selectallflag == false &&
                    this.selectAllState == "unchecked"
                  ) {
                    this.mySelection = [];
                  } else if (
                    this.selectallflag == false &&
                    this.selectAllState == "indeterminate"
                  ) {
                    var mdata: any = this.mySelection;
                    this.mySelection = [];
                    this.mySelection = mdata;
                  }

                  // console.log("RetriveUnmatchedClaims_v2  this.mySelection ", this.mySelection);
                  // console.log(" RetriveUnmatchedClaims_v2 for all selection this.myremove ",  this.myremove);
                } else {
                  this.loadingUnmatchedFilesGrid = false;
                  this.UnmatchedClaimsdisplaytotalrecordscount = 0;
                  this.Enabledisablebtn(false);
                }
              } else {
                this.loadingUnmatchedFilesGrid = false;
                this.UnmatchedClaimsdisplaytotalrecordscount = 0;
                this.Enabledisablebtn(false);
              }
            },
            (err) => {
              this.loadingUnmatchedFilesGrid = false;
              this.Enabledisablebtn(false);
            }
          )
      );
    } catch (error) {
      this.loadingUnmatchedFilesGrid = false;
      this.Enabledisablebtn(false);
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsUnmatchedClaims_v2(): void {
    this.UnmatchedClaimsGridView = null;
    try {
      if (
        this.UnmatchedClaimsItems != null &&
        this.UnmatchedClaimsItems != undefined
      ) {
        if (this.UnmatchedClaimsItems && this.UnmatchedClaimsItems.length > 0) {
          this.UnmatchedClaimsGridView = {
            data: orderBy(this.UnmatchedClaimsItems, this.sortUnmatchedClaims),
            total: this.UnmatchedClaimsResponse["totalelements"],
          };
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSearch($event: any = null) {
    try {
      if (!isNullOrUndefined($event)) {
        if ($event.type == "keyup") {
          this.UnmatchedClaimsSkip = 0;
          this.sSearchText = null;
          this.sSearchText = this.fbcFilterSearch.value.trim();
          this.UnmatchedClaimsdisplaytotalrecordscount = 0;
          this.loadingUnmatchedFilesGrid = true;
          // this.searchfiltersvr.setalluclaimsfilter(
          //   this.sSearchText,
          //   this.sSelectedUnmatchedSearchBy
          // );
          // this.RetriveUnmatchedClaims_v2();
        } else if ($event.type == "click") {
          this.UnmatchedClaimsSkip = 0;
          this.sSearchText = null;
          this.sSearchText = this.fbcFilterSearch.value.trim();
          this.UnmatchedClaimsdisplaytotalrecordscount = 0;
          this.loadingUnmatchedFilesGrid = true;
          // this.searchfiltersvr.setalluclaimsfilter(
          //   this.sSearchText,
          //   this.sSelectedUnmatchedSearchBy
          // );
          // this.RetriveUnmatchedClaims_v2();
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ExportData = (): Observable<any> => {
    try {
      this.emailloading = true;
      if (this.UnmatchedClaimsdisplaytotalrecordscount != 0) {
        var result = this.filedetailService.SelectedexportData(
          0,
          this.UnmatchedClaimsdisplaytotalrecordscount,
          "Unmatched Claims",
          this.neraMasterFileid,
          this.sSearchText,
          this.sSelectedUnmatchedSearchBy,
          this.datePipe.transform(this.startDate, "yyyyMMdd"),
          this.datePipe.transform(this.endDate, "yyyyMMdd"),
          [],
          [],
          true,
          this.sSelectedsendemailfilter,
          this.sSelectedClientID,
          this.bprobablepractice
        );

        return result;
      } else {
        this.clsUtility.showInfo("No records available for export");
        this.emailloading = false;
        return Observable.empty();
      }
    } catch (error) {
      this.emailloading = false;
      this.clsUtility.showError(error);
    }
  };

  public allData = (): Observable<any> => {
    try {
      this.emailloading = true;
      if (this.UnmatchedClaimsdisplaytotalrecordscount != 0) {
        var result = this.filedetailService.SelectedexportData(
          0,
          this.UnmatchedClaimsdisplaytotalrecordscount,
          "Unmatched Claims",
          this.neraMasterFileid,
          this.sSearchText,
          this.sSelectedUnmatchedSearchBy,
          this.datePipe.transform(this.startDate, "yyyyMMdd"),
          this.datePipe.transform(this.endDate, "yyyyMMdd"),
          this.mySelection,
          this.myremove,
          this.selectallflag,
          this.sSelectedsendemailfilter,
          this.sSelectedClientID,
          this.bprobablepractice
        );

        return result;
      } else {
        this.clsUtility.showInfo("No records available for export");
        this.emailloading = false;
        return Observable.empty();
      }
    } catch (error) {
      this.emailloading = false;
      this.clsUtility.showError(error);
    }
  };

  public onExcelExport(args: any): void {
    try {
      this.emailloading = true;
      args.preventDefault();
      const workbook = args.workbook;

      new Workbook(workbook).toDataURL().then((dataUrl: string) => {
        // saveAs(dataUrl, "Categories.xlsx");
        // this.loading = false;
        dataUrl = dataUrl.replace(
          "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,",
          ""
        );
        const blobltext = this.b64toBlob(
          dataUrl,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        var filename =
          "AllUnmatchedClaimsList_" +
          moment(new Date()).format("MMDDYYYY") +
          ".xlsx";

        var testFile = new File([blobltext], filename, {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        this.selectedFiles = testFile;

        this.getMailConfigurationByTitle("Unmatched claim details");
      });
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }

  b64toBlob = (
    b64Data,
    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    sliceSize = 512
  ) => {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blobpdf = new Blob(byteArrays, { type: contentType });
    return blobpdf;
  };

  getMailConfigurationByTitle(Title: String) {
    try {
      var date = moment(new Date()).format("MM/DD/YYYY");
      var objMailSend = new MailSend();

      let seq = this.api.get_email("EmailConfigurationByTitle/" + Title);
      this.subscription.add(
        seq.subscribe((res) => {
          let response = res;
          if (response != null && response != undefined) {
            this.resultarray = response["content"];

            if (this.resultarray != null || this.resultarray != undefined) {
              this.result = this.resultarray[0];
              objMailSend.FromEmail = this.result.emailfrom.toString();
              objMailSend.FromPassword = "";

              // objMailSend.FromPassword = this.clsUtility
              // .decryptAES(this.result.frompassword.toString())
              // .toString();

              if (
                this.result.emailsubject == null ||
                this.result.emailsubject == undefined ||
                this.result.emailbody == null ||
                this.result.emailbody == undefined
              ) {
                this.clsUtility.showError(
                  "Email Configuration not proper. Please contact system administrator."
                );
                this.emailloading = false;
                return;
              } else {
                objMailSend.Subject = this.result.emailsubject.replace(
                  "{{date}}",
                  date
                );
                objMailSend.Body = this.result.emailbody.replace(
                  "{{date}}",
                  date
                );
              }

              if (
                this.result.emailtoreceive != null ||
                this.result.emailtoreceive != undefined
              ) {
                objMailSend.To = this.result.emailtoreceive
                  .toString()
                  .replace(/,/g, ";");
              }
              if (
                this.result.emailccreceive != null ||
                this.result.emailccreceive != undefined
              ) {
                objMailSend.Cc = this.result.emailccreceive
                  .toString()
                  .replace(/,/g, ";");
              }

              this.subscription.add(
                this.authService
                  .sendMailwithAttachment(objMailSend, this.selectedFiles)
                  .subscribe(
                    (response) => {
                      if (response) {
                        this.clsUtility.showSuccess(response.status);
                        this.emailloading = false;
                        this.mySelection = [];
                        this.myremove = [];
                        this.recordselectioncount = 0;
                        this.selectallflag = false;
                        this.selectAllState = "unchecked";

                        this.recordslist = this.filedetailService.exportresponsedata;
                        this.filedetailService.exportresponsedata.forEach(
                          (obj) => {
                            this.recordslist.clpid = obj.clpid;
                            this.recordslist.fileid = obj.fileid;
                            this.recordslist.tsid = obj.tsid;
                            this.exportresponse.push(this.recordslist);
                          }
                        );

                        this.subscription.add(
                          this.filedetailService
                            .UpdateSendEmailData(
                              this.exportresponse,
                              this.currentuserid,
                              this.currentusername
                            )
                            .subscribe(
                              (data) => {
                                if (data != null && data != undefined) {
                                  if (data == 1) {
                                    this.filedetailService.exportresponsedata = [];
                                    this.exportresponse = [];
                                    this.recordslist.clpid = 0;
                                    this.recordslist.fileid = 0;
                                    this.recordslist.tsid = 0;
                                    this.UnmatchedClaimsSkip = 0;
                                    this.RetriveUnmatchedClaims_v2();
                                    this.api.insertActivityLog(
                                      "Email sended",
                                      "All Unmatched Claim",
                                      "READ",
                                      this.neraMasterFileid
                                    );
                                  }
                                }
                              },
                              (err) => {
                                this.clsUtility.showError(err);
                              }
                            )
                        );
                      }
                    },
                    (err) => {
                      this.clsUtility.showError("Error in mail send");
                      this.emailloading = false;
                      this.mySelection = [];
                      this.myremove = [];
                      this.recordselectioncount = 0;
                      this.selectallflag = false;
                      this.selectAllState = "unchecked";
                    }
                  )
              );
            } else {
              this.clsUtility.showInfo(
                "Title 'Unmatched claim details' is not registered in email configuration."
              );
              this.emailloading = false;
            }
          }
        })
      );
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }

  onReprocessClick() {
    // console.log("onReprocessClick");
    // console.log(this.neraMasterFileid);
    // console.log(this.nclientid);
    try {
      this.subscription.add(
        this.filedetailService
          .ReprocessUnmatchedClaims(this.neraMasterFileid, this.nclientid)
          .subscribe(
            (data) => {
              // this.UnmatchedClaimsResponse = data;
              // console.log(data);
              this.api.insertActivityLog(
                "Reprocess files on all unmatched claim for master file (" +
                  this.dataService.mastererafilename +
                  ") ",
                "All Unmatched Claims",
                "READ",
                this.neraMasterFileid
              );
              this.dataService.mastererafileid = this.neraMasterFileid;
              this.dataService.clientid = this.nclientid;
              this.router.navigate(["/SplitFiles"]);
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

  onUnmatchedSearchByChange(event: any) {
    try {
      this.sSelectedUnmatchedSearchBy = event;
      this.searchfiltersvr.setalluclaimsfilter(
        this.sSearchText,
        this.sSelectedUnmatchedSearchBy,
        this.sSelectedsendemailfilter
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onDateChange(value: Date, date: string): void {
    try {
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
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  applyFilters() {
    try {
      if (this.sSelectedClientID != "0") {
        this.bHidebtn = true;
      } else {
        this.bHidebtn = false;
      }
      this.mySelection = [];
      this.myremove = [];
      this.recordselectioncount = 0;
      this.selectallflag = false;
      this.selectAllState = "unchecked";

      if (
        this.fbcFilterSearch.value != null &&
        this.fbcFilterSearch.value != undefined
      ) {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
      } else {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
      }

      if (
        this.neraMasterFileid != null &&
        this.neraMasterFileid != undefined &&
        this.sSearchText != null &&
        this.sSearchText != undefined &&
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined
      ) {
        this.UnmatchedClaimsSkip = 0;
        this.UnmatchedClaimsdisplaytotalrecordscount = 0;
        this.loadingUnmatchedFilesGrid = true;

        this.searchfiltersvr.setalluclaimsfilter(
          this.sSearchText,
          this.sSelectedUnmatchedSearchBy,
          this.sSelectedsendemailfilter
        );
        this.Enabledisablebtn(true);
        this.RetriveUnmatchedClaims_v2();
      } else {
        this.UnmatchedClaimsSkip = 0;
        this.UnmatchedClaimsdisplaytotalrecordscount = 0;
        this.loadingUnmatchedFilesGrid = false;
        this.UnmatchedClaimsResponse = [];
        this.UnmatchedClaimsItems = [];
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clearFilters() {
    try {
      this.mySelection = [];
      this.myremove = [];
      this.recordselectioncount = 0;
      this.selectallflag = false;
      this.selectAllState = "unchecked";

      this.sSelectedClientID = "0";
      this.bHidebtn = false;
      this.nSelectedClientID = "0";
      this.sSearchText = "";
      this.sSelectedUnmatchedSearchBy = "Filename";
      this.fbcFilterSearch.setValue(this.sSearchText);
      this.startDate = new Date();
      this.startDate.setMonth(this.startDate.getMonth() - 3);
      this.endDate = new Date();
      this.sSelectedsendemailfilter = "All";

      this.searchfiltersvr.clearalluclaimsilter();

      this.UnmatchedClaimsSkip = 0;
      this.UnmatchedClaimsdisplaytotalrecordscount = 0;
      this.loadingUnmatchedFilesGrid = true;
      this.Enabledisablebtn(true);
      this.bOninit = true;
      this.RetriveAllClient();
      // this.RetriveUnmatchedClaims_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onSelectedKeysChange(e) {
    try {
      const len = this.mySelection.length;

      if (len === 0) {
        if (this.recordselectioncount > 0) {
          this.UnmatchedClaimsItems.forEach((obj1) => {
            let removeitem = this.mySelection.find(
              (obj2) => obj2 === obj1.clpid
            );
            if (removeitem == null || removeitem == undefined) {
              let redata = this.myremove.find((ob) => ob === obj1.clpid);
              if (redata == null || redata == undefined) {
                this.myremove.push(obj1.clpid);
              }
            } else {
              let redata = this.myremove.find((ob) => ob === obj1.clpid);
              var idx = this.myremove.findIndex((ob) => ob === obj1.clpid);
              if (redata != null || redata != undefined) {
                this.myremove.splice(idx, 1);
              }
            }
          });
        }

        if (this.recordselectioncount == 0) {
          this.selectAllState = "unchecked";
          this.selectallflag = false;
          this.recordselectioncount = 0;
          this.myremove = [];
          this.mySelection = [];
        } else if (
          this.recordselectioncount != 0 &&
          this.myremove.length != this.recordselectioncount
        ) {
          this.selectAllState = "indeterminate";
          this.selectallflag = false;
        } else if (
          this.recordselectioncount != 0 &&
          this.myremove.length == this.recordselectioncount
        ) {
          this.selectAllState = "unchecked";
          this.selectallflag = false;
          this.recordselectioncount = 0;
          this.myremove = [];
          this.mySelection = [];
        }
      } else if (
        (len > 0 && len < this.UnmatchedClaimsItems.length) ||
        (len > this.UnmatchedClaimsItems.length &&
          len < this.UnmatchedClaimsdisplaytotalrecordscount)
      ) {
        this.selectAllState = "indeterminate";
        this.selectallflag = false;

        if (this.recordselectioncount > 0) {
          this.UnmatchedClaimsItems.forEach((obj1) => {
            let removeitem = this.mySelection.find(
              (obj2) => obj2 === obj1.clpid
            );
            if (removeitem == null || removeitem == undefined) {
              let redata = this.myremove.find((ob) => ob === obj1.clpid);
              if (redata == null || redata == undefined) {
                this.myremove.push(obj1.clpid);
              }
            } else {
              let redata = this.myremove.find((ob) => ob === obj1.clpid);
              var idx = this.myremove.findIndex((ob) => ob === obj1.clpid);
              if (redata != null || redata != undefined) {
                this.myremove.splice(idx, 1);
              }
            }
          });
        }
      } else if (
        (len == this.UnmatchedClaimsItems.length &&
          len == this.UnmatchedClaimsPageSize &&
          len == this.recordselectioncount) ||
        len == this.UnmatchedClaimsdisplaytotalrecordscount ||
        (this.recordselectioncount > 0 &&
          this.recordselectioncount ==
            this.UnmatchedClaimsdisplaytotalrecordscount)
      ) {
        this.myremove = [];
        this.selectAllState = "checked";
        this.selectallflag = true;
        this.recordselectioncount = this.UnmatchedClaimsdisplaytotalrecordscount;
      }
      // console.log("len ", len, "this.UnmatchedClaimsItems.length ", this.UnmatchedClaimsItems.length, "this.UnmatchedClaimsPageSize ", this.UnmatchedClaimsPageSize, "this.recordselectioncount ", this.recordselectioncount)
      // console.log(" onSelectedKeysChange this.mySelection ", this.mySelection);
      // console.log(" onSelectedKeysChange for all selection this.myremove ",  this.myremove);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState) {
    try {
      if (checkedState === "checked") {
        this.selectallflag = true;
        this.selectAllState = "checked";
        this.myremove = [];
        this.recordselectioncount = this.UnmatchedClaimsdisplaytotalrecordscount;
      } else {
        this.selectallflag = false;
        this.mySelection = [];
        this.selectAllState = "unchecked";
        this.myremove = [];
        this.recordselectioncount = 0;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSendEmailfilterchange(event: any) {
    try {
      this.sSelectedsendemailfilter = event;
      this.searchfiltersvr.setalluclaimsfilter(
        this.sSearchText,
        this.sSelectedUnmatchedSearchBy,
        this.sSelectedsendemailfilter
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onSelectSuclientClick() {
    try {
      // this.matchedtopractice = true;
      const len = this.mySelection.length;

      let allrecordslist: {
        recordslist: any;
      } = { recordslist: [] };

      if (!isNullOrUndefined(this.mySelection) && this.mySelection != []) {
        for (let index = 0; index < this.mySelection.length; index++) {
          let GenerateUnmatchedClaim: {
            tsid: string;
            clpid: string;
            masterfileid: string;
            clientid: string;
            subclientid: string;
            subclientcode: string;
            userid: string;
            username: string;
          } = {
            tsid: "",
            clpid: "",
            masterfileid: "",
            clientid: "",
            subclientid: "",
            subclientcode: "",
            userid: "",
            username: "",
          };

          if (
            this.UnmatchedClaimsItems.find(
              (x) => x.clpid == this.mySelection[index]
            )
          ) {
            let SelectedClaimindex = this.UnmatchedClaimsItems.findIndex(
              (x) => x.clpid == this.mySelection[index]
            );
            this.Inputclientid = this.sSelectedClientID;
            // this.Inputclientid = this.UnmatchedClaimsItems[
            //   SelectedClaimindex
            // ].clientid;

            GenerateUnmatchedClaim.tsid = this.UnmatchedClaimsItems[
              SelectedClaimindex
            ].tsid;
            GenerateUnmatchedClaim.clpid = this.UnmatchedClaimsItems[
              SelectedClaimindex
            ].clpid;
            GenerateUnmatchedClaim.masterfileid = this.UnmatchedClaimsItems[
              SelectedClaimindex
            ].fileid;
            GenerateUnmatchedClaim.clientid = this.UnmatchedClaimsItems[
              SelectedClaimindex
            ].clientid;
            GenerateUnmatchedClaim.userid = this.dataService.SelectedUserid;
            GenerateUnmatchedClaim.username = this.dataService.loginName[
              "_value"
            ];

            allrecordslist.recordslist.push(GenerateUnmatchedClaim);
            if (this.InputAllClaimno.length > 0) {
              this.InputAllClaimno =
                this.InputAllClaimno +
                "," +
                this.UnmatchedClaimsItems[SelectedClaimindex].claimno;
            } else {
              this.InputAllClaimno = this.UnmatchedClaimsItems[
                SelectedClaimindex
              ].claimno;
            }
            // console.log(this.InputAllClaimno);
          }
        }
        this.InputGenerateUnmatchedClaim = allrecordslist;
      }

      $("#selectsubclientModal").modal("show");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputSelectSubclientResult($event) {
    try {
      this.mySelection = [];
      this.myremove = [];
      this.recordselectioncount = 0;
      this.selectallflag = false;
      this.selectAllState = "unchecked";
      this.Inputclientid = null;
      this.SelectsubclientChild.ResetComponents();
      if ($event == true) {
        this.UnmatchedClaimsSkip = 0;
        this.getUnmatchedClaimsCount();
        this.RetriveUnmatchedClaims_v2();
      }
      $("#selectsubclientModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onViewEOBClick(record: any) {
    try {
      this.inputmastererafileid = record.fileid;
      this.inputtsid = record.tsid;
      this.inputclpid = record.clpid;
      this.inputsplitfileid = 0;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputResult($event) {
    try {
      let IsSaved = $event;

      if (IsSaved == true) {
        this.inputmastererafileid = 0;
        this.inputtsid = 0;
        this.inputclpid = 0;
        this.inputsplitfileid = 0;
        this.EobreportChild.ResetComponents();
        $("#viewEOBReportModal").modal("hide");
      } else {
        this.inputmastererafileid = 0;
        this.inputtsid = 0;
        this.inputclpid = 0;
        this.inputsplitfileid = 0;
        this.EobreportChild.ResetComponents();
        $("#viewEOBReportModal").modal("hide");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  Enabledisablebtn(status: boolean = false) {
    try {
      this.disabledclient = status;
      this.disabledstartdate = status;
      this.disabledenddate = status;
      this.disabledsearch = status;
      this.disabledapplybtn = status;
      this.disabledclearbtn = status;
      this.disabledsearchBy = status;
      this.disabledsendemail = status;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getUnmatchedClaimsCount() {
    try {
      let unmatchedclaimcount = 0;
      let response;
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
            response = data;
            if (response != null && response != undefined) {
              if (response["ncount"] != null) {
                console.log(response["ncount"]);

                unmatchedclaimcount = response["ncount"];
                if (unmatchedclaimcount != null) {
                  this.dataService.unmatchedclaimcount = unmatchedclaimcount;
                  this.dataService.totalunmatchedcount = this.dataService.unmatchedclaimcount;
                }
              } else {
                this.dataService.unmatchedclaimcount = 0;
              }
            }
          })
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onClaimExcelExportClick() {
    try {
      if (this.UnmatchedClaimsdisplaytotalrecordscount > 0) {
        this.ExportExcelDownloadConfirmationMessage =
          this.UnmatchedClaimsdisplaytotalrecordscount +
          " records will be Exported, Do you want to continue ?";
        $("#ExportExcelClaimconfirmationModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async exportToExcelEmail(sgrid: GridComponent) {
    try {
      this.emailloading = true;

      await this.filedetailService
        .getUnmatchedClaimsList(
          this.neraMasterFileid,
          0,
          this.UnmatchedClaimsdisplaytotalrecordscount,
          this.sSelectedUnmatchedSearchBy,
          this.sSearchText,
          this.datePipe.transform(this.startDate, "yyyyMMdd"),
          this.datePipe.transform(this.endDate, "yyyyMMdd"),
          this.sSelectedsendemailfilter,
          this.sSelectedClientID,
          this.bprobablepractice
        )
        .toPromise()
        .then(
          async (data) => {
            sgrid.data = data["content"];
            await sgrid.saveAsExcel();
            this.emailloading = false;
          },
          (err) => {
            this.emailloading = false;
          }
        );

      // this.subscription.add(
      //   this.filedetailService
      //     .getUnmatchedClaimsList(
      //       this.neraMasterFileid,
      //       0,
      //       this.UnmatchedClaimsdisplaytotalrecordscount,
      //       this.sSelectedUnmatchedSearchBy,
      //       this.sSearchText,
      //       this.datePipe.transform(this.startDate, "yyyyMMdd"),
      //       this.datePipe.transform(this.endDate, "yyyyMMdd"),
      //       this.sSelectedsendemailfilter,
      //       this.sSelectedClientID
      //     )
      //     .subscribe(
      //       (data) => {
      //         console.log(data);

      //         sgrid.data = data["content"];
      //         sgrid.saveAsExcel();
      //         this.emailloading = false;
      //       },
      //       (err) => {
      //         this.emailloading = false;
      //       }
      //     )
      // );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onExportExcelCloseConfirmationClick() {
    try {
      $("#ExportExcelClaimconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onExportExcelYesConfirmationClick() {
    this.ClickExportExcel();
  }

  public ClickExportExcel() {
    try {
      document.getElementById("hbtnExportExcel").click();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ClaimExcelExport(args: any): void {
    try {
      this.emailloading = true;
      args.preventDefault();
      const workbook = args.workbook;

      new Workbook(workbook).toDataURL().then((dataUrl: string) => {
        saveAs(dataUrl, this.exportFilename + ".xlsx");
        this.api.insertActivityLog(
          "All Unmatched Claims exported excel",
          "All Unmatched Claims",
          "READ"
        );
        this.emailloading = false;
      });
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }
}
