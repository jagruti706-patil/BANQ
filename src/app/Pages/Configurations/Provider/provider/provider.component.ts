import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { Utility } from "src/app/Model/utility";
import { Providers } from "src/app/Model/Configuration/providers";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../../../node_modules/subsink";
import { AddproviderComponent } from "../addprovider/addprovider.component";
declare var $: any;

@Component({
  selector: "app-provider",
  templateUrl: "./provider.component.html",
  styleUrls: ["./provider.component.css"]
})
export class ProviderComponent implements OnInit, OnDestroy {
  public ProvidersgridData: {};
  public ProvidersgridView: GridDataResult;
  private Providersitems: any[] = [];
  public Providersskip = 0;
  public ProviderspageSize = 10;

  private Providersid: number = 0;
  public editProvidersid: number = 0;
  private deleteProvidersid: number = 0;
  public EditProvidersid: number = 0;

  public InputEditMessage: string;
  public OutEditResult: boolean;
  public InputDeleteMessage: string;
  public OutDeleteResult: boolean;
  private subscription = new SubSink();
  private clsUtility: Utility;
  toggleme: any;

  @ViewChild("AddProvidersChild")
  private AddProvidersChild: AddproviderComponent;

  public Providerssort: SortDescriptor[] = [
    {
      field: "sactioncode",
      dir: "desc"
    }
  ];
  constructor(
    private ConfigurationService: AllConfigurationService,
    private toastr: ToastrService,
    private allConfigService: AllConfigurationService
  ) {
    this.clsUtility = new Utility(toastr);
    this.ProviderspageSize = this.clsUtility.configPageSize;
  }

  ngOnInit() {
    try {
      this.Providersid = 0;
      this.getProvidersById();
    } catch (error) {
      this.clsUtility.LogError(error);
    }

    this.allConfigService.toggleSidebar.subscribe(isToggle => {
      this.toggleme = isToggle;
    });
  }

  togglesidebar() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }

  getProvidersById() {
    try {
      this.subscription
        .add
        // this.ConfigurationService.getProvidersById(this.Providersid).subscribe(
        //   data => {
        //     if (data != null || data != undefined) {
        //       this.ProvidersgridData = data;
        //       this.Providersitems = data;
        //       this.loadProvidersitems();
        //     }
        //   }
        // )
        ();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadProvidersitems(): void {
    try {
      this.ProvidersgridView = {
        data: orderBy(
          this.Providersitems.slice(
            this.Providersskip,
            this.Providersskip + this.ProviderspageSize
          ),
          this.Providerssort
        ),
        total: this.Providersitems.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortProvidersChange(sort: SortDescriptor[]): void {
    try {
      if (this.Providersitems != null) {
        this.Providerssort = sort;
        this.loadProvidersitems();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeProviders(event: PageChangeEvent): void {
    try {
      this.Providersskip = event.skip;
      this.loadProvidersitems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  EditProviders({ sender, rowIndex, dataItem }) {
    try {
      this.editProvidersid = dataItem.nactionid;
      this.InputEditMessage = "Do you want to edit actions?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  DeleteProviders({ sender, rowIndex, dataItem }) {
    try {
      this.deleteProvidersid = dataItem.nactionid;
      this.InputDeleteMessage = "Do you want to delete actions?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteProviders() {
    try {
      this.subscription
        .add
        // this.ConfigurationService.deleteProviders(
        //   this.deleteProvidersid
        // ).subscribe((data: {}) => {
        //   if (data != null || data != undefined) {
        //     if (data == 1) {
        //       alert("Action deleted successfully");
        //     } else {
        //       alert("Action not deleted");
        //     }
        //     this.Providersid = 0;
        //     this.getProvidersById();
        //   }
        // })
        ();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  updateProvidersStatus(Providersid, Providers) {
    try {
      const jsonactions = JSON.stringify(Providers);
      this.subscription
        .add
        // this.ConfigurationService.updateProvidersStatus(
        //   Providersid,
        //   jsonactions
        // ).subscribe((data: {}) => {
        //   if (data != null || data != undefined) {
        //     if (data == 1) {
        //       this.clsUtility.showSuccess("Status updated successfully");
        //     } else if (data == 0) {
        //       this.clsUtility.showError("Status not updated");
        //     } else {
        //       this.clsUtility.showInfo(
        //         "Status cannot be updated already in use"
        //       );
        //     }
        //     this.getProvidersById();
        //   }
        // })
        ();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  AddProviders() {
    try {
      this.editProvidersid = 0;
      this.EditProvidersid = 0;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputEditResult($event) {
    try {
      this.OutEditResult = $event;
      if (this.OutEditResult == true) {
        this.EditProvidersid = this.editProvidersid;
        $("#addprovidresModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputDeleteResult($event) {
    try {
      this.OutDeleteResult = $event;
      if (this.OutDeleteResult == true) {
        this.deleteProviders();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputProvidersEditResult($event) {
    try {
      this.Providersid = 0;
      let IsSaved = $event;
      if (IsSaved == true) {
        this.getProvidersById();
      }
      this.AddProvidersChild.ResetComponents();
      this.editProvidersid = null;
      this.EditProvidersid = null;
      $("#addprovidersModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnProvidersStatus(Providersid, ProvidersStatus) {
    try {
      let objProviders: Providers;
      objProviders = new Providers();
      // objProviders.nactionid = Providersid;
      // objProviders.bisactive = ProvidersStatus;
      this.updateProvidersStatus(Providersid, objProviders);
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
