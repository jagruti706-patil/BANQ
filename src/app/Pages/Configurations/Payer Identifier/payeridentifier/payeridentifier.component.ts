import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { Utility } from "src/app/Model/utility";
import {
  GridDataResult,
  DataStateChangeEvent,
  PageChangeEvent
} from "@progress/kendo-angular-grid";
import { State, SortDescriptor, process } from "@progress/kendo-data-query";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { ToastrService } from "ngx-toastr";
import { Api } from "src/app/Services/api";
import { AddpayeridentifierComponent } from "../addpayeridentifier/addpayeridentifier.component";
import { isNullOrUndefined } from "util";
import { Payeridentifier } from "src/app/Model/Configuration/payeridentifier";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { clsPermission } from "src/app/Services/settings/clspermission";
import { SubSink } from "subsink";
declare var $: any;

@Component({
  selector: "app-payeridentifier",
  templateUrl: "./payeridentifier.component.html",
  styleUrls: ["./payeridentifier.component.css"]
})
export class PayeridentifierComponent implements OnInit, OnDestroy {
  private clsUtility: Utility;
  toggleme: any;
  public PayerIdentifierLoading: boolean = false;
  public PayerIdentifierGridView: GridDataResult;
  public PayerIdentifierList: any;
  private PayerIdentifieritems: any[] = [];
  public PayerIdentifiergridData: {};

  public editPayeridentifierid: string = "";
  private deletePayeridentifierid: string = "";
  private deleteProvidersubclient: string = "";
  private deleteProvidernpi: string = "";
  private deleteProvidersubclientcode: string = "";
  public EditPayeridentifierid: string = "";

  private updateStatusPayeridentifierId: any;
  public updatePayeridentifierMessage: string;
  private updatePayeridentifierStatus: boolean;
  private deletepayeridentifiername: string = "";
  private payerid: string;

  public InputEditMessage: string;
  public OutEditResult: boolean;
  public InputDeleteMessage: string;
  public OutDeleteResult: boolean;
  //private subscription = new SubSink();
  public clsPermission: clsPermission;
  private subscription = new SubSink();

  loadingPayeridentifierGrid = true;

  @ViewChild("AddPayeridentifierChild")
  private AddPayeridentifierChild: AddpayeridentifierComponent;

  public state: State = {
    skip: 0,
    take: 50
  };

  public PayerIdentifierSort: SortDescriptor[] = [
    {
      field: "subclientname",
      dir: "asc"
    }
  ];

  constructor(
    private allConfigService: AllConfigurationService,
    private toaster: ToastrService,
    public api: Api,
    private dataService: DatatransaferService
  ) {
    this.clsUtility = new Utility(toaster);
  }

  togglesidebar() {
    try {
      this.allConfigService.toggleSidebar.next(!this.toggleme);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.dataService.newpermission.subscribe(
          value => (this.clsPermission = value)
        )
      );
      this.allConfigService.toggleSidebar.subscribe(isToggle => {
        this.toggleme = isToggle;
      });
      this.GetPayerIdentifierList();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  GetPayerIdentifierList() {
    try {
      this.PayerIdentifierGridView = null;
      this.PayerIdentifierList = [];
      this.loadingPayeridentifierGrid = true;
      let payeridentifierinput: {
        sid: string;
      } = {
        sid: ""
      };
      let seq = this.api.post_base("PayerIdentifier", payeridentifierinput);
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              let sdata = data;
              if (!isNullOrUndefined(data) && data != []) {
                this.PayerIdentifiergridData = sdata;
                this.PayerIdentifieritems = <any>sdata;
                this.PayerIdentifierList = <any>sdata;
                if (
                  !isNullOrUndefined(this.PayerIdentifierList) &&
                  this.PayerIdentifierList != []
                ) {
                  this.PayerIdentifierLoadItems();
                } else {
                  this.PayerIdentifieritems = [];
                  this.PayerIdentifierList = [];
                  this.PayerIdentifierLoadItems();
                }

                this.loadingPayeridentifierGrid = false;
                this.api.insertActivityLog(
                  "PLB Config List Viewed",
                  "PLB Config",
                  "READ"
                );
              } else {
                this.PayerIdentifierGridView = null;
                this.PayerIdentifiergridData = [];
                this.PayerIdentifieritems = [];
                this.PayerIdentifierList = [];
                this.loadingPayeridentifierGrid = false;
              }
            }
          },
          error => {
            this.loadingPayeridentifierGrid = false;
            this.clsUtility.LogError(error);
          }
        )
      );
    } catch (error) {
      this.loadingPayeridentifierGrid = false;
      this.clsUtility.LogError(error);
    }
  }

  public PayerIdentifierLoadItems(): void {
    try {
      if (
        this.PayerIdentifierList != null &&
        this.PayerIdentifierList != undefined
      ) {
        if (this.PayerIdentifierList.length > 0) {
          this.PayerIdentifierGridView = process(
            this.PayerIdentifierList,
            this.state
          );
        } else {
          this.PayerIdentifierList = [];
          this.PayerIdentifierGridView = process(
            this.PayerIdentifierList,
            this.state
          );
        }
      } else {
        this.PayerIdentifierList = [];
        this.PayerIdentifierGridView = process(
          this.PayerIdentifierList,
          this.state
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public PayerIdentifierDataStateChange(state: DataStateChangeEvent): void {
    try {
      if (
        this.PayerIdentifierList != null &&
        this.PayerIdentifierList != undefined
      ) {
        if (this.PayerIdentifierList.length > 0) {
          this.state = state;
          if (state.filter != undefined && state.filter != null) {
            state.filter.filters.forEach(f => {
              if (
                f["field"] == "payerid" ||
                f["field"] == "payername" ||
                f["field"] == "separator" ||
                f["field"] == "adjustmentreasoncode" ||
                f["field"] == "identifier_1" ||
                f["field"] == "identifier_2" ||
                f["field"] == "identifier_3" ||
                f["field"] == "identifier_4" ||
                f["field"] == "identifier_5"
              ) {
                if (f["value"] != null) {
                  f["value"] = f["value"].trim();
                }
              }
            });
          }
          this.PayerIdentifierLoadItems();
        }
      } else {
        this.PayerIdentifierList = [];
        this.PayerIdentifierLoadItems();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  PayerIdentifierPageChange(event: PageChangeEvent): void {
    try {
      this.state.skip = event.skip;
      this.PayerIdentifierLoadItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  EditPayerIdentifier({ sender, rowIndex, dataItem }) {
    try {
      this.editPayeridentifierid = dataItem.id;
      this.InputEditMessage = "Do you want to edit plb config?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  DeletePayerIdentifier({ sender, rowIndex, dataItem }) {
    try {
      this.deletePayeridentifierid = dataItem.id;
      this.deletepayeridentifiername = dataItem.payername;

      this.InputDeleteMessage = "Do you want to delete plb config?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  deleteProvidermapping() {
    try {
      let payeridentifierinput: {
        id: string;
      } = {
        id: this.deletePayeridentifierid
      };

      let seq = this.api.post_base(
        "PayerIdentifier/Delete",
        payeridentifierinput
      );
      this.subscription.add(
        seq.subscribe(
          data => {
            if (data != null || data != undefined) {
              if (data == 1) {
                this.clsUtility.showSuccess("PLB Config deleted successfully.");

                this.api.insertActivityLog(
                  "Deleted PLB Config for payerid : " +
                    this.deletePayeridentifierid +
                    " ,Payer name : " +
                    this.deletepayeridentifiername,
                  "PLB Config",
                  "DELETE"
                );

                this.GetPayerIdentifierList();
              }
              if (data == 0) {
                this.clsUtility.showError("Error while deleting plb config.");
              }
            }
          },
          err => {
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  AddPayeridentifier() {
    try {
      this.editPayeridentifierid = "";
      this.EditPayeridentifierid = "";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputEditResult($event) {
    try {
      this.OutEditResult = $event;
      if (this.OutEditResult == true) {
        this.EditPayeridentifierid = this.editPayeridentifierid;
        $("#addpayeridentifierModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputDeleteResult($event) {
    try {
      this.OutDeleteResult = $event;
      if (this.OutDeleteResult == true) {
        this.deleteProvidermapping();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputPayeridentifierEditResult($event) {
    try {
      // this.Providermappingid = "";
      this.GetPayerIdentifierList();
      let IsSaved = $event;
      if (IsSaved == true) {
        this.AddPayeridentifierChild.ResetComponents();
        this.editPayeridentifierid = null;
        this.EditPayeridentifierid = null;
        $("#addpayeridentifierModal").modal("hide");
      } else {
        this.AddPayeridentifierChild.ResetComponents();
        this.editPayeridentifierid = null;
        this.EditPayeridentifierid = null;
        $("#addpayeridentifierModal").modal("hide");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnPayeridentifierStatus(Payeridentifierid, PayeridentifierStatus) {
    try {
      let objPayeridentifier: Payeridentifier;
      objPayeridentifier = new Payeridentifier();
      objPayeridentifier.id = Payeridentifierid;
      objPayeridentifier.status = PayeridentifierStatus;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  updateStatusConfirmation(dataItem: any) {
    try {
      this.updateStatusPayeridentifierId = dataItem.id;
      this.deletePayeridentifierid = dataItem.id;
      this.deletepayeridentifiername = dataItem.payername;
      this.payerid = dataItem.payerid;
      let status: boolean;

      if (dataItem.status.toString().toLowerCase() == "false") {
        status = false;
      } else if (dataItem.status.toString().toLowerCase() == "true") {
        status = true;
      }

      if (status) {
        this.updatePayeridentifierMessage =
          "Do you want to deactivate plb config for payerid : " +
          this.payerid +
          " ,name : " +
          this.deletepayeridentifiername;
        "?";
        this.updatePayeridentifierStatus = false;
      } else {
        this.updatePayeridentifierMessage =
          "Do you want to activate plb config for payerid : " +
          this.payerid +
          "?";
        " ,name : " + this.deletepayeridentifiername;
        this.updatePayeridentifierStatus = true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  updateStatusPayeridentifier() {
    try {
      let obj: { id: string; status: boolean } = {
        id: this.updateStatusPayeridentifierId,
        status: this.updatePayeridentifierStatus
      };
      let seq1 = this.api.post_base("PayerIdentifier/UpdateStatus", obj);
      this.subscription.add(
        seq1.subscribe(
          data => {
            if (data != null || data != undefined) {
              if (data == 1) {
                this.clsUtility.showSuccess(
                  "PLB Config status updated successfully"
                );
                this.api.insertActivityLog(
                  "PLB Config (Id : " +
                    this.deletePayeridentifierid +
                    " ,Payer name : " +
                    this.deletepayeridentifiername +
                    ") " +
                    (this.updatePayeridentifierStatus == true
                      ? "Activated"
                      : "Deactivated") +
                    "",
                  "PLB Config",
                  this.updatePayeridentifierStatus == true
                    ? "ACTIVATE"
                    : "DEACTIVATE"
                );
                this.GetPayerIdentifierList();
              } else {
                this.clsUtility.showError("Error while updating status");
              }
            }
          },
          error => {
            this.clsUtility.LogError(error);
          }
        )
      );
    } catch (err) {
      this.clsUtility.LogError(err);
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
