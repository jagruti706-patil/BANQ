import { Component, OnInit, ViewChild } from "@angular/core";
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
declare var $: any;
import { FormBuilder, Validators } from "@angular/forms";
import { isNullOrUndefined } from "util";
import { Api } from "src/app/Services/api";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { EobreportComponent } from "../eobreport/eobreport.component";
import { parseNumber } from "@progress/kendo-angular-intl";
import { Workbook } from "@progress/kendo-angular-excel-export";
import { Observable } from "rxjs";
@Component({
  selector: "app-claimsummary",
  templateUrl: "./claimsummary.component.html",
  styleUrls: ["./claimsummary.component.css"],
})
export class ClaimsummaryComponent implements OnInit {
  public clsUtility: Utility;
  public subscription = new SubSink();
  public MasterClaimGridView: GridDataResult;
  public MasterSVClineGridView: GridDataResult;
  public MasterClaimItems: any[] = [];
  public MasterClaimResponse: any[] = [];
  public MasterSVClineItems: any[] = [];
  public MasterClaimdisplaytotalrecordscount: number = 0;
  public MasterClaimSkip = 0;
  public MasterClaimpagesize: number = 0;
  public MasterSVClineSkip = 0;
  public MasterSVClinepagesize: number = 4;
  public sortMaster: SortDescriptor[] = [
    {
      field: "clientid",
      dir: "asc",
    },
  ];

  isRowExpanded: boolean = true;
  neraMasterFileid: any = "0";
  nTS835id: any = "0";
  nclpid: any = "0";
  nsvcid: any = "0";
  claimSVClinearray = [];
  public gridData: any = [];
  public EOBReportItems: any[] = [];
  public EOBReportSVC: any[] = [];
  public EOBReportSVCGridView: GridDataResult;
  public EOBReportSVClineSkip = 0;
  public EOBReportSVClinepagesize: number = 50;
  public loadingClaimsDetailsGrid: boolean = false;
  public sSearchText: string = "";
  public sclaimno: string = "";
  public clsPermission: clsPermission;

  DropDownGroup = this.fb.group({
    fcSearch: [""],
  });

  get fbcFilterSearch() {
    return this.DropDownGroup.get("fcSearch");
  }

  public exportfilename: string = "";
  public echeckno: string = "";
  public eclaimno: string = "";
  public displayreport: boolean = false;
  public disabledbutton: boolean = false;

  @ViewChild("EobreportChild")
  private EobreportChild: EobreportComponent;
  public inputmastererafileid: any;
  public inputtsid: any;
  public inputclpid: any;
  public inputsplitfileid: any;
  public inputcomponentname: any = "File Data";

  public emailloading = false;
  public MasterClaimExportExcelDownloadConfirmationMessage: any;
  public SplitFileExportExcelDownloadConfirmationMessage: any;
  public MasterexportFilename: string =
  "ClaimSummary_" + this.datePipe.transform(new Date(), "MMddyyyy");

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
    this.MasterClaimpagesize = this.clsUtility.pagesize;
    this.neraMasterFileid = this.dataService.mastererafileid;
    this.nTS835id = this.dataService.TS835id;
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );

      this.neraMasterFileid = this.dataService.mastererafileid;
      this.nTS835id = this.dataService.TS835id;
      this.breadcrumbsvr.showbreadcrumb();
      this.breadcrumbsvr.showclaimsvcsummary();
      if (this.dataService.spliteflag == true) {
        this.breadcrumbsvr.showsplitfilesummary();
      } else {
        this.breadcrumbsvr.hidesplitfilesummary();
      }

      if (this.neraMasterFileid != "0" && this.nTS835id != "0") {
        if (
          this.searchfiltersvr.filesdata_spliteflag == true &&
          this.dataService.spliteflag == false
        ) {
          this.searchfiltersvr.filesdata_spliteflag = false;
        }

        if (
          this.searchfiltersvr.claimdatafilter == true &&
          this.searchfiltersvr.filesdata_spliteflag == false &&
          this.dataService.spliteflag == false
        ) {
          this.searchfiltersvr.filesdata_mastererafileid = this.neraMasterFileid;
          this.searchfiltersvr.filesdata_TS835id = this.nTS835id;
          this.sSearchText = this.searchfiltersvr.getclaimsSearchText();
          this.fbcFilterSearch.setValue(this.sSearchText);
        }

        if (
          this.searchfiltersvr.splitclaimdatafilter == true &&
          this.searchfiltersvr.filesdata_spliteflag == true &&
          this.dataService.spliteflag == true
        ) {
          this.searchfiltersvr.filesdata_mastererafileid = this.neraMasterFileid;
          this.searchfiltersvr.filesdata_TS835id = this.nTS835id;
          this.sSearchText = this.searchfiltersvr.getsplitclaimsSearchText();
          this.fbcFilterSearch.setValue(this.sSearchText);
        }

        this.loadingClaimsDetailsGrid = true;
        this.getclaimsummary();
        if (this.dataService.spliteflag == true) {
          this.api.insertActivityLog(
            "Claim summary Viewed for Split File Check (" +
              this.dataService.filecheckno +
              ")",
            "File Data",
            "READ",
            this.neraMasterFileid
          );
        } else {
          this.api.insertActivityLog(
            "Claim summary Viewed for Check (" +
              this.dataService.filecheckno +
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
      this.loadingClaimsDetailsGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  getclaimsummary() {
    this.MasterClaimGridView = null;
    this.MasterClaimItems = [];
    try {
      this.subscription.add(
        this.filedetailService
          .getClaimSummary(
            this.neraMasterFileid,
            this.nTS835id,
            this.nclpid,
            this.dataService.spliteflag,
            this.dataService.spliterafileid,
            this.MasterClaimpagesize,
            this.MasterClaimSkip,
            this.sSearchText
          )
          .subscribe(
            (data) => {
              this.MasterClaimResponse = data;
              if (
                this.MasterClaimResponse != null &&
                this.MasterClaimResponse != undefined
              ) {
                this.MasterClaimItems = this.MasterClaimResponse["content"];
                if (this.MasterClaimItems != null) {
                  if (this.MasterClaimItems.length > 0) {
                    this.MasterClaimItems.map((obj) => {
                      obj["totalpayment"] = parseNumber(
                        !isNullOrUndefined(obj["totalpayment"])
                          ? obj["totalpayment"]
                              .replace("$", "")
                              .replace(",", "")
                          : "$0.00"
                      );
                      obj["totaladjustment"] = parseNumber(
                        !isNullOrUndefined(obj["totaladjustment"])
                          ? obj["totaladjustment"]
                              .replace("$", "")
                              .replace(",", "")
                          : "$0.00"
                      );
                      obj["totalpatientdue"] = parseNumber(
                        !isNullOrUndefined(obj["totalpatientdue"])
                          ? obj["totalpatientdue"]
                              .replace("$", "")
                              .replace(",", "")
                          : "$0.00"
                      );

                      obj["totalbilledamount"] = parseNumber(
                        !isNullOrUndefined(obj["totalbilledamount"])
                          ? obj["totalbilledamount"]
                              .replace("$", "")
                              .replace(",", "")
                          : "$0.00"
                      );
                    });
                    this.loadItems();
                    this.loadingClaimsDetailsGrid = false;
                  }
                } else {
                  this.MasterClaimdisplaytotalrecordscount = 0;
                  this.loadingClaimsDetailsGrid = false;
                }
              } else {
                this.MasterClaimItems = [];
                this.MasterClaimdisplaytotalrecordscount = 0;
                this.loadingClaimsDetailsGrid = false;
                this.loadItems();
              }
            },
            (err) => {
              this.loadingClaimsDetailsGrid = false;
            }
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
      this.loadingClaimsDetailsGrid = false;
    }
  }

  private loadItems(): void {
    this.MasterClaimGridView = null;
    try {
      if (this.MasterClaimItems != null && this.MasterClaimItems != undefined) {
        if (this.MasterClaimItems.length > 0) {
          this.MasterClaimGridView = {
            data: orderBy(this.MasterClaimItems, this.sortMaster),
            total: this.MasterClaimResponse["totalelements"],
          };

          this.MasterClaimdisplaytotalrecordscount = this.MasterClaimResponse[
            "totalelements"
          ];
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnCellClickClaimDetails(event: any) {
    try {
      this.expandRow(event.rowIndex, event);
      // if (event.column.field == "svccount") {
      //   if (event.dataItem.svccount > 0) {
      //     this.nclpid = event.dataItem.clpid;
      //     this.getlinesummary(event.rowIndex);
      //   }
      // }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  expandRow(i: number, event: any) {
    try {
      event.dataItem.isRowExpanded = !event.dataItem.isRowExpanded;
      event.dataItem.isRowExpanded
        ? event.sender.expandRow(i)
        : event.sender.collapseRow(i);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getlinesummary(rowindex: any) {
    try {
      this.subscription.add(
        this.filedetailService
          .getSVCLineSummary(
            this.neraMasterFileid,
            this.nTS835id,
            this.nclpid,
            this.nsvcid
          )
          .subscribe(
            (data) => {
              this.MasterSVClineItems = data;

              if (
                this.MasterSVClineItems != null &&
                this.MasterSVClineItems.length > 0
              ) {
                this.loadItems2(rowindex);
                this.loadItems();
              }
            },
            (err) => {}
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeonClaims(event: PageChangeEvent): void {
    try {
      this.MasterClaimGridView = null;
      this.MasterClaimSkip = event.skip;
      this.loadingClaimsDetailsGrid = true;
      this.getclaimsummary();
    } catch (error) {
      this.loadingClaimsDetailsGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeonClaimsSVClines(
    event: PageChangeEvent,
    svcdmasterata: any,
    svcdata: any,
    index: any
  ): void {
    this.MasterSVClineSkip = event.skip;
    // this.loadItems2();
  }

  ngOnDestroy() {
    try {
      this.breadcrumbsvr.hideclaimsvcsummary();
      this.breadcrumbsvr.hidebreadcrumb();
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItems2(rowindex: any): void {
    try {
      this.MasterSVClineGridView = {
        data: orderBy(
          this.MasterSVClineItems.slice(
            this.MasterSVClineSkip,
            this.MasterSVClineSkip + this.MasterSVClinepagesize
          ),
          this.sortMaster
        ),
        total: this.MasterSVClineItems.length,
      };

      var obj = {
        masterdata: this.MasterSVClineItems,
        pagingdata: this.MasterSVClineItems,
        index: rowindex,
        clpid: this.MasterSVClineItems[0].clpid,
      };
      if (this.claimSVClinearray.length > 0) {
        let data = this.claimSVClinearray.find(
          (ob) => ob.clpid == this.MasterSVClineItems[0].clpid
        );
        if (data == undefined) {
          this.claimSVClinearray.push(obj);
        }
      } else {
        this.claimSVClinearray.push(obj);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSearch($event: any = null) {
    try {
      if (!isNullOrUndefined($event)) {
        if ($event.type == "keyup") {
          this.loadingClaimsDetailsGrid = true;
          this.MasterClaimdisplaytotalrecordscount = 0;
          this.MasterClaimSkip = 0;
          this.sSearchText = "";
          this.sSearchText = this.fbcFilterSearch.value.trim();

          if (this.dataService.spliteflag == true) {
            this.searchfiltersvr.setsplitclaimfilter(this.sSearchText);
          } else {
            this.searchfiltersvr.setclaimfilter(this.sSearchText);
          }

          this.getclaimsummary();
        } else if ($event.type == "click") {
          this.loadingClaimsDetailsGrid = true;
          this.MasterClaimdisplaytotalrecordscount = 0;
          this.MasterClaimSkip = 0;
          this.sSearchText = "";
          this.sSearchText = this.fbcFilterSearch.value.trim();

          if (this.dataService.spliteflag == true) {
            this.searchfiltersvr.setsplitclaimfilter(this.sSearchText);
          } else {
            this.searchfiltersvr.setclaimfilter(this.sSearchText);
          }

          this.getclaimsummary();
        }
      }
    } catch (error) {
      this.loadingClaimsDetailsGrid = false;
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

  onViewEOBClick(record: any) {
    try {
      this.inputmastererafileid = record.fileid;
      this.inputtsid = record.ts835id;
      this.inputclpid = record.clpid;
      if (record.hasOwnProperty("spliteid")) {
        this.inputsplitfileid = record.spliteid.toString();
      } else {
        this.inputsplitfileid = " 0";
      }
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

  onMasterFilesExcelExportClick() {
    try {
      if (this.MasterClaimdisplaytotalrecordscount > 0) {
        this.MasterClaimExportExcelDownloadConfirmationMessage =
          this.MasterClaimdisplaytotalrecordscount +
          " records will be Exported, Do you want to continue ?";
        $("#ClaimMasterExportExcelClaimconfirmationModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterClaimExportExcelCloseConfirmationClick() {
    try {
      $("#ClaimMasterExportExcelClaimconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterClaimExportExcelYesConfirmationClick() {
    try {
      this.ClickMasterExportExcel();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ClickMasterExportExcel() {
    try {
      document.getElementById("hbtnClaimMasterExportExcel").click();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public allDataClaim = (): Observable<any> => {
    try {  
      this.emailloading = true;

      let para: {
        nmastererafileid: any;
        sts835id: any;
        sclpid: any;
        splitfileflag: any;
        splitid: any;
        searchtext: any;
      } = {
        nmastererafileid: this.neraMasterFileid,
        sts835id: this.nTS835id,
        sclpid: this.nclpid,
        splitfileflag: this.dataService.spliteflag,
        splitid: this.dataService.spliterafileid,
        searchtext: this.sSearchText                  
      };
      
      if (this.MasterClaimdisplaytotalrecordscount != 0) {        
        var result = this.filedetailService.exporttoexcelfiledata("api/Reports/getClaimSummary", para, this.MasterClaimdisplaytotalrecordscount);
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
          "Claim data exported in excel for Check : " + this.dataService.filecheckno,
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
