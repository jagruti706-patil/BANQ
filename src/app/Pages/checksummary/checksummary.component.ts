import { Component, OnInit, OnDestroy } from "@angular/core";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { SubSink } from "../../../../node_modules/subsink";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { Router } from "@angular/router";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { BreadcrumbService } from "src/app/Services/breadcrumb.service";
import { FormBuilder, Validators } from "@angular/forms";
import { isNullOrUndefined } from "util";
import { Api } from "src/app/Services/api";
declare var $: any;
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { parseNumber } from "@progress/kendo-angular-intl";
import { clsPermission } from "./../../Services/settings/clspermission";
import { Workbook } from "@progress/kendo-angular-excel-export";
import { Observable } from "rxjs";

@Component({
  selector: "app-checksummary",
  templateUrl: "./checksummary.component.html",
  styleUrls: ["./checksummary.component.css"],
})
export class ChecksummaryComponent implements OnInit, OnDestroy {
  public clsUtility: Utility;
  public clsPermission: clsPermission;
  public subscription = new SubSink();
  public MasterChecksGridView: GridDataResult;
  public MasterChecksItems: any[] = [];
  public MasterChecksResponse: any[] = [];
  public MasterChecksdisplaytotalrecordscount: number = 0;
  public MasterChecksSkip = 0;
  public MasterCheckspagesize: number = 0;

  claimSVClinearray = [];
  public gridData: any = [];
  public EOBReportItems: any[] = [];
  public EOBReportSVC: any[] = [];
  public EOBReportSVCGridView: GridDataResult;
  public EOBReportSVClineSkip = 0;
  public EOBReportSVClinepagesize: number = 50;
  public loadingClaimsDetailsGrid: boolean = false;
  public sclaimno: string = "";
  public disabledchecksearchBy: boolean = false;

  public sCheckSearchBy: any = [
    { value: "Check", text: "Check" },
    { value: "Check date", text: "Check date" },
    { value: "Payer name", text: "Payer name" },
    { value: "Payerid", text: "Payerid" },
  ];
  public sSelectedCheckSearchBy: string = "Check";

  public sortMaster: SortDescriptor[] = [
    {
      field: "clientid",
      dir: "asc",
    },
  ];

  neraMasterFileid: any = "0";
  nTS835id: any = "0";
  public loadingCheckDetailsGrid: boolean = false;
  public sSearchText: string = "";
  public emailloading = false;
  public MasterChecksExportExcelDownloadConfirmationMessage: any;
  public SplitFileExportExcelDownloadConfirmationMessage: any;
  public MasterexportFilename: string =
  "CheckSummary_" + this.datePipe.transform(new Date(), "MMddyyyy");

  DropDownGroup = this.fb.group({
    fcSearch: [""],
    fcCheckSearchBy: [""],
  });

  get fbcFilterSearch() {
    return this.DropDownGroup.get("fcSearch");
  }

  get CheckSearchBy() {
    return this.DropDownGroup.get("fcCheckSearchBy");
  }

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private filedetailService: FileDetailsService,
    private router: Router,
    public dataService: DatatransaferService,
    private breadcrumbsvr: BreadcrumbService,
    public api: Api,
    public searchfiltersvr: SearchfiltersService
  ) {
    this.clsUtility = new Utility(toastr);
    this.MasterCheckspagesize = this.clsUtility.pagesize;
    this.neraMasterFileid = this.dataService.mastererafileid;
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );

      this.neraMasterFileid = this.dataService.mastererafileid;
      this.breadcrumbsvr.showbreadcrumb();
      this.breadcrumbsvr.showchecksummary();
      if (this.dataService.spliteflag == true) {
        this.breadcrumbsvr.showsplitfilesummary();
      } else {
        this.breadcrumbsvr.hidesplitfilesummary();
      }

      if (this.neraMasterFileid != "0") {
        if (
          this.searchfiltersvr.filesdata_spliteflag == true &&
          this.dataService.spliteflag == false
        ) {
          this.searchfiltersvr.filesdata_spliteflag = false;
        }

        if (
          this.searchfiltersvr.checkdatafilter == true &&
          this.searchfiltersvr.filesdata_spliteflag == false
        ) {
          this.searchfiltersvr.filesdata_mastererafileid = this.neraMasterFileid;
          this.sSelectedCheckSearchBy = this.searchfiltersvr.getchecksSearchBy();
          this.sSearchText = this.searchfiltersvr.getchecksSearchText();
          this.fbcFilterSearch.setValue(this.sSearchText);
        }

        if (
          this.searchfiltersvr.splitcheckdatafilter == true &&
          this.searchfiltersvr.filesdata_spliteflag == true
        ) {
          this.searchfiltersvr.filesdatasplit_mastererafileid = this.neraMasterFileid;
          this.sSelectedCheckSearchBy = this.searchfiltersvr.getsplitchecksSearchBy();
          this.sSearchText = this.searchfiltersvr.getsplitchecksSearchText();
          this.fbcFilterSearch.setValue(this.sSearchText);
        }

        this.loadingCheckDetailsGrid = true;
        this.getchecksummary();
        if (this.dataService.spliteflag == true) {
          this.api.insertActivityLog(
            "Check summary Viewed for Split File (" +
              this.dataService.mastererafilename +
              ")",
            "File Data",
            "READ",
            this.neraMasterFileid
          );
        } else {
          this.api.insertActivityLog(
            "Check summary Viewed for File (" +
              this.dataService.mastererafilename +
              ")",
            "File Data",
            "READ",
            this.neraMasterFileid
          );
        }
      } else {
        this.router.navigate(["/filedata"]);
      }
    } catch (error) {
      this.loadingCheckDetailsGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  getchecksummary() {
    this.MasterChecksGridView = null;
    this.MasterChecksItems = [];
    try {
      this.subscription.add(
        this.filedetailService
          .getCheckSummary(
            this.neraMasterFileid,
            this.nTS835id,
            this.dataService.spliteflag,
            this.dataService.spliterafileid,
            this.MasterCheckspagesize,
            this.MasterChecksSkip,
            this.sSelectedCheckSearchBy,
            this.sSearchText
          )
          .subscribe(
            (data) => {
              this.MasterChecksResponse = data;
              if (
                this.MasterChecksResponse != null &&
                this.MasterChecksResponse != undefined
              ) {
                this.MasterChecksItems = this.MasterChecksResponse["content"];
                if (this.MasterChecksItems != null) {
                  if (this.MasterChecksItems.length > 0) {
                    this.MasterChecksItems.map((obj) => {
                      obj["plbamount"] = parseNumber(
                        !isNullOrUndefined(obj["plbamount"])
                          ? obj["plbamount"].replace("$", "").replace(",", "")
                          : "$0.00"
                      );
                      obj["totalpaidamt"] = parseNumber(
                        !isNullOrUndefined(obj["totalpaidamt"])
                          ? obj["totalpaidamt"]
                              .replace("$", "")
                              .replace(",", "")
                          : "$0.00"
                      );
                      obj["totalpayment"] = parseNumber(
                        !isNullOrUndefined(obj["totalpayment"])
                          ? obj["totalpayment"]
                              .replace("$", "")
                              .replace(",", "")
                          : "$0.00"
                      );
                    });

                    this.loadItems();
                    this.loadingCheckDetailsGrid = false;
                  }
                } else {
                  this.MasterChecksdisplaytotalrecordscount = 0;
                  this.loadingCheckDetailsGrid = false;
                }
              } else {
                this.MasterChecksItems = [];
                this.MasterChecksdisplaytotalrecordscount = 0;
                this.loadingCheckDetailsGrid = false;
                this.loadItems();
              }
            },
            (err) => {
              this.loadingCheckDetailsGrid = false;
            }
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
      this.loadingCheckDetailsGrid = false;
    }
  }

  private loadItems(): void {
    this.MasterChecksGridView = null;
    try {
      if (
        this.MasterChecksItems != null &&
        this.MasterChecksItems != undefined
      ) {
        if (this.MasterChecksItems.length > 0) {
          this.MasterChecksGridView = {
            data: orderBy(this.MasterChecksItems, this.sortMaster),
            total: this.MasterChecksResponse["totalelements"],
          };

          this.MasterChecksdisplaytotalrecordscount = this.MasterChecksResponse[
            "totalelements"
          ];
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnCellClickCheckDetails(event: any) {
    try {
      if (event.column.field == "clpcount") {
        if (event.dataItem.clpcount > 0) {
          this.dataService.mastererafileid = event.dataItem.fileid;
          this.dataService.TS835id = event.dataItem.ts835id;
          this.dataService.filecheckno = event.dataItem.checkno;
          if (this.dataService.spliteflag == true) {
            this.dataService.spliterafileid = event.dataItem.nspliteid;

            if (
              this.searchfiltersvr.splitclaimdatafilter == true &&
              this.searchfiltersvr.filesdatasplit_mastererafileid ==
                event.dataItem.fileid &&
              this.searchfiltersvr.filesdatasplit_TS835id.toString() !=
                event.dataItem.ts835id.toString()
            ) {
              this.searchfiltersvr.clearsplitclaimfilter();
            } else if (this.searchfiltersvr.splitclaimdatafilter == true) {
              this.searchfiltersvr.filesdatasplit_mastererafileid =
                event.dataItem.fileid;
              this.searchfiltersvr.filesdatasplit_TS835id =
                event.dataItem.ts835id;
              this.searchfiltersvr.filesdata_spliterafileid =
                event.dataItem.nspliteid;
            } else {
              this.searchfiltersvr.splitclaimdatafilter = true;
              this.searchfiltersvr.filesdatasplit_mastererafileid =
                event.dataItem.fileid;
              this.searchfiltersvr.filesdatasplit_TS835id =
                event.dataItem.ts835id;
              this.searchfiltersvr.filesdata_spliterafileid =
                event.dataItem.nspliteid;
            }
          } else {
            this.dataService.spliterafileid = "0";

            if (
              this.searchfiltersvr.claimdatafilter == true &&
              this.searchfiltersvr.filesdata_mastererafileid ==
                event.dataItem.fileid &&
              this.searchfiltersvr.filesdata_TS835id.toString() !=
                event.dataItem.ts835id.toString()
            ) {
              this.searchfiltersvr.clearclaimfilter();
            } else if (this.searchfiltersvr.claimdatafilter == true) {
              this.searchfiltersvr.filesdata_mastererafileid =
                event.dataItem.fileid;
              this.searchfiltersvr.filesdata_TS835id = event.dataItem.ts835id;
            } else {
              this.searchfiltersvr.claimdatafilter = true;
              this.searchfiltersvr.filesdata_mastererafileid =
                event.dataItem.fileid;
              this.searchfiltersvr.filesdata_TS835id = event.dataItem.ts835id;
            }
          }

          this.router.navigate(["/claimsummary"]);
        }
      } else if (event.column.field == "plbcount") {
        if (event.dataItem.plbcount > 0) {
          this.dataService.filecheckno = event.dataItem.checkno;
          this.dataService.TS835id = event.dataItem.ts835id;
          if (!isNullOrUndefined(event.dataItem.splitefileid)) {
            this.dataService.splitplbfileid = event.dataItem.splitefileid;
          }
          this.router.navigate(["/plbsummary"]);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeMasterFile(event: PageChangeEvent): void {
    try {
      this.MasterChecksSkip = event.skip;
      this.MasterChecksGridView = null;
      this.loadingCheckDetailsGrid = true;
      this.getchecksummary();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.breadcrumbsvr.hidechecksummary();
      this.breadcrumbsvr.hidebreadcrumb();
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSearch($event: any = null) {
    try {
      if (!isNullOrUndefined($event)) {
        if ($event.type == "keyup") {
          this.loadingCheckDetailsGrid = true;
          this.MasterChecksdisplaytotalrecordscount = 0;
          this.MasterChecksSkip = 0;
          this.sSearchText = "";
          this.sSearchText = this.fbcFilterSearch.value.trim();

          if (this.dataService.spliteflag == true) {
            this.searchfiltersvr.setsplitcheckfilter(
              this.sSearchText,
              this.sSelectedCheckSearchBy
            );
            this.searchfiltersvr.clearsplitclaimfilter();
          } else {
            this.searchfiltersvr.setcheckfilter(
              this.sSearchText,
              this.sSelectedCheckSearchBy
            );
            this.searchfiltersvr.clearclaimfilter();
          }

          this.getchecksummary();
        } else if ($event.type == "click") {
          this.loadingCheckDetailsGrid = true;
          this.MasterChecksdisplaytotalrecordscount = 0;
          this.MasterChecksSkip = 0;
          this.sSearchText = "";
          this.sSearchText = this.fbcFilterSearch.value.trim();

          if (this.dataService.spliteflag == true) {
            this.searchfiltersvr.setsplitcheckfilter(
              this.sSearchText,
              this.sSelectedCheckSearchBy
            );
            this.searchfiltersvr.clearclaimfilter();
          } else {
            this.searchfiltersvr.setcheckfilter(
              this.sSearchText,
              this.sSelectedCheckSearchBy
            );
            this.searchfiltersvr.clearclaimfilter();
          }

          this.getchecksummary();
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onCloseClick() {
    $("#claimModal").modal("hide");
  }

  onViewEOBClick(record: any) {
    this.EOBReportItems = [];
    $("#claimModal").modal("show");

    let splitid = 0;
    try {
      this.subscription.add(
        this.filedetailService
          .getEOBReport(record.fileid, record.ts835id, record.clpid, splitid)
          .subscribe(
            (data) => {
              this.EOBReportItems = data;
              if (
                this.EOBReportItems != null &&
                this.EOBReportItems.length > 0
              ) {
                for (
                  let i = 0;
                  i < this.EOBReportItems[0].otherdetails.length;
                  i++
                ) {
                  let EOBItems = this.EOBReportItems[0].otherdetails[i].charges;
                  this.EOBReportSVC[i] = EOBItems;
                  if (this.EOBReportSVC.length > 0) {
                    this.loadsvcdetails();
                  }
                }

                if (this.dataService.spliteflag == true) {
                  this.api.insertActivityLog(
                    "ERA EOB Report Viewed for Split File Claim (" +
                      this.sclaimno +
                      ")",
                    "File Data",
                    "READ"
                  );
                } else {
                  this.api.insertActivityLog(
                    "ERA EOB Report Viewed for Claim (" + this.sclaimno + ")",
                    "File Data",
                    "READ"
                  );
                }
              }
            },
            (err) => {}
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onCheckSearchByChange(event: any) {
    try {
      this.sSelectedCheckSearchBy = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  loadsvcdetails() {
    try {
      this.EOBReportSVCGridView = {
        data: orderBy(
          this.EOBReportSVC.slice(
            this.EOBReportSVClineSkip,
            this.EOBReportSVClineSkip + this.EOBReportSVClinepagesize
          ),
          this.sortMaster
        ),
        total: this.EOBReportSVC.length,
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  applyCheckFilters() {
    try {
      this.loadingCheckDetailsGrid = true;
      this.MasterChecksdisplaytotalrecordscount = 0;
      this.MasterChecksSkip = 0;
      this.sSearchText = "";
      this.sSearchText = this.fbcFilterSearch.value.trim();

      if (this.dataService.spliteflag == true) {
        this.searchfiltersvr.setsplitcheckfilter(
          this.sSearchText,
          this.sSelectedCheckSearchBy
        );
        this.searchfiltersvr.clearsplitclaimfilter();
      } else {
        this.searchfiltersvr.setcheckfilter(
          this.sSearchText,
          this.sSelectedCheckSearchBy
        );
        this.searchfiltersvr.clearclaimfilter();
      }

      this.getchecksummary();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clearCheckFilters() {
    try {
      this.sSearchText = "";
      this.sSelectedCheckSearchBy = "Check";
      this.fbcFilterSearch.setValue(this.sSearchText);

      if (this.dataService.spliteflag == true) {
        this.searchfiltersvr.setsplitcheckfilter(
          this.sSearchText,
          this.sSelectedCheckSearchBy
        );
        this.searchfiltersvr.clearsplitclaimfilter();
      } else {
        this.searchfiltersvr.setcheckfilter(
          this.sSearchText,
          this.sSelectedCheckSearchBy
        );
        this.searchfiltersvr.clearclaimfilter();
      }

      this.MasterChecksSkip = 0;
      this.MasterChecksdisplaytotalrecordscount = 0;
      this.loadingCheckDetailsGrid = true;
      this.getchecksummary();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortMasterChange(sort: SortDescriptor[]): void {
    try {
      this.sortMaster = sort;
      this.loadItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterFilesExcelExportClick() {
    try {
      if (this.MasterChecksdisplaytotalrecordscount > 0) {
        this.MasterChecksExportExcelDownloadConfirmationMessage =
          this.MasterChecksdisplaytotalrecordscount +
          " records will be Exported, Do you want to continue ?";
        $("#CheckMasterExportExcelClaimconfirmationModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterChecksExportExcelCloseConfirmationClick() {
    try {
      $("#CheckMasterExportExcelClaimconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterChecksExportExcelYesConfirmationClick() {
    try {
      this.ClickMasterExportExcel();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ClickMasterExportExcel() {
    try {
      document.getElementById("hbtnCheckMasterExportExcel").click();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public allDataCheck = (): Observable<any> => {
    try {  
      this.emailloading = true;

      let para: {
        nmastererafileid: any;
        v_ts835id: any;
        splitfileflag: any;
        splitid: any;
        searchby: any;
        searchtext: any;
      } = {
        nmastererafileid: this.neraMasterFileid,
        v_ts835id: this.nTS835id,
        splitfileflag: this.dataService.spliteflag,
        splitid: this.dataService.spliterafileid,
        searchby: this.sSelectedCheckSearchBy,
        searchtext: this.sSearchText                       
      };

      if (this.MasterChecksdisplaytotalrecordscount != 0) {        
        var result = this.filedetailService.exporttoexcelfiledata("api/Reports/getCheckSummary", para, this.MasterChecksdisplaytotalrecordscount);
        return result;
      } else {
        this.clsUtility.showInfo("No records available for export"); 
        this.emailloading = false; 
        return Observable.empty();
      }
    } catch (error) {    
      this.clsUtility.showError(error);
      this.emailloading = false; 
    }
  };

  public onMasterExcelExport(args: any): void {
    try {  
      this.emailloading = true; 

      args.preventDefault();
      const workbook = args.workbook;

      new Workbook(workbook).toDataURL().then((dataUrl: string) => {
        saveAs(dataUrl, this.MasterexportFilename + ".xlsx");
        this.api.insertActivityLog(
          "Check data exported in excel for Master File : " + this.dataService.mastererafilename,
          "File Data",
          "READ"
        ); 
        this.emailloading = false; 
      });
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }

}
