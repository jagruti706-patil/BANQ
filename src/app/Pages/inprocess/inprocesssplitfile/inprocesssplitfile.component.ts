import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FileDetailsService } from "src/app/Services/file-details.service";
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings,
  SelectAllCheckboxState,
} from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import { saveAs } from "file-saver";
import * as JSZip from "jszip";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { Client } from "src/app/Model/client";
import { Subclient } from "src/app/Model/subclient";
import { FormBuilder, Validators } from "@angular/forms";
import { isNullOrEmptyString } from "@progress/kendo-angular-grid/dist/es2015/utils";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { Api } from "src/app/Services/api";
import { BreadcrumbService } from "src/app/Services/breadcrumb.service";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Router } from "@angular/router";
import { ContextMenuSelectEvent } from "@progress/kendo-angular-menu";
import { isNullOrUndefined } from "util";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { SubSink } from "subsink";
import { clsPermission } from "../../../Services/settings/clspermission";
import { Observable } from "rxjs";
declare var $: any;

@Component({
  selector: 'app-inprocesssplitfile',
  templateUrl: './inprocesssplitfile.component.html',
  styleUrls: ['./inprocesssplitfile.component.css']
})
export class InprocesssplitfileComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private filedetailService: FileDetailsService,
    private datePipe: DatePipe,
    private coreService: CoreoperationsService,
    private toastr: ToastrService,
    public api: Api,
    private breadcrumbService: BreadcrumbService,
    private dataService: DatatransaferService,
    private cdr: ChangeDetectorRef,
    private router: Router // , // public searchfiltersvr: SearchfiltersService
  ) {
    this.clsUtility = new Utility(toastr);
    this.SplitFilesPageSize = this.clsUtility.pagesize;
    this.setSelectableSettings();
  }
  public setSelectableSettings(): void {
    this.selectableSettings = {
      checkboxOnly: this.checkboxOnly,
      // mode: this.mode
    };
  }
  fileInProgress: string = "";
  splitFileStatus: any[] = [];
  countObj: {
    total: number;
    success: number;
    error: number;
  } = {
    total: 0,
    success: 0,
    error: 0,
  };
  percentage: number = 0;
  StatusGridView: GridDataResult;
  isFilesProcessing: boolean = false;
  public OrderSelected: any[] = [];
  public selectedCallback = (args) => args.dataItem;
  public checkboxOnly = true;
  private clsUtility: Utility;
  private subscription = new SubSink();
  public selectableSettings: SelectableSettings;
  loading = false;
  loadingSplitFilesGrid = true;
  neraMasterFileid: any = "0";
  nclientid: any = "0";
  public sSplitfile: any;
  public splitopened = false;
  public nSelectedClientID: string = "0";
  public s835splitstring: any;

  public SplitFilesGridData: {};
  public SplitFilesGridView: GridDataResult;
  private SplitFilesItems: any[] = [];
  public SplitFilesResponse: any[] = [];
  public SplitFilesSkip = 0;
  public SplitFilesPageSize = 0;

  public stitleSplitfile = "Split File";
  public sSubClients: any;
  public SelectAllSubClients: any;
  public sSelectedSubClientCode: any = "0";
  public selectedSubClientValue: any = 0;
  public sSplitFileBreadCrumb: string = "SplitFiles";
  public SplitFilesdisplaytotalrecordscount: number = 0;
  public items: any[] = [{ text: "Reprocess" }];
  public sSplitStatus: any = [{ value: "2", text: "Unprocess" }];
  public sSelectedSplitStatus: string = "0";
  public selectedSplitStatusValue: string = "2";
  public sSearchText: string = "";
  public disabledstartdate: boolean = false;
  public disabledenddate: boolean = false;
  public disabledsubclient: boolean = false;
  public disabledsplitstatus: boolean = false;
  public disabledsplitsearch: boolean = false;
  public disabledapplybtn: boolean = false;
  public disabledclearbtn: boolean = false;
  public clsPermission: clsPermission;
  public startDate: Date = new Date();
  public endDate: Date = new Date();

  public sortSplit: SortDescriptor[] = [
    {
      field: "dtcreateddate",
      dir: "desc",
    },
  ];
  public processStatusSort: SortDescriptor[] = [];

  //New parameter added for grid data selection logic
  public sSelectedSplitSearchBy: string = "Filename";
  public sSelectedDivisionID: string = "All";
  public SelectAllDivision: any;
  public sAllDivision: any;
  public selectAllState: SelectAllCheckboxState = "unchecked";
  public mode = "multiple";
  public selectallflag: boolean = false;
  public recordselectioncount: number = 0;
  public mySelection: any[] = [];
  public myremove: any[] = [];
  public processresultresponse: any = [];
  public processresultitems: any = [];
  public processselecteditems: any = [];
  public selectioncheckflag: boolean = false;
  public reprocesscall: boolean = false;
  public resendcall: boolean = false;
  public currentuserid: string = "0";

  DropDownGroup = this.fb.group({
    fcSubClientName: ["", Validators.required],
    fcSplitSearch: [""],
    fcSplitStatus: [""],
  });

  get SubClientName() {
    return this.DropDownGroup.get("fcSubClientName");
  }

  get fbcSplitFilterSearch() {
    return this.DropDownGroup.get("fcSplitSearch");
  }

  ngOnInit() {
    try {
      this.startDate.setMonth(this.startDate.getMonth() - 3);

      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );
      this.currentuserid = this.dataService.SelectedUserid;
      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = true;
      this.neraMasterFileid = this.dataService.mastererafileid;
      this.nclientid = 0;
      // if (
      //   this.neraMasterFileid != null &&
      //   this.neraMasterFileid != undefined &&
      //   this.neraMasterFileid != "" &&
      //   this.neraMasterFileid != "0" &&
      //   this.nclientid != null &&
      //   this.nclientid != undefined &&
      //   this.nclientid != "" &&
      //   this.nclientid != "0"
      // ) {
      //   if (this.searchfiltersvr.splitfilefilter == true) {
      //     this.sSelectedSubClientCode = this.searchfiltersvr.getsplitfileSelectedSubclientID();
      //     this.sSelectedSplitStatus = this.searchfiltersvr.getsplitfileselectedStatus();
      //     this.sSearchText = this.searchfiltersvr.getsplitfilesSearchText();
      //     this.fbcSplitFilterSearch.setValue(this.sSearchText);
      //   }
      this.Enabledisablebtn(true);
      this.RetriveSubClient();
      this.api.insertActivityLog(
        "Inprocess Split Files List Viewed ",
        "Inprocess Split Files",
        "READ",
        this.neraMasterFileid
      );
      // } else {
      //   this.router.navigate(["/Files"]);
      // }
      this.breadcrumbService.showhideFilesbreadcrumb(
        true,
        this.sSplitFileBreadCrumb
      );
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }
  onProcessClick() {
    try {
      if (this.mySelection.length <= 0 && this.myremove.length <= 0) {
        this.clsUtility.showInfo("Select file(s) to process");
        this.reprocesscall = false;
        return;
      } else {
        // console.log(this.OrderSelected);
        // this.reprocessFiles();
        this.clsUtility.showInfo("Invalid Files will not be reprocessed");
        this.reprocesscall = true;
        this.getfiledataprcoess();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async reprocessFiles() {
    try {
      let invalidcount = 0;
      this.processresultitems.forEach((obj) => {
        if (obj.serrormsg == "Generated file is invalid") {
          invalidcount++;
        }
      });

      if (invalidcount > 0 && invalidcount == this.processresultitems.length) {
        //clear all grid selection data
        this.processresultitems = [];
        this.processresultresponse = [];
        this.processselecteditems = [];
        this.mySelection = [];
        this.OrderSelected = [];
        this.selectallflag = false;
        this.selectAllState = "unchecked";
        this.recordselectioncount = 0;
        this.reprocesscall = false;
        return;
      }
      // let arrayOfRequests = [];
      this.isFilesProcessing = true;
      this.percentage = 0;
      var percentIncrease = 100 / this.processresultitems.length;
      this.cdr.detectChanges();
      class ProcessStatus {
        sfilename: string;
        status: number;
        description: string;
      }
      this.splitFileStatus = [];
      this.countObj = {
        total: 0,
        success: 0,
        error: 0,
      };
      this.StatusGridView = null;
      let nCount = 0;
      // this.countObj.total = this.processresultitems.length;
      for (let i = 0; i < this.processresultitems.length; i++) {
        if (
          this.processresultitems[i].serrormsg != "Generated file is invalid"
        ) {
          nCount++;

          this.fileInProgress = this.processresultitems[i].sfilename;
          let inputJson: {
            nmastererafileid: string;
            splitfileid: string;
            clientid: string;
          } = {
            nmastererafileid: this.processresultitems[i].mastererafileid,
            splitfileid: this.processresultitems[i].nsplitid,
            clientid: this.processresultitems[i].clientid,
          };

          await this.api
            .post_edi("api/Parser/Reprocess", inputJson)
            .toPromise()
            .then(
              (data) => {
                // console.log(data);
                if (data == 1) {
                  let statusObj = new ProcessStatus();
                  statusObj.sfilename = this.processresultitems[i].sfilename;
                  statusObj.status = 1;
                  statusObj.description = "Split file processed successfully";
                  this.splitFileStatus.push(statusObj);
                  this.countObj.success++;
                  this.api.insertActivityLog(
                    "Split File (" +
                      this.processresultitems[i].sfilename +
                      ") reprocessed.",
                    "Inprocess Split Files",
                    "READ",
                    this.processresultitems[i].nsplitid
                  );
                } else {
                  let statusObj = new ProcessStatus();
                  statusObj.sfilename = this.processresultitems[i].sfilename;
                  statusObj.status = 0;
                  statusObj.description = "Error while processing split file";
                  this.splitFileStatus.push(statusObj);
                  this.countObj.error++;
                }
                this.percentage = this.percentage + percentIncrease;
                this.cdr.detectChanges();
              },
              (error) => {
                let statusObj = new ProcessStatus();
                statusObj.sfilename = this.processresultitems[i].sfilename;
                statusObj.status = 0;
                statusObj.description = "Error while processing split file";
                this.splitFileStatus.push(statusObj);
                this.countObj.error++;
                // console.log(error);
                this.percentage = this.percentage + percentIncrease;
                this.cdr.detectChanges();
              }
            );
        }
      }
      this.countObj.total = nCount;
      // this.StatusGridView = {
      //   data: this.splitFileStatus,
      //   total: this.splitFileStatus.length
      // };
      this.loadProcessedItems();
      this.SplitFilesSkip = 0;
      this.getUnprocessedSplitFileList();
      this.getUnprocessedBadgesCount();
      setTimeout(() => {
        this.isFilesProcessing = false;
        this.percentage = 0;
        this.cdr.detectChanges();
        $("#statusModal").modal("show");
      }, 3000);

      //clear all grid selection data
      this.processresultitems = [];
      this.processresultresponse = [];
      this.processselecteditems = [];
      this.mySelection = [];
      this.OrderSelected = [];
      this.selectallflag = false;
      this.selectAllState = "unchecked";
      this.recordselectioncount = 0;
      this.reprocesscall = false;
    } catch (error) {
      this.isFilesProcessing = false;
      this.clsUtility.LogError(error);
    }
  }
  private loadProcessedItems(): void {
    this.StatusGridView = null;
    try {
      if (!isNullOrUndefined(this.splitFileStatus)) {
        this.StatusGridView = {
          data: orderBy(this.splitFileStatus, this.processStatusSort),
          total: this.splitFileStatus.length,
        };
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  sortProcessChange(sort: SortDescriptor[]): void {
    try {
      this.processStatusSort = sort;
      this.loadProcessedItems();
    } catch (error) {
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
              if (data != null && data != undefined) {
                this.SplitFilesGridData = data;
                this.SplitFilesItems = data;
                this.SplitFilesdisplaytotalrecordscount = this.SplitFilesItems.length;
                this.loadItemsSplit();
                this.loadingSplitFilesGrid = false;
                this.loading = false;
              }
            },
            (err) => {
              this.loading = false;
              this.loadingSplitFilesGrid = false;
            }
          )
      );
    } catch (error) {
      this.loading = false;
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveSplit835File(nerafileid, sfilename: string, status: string) {
    try {
      this.subscription.add(
        this.filedetailService.getSplit835File(nerafileid).subscribe(
          (data) => {
            if (data != null && data != undefined) {
              this.sSplitfile = data["s835string"];
              this.stitleSplitfile = sfilename;
              if (status == "View") {
                this.OnViewSplitFile();
                this.api.insertActivityLog(
                  "Inprocess Split File (" +
                    this.stitleSplitfile +
                    ") Viewed",
                  "Inprocess Split Files",
                  "READ",
                  nerafileid
                );
              } else {
                this.OnDownloadSplitFile(sfilename);

                this.api.insertActivityLog(
                  "Inprocess Split File (" +
                    this.stitleSplitfile +
                    ") Downloaded ",
                  "Inprocess Split Files",
                  "READ",
                  nerafileid
                );
              }
            }
          },
          (err) => {
            this.loadingSplitFilesGrid = false;
          }
        )
      );
    } catch (error) {
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient() {
    try {
      let getsubclient: {
        userid: string;
        status: boolean;
        v_clientid: string;
        v_divisioncode: string;
      } = {
        userid: this.currentuserid,
        status: true,
        v_clientid: "0",
        v_divisioncode: "All",
      };
      let seq = this.api.post("SubClient/GetSubClientByUserId", getsubclient);
      this.subscription.add(
        seq.subscribe(
          (res) => {
            this.sSubClients = res;

            if (this.sSubClients != null && this.sSubClients.length > 0) {
              // this.disabledsubclient = false;
              // this.disabledsplitstatus = false;
              // this.disabledsplitsearch = false;
              const Subclt = new Subclient();
              Subclt.subclientid = this.nSelectedClientID;
              Subclt.subclientcode = "0";
              Subclt.subclientname = "All";
              Subclt.displayname = "All";
              this.sSubClients.unshift(Subclt);
              this.SelectAllSubClients = this.sSubClients;

              // if (this.searchfiltersvr.splitfileSelectedSubclientID != "0") {
              //   this.sSelectedSubClientCode = this.searchfiltersvr.splitfileSelectedSubclientID;
              // } else
              {
                this.sSelectedSubClientCode = "0";
              }

              this.getUnprocessedSplitFileList();
            } else {
              this.sSubClients = [];
              this.Enabledisablebtn(true);
              // this.disabledsubclient = true;
              // this.disabledsplitstatus = true;
              // this.disabledsplitsearch = true;
              this.loadingSplitFilesGrid = false;
              this.clsUtility.showInfo("No practice is active");
            }
          },
          (err) => {
            this.loading = false;
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
      this.clsUtility.LogError(error);
    }
  }

  OnViewSplitFile() {
    try {
      this.s835splitstring = this.sSplitfile.replace(/~/g, "~\n");
      this.On835splitFile();
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

  On835splitFile() {
    try {
      this.splitopened = true;
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

  public pageChangeSplit(event: PageChangeEvent): void {
    try {
      this.loadingSplitFilesGrid = true;
      this.SplitFilesGridView = null;
      this.SplitFilesSkip = event.skip;
      this.getUnprocessedSplitFileList();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortSplitChange(sort: SortDescriptor[]): void {
    try {
      this.sortSplit = sort;
      this.loadItemsSplit_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async onMenuItemSelect(dataItem: any) {
    try {
      // console.log(dataItem);

      let reprocess: {
        nmastererafileid: string;
        splitfileid: string;
        clientid: string;
      } = {
        nmastererafileid: dataItem.mastererafileid,
        splitfileid: dataItem.nsplitid,
        clientid: dataItem.clientid,
      };
      let seq = this.api.post_edi("api/Parser/Reprocess", reprocess);
      seq.subscribe(
        (res) => {
          this.api.insertActivityLog(
            "Split File (" + dataItem.sfilename + ") reprocessed.",
            "Inprocess Split Files",
            "READ",
            dataItem.nsplitid
          );
          this.getUnprocessedBadgesCount();
          this.getUnprocessedSplitFileList();
        },
        (err) => {
          this.loading = false;
          this.clsUtility.LogError(err);
        }
      );
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

  getUnprocessedSplitFileList() {
    this.SplitFilesGridView = null;
    this.SplitFilesItems = [];
    try {
      this.subscription.add(
        this.filedetailService
          .getInprocessedSplitFileList(
            this.SplitFilesSkip,
            this.SplitFilesPageSize,
            this.sSearchText,
            this.sSelectedSubClientCode,
            this.sSelectedSplitStatus,
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),
            this.currentuserid
          )
          .subscribe(
            (data) => {
              if (data != null && data != undefined) {
                this.OrderSelected = [];
                this.SplitFilesResponse = data;
                this.SplitFilesItems = data.content; //this.SplitFilesResponse["content"];
                if (this.SplitFilesItems != null) {
                  if (this.SplitFilesItems.length > 0) {
                    this.SplitFilesdisplaytotalrecordscount = this.SplitFilesResponse[
                      "totalelements"
                    ];
                    this.loadItemsSplit_v2();
                    this.loadingSplitFilesGrid = false;
                    this.loading = false;
                    this.Enabledisablebtn(false);
                    //get selected data based on flag in myselection/ remove/ orderlist array
                    //below condition for selected all option and if items remove from all selection
                    if (
                      (this.selectallflag == true &&
                        this.selectAllState == "checked") ||
                      (this.selectallflag == false &&
                        this.selectAllState == "indeterminate" &&
                        this.recordselectioncount > 0)
                    ) {
                      this.OrderSelected = [];
                      this.SplitFilesItems.forEach((item) => {
                        if (this.myremove.length > 0) {
                          let rdata = this.myremove.find(
                            (x) => x == item.nsplitid
                          );
                          if (rdata == null || rdata == undefined) {
                            this.OrderSelected.push(item);
                          }
                        } else {
                          let data = this.OrderSelected.find(
                            (obj) => obj === item.nsplitid
                          );
                          if (data == null || data == undefined) {
                            this.OrderSelected.push(item);
                          }
                        }
                      });
                      this.OrderSelected.forEach((item) => {
                        let data = this.mySelection.find(
                          (obj) => obj === item.nsplitid
                        );
                        if (data == null || data == undefined) {
                          this.mySelection.push(item.nsplitid);
                        }
                      });
                      //below condition for unselected all option
                    } else if (
                      this.selectallflag == false &&
                      this.selectAllState == "unchecked"
                    ) {
                      this.OrderSelected = [];
                      this.mySelection = [];
                      //below condition for selected items on pages
                    } else if (
                      this.selectallflag == false &&
                      this.selectAllState == "indeterminate"
                    ) {
                      var data: any = this.OrderSelected;
                      this.OrderSelected = [];
                      this.mySelection.forEach((ob) => {
                        let data1 = this.SplitFilesItems.find(
                          (obj) => obj.nsplitid === ob
                        );
                        if (data1 != null || data1 != undefined) {
                          this.OrderSelected.push(data1);
                        }
                      });
                    }
                    // console.log("RetriveSplitFiles_v2  this.mySelection ", this.mySelection);
                    // console.log("RetriveSplitFiles_v2  this.OrderSelected ", this.OrderSelected);
                    // console.log(" RetriveSplitFiles_v2 for all selection this.myremove ",  this.myremove);
                  } else {
                    this.Enabledisablebtn(false);
                    this.SplitFilesItems = [];
                    this.loading = false;
                    this.SplitFilesdisplaytotalrecordscount = 0;
                    this.loadingSplitFilesGrid = false;
                  }
                } else {
                  this.Enabledisablebtn(false);
                  this.SplitFilesdisplaytotalrecordscount = 0;
                  this.loadingSplitFilesGrid = false;
                }
              }
            },
            (err) => {
              this.Enabledisablebtn(false);
              this.SplitFilesdisplaytotalrecordscount = 0;
              this.loadingSplitFilesGrid = false;
            }
          )
      );
    } catch (error) {
      this.Enabledisablebtn(false);
      this.loadingSplitFilesGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsSplit_v2(): void {
    this.SplitFilesGridView = null;
    try {
      if (!isNullOrUndefined(this.SplitFilesItems)) {
        if (this.SplitFilesItems && this.SplitFilesItems.length > 0) {
          this.SplitFilesGridView = {
            data: orderBy(this.SplitFilesItems, this.sortSplit),
            total: this.SplitFilesResponse["totalelements"],
          };
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSubClientChange(event: any) {
    try {
      // this.SplitFilesdisplaytotalrecordscount = 0;
      // this.SplitFilesSkip = 0;
      // this.loadingSplitFilesGrid = true;
      this.sSelectedSubClientCode = event;
      // this.getUnprocessedSplitFileList();
      // this.searchfiltersvr.setsplitfilefilter(
      //   this.sSelectedSubClientCode,
      //   this.sSelectedSplitStatus,
      //   this.sSearchText
      // );
      // this.RetriveSplitFiles_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitStatusChange(event: any) {
    try {
      // this.SplitFilesdisplaytotalrecordscount = 0;
      // this.SplitFilesSkip = 0;
      // this.loadingSplitFilesGrid = true;
      this.sSelectedSplitStatus = event;
      // this.searchfiltersvr.setsplitfilefilter(
      //   this.sSelectedSubClientCode,
      //   this.sSelectedSplitStatus,
      //   this.sSearchText
      // );
      // this.RetriveSplitFiles_v2();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitSearch($event: any = null) {
    try {
      if (!isNullOrUndefined($event)) {
        if ($event.type == "keyup") {
          // this.SplitFilesSkip = 0;
          this.sSearchText = null;
          this.sSearchText = this.fbcSplitFilterSearch.value.trim();
          // this.SplitFilesdisplaytotalrecordscount = 0;
          // this.loadingSplitFilesGrid = true;
          // this.searchfiltersvr.setsplitfilefilter(
          //   this.sSelectedSubClientCode,
          //   this.sSelectedSplitStatus,
          //   this.sSearchText
          // );
          // this.RetriveSplitFiles_v2();
        } else if ($event.type == "click") {
          // this.SplitFilesSkip = 0;
          this.sSearchText = null;
          this.sSearchText = this.fbcSplitFilterSearch.value.trim();
          // this.SplitFilesdisplaytotalrecordscount = 0;
          // this.loadingSplitFilesGrid = true;
          // this.searchfiltersvr.setsplitfilefilter(
          //   this.sSelectedSubClientCode,
          //   this.sSelectedSplitStatus,
          //   this.sSearchText
          // );
          // this.RetriveSplitFiles_v2();
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleSubclientFilter(value) {
    this.sSubClients = this.SelectAllSubClients.filter(
      (s) => s.displayname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }

  applySplitFilters() {
    try {
      //clear all grid selection data
      if (this.sSelectedSplitStatus != "3") {
        this.selectioncheckflag = true;
      } else {
        this.selectioncheckflag = false;
      }
      this.processresultitems = [];
      this.processresultresponse = [];
      this.processselecteditems = [];
      this.mySelection = [];
      this.OrderSelected = [];
      this.selectallflag = false;
      this.selectAllState = "unchecked";
      this.recordselectioncount = 0;
      this.reprocesscall = false;

      if (
        this.fbcSplitFilterSearch.value != null &&
        this.fbcSplitFilterSearch.value != undefined
      ) {
        this.sSearchText = "";
        this.sSearchText = this.fbcSplitFilterSearch.value.trim();
      } else {
        this.sSearchText = "";
        this.sSearchText = this.fbcSplitFilterSearch.value.trim();
      }

      if (
        this.sSelectedSubClientCode != null &&
        this.sSelectedSubClientCode != undefined &&
        this.startDate != null &&
        this.startDate != undefined &&
        this.endDate != null &&
        this.endDate != undefined
      ) {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = true;
        this.Enabledisablebtn(true);
        this.getUnprocessedSplitFileList();
      } else {
        this.SplitFilesSkip = 0;
        this.SplitFilesdisplaytotalrecordscount = 0;
        this.loadingSplitFilesGrid = false;
        this.SplitFilesResponse = [];
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clearSplitFilters() {
    try {
      //clear all grid selection data
      this.selectioncheckflag = false;
      this.processresultitems = [];
      this.processresultresponse = [];
      this.processselecteditems = [];
      this.mySelection = [];
      this.OrderSelected = [];
      this.selectallflag = false;
      this.selectAllState = "unchecked";
      this.recordselectioncount = 0;
      this.reprocesscall = false;

      this.sSelectedSubClientCode = "0";
      this.sSelectedSplitStatus = "0";
      this.sSearchText = "";
      this.fbcSplitFilterSearch.setValue(this.sSearchText);
      this.startDate = new Date();
      this.startDate.setMonth(this.startDate.getMonth() - 3);
      this.endDate = new Date();

      this.SplitFilesSkip = 0;
      this.SplitFilesdisplaytotalrecordscount = 0;
      this.loadingSplitFilesGrid = true;
      this.Enabledisablebtn(true);
      this.RetriveSubClient();
      // this.getUnprocessedSplitFileList();
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

  public onSelectedKeysChange(e) {
    try {
      //push selection data in myselection array for maintaing selected array data
      this.OrderSelected.forEach((item) => {
        let data = this.mySelection.find((obj) => obj === item.nsplitid);
        if (data == null || data == undefined) {
          this.mySelection.push(item.nsplitid);

          let redata = this.myremove.find((ob) => ob === item.nsplitid);
          var idx = this.myremove.findIndex((ob) => ob === item.nsplitid);
          if (redata != null || redata != undefined) {
            this.myremove.splice(idx, 1);
          }
        }
      });

      //set grid selected status
      const len = this.OrderSelected.length;
      if (len === 0) {
        if (this.recordselectioncount > 0) {
          this.SplitFilesItems.forEach((obj1) => {
            let removeitem = this.mySelection.find(
              (obj2) => obj2 === obj1.nsplitid
            );
            // console.log("removeitem ", removeitem) ;
            if (removeitem != null || removeitem != undefined) {
              let redata = this.myremove.find((ob) => ob === obj1.nsplitid);
              // console.log("redata if " , redata);
              if (redata == null || redata == undefined) {
                this.myremove.push(obj1.nsplitid);

                var idx = this.mySelection.findIndex(
                  (ob) => ob === obj1.nsplitid
                );
                // console.log("redata if ", redata);
                if (redata != null || redata != undefined) {
                  this.mySelection.splice(idx, 1);
                }
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

        // this.selectAllState = 'unchecked';
        // this.selectallflag = false;
      } else if (
        (len > 0 && len < this.SplitFilesItems.length) ||
        (len > this.SplitFilesItems.length &&
          len < this.SplitFilesdisplaytotalrecordscount)
      ) {
        this.selectAllState = "indeterminate";
        this.selectallflag = false;

        this.SplitFilesItems.forEach((obj1) => {
          let removeitem = this.OrderSelected.find(
            (obj2) => obj2.nsplitid === obj1.nsplitid
          );
          if (removeitem == null || removeitem == undefined) {
            var index = this.mySelection.findIndex((ob) => ob == obj1.nsplitid);
            if (index != -1) {
              this.mySelection.splice(index, 1);

              let redata = this.myremove.find((ob) => ob === obj1.nsplitid);
              if (redata == null || redata == undefined) {
                this.myremove.push(obj1.nsplitid);
              }
            }
          }
        });
      } else if (
        (len == this.SplitFilesItems.length &&
          len == this.SplitFilesPageSize &&
          len == this.recordselectioncount) ||
        len == this.SplitFilesdisplaytotalrecordscount ||
        (this.recordselectioncount > 0 &&
          this.recordselectioncount == this.SplitFilesdisplaytotalrecordscount)
      ) {
        this.myremove = [];
        this.selectAllState = "checked";
        this.selectallflag = true;
        this.recordselectioncount = this.SplitFilesdisplaytotalrecordscount;
      } else if (
        this.mySelection.length == this.SplitFilesdisplaytotalrecordscount
      ) {
        this.myremove = [];
        this.selectAllState = "checked";
        this.selectallflag = true;
        this.recordselectioncount = this.SplitFilesdisplaytotalrecordscount;
      }

      // console.log(" onSelectedKeysChange this.mySelection ", this.mySelection);
      // console.log(" onSelectedKeysChange this.OrderSelected ",  this.OrderSelected);
      // console.log(" onSelectedKeysChange for all selection this.myremove ",  this.myremove);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState) {
    try {
      if (this.sSelectedSplitStatus != "3") {
        if (checkedState === "checked") {
          this.selectallflag = true;
          this.selectAllState = "checked";
          this.myremove = [];
          this.recordselectioncount = this.SplitFilesdisplaytotalrecordscount;
        } else {
          this.selectallflag = false;
          this.OrderSelected = [];
          this.mySelection = [];
          this.myremove = [];
          this.selectAllState = "unchecked";
          this.recordselectioncount = 0;
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getfiledataprcoess() {
    try {
      this.subscription.add(
        this.filedetailService
          .getUnprocessedSplitFileList(
            0,
            this.SplitFilesdisplaytotalrecordscount,
            this.sSearchText,
            this.sSelectedSubClientCode,
            this.sSelectedSplitStatus,
            this.datePipe.transform(this.startDate, "yyyyMMdd"),
            this.datePipe.transform(this.endDate, "yyyyMMdd"),
            this.currentuserid
          )
          .subscribe(
            (data) => {
              this.processresultresponse = data;
              if (
                this.processresultresponse != null ||
                this.processresultresponse != undefined
              ) {
                this.processresultitems = this.processresultresponse.content;
                if (
                  this.processresultitems != null ||
                  this.processresultitems != undefined
                ) {
                  // console.log(" this.processresultitems ", this.processresultitems);
                  if (this.processresultitems.length > 0) {
                    if (this.selectallflag == true) {
                      if (this.reprocesscall == true) {
                        this.reprocessFiles();
                      }
                    } else if (
                      this.selectallflag == false &&
                      this.recordselectioncount == 0
                    ) {
                      this.processselecteditems = [];
                      this.mySelection.forEach((obj) => {
                        var item = this.processresultitems.find(
                          (obj1) => obj1.nsplitid === obj
                        );
                        if (item != null && item != undefined) {
                          this.processselecteditems.push(item);
                        }
                      });
                      this.processresultitems = [];
                      this.processresultitems = this.processselecteditems;
                      if (this.processresultitems.length > 0) {
                        if (this.reprocesscall == true) {
                          this.reprocessFiles();
                        }
                      }
                    } else if (
                      this.selectallflag == false &&
                      this.recordselectioncount > 0
                    ) {
                      this.processselecteditems = [];
                      this.processselecteditems = this.processresultitems;
                      this.myremove.forEach((obj) => {
                        var item = this.processselecteditems.find(
                          (obj1) => obj1.nsplitid === obj
                        );
                        if (item != null && item != undefined) {
                          var index = this.processselecteditems.findIndex(
                            (obj1) => obj1.nsplitid === obj
                          );
                          this.processselecteditems.splice(index, 1);
                        }
                      });
                      this.processresultitems = [];
                      this.processresultitems = this.processselecteditems;
                      if (this.processresultitems.length > 0) {
                        if (this.reprocesscall == true) {
                          this.reprocessFiles();
                        }
                      }
                    }
                  }
                }
              } else {
                this.processresultresponse = [];
                this.processselecteditems = [];
                this.processresultitems = [];
              }
            },
            (err) => {
              this.processresultresponse = [];
              this.processselecteditems = [];
              this.processresultitems = [];
            }
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  Enabledisablebtn(status: boolean = false) {
    try {
      this.disabledstartdate = status;
      this.disabledenddate = status;
      this.disabledsubclient = status;
      this.disabledapplybtn = status;
      this.disabledclearbtn = status;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getUnprocessedBadgesCount() {
    try {
      let response;
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
              response = data;
              if (response != null && response != undefined) {
                this.dataService.totalunprocessmastercount =
                  response["nmastercount"];
                this.dataService.totalunprocesssplitcount =
                  response["nsplitcount"];
                this.dataService.totalunprocesscount = response["ntotalcount"];
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
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

}
