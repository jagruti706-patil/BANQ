import {
  Component,
  OnInit,
  Input,
  Output,
  OnChanges,
  OnDestroy
} from "@angular/core";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { Client } from "src/app/Model/client";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import {
  SelectableSettings,
  GridDataResult,
  PageChangeEvent
} from "@progress/kendo-angular-grid";
import { Subclientstatus } from "src/app/Model/subclientstatus";
import { Clientstatus } from "src/app/Model/clientstatus";
import { Utility } from "src/app/Model/utility";
import { isNullOrUndefined } from "util";
import { EventEmitter } from "@angular/core";
import { orderBy, SortDescriptor } from "@progress/kendo-data-query";
import { Ftpmaster } from "src/app/Model/ftpmaster";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../node_modules/subsink";

@Component({
  selector: "app-clientstatus",
  templateUrl: "./clientstatus.component.html",
  styleUrls: ["./clientstatus.component.css"]
})
export class ClientstatusComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private coreService: CoreoperationsService,
    private toastr: ToastrService
  ) {
    this.clsUtility = new Utility(toastr);
    this.clsClient = new Client();
    this.CurrentClient = new Clientstatus();
    this.setSelectableSettings();
    this.UpdatedSubClientStatus = new Subclientstatus();
  }

  @Input() SelectedClientID: string;
  @Output() outClientStatus = new EventEmitter<string>();

  private clsUtility: Utility;
  private subscription = new SubSink();

  public clsClient: Client;
  private SelectedClient: any;
  public checkboxOnly = true;
  private selectableSettings: SelectableSettings;

  public SubClientgridData: {};
  public SubClientgridView: GridDataResult;
  private SubClientitems: any[] = [];
  public SubClientskip = 0;
  public SubClientpageSize = 10;
  SelectedSubClient: any;

  public SubClientsort: SortDescriptor[] = [
    {
      field: "subclientcode",
      dir: "desc"
    }
  ];

  public InboundFtpgridData: {};
  public InboundFtpgridView: GridDataResult;
  private InboundFtpitems: any[] = [];
  public InboundFtpskip = 0;
  public InboundFtppageSize = 10;
  public SelectedInboundFtp: any;

  public InboundFtpsort: SortDescriptor[] = [
    {
      field: "ftpcode",
      dir: "desc"
    }
  ];

  public allSubClientStatus: Array<Subclientstatus> = [];
  public allInboundFtpStatus: Array<Ftpmaster> = [];
  public UpdatedSubClientStatus: Subclientstatus;
  public UpdatedInboundFtpStatus: Ftpmaster;
  private CurrentClient: Clientstatus;
  public subClientCount = 0;
  public InboundFtpCount = 0;

  loadingStatus = true;

  public form = new FormGroup({
    fcClientStatus: new FormControl(null, Validators.required)
  });

  OutputClient(data: any) {
    try {
      this.outClientStatus.emit(data);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  get ClientStatus() {
    try {
      return this.form.get("fcClientStatus");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnInit() {
    try {
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      this.loadingStatus = true;
      this.getClientInformation();
      this.RetriveAllSubClient();
      this.RetriveAllInboundFTP();
    } catch (error) {
      this.loadingStatus = true;
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllInboundFTP() {
    try {
      this.subscription.add(
        this.coreService
          .getInboundFtpDetailbyClientId(this.SelectedClientID)
          .subscribe(
            data => {
              this.InboundFtpgridData = data;
              this.InboundFtpitems = data;
              this.loadInboundFtpitems();
              this.loadingStatus = false;
              this.SelectedInboundFtp = data;
              if (!isNullOrUndefined(this.SelectedInboundFtp)) {
                this.InboundFtpCount = this.SelectedInboundFtp.length;
              }
              this.FillInboundFtp();
            },
            err => {
              this.loadingStatus = false;
            }
          )
      );
    } catch (error) {
      this.loadingStatus = true;
      this.clsUtility.LogError(error);
    }
  }

  RetriveAllSubClient() {
    try {
      this.subscription.add(
        this.coreService
          .getSubClientDetailbyClientId(this.SelectedClientID)
          .subscribe(
            data => {
              this.SubClientgridData = data;
              this.SubClientitems = data;
              this.loadItemsSubclient();
              this.SelectedSubClient = data;
              if (!isNullOrUndefined(this.SelectedSubClient)) {
                this.subClientCount = this.SelectedSubClient.length;
              }
              this.FillSubClients();
              this.loadingStatus = false;
            },
            err => {
              this.loadingStatus = false;
            }
          )
      );
    } catch (error) {
      this.loadingStatus = true;
      this.clsUtility.LogError(error);
    }
  }

  getClientInformation() {
    try {
      this.subscription.add(
        this.coreService.getClientDetailbyId(this.SelectedClientID).subscribe(
          (data: {}) => {
            this.SelectedClient = data;
            this.clsClient.clientcode = this.SelectedClient.clientjson.clientcode;
            this.clsClient.clientname = this.SelectedClient.clientjson.clientname;
            this.clsClient.clientcontactname = this.SelectedClient.clientjson.clientcontactname;
            this.clsClient.clientcontactemail = this.SelectedClient.clientjson.clientcontactemail;
            this.clsClient.clientcontactphone = this.SelectedClient.clientjson.clientcontactphone;
            this.clsClient.clientstatus = this.SelectedClient.clientjson.clientstatus;
            this.ClientStatus.setValue(this.clsClient.clientstatus);
            this.loadingStatus = false;
          },
          err => {
            this.loadingStatus = false;
          }
        )
      );
    } catch (error) {
      this.loadingStatus = true;
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

  onInboundFTPSwitchChange(code, event) {
    try {
      if (this.UpdatedInboundFtpStatus != null) {
        this.UpdatedInboundFtpStatus = null;
        this.UpdatedInboundFtpStatus = new Ftpmaster();
      }
      this.UpdatedInboundFtpStatus.ftpcode = code;
      this.UpdatedInboundFtpStatus.status = event.target.checked;
      if (
        this.allInboundFtpStatus.find(
          x => x.ftpcode === this.UpdatedInboundFtpStatus.ftpcode
        )
      ) {
        const index: number = this.allInboundFtpStatus.findIndex(
          x => x.ftpcode === this.UpdatedInboundFtpStatus.ftpcode
        );
        this.allInboundFtpStatus.splice(index, 1);
        this.allInboundFtpStatus.push(this.UpdatedInboundFtpStatus);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSwitchChange(code, event) {
    try {
      if (this.UpdatedSubClientStatus != null) {
        this.UpdatedSubClientStatus = null;
        this.UpdatedSubClientStatus = new Subclientstatus();
      }
      this.UpdatedSubClientStatus.subclientcode = code;
      // active/Deactivate screen: active Sub-client status is display as a Inactive High bug #48
      this.UpdatedSubClientStatus.subclientstatus = event.target.checked;

      if (
        this.allSubClientStatus.find(
          x => x.subclientcode === this.UpdatedSubClientStatus.subclientcode
        )
      ) {
        const index: number = this.allSubClientStatus.findIndex(
          x => x.subclientcode === this.UpdatedSubClientStatus.subclientcode
        );
        this.allSubClientStatus.splice(index, 1);
        this.allSubClientStatus.push(this.UpdatedSubClientStatus);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FillInboundFtp() {
    try {
      for (const selectedftp of this.SelectedInboundFtp) {
        this.UpdatedInboundFtpStatus = null;
        this.UpdatedInboundFtpStatus = new Ftpmaster();
        this.UpdatedInboundFtpStatus.ftpcode = selectedftp.ftpcode;
        this.UpdatedInboundFtpStatus.status = selectedftp.status;

        if (this.allInboundFtpStatus.length === 0) {
          this.allInboundFtpStatus.push(this.UpdatedInboundFtpStatus);
        } else {
          if (
            this.allInboundFtpStatus.find(
              x => x.ftpcode === this.UpdatedInboundFtpStatus.ftpcode
            )
          ) {
            const index: number = this.allInboundFtpStatus.findIndex(
              x => x.ftpcode === this.UpdatedInboundFtpStatus.ftpcode
            );
            this.allInboundFtpStatus.splice(index, 1);
            this.allInboundFtpStatus.push(this.UpdatedInboundFtpStatus);
          } else {
            this.allInboundFtpStatus.push(this.UpdatedInboundFtpStatus);
          }
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FillSubClients() {
    try {
      for (const selectedClient of this.SelectedSubClient) {
        this.UpdatedSubClientStatus = null;
        this.UpdatedSubClientStatus = new Subclientstatus();
        this.UpdatedSubClientStatus.subclientcode =
          selectedClient.subclientcode;
        this.UpdatedSubClientStatus.subclientstatus =
          selectedClient.subclientstatus;

        if (this.allSubClientStatus.length === 0) {
          this.allSubClientStatus.push(this.UpdatedSubClientStatus);
        } else {
          if (
            this.allSubClientStatus.find(
              x => x.subclientcode === this.UpdatedSubClientStatus.subclientcode
            )
          ) {
            const index: number = this.allSubClientStatus.findIndex(
              x => x.subclientcode === this.UpdatedSubClientStatus.subclientcode
            );
            this.allSubClientStatus.splice(index, 1);
            this.allSubClientStatus.push(this.UpdatedSubClientStatus);
          } else {
            this.allSubClientStatus.push(this.UpdatedSubClientStatus);
          }
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSaveStatus() {
    try {
      this.CurrentClient.clientcode = this.clsClient.clientcode;
      this.CurrentClient.clientstatus = this.ClientStatus.value;
      this.CurrentClient.InboundFtp = this.allInboundFtpStatus;
      if (
        !isNullOrUndefined(this.allSubClientStatus) &&
        this.allSubClientStatus.length > 0
      ) {
        this.CurrentClient.subclients = this.allSubClientStatus;
      }

      this.coreService
        .updateClientStatus(this.SelectedClientID, this.CurrentClient)
        .subscribe((data: {}) => {
          this.OutputClient(data);
        });
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeSubclient(event: PageChangeEvent): void {
    try {
      this.SubClientskip = event.skip;
      this.loadItemsSubclient();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadItemsSubclient(): void {
    try {
      this.SubClientgridView = {
        data: orderBy(
          this.SubClientitems.slice(
            this.SubClientskip,
            this.SubClientskip + this.SubClientpageSize
          ),
          this.SubClientsort
        ),
        total: this.SubClientitems.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortsubClientChange(sort: SortDescriptor[]): void {
    try {
      this.SubClientsort = sort;
      this.loadItemsSubclient();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadInboundFtpitems(): void {
    try {
      this.InboundFtpgridView = {
        data: orderBy(
          this.InboundFtpitems.slice(
            this.InboundFtpskip,
            this.InboundFtpskip + this.InboundFtppageSize
          ),
          this.InboundFtpsort
        ),
        total: this.InboundFtpitems.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortInboundFtpChange(sort: SortDescriptor[]): void {
    try {
      if (this.InboundFtpitems != null) {
        this.InboundFtpsort = sort;
        this.loadInboundFtpitems();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChangeInboundFtp(event: PageChangeEvent): void {
    try {
      this.InboundFtpskip = event.skip;
      this.loadInboundFtpitems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public ResetComponents() {
    try {
      this.OutputClient(false);
      this.SelectedClientID = null;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.SelectedClientID = null;
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
