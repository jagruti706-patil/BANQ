import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import { saveAs } from "file-saver";
import * as JSZip from "jszip";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { Client } from "src/app/Model/client";
import { Subclient } from "src/app/Model/subclient";
import { FormBuilder, Validators } from "@angular/forms";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../node_modules/subsink";
import { Api } from "src/app/Services/api";
import { BreadcrumbService } from "src/app/Services/breadcrumb.service";
import { Router } from "@angular/router";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { ContextMenuSelectEvent } from "@progress/kendo-angular-menu";
import { isNullOrUndefined } from "util";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { clsPermission } from "./../../Services/settings/clspermission";

// import * as $ from 'jquery';

// declare var $: any;

@Component({
  selector: "app-filedetails",
  templateUrl: "./filedetails.component.html",
  styleUrls: ["./filedetails.component.css"],
})
export class FiledetailsComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private filedetailService: FileDetailsService,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    public api: Api,
    private breadcrumbService: BreadcrumbService,
    private router: Router,
    private dataService: DatatransaferService,
    public searchfiltersvr: SearchfiltersService,
    private cdr: ChangeDetectorRef
  ) {
    this.clsUtility = new Utility(toastr);
    this.MasterFilespagesize = this.clsUtility.pagesize;
  }

  private clsUtility: Utility;
  private subscription = new SubSink();

  public MasterFilesGridData: {};
  public MasterFilesGridView: GridDataResult;
  private MasterFilesItems: any[] = [];
  public MasterFilesResponse: any[] = [];
  public MasterFilesSkip = 0;

  public SplitFilesGridData: {};
  public SplitFilesGridView: GridDataResult;
  private SplitFilesItems: any[] = [];
  public SplitFilesSkip = 0;
  public SplitFilesPageSize = 0;

  public MasterFilespage: number = 0;
  public MasterFilespagesize: number = 0;
  public MasterFilesdisplaycurrentpages: number = 0;
  public MasterFilesdisplaytotalpages: number = 0;
  public MasterFilesdisplaytotalrecordscount: number = 0;
  public MasterFilestotalpagescount: number = 0;
  public MasterFilesIspreviousdisabled: boolean = true;
  public MasterFilesIsnextdisabled: boolean = true;

  // Loading
  loadingMasterFiles = true;
  loadingMasterFilesGrid = true;

  loading = false;
  neraMasterFileid: any = "0";
  public startDate: Date = new Date();
  public endDate: Date = new Date();
  public masteropened = false;
  public splitopened = false;
  public s835erainstring: any;
  public s835splitstring: any;
  public sMasterfile: any;
  public sSplitfile: any;
  public stitleMasterfile = "ERA File";
  public stitleSplitfile = "Split File";
  public sAllClients: any; //Client[];
  public SelectAllClients: any;
  public sSubClients: any; //Subclient[];
  public nSelectedClientID: string = "0";
  public sSelectedSubClientCode: any;
  public selectedClientValue: string = "0";
  public selectedSubClientValue: any = 0;
  public selectedMasterStatusValue: string = "3";
  public sMasterStatus: any = [
    { value: "3", text: "All" },
    { value: "0", text: "Inprocess" },
    { value: "1", text: "Process" },
    { value: "2", text: "Unprocess" },
  ];
  public sMasterFileBreadCrumb: string = "MasterFiles";
  public items: any[] = [];
  public itemsexpand: any[] = [];
  public sSelectedMasterStatus: string = "3";
  public sSearchText: string = "";
  public disabledclient: boolean = false;
  public disabledstatus: boolean = false;
  public disabledstartdate: boolean = false;
  public disabledenddate: boolean = false;
  public disabledsearch: boolean = false;
  public disabledSearchBy: boolean = false;
  public disabledapplybtn: boolean = false;
  public disabledclearbtn: boolean = false;
  //public ClientStatus: number = 1;
  clsPermission: clsPermission;
  public sMasterSearchBy: any = [
    { value: "Filename", text: "Filename" },
    { value: "Claim", text: "Claim" },
    { value: "Check", text: "Check" },
    { value: "Payer name", text: "Payer name" },
    { value: "Payerid", text: "Payerid" },
    { value: "Patient firstname", text: "Patient firstname" },
    { value: "Patient lastname", text: "Patient lastname" },
    {
      value: "Rendering provider firstname",
      text: "Rendering provider firstname",
    },
    {
      value: "Rendering provider lastname",
      text: "Rendering provider lastname",
    },
    { value: "Rendering provider npi", text: "Rendering provider npi" },
  ];
  public sSelectedMasterSearchBy: string = "Filename";
  public currentusername: string = "";
  private currentuserid: string;
  private bOninit = false;

  percentage: number = 0;
  isFilesProcessing: boolean = false;
  public ConfirmationMessage: string = "";
  public openederrorcontext = false;
  public Filename: string = "";
  public errorresponse: any = [];
  public reprocessdata: any = [];

  public sortMaster: SortDescriptor[] = [
    {
      field: "dtimportdate",
      dir: "desc",
    },
  ];

  public sortSplit: SortDescriptor[] = [
    {
      field: "sfilename",
      dir: "desc",
    },
  ];

  DropDownGroup = this.fb.group({
    fcClientName: ["", Validators.required],
    fcSubClientName: ["", Validators.required],
    fcMasterStatus: ["", Validators.required],
    fcMasterSearchBy: ["", Validators.required],
    fcSearch: [""],
  });

  get ClientName() {
    return this.DropDownGroup.get("fcClientName");
  }

  get SubClientName() {
    return this.DropDownGroup.get("fcSubClientName");
  }

  get MasterStatus() {
    return this.DropDownGroup.get("fcMasterStatus");
  }

  get MasterSearchBy() {
    return this.DropDownGroup.get("fcMasterSearchBy");
  }

  get fbcFilterSearch() {
    return this.DropDownGroup.get("fcSearch");
  }

  ngOnInit() {
    try {
      this.bOninit = true;
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );
      this.currentuserid = this.dataService.SelectedUserid;
      this.currentusername = this.dataService.loginUserName;
      
      if(this.clsPermission.reprocessaccess){
        this.items.push({ text: "Reprocess" });
        // this.itemsexpand.push({ text: "Reprocess" });
      }

      if(this.clsPermission.viewerrorcontext){
        this.itemsexpand.push({ text: "View Error Context" });
      }

      this.startDate.setDate(this.startDate.getDate() - 1);
      if (this.searchfiltersvr.filefilter == true) {
        this.nSelectedClientID = this.searchfiltersvr.getfileSelectedClientID();
        let sdate = new Date(this.searchfiltersvr.getfilestartDate());
        this.startDate = sdate;
        let edate = new Date(this.searchfiltersvr.getfileendDate());
        this.endDate = edate;
        this.selectedMasterStatusValue = this.searchfiltersvr.getfileselectedStatus();
        this.sSelectedMasterStatus = this.searchfiltersvr.getfileselectedStatus();
        this.sSelectedMasterSearchBy = this.searchfiltersvr.getfileselectedSearchBy();
        this.sSearchText = this.searchfiltersvr.getfilesSearchText();
        this.fbcFilterSearch.setValue(this.sSearchText);
      }

      this.MasterFilesdisplaytotalrecordscount = 0;
      this.loadingMasterFiles = true;
      this.loadingMasterFilesGrid = true;
      //this.ClientStatus = 1;
      this.breadcrumbService.showhideFilesbreadcrumb(
        true,
        this.sMasterFileBreadCrumb
      );
      this.Enabledisablebtn(true);
      this.RetriveAllClient();
      this.api.insertActivityLog("Master Files List Viewed", "Files", "READ");
    } catch (error) {
      this.loadingMasterFiles = false;
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveMasterFiles() {
    try {
      this.subscription.add(
        this.filedetailService
          .getMasterFileList(
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),
            this.nSelectedClientID,
            this.MasterFilespage,
            this.MasterFilespagesize,
            this.fbcFilterSearch.value
          )
          .subscribe(
            (data) => {
              if (!isNullOrUndefined(data) && data.content != null) {
                this.MasterFilesdisplaycurrentpages =
                  data.pageable.pageNumber + 1;
                this.MasterFilesdisplaytotalpages = data.totalPages;
                this.MasterFilestotalpagescount = data.totalPages;
                this.MasterFilesdisplaytotalrecordscount = data.totalElements;
              } else {
                this.MasterFilesdisplaycurrentpages = 0;
                this.MasterFilesdisplaytotalpages = 0;
                this.MasterFilestotalpagescount = 0;
                this.MasterFilesdisplaytotalrecordscount = 0;
                this.MasterFilesItems = null;
                this.MasterFilesGridView = null;
                return;
              }

              this.MasterFilesdisplaycurrentpages =
                data.pageable.pageNumber + 1;
              this.MasterFilesdisplaytotalpages = data.totalPages;
              this.MasterFilestotalpagescount = data.totalPages;
              this.MasterFilesdisplaytotalrecordscount = data.totalElements;
              if (JSON.stringify(data.last) == "true") {
                this.MasterFilesIsnextdisabled = true;
              } else {
                this.MasterFilesIsnextdisabled = false;
              }
              if (this.MasterFilespage == 0) {
                this.MasterFilesIspreviousdisabled = true;
              } else {
                this.MasterFilesIspreviousdisabled = false;
              }

              this.MasterFilesGridData = data.content;
              this.MasterFilesItems = data.content;
              if (data.content != null) this.loadItemsMaster();
              else this.MasterFilesGridView = null;
              this.loadingMasterFiles = false;
              this.loadingMasterFilesGrid = false;

              this.neraMasterFileid = "0";
              // if (JSON.stringify(data) != "[]") {
              //   // this.neraMasterFileid = JSON.stringify(data[0]['nmastererafileid']).replace(/"/g, "");
              //   this.RetriveSplitFiles();
              // }

              if (this.MasterStatus.value != "All") {
                this.MasterFilesItems = this.MasterFilesItems.filter(
                  (x) => x.status == this.MasterStatus.value
                );
                this.loadItemsMaster();
              }
            },
            (err) => {
              this.loadingMasterFilesGrid = false;
            }
          )
      );
    } catch (error) {
      this.loadingMasterFiles = false;
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveSplitFiles() {
    try {
      this.subscription.add(
        this.filedetailService
          .getSplitFileList(this.neraMasterFileid, this.sSelectedSubClientCode)
          .subscribe(
            (data) => {
              if (!isNullOrUndefined(data)) {
                this.SplitFilesGridData = data;
                this.SplitFilesItems = data;
                this.loadItemsSplit();
                this.loading = false;
              } else {
                this.loading = false;
                this.loadingMasterFiles = false;
                this.loadingMasterFilesGrid = false;
              }
            },
            (err) => {
              this.loading = false;
              this.loadingMasterFiles = false;
              this.loadingMasterFilesGrid = false;
            }
          )
      );
    } catch (error) {
      this.loading = false;
      this.loadingMasterFiles = false;
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveMaster835File(nerafileid, sfilename: string, status: string) {
    try {
      this.loadingMasterFilesGrid = true;
      this.neraMasterFileid = nerafileid;
      this.subscription.add(
        this.filedetailService
          .getMaster835File(this.neraMasterFileid)
          .subscribe(
            (data) => {
              if (!isNullOrUndefined(data)) {
                this.sMasterfile = data["s835string"];
                this.stitleMasterfile = sfilename;
                if (status == "View") {
                  this.OnViewMasterFile();
                  this.loadingMasterFilesGrid = false;
                  this.api.insertActivityLog(
                    "Master File (" + this.stitleMasterfile + ") Viewed",
                    "Files",
                    "READ",
                    this.neraMasterFileid
                  );
                } else {
                  this.OnDownloadMasterFile(sfilename);
                  this.loadingMasterFilesGrid = false;
                  this.api.insertActivityLog(
                    "Master File (" + this.stitleMasterfile + ") Downloaded",
                    "Files",
                    "READ",
                    this.neraMasterFileid
                  );
                }
              } else {
                this.loading = false;
                this.loadingMasterFiles = false;
                this.loadingMasterFilesGrid = false;
              }
            },
            (err) => {
              this.loading = false;
              this.loadingMasterFiles = false;
              this.loadingMasterFilesGrid = false;
            }
          )
      );
    } catch (error) {
      this.loading = false;
      this.loadingMasterFiles = false;
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveSplit835File(nerafileid, sfilename: string, status: string) {
    try {
      this.subscription.add(
        this.filedetailService.getSplit835File(nerafileid).subscribe(
          (data) => {
            if (!isNullOrUndefined(data)) {
              this.sSplitfile = data;
              this.stitleSplitfile = sfilename.split(".")[0];
              if (status == "View") {
                this.OnViewSplitFile();
              } else {
                this.OnDownloadSplitFile(sfilename.split(".")[0]);
              }
            } else {
              this.loading = false;
              this.loadingMasterFiles = false;
              this.loadingMasterFilesGrid = false;
            }
          },
          (err) => {
            this.loading = false;
            this.loadingMasterFiles = false;
            this.loadingMasterFilesGrid = false;
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.loadingMasterFiles = false;
      this.loadingMasterFilesGrid = false;
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
              // this.disabledclient = false;
              // this.disabledstatus = false;
              // this.disabledstartdate = false;
              // this.disabledenddate = false;
              // this.disabledsearch = false;
              // this.disabledSearchBy = false;

              if (
                this.sAllClients[0]["nclientcount"] == this.sAllClients.length
              ) {
                const Allclt = new Client();
                Allclt.clientid = "0";
                Allclt.clientcode = "";
                Allclt.clientname = "All";
                this.sAllClients.unshift(Allclt);
                this.SelectAllClients = this.sAllClients;
                this.nSelectedClientID = "0";
              } else {
                this.SelectAllClients = this.sAllClients;
                this.nSelectedClientID = this.sAllClients[0]["clientid"];
              }

              if (this.searchfiltersvr.fileSelectedClientID != "0") {
                this.nSelectedClientID = this.searchfiltersvr.fileSelectedClientID;
              }
              // else {
              //   this.nSelectedClientID = "0";
              // }
              if (this.bOninit) {
                this.RetriveMasterFiles_v2();
                this.bOninit = false;
              } else {
                this.Enabledisablebtn(false);
              }
            } else {
              this.sAllClients = [];
              this.Enabledisablebtn(true);
              // this.disabledclient = true;
              // this.disabledstatus = true;
              // this.disabledstartdate = true;
              // this.disabledenddate = true;
              // this.disabledsearch = true;
              // this.disabledSearchBy = true;
              this.MasterFilesResponse = [];
              this.MasterFilesItems = [];
              this.loadingMasterFilesGrid = false;
              this.neraMasterFileid = "0";
              this.clsUtility.showInfo("No group is active");
            }
          },
          (err) => {
            this.loading = false;
            this.loadingMasterFilesGrid = false;
            this.clsUtility.LogError(err);
          }
        )
      );
      // this.subscription.add(
      //   this.coreService.getClientList(nClientStatus).subscribe(
      //     data => {
      //       this.sAllClients = data;
      //       const Allclt = new Client();
      //       Allclt.clientid = "0";
      //       Allclt.clientcode = "";
      //       Allclt.clientname = "All";
      //       this.sAllClients.push(Allclt);
      //       this.selectedClientValue = "0";
      //     },
      //     err => {
      //       this.loadingMasterFilesGrid = false;
      //     }
      //   )
      // );
    } catch (error) {
      this.loading = false;
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient() {
    try {
      let getsubclient: { clientid: string; subclientcode: string } = {
        clientid: this.nSelectedClientID,
        subclientcode: "",
      };
      let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            if (!isNullOrUndefined(res)) {
              this.sSubClients = res;
              const Subclt = new Subclient();
              Subclt.subclientid = this.nSelectedClientID;
              Subclt.subclientcode = "0";
              Subclt.subclientname = "All";
              this.sSubClients.push(Subclt);
              this.sSelectedSubClientCode = "0";
            }
          },
          (err) => {
            this.loading = false;
            this.loadingMasterFilesGrid = false;
            this.clsUtility.LogError(err);
          }
        )
      );

      // this.subscription.add(
      //   this.coreService
      //     .getSubClientDetailbyClientId(this.nSelectedClientID)
      //     .subscribe(
      //       data => {
      //         // if (data != []) {
      //         //   console.log("data : " + JSON.stringify(data));
      //         //   for (let i = 0; i < data.length; i++) {
      //         //     console.log("Length : " + data.length + data[i]["subclientstatus"]);
      //         //     if (data[i]["subclientstatus"] == true) {
      //         //       console.log("i: " + i + "Data :" + data[i]["subclientstatus"]);
      //         //     }
      //         //   }
      //         // }

      //         this.sSubClients = data;
      //         const Subclt = new Subclient();
      //         Subclt.subclientid = this.nSelectedClientID;
      //         // if (this.sSubClients.length > 0) {
      //         //   console.log(JSON.stringify(this.sSubClients));
      //         //   const index: number = this.sSubClients.findIndex(x => x.subclientstatus == false);
      //         //   console.log("Index :" + index);
      //         //   // if ((this.sSubClients.findIndex(x => x.subclientstatus == false)) > 0) {
      //         //   //   let index = this.sSubClients.findIndex(x => x.subclientstatus == false)
      //         //   //   console.log("Index :" + index);
      //         //   // }
      //         //   // for (let i = 0; i < this.sSubClients.length; i++) {
      //         //   //   console.log("this.sSubClients[i].subclientstatus i:" + i + JSON.stringify(this.sSubClients[i].subclientstatus));
      //         //   //   if (this.sSubClients[i].subclientstatus === false) {
      //         //   //     console.log("Subclient Inactive : " + JSON.stringify(this.sSubClients[i].subclientstatus));
      //         //   //   }
      //         // }
      //         Subclt.subclientcode = "0";
      //         Subclt.subclientname = "All";
      //         this.sSubClients.push(Subclt);
      //         this.sSelectedSubClientCode = "0";
      //       },
      //       err => {
      //         this.loadingMasterFilesGrid = false;
      //       }
      //     )
      // );
    } catch (error) {
      this.loading = false;
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  OnViewMasterFile() {
    try {
      // this.s835erainstring = this.sMasterfile.replace(/~/g, "~\n");
      this.s835erainstring = this.sMasterfile;
      this.On835erainFile();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnViewSplitFile() {
    try {
      // this.s835splitstring = this.sSplitfile.replace(/~/g, "~\n");
      this.s835splitstring = this.sSplitfile;
      this.On835splitFile();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnDownloadMasterFile(Masterfilename) {
    try {
      var zip = new JSZip();
      zip.file(Masterfilename, this.sMasterfile);
      zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, Masterfilename + ".zip");
      });
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnDownloadSplitFile(Splitfilename) {
    try {
      var zip = new JSZip();
      zip.file(Splitfilename + ".txt", this.sSplitfile);
      zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, Splitfilename + ".zip");
      });
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnCellClickMasterFile(event: any) {
    try {
      this.neraMasterFileid = event.dataItem.nmastererafileid;
      this.dataService.mastererafileid = this.neraMasterFileid;
      this.dataService.clientid = event.dataItem.clientid;
      this.dataService.mastererafilename = event.dataItem.sfilename;
      //this.RetriveSplitFiles();
      if (event.column.title == "Split Files") {
        if (
          event.dataItem.nstatus == "Process" &&
          event.dataItem.splitcount != "0" &&
          event.dataItem.subclientcount != "0"
        ) {
          if (
            this.searchfiltersvr.splitfilefilter == true &&
            this.searchfiltersvr.files_mastererafileid !=
              event.dataItem.nmastererafileid
          ) {
            this.searchfiltersvr.clearsplitfilefilter();
          } else if (this.searchfiltersvr.splitfilefilter == true) {
            this.searchfiltersvr.files_mastererafileid =
              event.dataItem.nmastererafileid;
          } else {
            this.searchfiltersvr.splitfilefilter = true;
            this.searchfiltersvr.files_mastererafileid =
              event.dataItem.nmastererafileid;
          }

          this.router.navigate(["/SplitFiles"]);
        }
      } else if (event.column.title == "Unmatched Claim Count") {
        if (event.dataItem.unmatchedclaimcount != "0") {
          if (
            this.searchfiltersvr.uclaimsfilter == true &&
            this.searchfiltersvr.files_mastererafileid !=
              event.dataItem.nmastererafileid
          ) {
            this.searchfiltersvr.clearuclaimsilter();
          } else if (this.searchfiltersvr.uclaimsfilter == true) {
            this.searchfiltersvr.files_mastererafileid =
              event.dataItem.nmastererafileid;
          } else {
            this.searchfiltersvr.uclaimsfilter = true;
            this.searchfiltersvr.files_mastererafileid =
              event.dataItem.nmastererafileid;
          }

          this.router.navigate(["/UnmatchedClaims"]);
        }
      } else if (event.column.title == "Payer") {
        if (event.dataItem.nstatus == "Process") {
          if (
            this.searchfiltersvr.payerfilter == true &&
            this.searchfiltersvr.files_mastererafileid !=
              event.dataItem.nmastererafileid
          ) {
            this.searchfiltersvr.clearpayerfilter();
          } else if (this.searchfiltersvr.payerfilter == true) {
            this.searchfiltersvr.files_mastererafileid =
              event.dataItem.nmastererafileid;
          } else {
            this.searchfiltersvr.payerfilter = true;
            this.searchfiltersvr.files_mastererafileid =
              event.dataItem.nmastererafileid;
          }

          this.router.navigate(["/FilesClaimDetails"]);
        }
      } else if (event.column.title == "Unmatched PLB Count") {
        if (event.dataItem.unmatchedplbcount != "0") {
          // if (
          //   this.searchfiltersvr.uclaimsfilter == true &&
          //   this.searchfiltersvr.files_mastererafileid !=
          //     event.dataItem.nmastererafileid
          // ) {
          //   this.searchfiltersvr.clearuclaimsilter();
          // } else if (this.searchfiltersvr.uclaimsfilter == true) {
          //   this.searchfiltersvr.files_mastererafileid =
          //     event.dataItem.nmastererafileid;
          // } else {
          //   this.searchfiltersvr.uclaimsfilter = true;
          //   this.searchfiltersvr.files_mastererafileid =
          //     event.dataItem.nmastererafileid;
          // }

          this.router.navigate(["/UnmatchedPLBs"]);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  On835erainFile() {
    try {
      this.masteropened = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  On835splitFile() {
    try {
      this.splitopened = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public masterclose() {
    try {
      this.masteropened = false;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public splitclose() {
    try {
      this.splitopened = false;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsMaster(): void {
    try {
      this.MasterFilesGridView = {
        data: orderBy(
          this.MasterFilesItems.slice(
            this.MasterFilesSkip,
            this.MasterFilesSkip + this.MasterFilespagesize
          ),
          this.sortMaster
        ),
        total: this.MasterFilesItems.length,
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsSplit(): void {
    try {
      this.SplitFilesGridView = {
        data: orderBy(
          this.SplitFilesItems.slice(
            this.SplitFilesSkip,
            this.SplitFilesSkip + this.SplitFilesPageSize
          ),
          this.sortSplit
        ),
        total: this.SplitFilesItems.length,
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeMaster(event: PageChangeEvent): void {
    try {
      this.MasterFilesSkip = event.skip;
      this.loadItemsMaster();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeSplit(event: PageChangeEvent): void {
    try {
      this.SplitFilesSkip = event.skip;
      this.loadItemsSplit();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onDateChange(value: Date, date: string): void {
    try {
      // console.log("Date:" + (this.datePipe.transform(value, 'yyyyMMdd')));

      // if ((this.datePipe.transform(this.startDate, 'yyyyMMdd')) > (this.datePipe.transform(this.endDate, 'yyyyMMdd'))) {
      //   alert("Start date should be smaller then End date");
      //   this.gridViewMaster.data = [];
      //   this.gridViewSplit.data = [];
      //   return;
      // }

      if (value != null) {
        // this.RetriveMasterFiles();
        if (date == "start date" && value > this.endDate) {
          this.clsUtility.showWarning("Start date must be less than end date");
          this.startDate = new Date();
        } else if (date == "end date" && value < this.startDate) {
          this.clsUtility.showWarning(
            "End date must be greater than start date"
          );
          this.endDate = new Date();
        }
        // this.MasterFilesSkip = 0;
        // this.MasterFilesdisplaytotalrecordscount = 0;
        // this.loadingMasterFilesGrid = true;
        this.searchfiltersvr.setfilefilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        // this.RetriveMasterFiles_v2();
      } else {
        if (date == "start date") {
          this.startDate = new Date();
        } else if (date == "end date") {
          this.endDate = new Date();
        }
        this.searchfiltersvr.setfilefilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        this.RetriveMasterFiles_v2();
        this.clsUtility.LogError("Select valid date");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortMasterChange(sort: SortDescriptor[]): void {
    try {
      this.sortMaster = sort;
      // this.loadItemsMaster();
      this.loadItemsMaster_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortSplitChange(sort: SortDescriptor[]): void {
    try {
      this.sortSplit = sort;
      this.loadItemsSplit();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onClientChange(event: any) {
    try {
      // this.MasterFilesdisplaytotalrecordscount = 0;
      // this.loadingMasterFilesGrid = true;
      // this.MasterFilesSkip = 0;
      // this.SplitFilesSkip = 0;
      this.nSelectedClientID = event;
      this.searchfiltersvr.setfilefilter(
        this.nSelectedClientID,
        this.startDate,
        this.endDate,
        this.sSelectedMasterStatus,
        this.sSelectedMasterSearchBy,
        this.sSearchText
      );
      // this.RetriveMasterFiles();
      // this.RetriveMasterFiles_v2();
      //this.RetriveSubClient();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSubClientChange(event: any) {
    // try {
    //   this.SplitFilesSkip = 0;
    //   this.sSelectedSubClientCode = event;
    //   // this.RetriveSplitFiles();
    //   this.sSelectedMasterStatus = event;
    //   this.RetriveMasterFiles_v2();
    // } catch (error) {
    //   this.clsUtility.LogError(error);
    // }
  }

  onMasterStatusChange(event: any) {
    try {
      // this.MasterFilesdisplaytotalrecordscount = 0;
      // this.loadingMasterFilesGrid = true;
      this.sSelectedMasterStatus = event;
      // if (
      //   this.sSelectedMasterStatus == "3" ||
      //   this.sSelectedMasterStatus == "1"
      // ) {
      //   this.sMasterSearchBy = [
      //     { value: "Filename", text: "Filename" },
      //     { value: "Claim", text: "Claim" },
      //     { value: "Check", text: "Check" },
      //     { value: "Payer name", text: "Payer name" },
      //     { value: "Payerid", text: "Payerid" },
      //     { value: "Patient firstname", text: "Patient firstname" },
      //     { value: "Patient lastname", text: "Patient lastname" },
      //     {
      //       value: "Rendering provider firstname",
      //       text: "Rendering provider firstname"
      //     },
      //     {
      //       value: "Rendering provider lastname",
      //       text: "Rendering provider lastname"
      //     },
      //     { value: "Rendering provider npi", text: "Rendering provider npi" }
      //   ];
      // } else if (
      //   this.sSelectedMasterStatus == "0" ||
      //   this.sSelectedMasterStatus == "2"
      // ) {
      //   this.sMasterSearchBy = [{ value: "Filename", text: "Filename" }];
      //   this.sSelectedMasterSearchBy = "Filename";
      //   this.sSearchText = "";
      //   // this.fcMasterSearchBy.this.sSearchText = "";
      // }
      // this.MasterFilesSkip = 0;
      // this.SplitFilesSkip = 0;
      this.searchfiltersvr.setfilefilter(
        this.nSelectedClientID,
        this.startDate,
        this.endDate,
        this.sSelectedMasterStatus,
        this.sSelectedMasterSearchBy,
        this.sSearchText
      );
      // this.RetriveMasterFiles_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterSearchByChange(event: any) {
    try {
      // console.log(event);
      this.sSelectedMasterSearchBy = event;
      this.searchfiltersvr.setfilefilter(
        this.nSelectedClientID,
        this.startDate,
        this.endDate,
        this.sSelectedMasterStatus,
        this.sSelectedMasterSearchBy,
        this.sSearchText
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterFilesClickPrevious() {
    try {
      if (this.MasterFilespage >= 0) {
        if (this.MasterFilespage == 0) {
          this.MasterFilesIspreviousdisabled = true;
          return;
        } else {
          this.MasterFilesIspreviousdisabled = false;
          this.MasterFilespage = this.MasterFilespage - 1;
        }
        this.RetriveMasterFiles();
      }
    } catch (error) {
      this.MasterFilespage = this.MasterFilespage + 1;
      this.clsUtility.LogError(error);
    }
  }

  onMasterFilesClickNext() {
    try {
      if (this.MasterFilespage >= 0) {
        if (
          this.MasterFilestotalpagescount > 0 &&
          this.MasterFilespage < this.MasterFilestotalpagescount - 1
        )
          this.MasterFilespage = this.MasterFilespage + 1;
        this.RetriveMasterFiles();
      }
    } catch (error) {
      this.MasterFilespage = this.MasterFilespage - 1;
      this.clsUtility.LogError(error);
    }
  }

  onSearch($event: any = null) {
    try {
      if (!isNullOrUndefined($event)) {
        if ($event.type == "keyup") {
          // this.MasterFilesSkip = 0;
          this.sSearchText = "";
          this.sSearchText = this.fbcFilterSearch.value.trim();
          // this.MasterFilesdisplaytotalrecordscount = 0;
          // this.loadingMasterFilesGrid = true;
          this.searchfiltersvr.setfilefilter(
            this.nSelectedClientID,
            this.startDate,
            this.endDate,
            this.sSelectedMasterStatus,
            this.sSelectedMasterSearchBy,
            this.sSearchText
          );
          // this.RetriveMasterFiles_v2();
        } else if ($event.type == "click") {
          // this.MasterFilesSkip = 0;
          this.sSearchText = "";
          this.sSearchText = this.fbcFilterSearch.value.trim();
          // this.MasterFilesdisplaytotalrecordscount = 0;
          // this.loadingMasterFilesGrid = true;
          this.searchfiltersvr.setfilefilter(
            this.nSelectedClientID,
            this.startDate,
            this.endDate,
            this.sSelectedMasterStatus,
            this.sSelectedMasterSearchBy,
            this.sSearchText
          );
          // this.RetriveMasterFiles_v2();
        }
      }

      // this.RetriveMasterFiles();
      //this.RetriveMasterFiles_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMenuItemSelect(dataItem: any, target: any) {
    try {      
      if(target.item.text == 'Reprocess'){
        if(dataItem.isFilesProcessing == false){
          dataItem.isFilesProcessing = true;
          let reprocess: {
            mastererafileid: string;
            clientid: string;
            filename: string;
            validationoverride: boolean;
            checkduplicatepaymentoverride: boolean;
          } = {
            mastererafileid: dataItem.nmastererafileid,
            clientid: dataItem.clientid,
            filename: dataItem.sfilename,
            validationoverride: false,
            checkduplicatepaymentoverride: false
          };
          let seq = this.api.post_edi("api/Parser/MasterReprocess", reprocess);
          seq.subscribe(
            (res) => {
              this.api.insertActivityLog(
                "Master File (" + dataItem.sfilename + ") reprocessed.",
                "Files",
                "READ",
                dataItem.nmastererafileid
              );
    
              setTimeout(() => {
                this.RetriveMasterFiles_v2();
              }, 2000);
            },
            (err) => {
              this.loading = false;
              this.clsUtility.LogError(err);
            }
          );
        }        
      } else if (target.item.text == 'View Error Context') {
        this.errorresponse = [];
        this.ConfirmationMessage = "Error Context Details";
        this.Filename = dataItem.sfilename;

        let para: {
          mastererafileid: string;         
        } = {
          mastererafileid: dataItem.nmastererafileid        
        };
        let seq = this.api.post_edi("api/Files/getErrorContextDetails", para);
        seq.subscribe(
          (res) => {            
            if(res != null && res != undefined){
              this.errorresponse = res;
              this.api.insertActivityLog("Error Context Details Viewed for " + this.Filename, "Files", "READ");
              this.reprocessdata = dataItem;
              this.openErrorDailog();
            }         
          },
          (err) => {
            this.loading = false;
            this.clsUtility.LogError(err);
          }
        );        
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  masterreprocess(overrideflag: boolean){
    try {
      if(this.reprocessdata != null && this.reprocessdata != undefined && this.reprocessdata != []){
        if(this.reprocessdata.isFilesProcessing == false){
          this.reprocessdata.isFilesProcessing = true;
          let reprocess: {
            mastererafileid: string;
            clientid: string;
            filename: string;
            validationoverride: boolean;
            checkduplicatepaymentoverride: boolean;
          } = {
            mastererafileid: this.reprocessdata.nmastererafileid,
            clientid: this.reprocessdata.clientid,
            filename: this.reprocessdata.sfilename,
            validationoverride: overrideflag,
            checkduplicatepaymentoverride: overrideflag
          };
          let seq = this.api.post_edi("api/Parser/MasterReprocess", reprocess);
          seq.subscribe(
            (res) => {
              this.api.insertActivityLog(
                "Master File (" + this.reprocessdata.sfilename + ") reprocessed.",
                "Files",
                "READ",
                this.reprocessdata.nmastererafileid
              );
    
              setTimeout(() => {
                this.closeErrorDailog();
                this.RetriveMasterFiles_v2();
              }, 2000);
            },
            (err) => {
              this.loading = false;
              this.clsUtility.LogError(err);
            }
          );
        } 
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.breadcrumbService.showhideFilesbreadcrumb();
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveMasterFiles_v2() {
    this.MasterFilesGridView = null;
    this.MasterFilesItems = [];
    try {
      this.loadingMasterFilesGrid = true;
      this.subscription.add(
        this.filedetailService
          .getMasterFileList_v2(
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),
            this.nSelectedClientID,
            this.MasterFilesSkip,
            this.MasterFilespagesize,
            this.sSelectedMasterSearchBy,
            this.sSearchText,
            this.sSelectedMasterStatus
          )
          .subscribe(
            (data) => {
              if (data != null && data != undefined) {
                this.MasterFilesResponse = data;
                this.MasterFilesItems = this.MasterFilesResponse["content"];
                this.MasterFilesdisplaytotalrecordscount = this.MasterFilesResponse[
                  "totalelements"
                ];
                
                if (this.MasterFilesItems != null) {
                  this.MasterFilesItems.forEach(obj1 => {                    
                    if(obj1.nstatus == 'UnProcess'){
                      obj1.isFilesProcessing = false;
                    }
                  });                
                  this.loadItemsMaster_v2();
                  this.loadingMasterFiles = false;
                  this.Enabledisablebtn(false);
                  this.neraMasterFileid = "0";
                } else {
                  this.MasterFilesdisplaytotalrecordscount = 0;
                  this.Enabledisablebtn(false);
                }
              }
              this.loadingMasterFilesGrid = false;
            },
            (err) => {
              this.loading = false;
              this.loadingMasterFiles = false;
              this.loadingMasterFilesGrid = false;
              this.Enabledisablebtn(false);
            }
          )
      );
    } catch (error) {
      this.loading = false;
      this.loadingMasterFiles = false;
      this.loadingMasterFilesGrid = false;
      this.Enabledisablebtn(false);
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsMaster_v2(): void {
    this.MasterFilesGridView = null;
    try {
      if (this.MasterFilesItems != null && this.MasterFilesItems != undefined) {
        if (this.MasterFilesItems && this.MasterFilesItems.length > 0) {
          this.MasterFilesGridView = {
            data: orderBy(this.MasterFilesItems, this.sortMaster),
            total: this.MasterFilesResponse["totalelements"],
          };
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  pageChangeMasterFile(event: PageChangeEvent): void {
    this.loadingMasterFilesGrid = true;
    this.MasterFilesGridView = null;
    this.MasterFilesSkip = event.skip;
    this.RetriveMasterFiles_v2();
  }

  handleClientFilter(value) {
    this.sAllClients = this.SelectAllClients.filter(
      (s) => s.clientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  applyFilters() {
    try {
      if (
        this.fbcFilterSearch.value != null &&
        this.fbcFilterSearch.value != undefined
      ) {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
        this.searchfiltersvr.setfilefilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        this.searchfiltersvr.clearuclaimsilter();
        this.searchfiltersvr.clearpayerfilter();
        this.searchfiltersvr.clearsplitfilefilter();
      } else {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
        this.searchfiltersvr.setfilefilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        this.searchfiltersvr.clearuclaimsilter();
        this.searchfiltersvr.clearpayerfilter();
        this.searchfiltersvr.clearsplitfilefilter();
      }

      if (
        this.nSelectedClientID != null &&
        this.nSelectedClientID != undefined &&
        this.sSelectedMasterStatus != null &&
        this.sSelectedMasterStatus != undefined &&
        this.sSearchText != null &&
        this.sSearchText != undefined &&
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined
      ) {
        this.MasterFilesSkip = 0;
        this.MasterFilesdisplaytotalrecordscount = 0;
        this.loadingMasterFilesGrid = true;
        this.Enabledisablebtn(true);
        this.RetriveMasterFiles_v2();
      } else {
        this.MasterFilesSkip = 0;
        this.MasterFilesdisplaytotalrecordscount = 0;
        this.loadingMasterFilesGrid = false;
        this.MasterFilesResponse = [];
        this.MasterFilesItems = [];
      }
    } catch (error) {
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  clearFilters() {
    try {
      this.nSelectedClientID = "0";
      this.sSelectedMasterStatus = "3";
      this.sSelectedMasterSearchBy = "Filename";
      this.sSearchText = "";
      this.fbcFilterSearch.setValue(this.sSearchText);
      this.startDate = new Date();
      this.startDate.setDate(this.startDate.getDate() - 1);
      this.endDate = new Date();

      this.searchfiltersvr.setfilefilter(
        this.nSelectedClientID,
        this.startDate,
        this.endDate,
        this.sSelectedMasterStatus,
        this.sSelectedMasterSearchBy,
        this.sSearchText
      );
      this.searchfiltersvr.clearuclaimsilter();
      this.searchfiltersvr.clearpayerfilter();
      this.searchfiltersvr.clearsplitfilefilter();

      this.MasterFilesSkip = 0;
      this.MasterFilesdisplaytotalrecordscount = 0;
      this.loadingMasterFilesGrid = true;
      this.Enabledisablebtn(true);
      this.bOninit = true;
      this.RetriveAllClient();
      // this.RetriveMasterFiles_v2();
    } catch (error) {
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onRefreshClick() {
    try {
      if (
        this.fbcFilterSearch.value != null &&
        this.fbcFilterSearch.value != undefined
      ) {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
        this.searchfiltersvr.setfilefilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        this.searchfiltersvr.clearuclaimsilter();
        this.searchfiltersvr.clearpayerfilter();
        this.searchfiltersvr.clearsplitfilefilter();
      } else {
        this.sSearchText = "";
        this.sSearchText = this.fbcFilterSearch.value.trim();
        this.searchfiltersvr.setfilefilter(
          this.nSelectedClientID,
          this.startDate,
          this.endDate,
          this.sSelectedMasterStatus,
          this.sSelectedMasterSearchBy,
          this.sSearchText
        );
        this.searchfiltersvr.clearuclaimsilter();
        this.searchfiltersvr.clearpayerfilter();
        this.searchfiltersvr.clearsplitfilefilter();
      }

      if (
        this.nSelectedClientID != null &&
        this.nSelectedClientID != undefined &&
        this.sSelectedMasterStatus != null &&
        this.sSelectedMasterStatus != undefined &&
        this.sSearchText != null &&
        this.sSearchText != undefined &&
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined
      ) {
        this.MasterFilesSkip = 0;
        this.MasterFilesdisplaytotalrecordscount = 0;
        this.loadingMasterFilesGrid = true;
        this.RetriveMasterFiles_v2();
      } else {
        this.MasterFilesSkip = 0;
        this.MasterFilesdisplaytotalrecordscount = 0;
        this.loadingMasterFilesGrid = false;
        this.MasterFilesResponse = [];
        this.MasterFilesItems = [];
      }
    } catch (error) {
      this.loadingMasterFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onSplitfileClick(event: any) {
    try {
      if (
        event.nstatus == "Process" &&
        event.splitcount != "0" &&
        event.subclientcount != "0"
      ) {
        this.neraMasterFileid = event.nmastererafileid;
        this.dataService.mastererafileid = this.neraMasterFileid;
        this.dataService.clientid = event.clientid;
        this.dataService.mastererafilename = event.sfilename;
        if (
          this.searchfiltersvr.splitfilefilter == true &&
          this.searchfiltersvr.files_mastererafileid != event.nmastererafileid
        ) {
          this.searchfiltersvr.clearsplitfilefilter();
        } else if (this.searchfiltersvr.splitfilefilter == true) {
          this.searchfiltersvr.files_mastererafileid = event.nmastererafileid;
        } else {
          this.searchfiltersvr.splitfilefilter = true;
          this.searchfiltersvr.files_mastererafileid = event.nmastererafileid;
        }

        this.router.navigate(["/SplitFiles"]);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  Enabledisablebtn(status: boolean = false) {
    try {
      this.disabledstartdate = status;
      this.disabledenddate = status;
      this.disabledclient = status;
      this.disabledstatus = status;
      this.disabledSearchBy = status;
      this.disabledsearch = status;
      this.disabledapplybtn = status;
      this.disabledclearbtn = status;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public openErrorDailog() {
    try {   
      this.openederrorcontext = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }   
  }

  public closeErrorDailog() {
    try {        
      this.errorresponse = [];
      this.reprocessdata = [];
      this.openederrorcontext = false;   
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

}
