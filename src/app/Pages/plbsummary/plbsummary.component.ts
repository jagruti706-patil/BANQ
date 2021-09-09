import { Component, OnInit } from "@angular/core";
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
import { Api } from "src/app/Services/api";
declare var $: any;
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { isNullOrUndefined } from "util";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { Workbook } from "@progress/kendo-angular-excel-export";
import { Observable } from "rxjs";

@Component({
  selector: "app-plbsummary",
  templateUrl: "./plbsummary.component.html",
  styleUrls: ["./plbsummary.component.css"],
})
export class PlbsummaryComponent implements OnInit {
  public clsPermission: clsPermission;
  public clsUtility: Utility;
  public subscription = new SubSink();
  public PLBGridView: GridDataResult;
  public PLBItems: any[] = [];
  public PLBResponse: any[] = [];
  public PLBdisplaytotalrecordscount: number = 0;
  public PLBSkip = 0;
  public PLBpagesize: number = 0;
  public payername: string = "";

  public sortPLB: SortDescriptor[] = [
    {
      field: "clientid",
      dir: "asc",
    },
  ];

  neraMasterFileid: any = "0";
  nTS835id: any = "0";
  nsplitfileid: any = "0";
  public loadingPLBDetailsGrid: boolean = false;

  public emailloading = false;
  public MasterPLBExportExcelDownloadConfirmationMessage: any;
  public SplitFileExportExcelDownloadConfirmationMessage: any;
  public MasterexportFilename: string =
  "PLBSummary_" + this.datePipe.transform(new Date(), "MMddyyyy");

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
    this.PLBpagesize = this.clsUtility.pagesize;
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
      this.nTS835id = this.dataService.TS835id;
      this.nsplitfileid = this.dataService.splitplbfileid;
      if (isNullOrUndefined(this.nsplitfileid)) {
        this.nsplitfileid = "0";
      }
      if (
        this.neraMasterFileid != null &&
        this.neraMasterFileid != "0" &&
        this.nTS835id != null &&
        this.nTS835id != "0"
      ) {
        this.breadcrumbsvr.showbreadcrumb();
        this.breadcrumbsvr.showplbsummary();

        this.loadingPLBDetailsGrid = true;
        this.getPLBsummary();
        if (this.dataService.spliteflag == true) {
          this.api.insertActivityLog(
            "PLB summary Viewed for Check (" +
              this.dataService.filecheckno +
              ")",
            "File Data",
            "READ",
            this.neraMasterFileid
          );
        }

        this.router.navigate(["/plbsummary"]);
      } else if (
        this.neraMasterFileid != null &&
        this.neraMasterFileid != "0" &&
        this.nTS835id != null &&
        this.nTS835id != "0" &&
        this.nsplitfileid != null &&
        this.nsplitfileid != "0"
      ) {
        this.breadcrumbsvr.showbreadcrumb();
        this.breadcrumbsvr.showplbsummary();

        this.loadingPLBDetailsGrid = true;
        this.getPLBsummary();
        if (this.dataService.spliteflag == true) {
          this.api.insertActivityLog(
            "PLB summary Viewed for Check (" +
              this.dataService.filecheckno +
              ")",
            "File Data",
            "READ",
            this.neraMasterFileid
          );
        }

        this.router.navigate(["/plbsummary"]);
      } else {
        this.router.navigate(["/filedata"]);
      }
    } catch (error) {
      this.loadingPLBDetailsGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  getPLBsummary() {
    this.PLBGridView = null;
    this.PLBItems = [];
    try {
      this.subscription.add(
        this.filedetailService
          .getPLBSummary(
            this.neraMasterFileid,
            this.nTS835id,
            this.dataService.spliteflag,
            this.nsplitfileid,
            this.PLBpagesize,
            this.PLBSkip
          )
          .subscribe(
            (data) => {
              this.PLBResponse = data;
              if (this.PLBResponse != null) {
                this.PLBItems = this.PLBResponse["content"];
                if (this.PLBItems != null) {
                  if (this.PLBItems.length > 0) {
                    this.payername = this.PLBItems[0]["payername"];
                    this.loadItems();
                    this.loadingPLBDetailsGrid = false;
                  }
                } else {
                  this.PLBdisplaytotalrecordscount = 0;
                  this.loadingPLBDetailsGrid = false;
                }
              }
            },
            (err) => {
              this.loadingPLBDetailsGrid = false;
            }
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
      this.loadingPLBDetailsGrid = false;
    }
  }

  private loadItems(): void {
    this.PLBGridView = null;
    try {
      this.PLBGridView = {
        data: orderBy(this.PLBItems, this.sortPLB),
        total: this.PLBResponse["totalelements"],
      };
      this.PLBdisplaytotalrecordscount = this.PLBResponse["totalelements"];
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangePLB(event: PageChangeEvent): void {
    try {
      this.PLBSkip = event.skip;
      this.PLBGridView = null;
      this.loadingPLBDetailsGrid = true;
      this.getPLBsummary();
    } catch (error) {
      this.loadingPLBDetailsGrid = false;
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

  onMasterFilesExcelExportClick() {
    try {
      if (this.PLBdisplaytotalrecordscount > 0) {
        this.MasterPLBExportExcelDownloadConfirmationMessage =
          this.PLBdisplaytotalrecordscount +
          " records will be Exported, Do you want to continue ?";
        $("#PLBMasterExportExcelClaimconfirmationModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterPLBExportExcelCloseConfirmationClick() {
    try {
      $("#PLBMasterExportExcelClaimconfirmationModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onMasterPLBExportExcelYesConfirmationClick() {
    try {
      this.ClickMasterExportExcel();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ClickMasterExportExcel() {
    try {
      document.getElementById("hbtnPLBMasterExportExcel").click();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }  

  public allDataPLB = (): Observable<any> => {
    try {  
      this.emailloading = true;

      let para: {
        nmastererafileid: any;
        v_ts835id: any;
        splitfileflag: any;
        splitid: any;
      } = {
        nmastererafileid: this.neraMasterFileid,
        v_ts835id: this.nTS835id,     
        splitfileflag: this.dataService.spliteflag,
        splitid: this.nsplitfileid                      
      };
      
      if (this.PLBdisplaytotalrecordscount != 0) {        
        var result = this.filedetailService.exporttoexcelfiledata("api/Reports/getPLBSummary", para, this.PLBdisplaytotalrecordscount);
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
          "PLB data exported in excel for Check : " + this.dataService.filecheckno + " and for Payer : " + this.payername,
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
