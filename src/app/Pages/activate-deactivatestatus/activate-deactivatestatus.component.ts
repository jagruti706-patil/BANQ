import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import {
  GridDataResult,
  PageChangeEvent,
  SelectableSettings
} from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { Client } from "src/app/Model/client";
import { Subclient } from "src/app/Model/subclient";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { Clientstatus } from "src/app/Model/clientstatus";
import { Subclientstatus } from "src/app/Model/subclientstatus";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../node_modules/subsink";

@Component({
  selector: "app-activate-deactivatestatus",
  templateUrl: "./activate-deactivatestatus.component.html",
  styleUrls: ["./activate-deactivatestatus.component.css"]
})
export class ActivateDeactivatestatusComponent implements OnInit {
  private clsUtility: Utility;

  public ActivateDeactivateSubclientsgridData: {};
  public ActivateDeactivateSubclientsgridView: GridDataResult;
  private ActivateDeactivateSubclientsitems: any[] = [];
  public ActivateDeactivateSubclientsskip = 0;
  public ActivateDeactivateSubclientspageSize = 10;

  public sAllClients: Client[];
  public sSubClients: Subclient[];
  public nSelectedClientID: string = "0";

  public checkboxOnly = false;
  public mode = "multiple";
  public mySelection: string[] = [];
  public selectableSettings: SelectableSettings;
  public CurrentClient: Clientstatus;
  public AllSubClient: Array<Subclientstatus> = [];
  public CurrentSubClient: Subclientstatus;
  public rdStatus: string = "Activate";
  public SubclientFTPDetails: string;
  public ClientStatus: number = 0;
  private subscription = new SubSink();

  public sortSubclients: SortDescriptor[] = [
    {
      field: "subclientcode",
      dir: "desc"
    }
  ];

  constructor(
    private fb: FormBuilder,
    private coreService: CoreoperationsService,
    private toastr: ToastrService
  ) {
    this.clsUtility = new Utility(toastr);
  }

  ClientGroup = this.fb.group({
    fcClientName: ["", Validators.required],
    fcStatus: ["Activate", Validators.required]
  });

  CommentGroup = this.fb.group({
    fcComment: ["", Validators.required]
  });

  get ClientName() {
    return this.ClientGroup.get("fcClientName");
  }

  get Status() {
    return this.ClientGroup.get("fcStatus");
  }

  get Comment() {
    return this.CommentGroup.get("fcComment");
  }

  ngOnInit() {
    try {
      this.ClientStatus = 0;
      this.RetriveAllClient(this.ClientStatus);
      this.setSelectableSettings();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllClient(nClientStatus) {
    try {
      this.subscription.add(
        this.coreService.getClientList(nClientStatus).subscribe(
          data => {
            if (data != null && data != undefined) {
              this.sAllClients = data;
              const Allclt = new Client();
              Allclt.clientid = "0";
              Allclt.clientcode = "";
              Allclt.clientname = "Select";
              this.sAllClients.push(Allclt);
              this.nSelectedClientID = "0";
              this.RetriveSubClient();
              this.ngOnDestroy();
              this.SubclientFTPDetails = "";
            } else {
              this.nSelectedClientID = "0";
              this.SubclientFTPDetails = "";
            }
          },
          err => {}
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  RetriveSubClient() {
    try {
      this.subscription.add(
        this.coreService
          .getSubClientDetailbyClientId(this.nSelectedClientID)
          .subscribe(
            data => {
              if (data != null && data != undefined) {
                this.sSubClients = data;
                this.ActivateDeactivateSubclientsgridData = data;
                this.ActivateDeactivateSubclientsitems = data;
                this.loadItemsSubClients();
                this.ngOnDestroy();
              }
            },
            err => {}
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onClientChange(event: any) {
    try {
      this.nSelectedClientID = event;
      this.mySelection = [];
      this.RetriveSubClient();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsSubClients(): void {
    try {
      this.ActivateDeactivateSubclientsgridView = {
        data: orderBy(
          this.ActivateDeactivateSubclientsitems.slice(
            this.ActivateDeactivateSubclientsskip,
            this.ActivateDeactivateSubclientsskip +
              this.ActivateDeactivateSubclientspageSize
          ),
          this.sortSubclients
        ),
        total: this.ActivateDeactivateSubclientsitems.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeSubClients(event: PageChangeEvent): void {
    try {
      this.ActivateDeactivateSubclientsskip = event.skip;
      this.loadItemsSubClients();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortSubClientsChange(sort: SortDescriptor[]): void {
    try {
      this.sortSubclients = sort;
      this.loadItemsSubClients();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public setSelectableSettings(): void {
    try {
      this.selectableSettings = {
        checkboxOnly: this.checkboxOnly
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ValidateCommentGroup() {
    try {
      if (this.Comment.valid) return true;
      else {
        alert("Comment is required");
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onActivate(status: string) {
    try {
      if (this.nSelectedClientID != "0") {
        if (this.ValidateCommentGroup()) {
          this.CurrentClient = new Clientstatus();
          this.AllSubClient = new Array<Subclientstatus>();

          if (
            this.sAllClients.find(x => x.clientid == this.nSelectedClientID)
          ) {
            const clientindex: number = this.sAllClients.findIndex(
              x => x.clientid == this.nSelectedClientID
            );
            this.CurrentClient.clientcode = this.sAllClients[
              clientindex
            ].clientcode;
            if (status == "Activate") this.CurrentClient.clientstatus = "true";
            else this.CurrentClient.clientstatus = "false";
          }

          for (let i = 0; i < this.mySelection.length; i++) {
            if (
              this.sSubClients.find(x => x.subclientcode == this.mySelection[i])
            ) {
              const subclientindex: number = this.sSubClients.findIndex(
                x => x.subclientcode == this.mySelection[i]
              );
              this.CurrentSubClient = new Subclientstatus();
              this.CurrentSubClient.subclientcode = this.sSubClients[
                subclientindex
              ].subclientcode;
              if (status == "Activate")
                this.CurrentSubClient.subclientstatus = "true";
              else this.CurrentSubClient.subclientstatus = "false";
              this.AllSubClient.push(this.CurrentSubClient);
            }
          }

          for (let i = 0; i < this.sSubClients.length; i++) {
            if (
              !this.AllSubClient.find(
                x => x.subclientcode == this.sSubClients[i].subclientcode
              )
            ) {
              this.CurrentSubClient = new Subclientstatus();
              this.CurrentSubClient.subclientcode = this.sSubClients[
                i
              ].subclientcode;
              this.CurrentSubClient.subclientstatus = String(
                this.sSubClients[i].subclientstatus
              );
              this.AllSubClient.push(this.CurrentSubClient);
            }
          }

          if (this.AllSubClient.length > 0) {
            this.CurrentClient.subclients = this.AllSubClient;
          }
          this.SubclientsFTPDetails();
          this.UpdateStatus();
        }
      } else {
        alert("Select Client");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  UpdateStatus() {
    try {
      this.subscription.add(
        this.coreService
          .updateClientStatus(this.nSelectedClientID, this.CurrentClient)
          .subscribe(
            (data: {}) => {
              if (data != null && data != undefined) {
                this.RetriveSubClient();
              }
            },
            err => {}
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnStatusChange() {
    try {
      if (this.Status.value == "Activate") {
        this.rdStatus = "Activate";
      } else {
        this.rdStatus = "Deactivate";
      }
      this.RetriveAllClient(this.ClientStatus);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      // Reset the controls
      this.CommentGroup.reset();
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  SubclientsFTPDetails() {
    try {
      this.SubclientFTPDetails = "";
      for (let i = 0; i < this.mySelection.length; i++) {
        if (
          this.sSubClients.find(x => x.subclientcode == this.mySelection[i])
        ) {
          const index = this.sSubClients.findIndex(
            x => x.subclientcode == this.mySelection[i]
          );
          this.SubclientFTPDetails =
            this.SubclientFTPDetails +
            "Verifying FTP Details for " +
            this.sSubClients[index].subclientname +
            "\n";
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
