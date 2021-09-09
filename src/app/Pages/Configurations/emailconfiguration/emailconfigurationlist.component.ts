import { Component, OnInit, OnDestroy } from "@angular/core";
import { Api } from "../../../Services/api";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { process, State } from "@progress/kendo-data-query";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { SubSink } from "subsink";
declare var $: any;

@Component({
  selector: "app-emailconfigurationlist",
  templateUrl: "./emailconfigurationlist.component.html",
  styleUrls: ["./emailconfigurationlist.component.css"],
})
export class EmailconfigurationlistComponent implements OnInit, OnDestroy {
  private clsUtility: Utility;
  public subscription = new SubSink();
  toggleme: boolean = false;
  result: any = [];
  public gridView: GridDataResult;
  public EmailItems: any[] = [];
  public EmailResponse: any[] = [];
  public EmailSkip = 0;
  public Emailpagesize: number = 0;
  public Emailcount: number = 0;
  public editmessage: string = "";
  public editemailID: string = "";
  public loadingEmailConfigGrid: boolean = false;
  public clsPermission: clsPermission;

  public state: State = {
    skip: 0,
    take: 50,
  };

  public sortMaster: SortDescriptor[] = [
    {
      field: "createdon",
      dir: "desc",
    },
  ];

  constructor(
    public api: Api,
    private toastr: ToastrService,
    private allConfigService: AllConfigurationService,
    private dataService: DatatransaferService
  ) {
    this.clsUtility = new Utility(toastr);
    this.Emailpagesize = this.clsUtility.configPageSize;
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          (value) => (this.clsPermission = value)
        )
      );
      this.subscription.add(
        this.allConfigService.toggleSidebar.subscribe((isToggle) => {
          this.toggleme = isToggle;
        })
      );
      this.loadingEmailConfigGrid = true;
      this.getconfiglist();
    } catch (error) {
      this.loadingEmailConfigGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  togglesidebar() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }

  getconfiglist() {
    try {
      let para: { configid: Number } = {
        configid: 0,
      };

      let seq = this.api.post_email(
        "EmailConfiguration/" + this.Emailpagesize + "/" + this.EmailSkip,
        para
      );
      this.subscription.add(
        seq.subscribe((res) => {
          this.EmailResponse = res;
          if (this.EmailResponse != null) {
            this.EmailItems = this.EmailResponse["content"];
            if (this.EmailItems != null && this.EmailItems != undefined) {
              this.loadMaster();
            } else {
              this.EmailItems = [];
              this.loadMaster();
            }
            this.loadingEmailConfigGrid = false;
            this.api.insertActivityLog(
              "Email Configuration List Viewed",
              "Email Configuration",
              "READ"
            );
          }
        })
      );
    } catch (error) {
      this.loadingEmailConfigGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  private loadMaster(): void {
    this.gridView = null;
    try {
      if (this.EmailItems) {
        this.gridView = {
          data: orderBy(this.EmailItems, this.sortMaster),
          total: this.EmailResponse["totalelements"],
        };

        this.Emailcount = this.EmailResponse["totalelements"];
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    try {
      this.gridView = null;
      this.EmailSkip = event.skip;
      this.getconfiglist();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  editConfiratmion(dataItem: any) {
    try {
      this.editemailID = dataItem.configid;
      let title = dataItem.title;

      this.editmessage =
        "Do you want to edit email configuration for " + title + "?";
      $("#editemailmodal").modal("show");
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
