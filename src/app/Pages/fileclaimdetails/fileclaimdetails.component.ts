import { Component, OnInit, OnDestroy } from "@angular/core";
import { FileDetailsService } from "src/app/Services/file-details.service";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { DatePipe } from "@angular/common";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../node_modules/subsink";
import { Api } from "src/app/Services/api";
import { BreadcrumbService } from "src/app/Services/breadcrumb.service";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Router } from "@angular/router";
import { FormBuilder, Validators } from "@angular/forms";
import { isNullOrUndefined } from "util";
import { SearchfiltersService } from "src/app/Services/searchfilters.service";
import { parseNumber } from "@progress/kendo-angular-intl";

@Component({
  selector: "app-fileclaimdetails",
  templateUrl: "./fileclaimdetails.component.html",
  styleUrls: ["./fileclaimdetails.component.css"]
})
export class FileclaimdetailsComponent implements OnInit, OnDestroy {
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
    public searchfiltersvr: SearchfiltersService
  ) {
    this.clsUtility = new Utility(toastr);
    this.PayerdetailsPageSize = this.clsUtility.pagesize;
  }

  private clsUtility: Utility;
  private subscription = new SubSink();

  loading = false;
  loadingPayerdetailsGrid = false;
  neraMasterFileid: any = "0";
  public sPayerdetails: any;
  public nSelectedClientID: string = "0";

  public PayerdetailsGridData: {};
  public PayerdetailsGridView: GridDataResult;
  private PayerdetailsItems: any[] = [];
  private PayerdetailsResponse: any[] = [];
  public PayerdetailsSkip = 0;
  public PayerdetailsPageSize = 0;

  public stitlePayerdetails = "Payer Details";
  public sPayerdetailsBreadCrumb: string = "FilesClaimDetails";
  public Payerdetailsdisplaytotalrecordscount: number = 0;
  public sSearchText: string = "";

  public sPayerSearchBy: any = [
    { value: "Check", text: "Check" },
    { value: "Check date", text: "Check date" },
    { value: "Payer name", text: "Payer name" },
    { value: "Payerid", text: "Payerid" }
  ];
  public sSelectedPayerSearchBy: string = "Check";
  public disabledsearchBy: boolean = false;

  public sortPayerdetails: SortDescriptor[] = [
    {
      field: "dtcreateddate",
      dir: "desc"
    }
  ];

  DropDownGroup = this.fb.group({
    fcSearch: [""],
    fcPayerSearchBy: [""]
  });

  get fbcFilterSearch() {
    return this.DropDownGroup.get("fcSearch");
  }

  get PayerSearchBy() {
    return this.DropDownGroup.get("fcPayerSearchBy");
  }

  ngOnInit() {
    try {
      this.neraMasterFileid = this.dataService.mastererafileid;
      if (
        this.neraMasterFileid != null &&
        this.neraMasterFileid != undefined &&
        this.neraMasterFileid != "" &&
        this.neraMasterFileid != "0"
      ) {
        if (this.searchfiltersvr.payerfilter == true) {
          this.searchfiltersvr.files_mastererafileid = this.neraMasterFileid;
          this.sSearchText = this.searchfiltersvr.getpayersSearchText();
          this.sSelectedPayerSearchBy = this.searchfiltersvr.getpayersSearchBy();
          this.fbcFilterSearch.setValue(this.sSearchText);
        }
        this.Payerdetailsdisplaytotalrecordscount = 0;
        this.loadingPayerdetailsGrid = true;
        this.RetrivePayerdetails();
        this.api.insertActivityLog(
          "Payer Details Viewed for File (" +
            this.dataService.mastererafilename +
            ")",
          "Files",
          "READ",
          this.neraMasterFileid
        );
      } else {
        this.router.navigate(["/Files"]);
      }
      this.breadcrumbService.showhideFilesbreadcrumb(
        true,
        this.sPayerdetailsBreadCrumb
      );
    } catch (error) {
      this.loadingPayerdetailsGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  public pageChangePayerdetails(event: PageChangeEvent): void {
    try {
      this.PayerdetailsSkip = event.skip;
      this.RetrivePayerdetails();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortPayerdetailsChange(sort: SortDescriptor[]): void {
    try {
      this.sortPayerdetails = sort;
      this.loadItemsPayerdetails();
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

  RetrivePayerdetails() {
    this.PayerdetailsGridView = null;
    this.PayerdetailsItems = [];
    try {
      this.loadingPayerdetailsGrid = true;
      this.subscription.add(
        this.filedetailService
          .getFilesClaimDetails(
            this.neraMasterFileid,
            this.PayerdetailsSkip,
            this.PayerdetailsPageSize,
            this.sSelectedPayerSearchBy,
            this.sSearchText
          )
          .subscribe(
            data => {
              if (!isNullOrUndefined(data)) {
                this.PayerdetailsResponse = data;
                this.PayerdetailsItems = this.PayerdetailsResponse["content"];
                if (this.PayerdetailsItems != null) {
                  if (this.PayerdetailsItems.length > 0) {
                    this.Payerdetailsdisplaytotalrecordscount = this.PayerdetailsResponse[
                      "totalelements"
                    ];

                    this.PayerdetailsItems.map(obj => {
                      obj["checkamount"] = parseNumber(
                        !isNullOrUndefined(obj["checkamount"])
                          ? obj["checkamount"].replace("$", "").replace(",", "")
                          : "$0.00"
                      );
                      obj["totalpaidamt"] = parseNumber(
                        !isNullOrUndefined(obj["totalpaidamt"])
                          ? obj["totalpaidamt"]
                              .replace("$", "")
                              .replace(",", "")
                          : "$0.00"
                      );
                      obj["plbamount"] = parseNumber(
                        !isNullOrUndefined(obj["plbamount"])
                          ? obj["plbamount"].replace("$", "").replace(",", "")
                          : "$0.00"
                      );
                    });

                    this.loadItemsPayerdetails();
                    this.loadingPayerdetailsGrid = false;
                  } else {
                    this.loadingPayerdetailsGrid = false;
                    this.Payerdetailsdisplaytotalrecordscount = 0;
                  }
                } else {
                  this.loadingPayerdetailsGrid = false;
                  this.Payerdetailsdisplaytotalrecordscount = 0;
                }
              } else {
                this.loadingPayerdetailsGrid = false;
              }
            },
            err => {
              this.loadingPayerdetailsGrid = false;
            }
          )
      );
    } catch (error) {
      this.loadingPayerdetailsGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsPayerdetails(): void {
    this.PayerdetailsGridView = null;
    try {
      if(this.PayerdetailsItems != null && this.PayerdetailsItems != undefined){
        if (this.PayerdetailsItems && this.PayerdetailsItems.length > 0) {
          this.PayerdetailsGridView = {
            data: orderBy(this.PayerdetailsItems, this.sortPayerdetails),
            total: this.PayerdetailsResponse["totalelements"]
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
          this.PayerdetailsSkip = 0;
          this.sSearchText = null;
          this.sSearchText = this.fbcFilterSearch.value.trim();
          this.Payerdetailsdisplaytotalrecordscount = 0;
          this.loadingPayerdetailsGrid = true;
          this.searchfiltersvr.setpayerfilter(
            this.sSearchText,
            this.sSelectedPayerSearchBy
          );
          this.RetrivePayerdetails();
        } else if ($event.type == "click") {
          this.PayerdetailsSkip = 0;
          this.sSearchText = null;
          this.sSearchText = this.fbcFilterSearch.value.trim();
          this.Payerdetailsdisplaytotalrecordscount = 0;
          this.loadingPayerdetailsGrid = true;
          this.searchfiltersvr.setpayerfilter(
            this.sSearchText,
            this.sSelectedPayerSearchBy
          );
          this.RetrivePayerdetails();
        }
      }
    } catch (error) {
      this.loadingPayerdetailsGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  onPayerSearchByChange(event: any) {
    try {
      this.sSelectedPayerSearchBy = event;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  applyFilters() {
    try {
      this.PayerdetailsSkip = 0;
      this.sSearchText = null;
      this.sSearchText = this.fbcFilterSearch.value.trim();
      this.Payerdetailsdisplaytotalrecordscount = 0;
      this.loadingPayerdetailsGrid = true;
      this.searchfiltersvr.setpayerfilter(
        this.sSearchText,
        this.sSelectedPayerSearchBy
      );
      this.RetrivePayerdetails();
    } catch (error) {
      this.loadingPayerdetailsGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  clearFilters() {
    try {
      this.nSelectedClientID = "0";
      this.sSearchText = "";
      this.sSelectedPayerSearchBy = "Check";
      this.fbcFilterSearch.setValue(this.sSearchText);
      this.searchfiltersvr.clearpayerfilter();
      this.PayerdetailsSkip = 0;
      this.Payerdetailsdisplaytotalrecordscount = 0;
      this.loadingPayerdetailsGrid = true;
      this.RetrivePayerdetails();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
