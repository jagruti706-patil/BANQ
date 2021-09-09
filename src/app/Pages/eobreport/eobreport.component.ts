import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnDestroy,
} from "@angular/core";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { GridDataResult } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Api } from "src/app/Services/api";
declare var $: any;
import { clsPermission } from "src/app/Services/settings/clspermission";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { isNullOrUndefined } from "util";

@Component({
  selector: "app-eobreport",
  templateUrl: "./eobreport.component.html",
  styleUrls: ["./eobreport.component.css"],
})
export class EobreportComponent implements OnInit, OnDestroy {
  private clsUtility: Utility;
  private subscription = new SubSink();
  public clsPermission: clsPermission;

  public EOBReportItems: any[] = [];
  public EOBReportSVC: any[] = [];
  public EOBReportSVCGridView: GridDataResult;
  public EOBReportSVClineSkip = 0;
  public EOBReportSVClinepagesize: number = 50;

  public exportfilename: string = "";
  public echeckno: string = "";
  public eclaimno: string = "";
  public displayreport: boolean = false;
  public disabledbutton: boolean = false;
  public sclaimno: string = "";
  public renderingproviderNameNpi: string = "";

  public sortMaster: SortDescriptor[] = [
    {
      field: "clientid",
      dir: "asc",
    },
  ];

  // Received Input from parent component
  @Input() InputMastererafileid: any;
  @Input() InputTsid: any;
  @Input() InputClpid: any;
  @Input() InputSplitfileid: any;
  @Input() InputComponentname: any;

  // Send Output to parent component
  @Output() OutputViewEobReportResult = new EventEmitter<boolean>();

  OutputResult(data: any) {
    let outResult = data;
    this.OutputViewEobReportResult.emit(outResult);
  }

  constructor(
    private toastr: ToastrService,
    private filedetailService: FileDetailsService,
    private api: Api,
    private dataService: DatatransaferService
  ) {
    this.clsUtility = new Utility(toastr);
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );

      if (
        this.InputMastererafileid != null &&
        this.InputMastererafileid != 0 &&
        this.InputTsid != null &&
        this.InputTsid != 0 &&
        this.InputClpid != null &&
        this.InputClpid != 0 &&
        this.InputSplitfileid != null
      ) {
        this.getEOBReport();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      if (
        this.InputMastererafileid != null &&
        this.InputMastererafileid != 0 &&
        this.InputTsid != null &&
        this.InputTsid != 0 &&
        this.InputClpid != null &&
        this.InputClpid != 0 &&
        this.InputSplitfileid != null
      ) {
        this.getEOBReport();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getEOBReport() {
    this.EOBReportItems = [];
    this.EOBReportSVC = [];
    this.EOBReportSVCGridView = null;
    this.EOBReportItems = [];

    try {
      this.disabledbutton = false;
      this.subscription.add(
        this.filedetailService
          .getEOBReport(
            this.InputMastererafileid,
            this.InputTsid,
            this.InputClpid,
            this.InputSplitfileid
          )
          .subscribe(
            (data) => {
              this.EOBReportItems = data;

              if (this.EOBReportItems != null) {
                if (this.EOBReportItems.length > 0) {
                  this.sclaimno = this.EOBReportItems["0"].otherdetails[
                    "0"
                  ].claimno;

                  if (
                    !isNullOrUndefined(
                      this.EOBReportItems["0"].otherdetails["0"].charges
                    )
                  ) {
                    this.EOBReportSVC = this.EOBReportItems["0"].otherdetails[
                      "0"
                    ].charges;   
                                  
                    if (this.EOBReportItems["0"].otherdetails["0"].renderringprovider != null){
                      this.EOBReportItems["0"].otherdetails["0"].renderringprovider = this.EOBReportItems["0"].otherdetails["0"].renderringprovider.trim();
                    } else {
                      this.EOBReportItems["0"].otherdetails["0"].renderringprovider = "";
                    }                    
                    
                    if (this.EOBReportItems["0"].otherdetails["0"].renderingnpi != null) {
                      this.EOBReportItems["0"].otherdetails["0"].renderingnpi = this.EOBReportItems["0"].otherdetails["0"].renderingnpi.trim();
                    } else {
                      this.EOBReportItems["0"].otherdetails["0"].renderingnpi = "";
                    }

                    if(this.EOBReportItems["0"].otherdetails["0"].renderringprovider != ''){
                      this.renderingproviderNameNpi = this.EOBReportItems["0"].otherdetails["0"].renderringprovider ;
                      if(this.EOBReportItems["0"].otherdetails["0"].renderingnpi != ''){
                        this.renderingproviderNameNpi  = this.renderingproviderNameNpi  + '(' + this.EOBReportItems["0"].otherdetails["0"].renderingnpi + ')';
                      } 
                    } else if(this.EOBReportItems["0"].otherdetails["0"].renderringprovider == ''){
                      this.renderingproviderNameNpi = this.EOBReportItems["0"].otherdetails["0"].renderingnpi;
                    }
                                        
                    if (this.EOBReportSVC.length > 0) {
                      this.loadsvcdetails();
                    }
                  }

                  this.api.insertActivityLog(
                    "ERA EOB Report Viewed for Claim (" + this.sclaimno + ")",
                    this.InputComponentname,
                    "READ"
                  );

                  this.echeckno = this.EOBReportItems["0"].payerandcheck[
                    "0"
                  ].checknumber;
                  this.eclaimno = this.EOBReportItems["0"].otherdetails[
                    "0"
                  ].claimno;
                  this.exportfilename =
                    this.echeckno + "_" + this.eclaimno + ".pdf";
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

  onCloseClick() {
    try {
      this.displayreport = false;
      this.disabledbutton = false;
      this.OutputResult(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ResetComponents() {
    try {
      this.InputMastererafileid = 0;
      this.InputTsid = 0;
      this.InputClpid = 0;
      this.InputSplitfileid = 0;
      this.displayreport = false;
      this.disabledbutton = false;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  exporttopdfclick() {
    try {
      this.displayreport = false;

      this.api.insertActivityLog(
        "ERA EOB Report exported for Claim (" + this.eclaimno + ")",
        this.InputComponentname,
        "READ"
      );
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }

  exportpdf() {
    try {
      this.displayreport = true;
      this.disabledbutton = true;
      setTimeout(function () {
        document.getElementById("hiddenbtn").click();
      }, 1000);
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
}
