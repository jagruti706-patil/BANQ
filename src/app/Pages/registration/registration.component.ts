import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { MovingDirection } from "angular-archwizard";
import { MasterdataService } from "src/app/Services/masterdata.service";
import { Servicetype } from "src/app/Model/servicetype";
import { Subclient } from "src/app/Model/subclient";
import { Ftpmaster } from "src/app/Model/ftpmaster";
import { Client } from "src/app/Model/client";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { Utility } from "src/app/Model/utility";
import { GridDataResult, PageChangeEvent } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { SubclientregistrationComponent } from "src/app/Pages/subclientregistration/subclientregistration.component";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { log } from "util";
import { FtpmasterComponent } from "src/app/Pages/ftpmaster/ftpmaster.component";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../node_modules/subsink";

declare var $: any;
@Component({
  selector: "app-registration",
  templateUrl: "./registration.component.html",
  styleUrls: ["./registration.component.css"]
})
export class RegistrationComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private masterData: MasterdataService,
    private coreService: CoreoperationsService,
    private activatedroute: ActivatedRoute,
    private dataService: DatatransaferService,
    private route: Router,
    private toastr: ToastrService
  ) {
    if (
      this.dataService.EditClientid != null &&
      this.dataService != undefined &&
      this.dataService.EditClientid != "0"
    ) {
      this.getClientDetailbyId(this.dataService.EditClientid);
    } else {
      this.newclient = true;
    }

    // if (this.activatedroute.snapshot.params.id) {
    //   this.getClientDetailbyId(this.activatedroute.snapshot.params.id);
    // } else {
    //   this.newclient = true;
    // }
    this.clsUtility = new Utility(toastr);
    this.clsServiceType = new Servicetype();
    this.clsClientObject = new Client();
    this.outSubClient = new Subclient();
    this.OutFTP = new Ftpmaster();
    this.allsubclientDetails = new Array<Subclient>();
    this.allFtpDetails = new Array<Ftpmaster>();
  }

  @ViewChild("AddSubClientChild")
  private AddSubClientChild: SubclientregistrationComponent;
  @ViewChild("AddFTPChild") private AddFTPChild: FtpmasterComponent;

  private clsUtility: Utility;
  private subscription = new SubSink();

  private newclient = false;
  private clientdetail: any = [];
  public clsClientObject: Client;

  private ClientFTPgridData = [];
  public ClientFtpgridView: GridDataResult;
  private ClientFtpitems: any[] = [];
  public ClientFtppageSize = 10;
  public ClientFtpskip = 0;

  private SubClientgridData = [];
  public SubClientgridView: GridDataResult;
  private Subclientitems: any[] = [];
  public SubClientpageSize = 10;
  public SubClientskip = 0;

  public editftpcode: any;
  public deleteftpcode: any;

  public editSubclientcode: any;
  public deleteSubclientcode: any;

  public mask: string = "(999) 000-0000";
  public IsERAHUBSelected = false;
  public arrServiceTypes: {};

  private clsServiceType: Servicetype;
  private serviceTypeObject: Array<Servicetype> = [];
  private SelectedserviceTypes: Array<Servicetype> = [];
  sAllSplitparametervalues: Array<{
    subclientcode: string;
    splitparametervalue: string;
  }>;

  // Receive Output from SubClient Component
  outSubClient: Subclient;
  // Receive Output from FTP Component
  OutFTP: Ftpmaster;

  OutclientFTPDetail: Ftpmaster;
  OutsubclientDetail: Subclient;

  allFtpDetails: Array<Ftpmaster>;
  allsubclientDetails: Array<Subclient>;

  OutSubClientCount = "0";
  OutClientFTPCount = "0";

  private ClientFTPNewarr: Ftpmaster[];
  private SubClientFTPNewarr: Subclient[];

  public SubClientInputEditMessage: string;
  public SubClientOutEditResult: boolean;
  public SubClientInputDeleteMessage: string;
  public SubClientOutDeleteResult: boolean;

  public ClientFtpInputEditMessage: string;
  public ClientFtpOutEditResult: boolean;
  public ClientFtpInputDeleteMessage: string;
  public ClientFtpOutDeleteResult: boolean;

  public hiddenColumns: string[] = [];

  // for showing loding image
  loadingClientDetails = true;

  public Subclientsort: SortDescriptor[] = [
    {
      field: "subclientcode",
      dir: "asc"
    }
  ];

  public ClientFtpsort: SortDescriptor[] = [
    {
      field: "ftpid",
      dir: "asc"
    }
  ];

  get clientCode() {
    return this.ClientContactGroup.get("fcClientCode");
  }
  get clientName() {
    return this.ClientContactGroup.get("fcClientName");
  }
  get contactName() {
    return this.ClientContactGroup.get("fcContactName");
  }
  get contactEmail() {
    return this.ClientContactGroup.get("fcContactEmail");
  }
  get contactPhone() {
    return this.ClientContactGroup.get("fcContactPhone");
  }
  get ClientStatus() {
    return this.ClientContactGroup.get("fcClientStatus");
  }
  get serviceTypeValue() {
    return this.ClientServiceGroup.get("fcServiceTypeValue");
  }
  // get client835FtpFolder() {
  //   return this.ClientFTPGroup.get('fcClient835Ftpfolder');
  // }
  // get client837FtpFolder() {
  //   return this.ClientFTPGroup.get('fcClient837Ftpfolder');
  // }
  // get SubclientSearch() {
  //   return this.SubclientSearchGroup.get('fcSubclientSearch');
  // }
  // ClientContactGroup = this.fb.group({
  //   fcClientCode: ['THG1', Validators.required],
  //   fcClientName: ['Millenium Health Practice', Validators.required],
  //   fcContactName: ['Ronald J. Martinez', Validators.required],
  //   fcContactEmail: ['RonaldJMartinez@dayrep.com', [Validators.required, Validators.email]],
  //   fcContactPhone: ['9095533820', [Validators.required, Validators.pattern('^[0-9]*$')]],
  //   fcClientStatus: [false, Validators.required]
  // });
  // ClientServiceGroup = this.fb.group({
  //   fcServiceTypeValue: ['', Validators.required]
  // });
  // ClientFTPGroup = this.fb.group({
  //   fcClient835Ftpfolder: ['/remits/In/835Folder', Validators.required],
  //   fcClient837Ftpfolder: ['/remits/In/837Folder', Validators.required]
  // });
  ClientContactGroup = this.fb.group({
    fcClientCode: ["", Validators.required],
    fcClientName: ["", [Validators.required, Validators.maxLength(100)]],
    fcContactName: ["", [Validators.required, Validators.maxLength(100)]],
    fcContactEmail: [
      "",
      [Validators.required, Validators.email, Validators.maxLength(50)]
    ],
    fcContactPhone: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
    fcClientStatus: [false, Validators.required]
  });
  ClientServiceGroup = this.fb.group({
    fcServiceTypeValue: ["", Validators.required]
  });
  // ClientFTPGroup = this.fb.group({
  //   fcClient835Ftpfolder: ['', [Validators.required, Validators.maxLength(150)]],
  //   fcClient837Ftpfolder: ['', [Validators.required, Validators.maxLength(150)]]
  // });
  // SubclientSearchGroup = this.fb.group({
  //   fcSubclientSearch: [''],
  // });

  OutputfromFTP($event) {
    try {
      if (this.ClientFTPNewarr != null || this.ClientFTPNewarr != undefined) {
        this.allFtpDetails = this.ClientFTPNewarr;
      }
      if (JSON.stringify($event) != "false") {
        this.OutFTP = $event;
        this.AddFTPDetails();
      }
      this.AddFTPChild.ResetComponents();
      this.OutclientFTPDetail = null;
      this.OutClientFTPCount = null;
      $("#addftpModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputSubClient($event) {
    try {
      if (
        this.SubClientFTPNewarr != null ||
        this.SubClientFTPNewarr != undefined
      ) {
        this.allsubclientDetails = this.SubClientFTPNewarr;
      }
      if (JSON.stringify($event) != "false") {
        this.outSubClient = $event;
        this.AddSubClientDetails();
      }
      this.AddSubClientChild.ResetComponents();
      this.OutsubclientDetail = null;
      this.OutSubClientCount = null;
      $("#exampleSubClientModal").modal("hide");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnInit() {
    try {
      this.loadingClientDetails = true;
      this.FetchServiceType();
      if (this.newclient) {
        this.FetchClientID();
      }
      this.hideColumn("subclientid");
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public isHidden(columnName: string): boolean {
    try {
      return this.hiddenColumns.indexOf(columnName) > -1;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public hideColumn(columnName: string): void {
    try {
      const hiddenColumns = this.hiddenColumns;
      hiddenColumns.push(columnName);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FetchClientID() {
    try {
      this.subscription.add(
        this.masterData.getClientID().subscribe(
          data => {
            this.SetClientID(data);
            this.loadingClientDetails = false;
          },
          err => {
            this.loadingClientDetails = false;
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  SetClientID(data: number): any {
    try {
      if (data == null) {
        this.clientCode.setValue("THG" + 1);
      } else {
        this.clientCode.setValue("THG" + data);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  moveDirection = (validitystatus, direction) => {
    try {
      if (validitystatus === false) {
        alert("Please fill the form information");
      }
      if (
        direction === MovingDirection.Forwards ||
        direction === MovingDirection.Backwards
      ) {
        return validitystatus;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  };

  moveDirectionService = (validitystatus, direction) => {
    try {
      if (this.newclient) {
        if (validitystatus === false) {
          alert("Please fill the form information");
        }
        if (
          direction === MovingDirection.Forwards ||
          direction === MovingDirection.Backwards
        ) {
          return validitystatus;
        }
      } else {
        //// need to verify
        return true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  };

  moveDirectionFTPInbound = (validitystatus, direction) => {
    try {
      if (validitystatus === false) {
        alert("Please fill the form information");
      }
      if (
        direction === MovingDirection.Forwards ||
        direction === MovingDirection.Backwards
      ) {
        return validitystatus;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  };

  moveDirectionSubClient = (validitystatus, direction) => {
    try {
      if (validitystatus === false) {
        alert("Please fill the form information");
      }
      if (
        direction === MovingDirection.Forwards ||
        direction === MovingDirection.Backwards
      ) {
        return validitystatus;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  };

  FetchServiceType() {
    try {
      this.subscription.add(
        this.masterData.getServiceType(this.clsServiceType).subscribe(
          (data: {}) => {
            this.arrServiceTypes = data;
            this.loadingClientDetails = false;
          },
          err => {
            this.loadingClientDetails = false;
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  serviceChange(service: Servicetype) {
    try {
      const serviceStatus =
        this.serviceTypeValue.value === ""
          ? service.status
          : this.serviceTypeValue.value;
      const objService = new Servicetype();
      objService.servicetypeid = service.servicetypeid;
      objService.servicetypename = service.servicetypename;
      objService.status = serviceStatus;
      if (this.serviceTypeObject.length === 0) {
        this.serviceTypeObject.push(objService);
      }

      if (
        this.serviceTypeObject.find(
          x => x.servicetypeid === service.servicetypeid
        )
      ) {
        const index: number = this.serviceTypeObject.findIndex(
          x => x.servicetypeid === service.servicetypeid
        );
        this.serviceTypeObject.splice(index, 1);
        this.serviceTypeObject.push(objService);
      } else {
        this.serviceTypeObject.push(objService);
      }

      if (
        this.serviceTypeObject.find(
          x => x.servicetypename === "ERA HUB" && x.status === true
        )
      ) {
        this.IsERAHUBSelected = true;
      } else {
        this.IsERAHUBSelected = false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateContact() {
    try {
      if (
        this.clientName.valid &&
        this.contactEmail.valid &&
        this.contactPhone.valid &&
        this.clientCode.valid &&
        this.ClientStatus.valid
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateService() {
    try {
      if (this.newclient) {
        if (
          this.serviceTypeValue.valid &&
          this.serviceTypeObject.find(x => x.status === true)
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        if (this.serviceTypeObject.find(x => x.status === true)) {
          return true;
        } else {
          return false;
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateFTPGrid() {
    try {
      if (this.allFtpDetails.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateSubClientGrid() {
    try {
      if (this.allsubclientDetails.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  isServiceSelected(service) {
    try {
      return this.SelectedserviceTypes.find(
        x => x.servicetypeid == service.servicetypeid
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  setObject() {
    try {
      this.clsClientObject.clientcode = this.clientCode.value;
      this.clsClientObject.clientname = this.clientName.value;
      this.clsClientObject.clientcontactname = this.contactName.value;
      this.clsClientObject.clientcontactemail = this.contactEmail.value;
      this.clsClientObject.clientcontactphone = this.contactPhone.value;
      this.clsClientObject.clientstatus = this.ClientStatus.value;
      this.clsClientObject.clientservicetypes = this.serviceTypeObject;
      this.clsClientObject.clientinboundftp = this.allFtpDetails;
      if (this.IsERAHUBSelected === true) {
        this.clsClientObject.subclients = this.allsubclientDetails;
      } else {
        this.clsClientObject.subclients = null;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSubmit() {
    try {
      this.loadingClientDetails = true;
      const fieldName = "clientjson";
      const fieldValue = this.clsClientObject;
      const obj = {};
      obj[fieldName] = fieldValue;
      const jsonclient = JSON.stringify(obj);
      if (this.newclient) {
        this.subscription.add(
          this.coreService.saveClientDetails(jsonclient).subscribe(
            (data: {}) => {
              this.route.navigate(["Summary"]);
              this.loadingClientDetails = false;
            },
            err => {
              this.loadingClientDetails = false;
            }
          )
        );
      } else {
        this.coreService
          .updateClientDetial(this.dataService.EditClientid, jsonclient)
          .subscribe((data: {}) => {
            this.route.navigate(["Summary"]);
            this.loadingClientDetails = false;
          });
      }
      this.ClientContactGroup.reset();
      this.ClientServiceGroup.reset();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onAddClientFTP() {
    try {
      if (this.ClientFTPgridData.length === 0) {
        this.OutClientFTPCount = "F1";
      } else {
        const MaxclientFtpCode =
          Math.max.apply(
            Math,
            this.ClientFTPgridData.map(function(o) {
              return o.ftpid;
            })
          ) + 1;
        this.OutClientFTPCount = "F" + MaxclientFtpCode;
      }

      this.ClientFtpitems = this.ClientFTPgridData;
      this.loadClientFtpItems();
      this.OutclientFTPDetail = null;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onAddSubClient() {
    try {
      if (this.SubClientgridData.length === 0) {
        this.OutSubClientCount = this.clientCode.value + "S1";
      } else {
        const MaxSubclientCode =
          Math.max.apply(
            Math,
            this.SubClientgridData.map(function(o) {
              return o.subclientid;
            })
          ) + 1;
        this.OutSubClientCount = this.clientCode.value + "S" + MaxSubclientCode;
      }
      this.Subclientitems = this.SubClientgridData;
      this.loadSubclientItems();
      this.OutsubclientDetail = null;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  AddFTPDetails() {
    try {
      if (this.ClientFTPgridData.length !== 0) {
        this.ClientFTPgridData = null;
        this.ClientFTPgridData = Array<Ftpmaster>();
      }
      let index: number;
      if (this.OutFTP.ftpcode !== undefined) {
        if (this.allFtpDetails.find(x => x.ftpcode === this.OutFTP.ftpcode)) {
          index = this.allFtpDetails.findIndex(
            x => x.ftpcode === this.OutFTP.ftpcode
          );
          this.allFtpDetails.splice(index, 1, this.OutFTP);
        } else {
          this.allFtpDetails.push(this.OutFTP);
        }
      }

      for (const clientftp of this.allFtpDetails) {
        this.ClientFTPgridData.push(clientftp);
      }
      this.ClientFtpitems = this.ClientFTPgridData;
      this.loadClientFtpItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  AddSubClientDetails() {
    try {
      if (this.SubClientgridData.length !== 0) {
        this.SubClientgridData = null;
        this.SubClientgridData = Array<Subclient>();
      }
      let index: number;

      if (this.outSubClient.subclientcode !== undefined) {
        if (
          this.allsubclientDetails.find(
            x => x.subclientcode === this.outSubClient.subclientcode
          )
        ) {
          index = this.allsubclientDetails.findIndex(
            x => x.subclientcode === this.outSubClient.subclientcode
          );

          this.allsubclientDetails.splice(index, 1, this.outSubClient);
        } else {
          this.allsubclientDetails.push(this.outSubClient);
        }
      }
      this.sAllSplitparametervalues = [];
      for (const subclient of this.allsubclientDetails) {
        this.sAllSplitparametervalues.push({
          subclientcode: subclient.subclientcode,
          splitparametervalue:
            subclient.subclientsplitparameters[0]["splitparametervalue"]
        });
        this.SubClientgridData.push(subclient);
      }
      this.Subclientitems = this.SubClientgridData;
      this.loadSubclientItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getClientDetailbyId(id: string) {
    try {
      this.subscription.add(
        this.coreService.getClientDetailbyId(id).subscribe(
          data => {
            this.clientdetail = data;
            this.FillClientGroup();
            this.loadingClientDetails = false;
          },
          err => {
            this.loadingClientDetails = false;
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FillClientGroup() {
    try {
      let clientFTP: Ftpmaster;
      clientFTP = this.clientdetail.clientjson.clientinboundftp;
      this.clientCode.setValue(this.clientdetail.clientjson.clientcode);
      this.clientName.setValue(this.clientdetail.clientjson.clientname);
      this.contactName.setValue(this.clientdetail.clientjson.clientcontactname);
      this.contactEmail.setValue(
        this.clientdetail.clientjson.clientcontactemail
      );
      this.contactPhone.setValue(
        this.clientdetail.clientjson.clientcontactphone
      );
      this.ClientStatus.setValue(this.clientdetail.clientjson.clientstatus);

      // ServiceTypes
      this.clientdetail.clientjson.clientservicetypes.forEach(element => {
        if (element.status === true) {
          this.serviceChange(element);
          this.SelectedserviceTypes.push(element);
        }
      });

      if (
        this.clientdetail.clientjson.clientservicetypes.find(
          x => x.status === true && x.servicetypename === "ERA HUB"
        )
      ) {
        // SubClient
        this.allsubclientDetails = this.clientdetail.clientjson.subclients;
        this.AddSubClientDetails();
      }
      this.allFtpDetails = this.clientdetail.clientjson.clientinboundftp;
      this.AddFTPDetails();

      this.setObject();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  EditSubClient({ sender, rowIndex, dataItem }) {
    try {
      this.editSubclientcode = dataItem.subclientcode;
      this.SubClientInputEditMessage =
        "Do you want to edit subclient " + dataItem.subclientcode + "?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  DeleteSubClient({ sender, rowIndex, dataItem }) {
    try {
      this.deleteSubclientcode = dataItem.subclientcode;
      this.SubClientInputDeleteMessage =
        "Do you want to delete subclient " + dataItem.subclientcode + "?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  EditSubclient() {
    try {
      let index: number;
      if (
        this.allsubclientDetails.find(
          x => x.subclientcode === this.editSubclientcode
        )
      ) {
        index = this.allsubclientDetails.findIndex(
          x => x.subclientcode === this.editSubclientcode
        );
        if (this.OutsubclientDetail !== null) {
          this.OutsubclientDetail = null;
          this.OutsubclientDetail = new Subclient();
        }
        this.SubClientFTPNewarr = JSON.parse(
          JSON.stringify(this.allsubclientDetails)
        );
        // this.sAllSplitparametervalues = [];
        // for (const subclient of this.SubClientFTPNewarr) {
        //   this.sAllSplitparametervalues.push({
        //     subclientcode: subclient.subclientcode,
        //     splitparametervalue:
        //       subclient.subclientsplitparameters[0]["splitparametervalue"]
        //   });
        //   this.SubClientgridData.push(subclient);
        // }
        this.OutsubclientDetail = this.SubClientFTPNewarr[index];
        $("#exampleSubClientModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  DeleteSubclient() {
    try {
      let index: number;
      if (
        this.SubClientgridData.find(
          x => x.subclientcode === this.deleteSubclientcode
        )
      ) {
        index = this.SubClientgridData.findIndex(
          x => x.subclientcode === this.deleteSubclientcode
        );
        this.SubClientgridData.splice(index, 1);
      }

      if (
        this.allsubclientDetails.find(
          x => x.subclientcode === this.deleteSubclientcode
        )
      ) {
        index = this.allsubclientDetails.findIndex(
          x => x.subclientcode === this.deleteSubclientcode
        );
        this.allsubclientDetails.splice(index, 1);
      }
      this.Subclientitems = this.SubClientgridData;
      this.loadSubclientItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageSubclientChange(event: PageChangeEvent): void {
    try {
      this.SubClientskip = event.skip;
      this.loadSubclientItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadSubclientItems(): void {
    try {
      this.SubClientgridView = {
        data: orderBy(
          this.Subclientitems.slice(
            this.SubClientskip,
            this.SubClientskip + this.SubClientpageSize
          ),
          this.Subclientsort
        ),
        total: this.Subclientitems.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortSubclientChange(sort: SortDescriptor[]): void {
    try {
      this.Subclientsort = sort;
      this.loadSubclientItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  EditFTP({ sender, rowIndex, dataItem }) {
    try {
      this.editftpcode = dataItem.ftpcode;

      this.ClientFtpInputEditMessage =
        "Do you want to edit ftp " + dataItem.ftpcode + "?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  DeleteFTP({ sender, rowIndex, dataItem }) {
    try {
      this.deleteftpcode = dataItem.ftpcode;
      this.ClientFtpInputDeleteMessage =
        "Do you want to delete ftp " + dataItem.ftpcode + "?";
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  EditFtp() {
    try {
      let index: number;
      if (this.allFtpDetails.find(x => x.ftpcode === this.editftpcode)) {
        index = this.allFtpDetails.findIndex(
          x => x.ftpcode === this.editftpcode
        );

        if (this.OutclientFTPDetail !== null) {
          this.OutclientFTPDetail = null;
          this.OutclientFTPDetail = new Ftpmaster();
        }
        this.ClientFTPNewarr = JSON.parse(JSON.stringify(this.allFtpDetails));
        this.OutclientFTPDetail = this.ClientFTPNewarr[index];
        $("#addftpModal").modal("show");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  DeleteFtp() {
    try {
      let index: number;
      if (this.ClientFTPgridData.find(x => x.ftpcode === this.deleteftpcode)) {
        index = this.ClientFTPgridData.findIndex(
          x => x.ftpcode === this.deleteftpcode
        );
        this.ClientFTPgridData.splice(index, 1);
      }
      if (this.allFtpDetails.find(x => x.ftpcode === this.deleteftpcode)) {
        index = this.allFtpDetails.findIndex(
          x => x.ftpcode === this.deleteftpcode
        );
        this.allFtpDetails.splice(index, 1);
      }
      this.ClientFtpitems = this.ClientFTPgridData;
      this.loadClientFtpItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageClientFtpChange(event: PageChangeEvent): void {
    try {
      this.ClientFtpskip = event.skip;
      this.loadClientFtpItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  private loadClientFtpItems(): void {
    try {
      this.ClientFtpgridView = {
        data: orderBy(
          this.ClientFtpitems.slice(
            this.ClientFtpskip,
            this.ClientFtpskip + this.ClientFtppageSize
          ),
          this.ClientFtpsort
        ),
        total: this.ClientFtpitems.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sortClientFtpChange(sort: SortDescriptor[]): void {
    try {
      this.ClientFtpsort = sort;
      this.loadClientFtpItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputSubclientEditResult($event) {
    try {
      this.SubClientOutEditResult = $event;
      if (this.SubClientOutEditResult == true) {
        this.EditSubclient();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputSubclientDeleteResult($event) {
    try {
      this.SubClientOutDeleteResult = $event;
      if (this.SubClientOutDeleteResult == true) {
        this.DeleteSubclient();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputFtpEditResult($event) {
    try {
      this.ClientFtpOutEditResult = $event;
      if (this.ClientFtpOutEditResult == true) {
        this.EditFtp();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OutputFtpDeleteResult($event) {
    try {
      this.ClientFtpOutDeleteResult = $event;
      if (this.ClientFtpOutDeleteResult == true) {
        this.DeleteFtp();
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.ClientContactGroup.reset();
      this.ClientServiceGroup.reset();
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  // onSubclientSearchClick() {

  //   // let a = this.Subclientitems;
  //   // a.filter((obj) => {
  //   //   if(obj.subclientsplitparameters[0].splitparametervalue==)
  //   // });
  //   // console.log("a:" + a);

  //   if (this.SubclientSearch.value == "") {
  //     this.addSubClientDetails();
  //     return;
  //   }

  //   if (this.Subclientitems.length > 0) {
  //     this.addSubClientDetails();
  //     if ((this.Subclientitems.filter(x => x.subclientcode.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.Subclientitems = this.Subclientitems.filter(x => x.subclientcode.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in subclientcode");
  //     }
  //     else if ((this.Subclientitems.filter(x => x.subclientdivisioncode.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.Subclientitems = this.Subclientitems.filter(x => x.subclientdivisioncode.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in subclientdivisioncode");
  //     }
  //     else if ((this.Subclientitems.filter(x => x.subclientname.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.Subclientitems = this.Subclientitems.filter(x => x.subclientname.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in subclientname");
  //     }
  //     else if ((this.Subclientitems.filter(x => x.subclientcontactname.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.Subclientitems = this.Subclientitems.filter(x => x.subclientcontactname.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in subclientcontactname");
  //     }
  //     else if ((this.Subclientitems.filter(x => x.subclientcontactemail.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.Subclientitems = this.Subclientitems.filter(x => x.subclientcontactemail.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in subclientcontactemail");
  //     }
  //     else if ((this.Subclientitems.filter(x => x.subclientcontactphone.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0)).length != 0) {
  //       this.Subclientitems = this.Subclientitems.filter(x => x.subclientcontactphone.toLowerCase().indexOf(this.SubclientSearch.value.toLowerCase()) >= 0);
  //       console.log("Match found in subclientcontactphone");
  //     }
  //     this.loadSubclientItems();
  //   }
  // }
}
