import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList
} from "@angular/core";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { GridDataResult } from "@progress/kendo-angular-grid";
import {
  SortDescriptor,
  orderBy,
  GroupDescriptor,
  process
} from "@progress/kendo-data-query";
import { Subclient } from "src/app/Model/subclient";
import { FormBuilder, Validators } from "@angular/forms";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { Api } from "src/app/Services/api";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { isNullOrUndefined } from "util";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { SubSink } from "subsink";
import { FileSummaryInfoComponent } from "../file-summary-info/file-summary-info.component";
import { GridComponent } from "@progress/kendo-angular-grid";
import { Router, ActivatedRoute } from "@angular/router";
import { BreadcrumbService } from "src/app/Services/breadcrumb.service";
import { DatePipe } from "@angular/common";
import { clsPermission } from "../../../Services/settings/clspermission";

@Component({
  selector: "app-practice-file-summary",
  templateUrl: "./practice-file-summary.component.html",
  styleUrls: ["./practice-file-summary.component.css"]
})
export class PracticeFileSummaryComponent implements OnInit, OnDestroy {
  groups: GroupDescriptor[];
  constructor(
    private fb: FormBuilder,
    private filedetailService: FileDetailsService,
    private toastr: ToastrService,
    public api: Api,
    private dataService: DatatransaferService,
    public searchfiltersvr: SearchfiltersService,
    private _routeParams: ActivatedRoute,
    private router: Router,
    public breadcrumbsvr: BreadcrumbService,
    private datePipe: DatePipe
  ) {
    this.clsUtility = new Utility(toastr);
  }

  totalclaimpaid: string;
  totalcheckamount: string;
  totalcheckadjustment: string;
  private clsUtility: Utility;
  private subscription = new SubSink();
  loading = false;
  nclientid: any = "0";
  public sSelectedClientID: string = "0";
  public sSelectedDivisionID: string = "All";

  public FileSummaryGridView: GridDataResult;
  FileSummaryItems: any[] = [];
  public FileSummaryRespose: any;
  totalRecords = 0;
  public sSubClients: any;
  public SelectAllSubClients: any;
  public sSelectedSubClientCode: any = "0";
  public selectedSubClientValue: any = 0;
  public sSearchText: string = "";
  public currentuserid: string = "0";
  public sAllDivision: any;
  public SelectAllDivision: any;
  disabledControls: boolean = false;
  disabledPractice: boolean = false;
  public FilenameColumn: boolean = false;
  @ViewChild("FileSummaryInfo")
  private infoComponentInstance: FileSummaryInfoComponent;

  public SearchByData: any = [
    { value: "Master Filename", text: "Master Filename" },
    { value: "Check", text: "Check" }
  ];
  public sSelectedfbcSearchBy: string = "Master Filename";

  public sort: SortDescriptor[] = [];

  @ViewChildren(GridComponent)
  public grids: QueryList<GridComponent>;
  public demogrid: GridComponent;
  public griditem: any = [];
  public currentmasterfilename: string = "";
  public currentmasterfileid: string = "";
  public disabledexportbutton: boolean = true;
  public disabledfilters: boolean = true;
  public erareport: boolean = false;
  public exportfilename: string = "";
  public clsPermission: clsPermission;
  public disabledbutton: boolean = false;

  DropDownGroup = this.fb.group({
    fcSubClientName: ["", Validators.required],
    fcSearch: [""],
    fcSearchBy: ["", Validators.required],
    fcDivision: ["", Validators.required]
  });

  get SubClientName() {
    return this.DropDownGroup.get("fcSubClientName");
  }

  get fbcSearch() {
    return this.DropDownGroup.get("fcSearch");
  }

  get fbcSearchBy() {
    return this.DropDownGroup.get("fcSearchBy");
  }

  get Division() {
    return this.DropDownGroup.get("fcDivision");
  }

  ngOnInit() {
    try {
      // this.getFileSummaryData();
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          value => (this.clsPermission = value)
        )
      );

      this.currentuserid = this.dataService.SelectedUserid;
      this.RetriveAllDivision();

      this._routeParams.params.subscribe(params => {
        if (params["text"] == "ERAreport") {
          this.erareport = true;
          this.currentmasterfilename = this.dataService.mastererafilename;
          this.currentmasterfileid = this.dataService.mastererafileid;
          this.disabledexportbutton = false;
          this.disabledfilters = true;

          this.breadcrumbsvr.showbreadcrumb();
          this.breadcrumbsvr.showreportfilesummary();

          if (this.currentmasterfilename != "") {
            this.exportfilename =
              this.currentmasterfilename +
              "_" +
              this.datePipe.transform(new Date(), "MMddyyyy") +
              ".pdf";
            this.getReportFileSummaryData();

            this.api.insertActivityLog(
              "File Summary Report Viewed",
              "File Summary Report",
              "READ",
              "0"
            );
          } else {
            this.router.navigate(["/filedata"]);
          }
        } else {
          this.erareport = false;
          this.disabledexportbutton = true;
          this.disabledfilters = false;

          this.api.insertActivityLog(
            "File Summary List Viewed",
            "File Summary",
            "READ",
            "0"
          );
        }
      });
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  resetGrid() {
    try {
      this.FileSummaryGridView = null;
      this.FileSummaryRespose = null;
      this.FileSummaryItems = [];
      this.totalclaimpaid = null;
      this.totalcheckamount = null;
      this.totalcheckadjustment = null;
      this.totalRecords = 0;
      // this.loadItems();
      this.groupItem();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getFileSummaryData() {
    try {
      let summaryinput: {
        searchby: string;
        searchtext: string;
        nsubclientid: string;
        sdivisioncode: string;
        nmastererafileid: any;
      } = {
        searchby: this.sSelectedfbcSearchBy,
        searchtext: this.fbcSearch.value,
        nsubclientid: this.sSelectedSubClientCode,
        sdivisioncode: this.sSelectedDivisionID,
        nmastererafileid: 0
      };
      this.resetGrid();
      this.loading = true;
      this.subscription.add(
        this.filedetailService.getFileSummaryMaster(summaryinput).subscribe(
          data => {
            if (data) {
              this.FileSummaryRespose = data;
              this.FileSummaryItems = this.FileSummaryRespose.content;
              if (this.FileSummaryItems)
                this.totalRecords = this.FileSummaryItems.length;
              this.totalclaimpaid = this.FileSummaryRespose.totalclaimpaid;
              this.totalcheckamount = this.FileSummaryRespose.totalcheckamount;
              this.totalcheckadjustment = this.FileSummaryRespose.totalcheckadjustment;
              // this.loadItems();
              this.groupItem();
            }
            this.loading = false;
          },
          error => {
            this.loading = false;
            this.clsUtility.LogError(error);
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.clsUtility.showError(error);
    }
  }

  onInfoClick(nsplitid: string) {
    try {
      this.infoComponentInstance.getFileSummaryInfo(nsplitid);
    } catch (error) {
      this.clsUtility.showError(error);
    }
  }

  // Dropdown Division Data
  RetriveAllDivision(client: string = "0") {
    try {
      class division {
        subclientdivisioncode: string;
      }
      let getdivision: { clientid: string } = {
        clientid: client
      };
      let seq = this.api.post("GetDivisionCode", getdivision);
      seq.subscribe(
        res => {
          this.sAllDivision = res;
          if (this.sAllDivision && this.sAllDivision.length > 0) {
            const Alldiv = new division();
            Alldiv.subclientdivisioncode = "All";
            this.sAllDivision.unshift(Alldiv);
            this.SelectAllDivision = this.sAllDivision;
            this.sSelectedDivisionID = "All";
            this.disabledControls = false;
            this.RetriveSubClient();
          } else {
            this.sAllDivision = [];
            this.FileSummaryRespose = [];
            this.FileSummaryItems = [];
            this.disabledControls = true;
            this.clsUtility.showInfo("No Divisioncode/Practice is available");
          }
        },
        err => {
          this.clsUtility.LogError(err);
        }
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient() {
    try {
      let getsubclient: {
        subclientcode: string;
        clientid: string;
        subclientdivisioncode: string;
        subclientstatus: boolean;
      } = {
        subclientcode: "",
        clientid: "0",
        subclientdivisioncode: this.sSelectedDivisionID,
        subclientstatus: true
      };
      let seq = this.api.post("SubClient/GetSubClient", getsubclient);
      seq.subscribe(
        res => {
          this.sSubClients = res;
          if (this.sSubClients && this.sSubClients.length > 0) {
            const Subclt = new Subclient();
            Subclt.subclientid = "0";
            Subclt.subclientcode = "0";
            Subclt.subclientname = "All";
            this.sSubClients.unshift(Subclt);
            this.SelectAllSubClients = this.sSubClients;
            this.sSelectedSubClientCode = "0";
            this.disabledPractice = false;
            // this.RetriveSplitFiles();
          } else {
            this.sSubClients = [];
            this.disabledPractice = true;
            this.clsUtility.showInfo("No group/practice is mapped to user");
          }
        },
        err => {
          this.clsUtility.LogError(err);
        }
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  // sortChange(sort: SortDescriptor[]): void {
  //   try {
  //     this.sort = sort;
  //     this.loadItems();
  //   } catch (error) {
  //     this.clsUtility.LogError(error);
  //   }
  // }

  ngOnDestroy() {
    try {
      this.breadcrumbsvr.hidereportfilesummary();
      this.breadcrumbsvr.hidebreadcrumb();
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  // private loadItems(): void {
  //   try {
  //     if (!isNullOrUndefined(this.FileSummaryItems)) {
  //       if (this.FileSummaryItems.length > 0) {
  //         this.FileSummaryGridView = {
  //           data: orderBy(this.FileSummaryItems, this.sort),
  //           total: this.FileSummaryItems.length
  //         };
  //       }
  //     }
  //   } catch (error) {
  //     this.clsUtility.LogError(error);
  //   }
  // }

  onSubClientChange(event: any) {
    try {
      this.sSelectedSubClientCode = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleSubclientFilter(value) {
    this.sSubClients = this.SelectAllSubClients.filter(
      s => s.subclientname.toLowerCase().indexOf(value.toLowerCase()) !== -1
    );
  }
  public groupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    this.groupItem();
  }

  private groupItem(): void {
    try {
      if (!isNullOrUndefined(this.FileSummaryItems)) {
        if (this.FileSummaryItems.length > 0) {
          this.FileSummaryGridView = process(this.FileSummaryItems, {
            group: this.groups
          });
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  applyFilters() {
    try {
      if (this.DropDownGroup.valid) {
        if (this.fbcSearch.value && this.fbcSearch.value.trim())
          this.sSearchText = this.fbcSearch.value.trim();
        if (this.sSearchText) {
          if (this.sSelectedfbcSearchBy == "Check") {
            this.FilenameColumn = true;
          } else {
            this.FilenameColumn = false;
          }
          this.getFileSummaryData();
        } else {
          this.clsUtility.showInfo(
            "Please enter search value to retrieve data"
          );
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  clearFilters() {
    try {
      this.sSelectedDivisionID = "All";
      this.sSelectedSubClientCode = "0";
      this.sSearchText = "";
      this.sSelectedfbcSearchBy = "Master Filename";
      this.fbcSearch.setValue(this.sSearchText);
      this.resetGrid();
      this.RetriveAllDivision();
      //this.RetriveSubClient();
      // this.getFileSummaryData();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  SearchByChange(event: any) {
    try {
      this.sSelectedfbcSearchBy = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onDivisionChange(event: any) {
    try {
      if (this.Division.value == undefined || this.Division.value == "") {
        this.toastr.warning("Please Select Division");
      } else {
        this.sSelectedDivisionID = event;
        this.RetriveSubClient();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleDivisionFilter(value) {
    this.sAllDivision = this.SelectAllDivision.filter(
      s =>
        s.subclientdivisioncode.toLowerCase().indexOf(value.toLowerCase()) !==
        -1
    );
  }

  ngAfterViewInit() {
    try {
      if (!this.fbcSearch.value) {
        if (this.erareport == false) {
          setTimeout(() => {
            this.clsUtility.showWarning(
              "Please enter search value to retrieve data"
            );
          }, 0);
        }
      }
    } catch (error) {}
  }

  getReportFileSummaryData() {
    try {
      let summaryinput: {
        searchby: string;
        searchtext: string;
        nsubclientid: string;
        sdivisioncode: string;
        nmastererafileid: any;
      } = {
        searchby: this.sSelectedfbcSearchBy,
        searchtext: this.currentmasterfilename,
        nsubclientid: this.sSelectedSubClientCode,
        sdivisioncode: this.sSelectedDivisionID,
        nmastererafileid: this.currentmasterfileid
      };
      this.resetGrid();
      this.loading = true;
      this.subscription.add(
        this.filedetailService.getFileSummaryMaster(summaryinput).subscribe(
          data => {
            if (data) {
              this.FileSummaryRespose = data;
              this.FileSummaryItems = this.FileSummaryRespose.content;
              if (this.FileSummaryItems)
                this.totalRecords = this.FileSummaryItems.length;
              this.totalclaimpaid = this.FileSummaryRespose.totalclaimpaid;
              this.totalcheckamount = this.FileSummaryRespose.totalcheckamount;
              this.totalcheckadjustment = this.FileSummaryRespose.totalcheckadjustment;
              // this.loadItems();
              this.groupItem();
            }
            this.loading = false;
          },
          error => {
            this.loading = false;
            this.clsUtility.LogError(error);
          }
        )
      );
    } catch (error) {
      this.loading = false;
      this.clsUtility.showError(error);
    }
  }

  exporttopdfclick() {
    this.disabledbutton = true;

    this.api.insertActivityLog(
      "ERA File Summary Report exported for File (" +
        this.currentmasterfilename +
        ")",
      "File Summary",
      "READ"
    );
  }
}
