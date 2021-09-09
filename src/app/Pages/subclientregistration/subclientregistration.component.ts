import {
  Component,
  OnInit,
  Input,
  Output,
  OnDestroy,
  OnChanges
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MasterdataService } from "src/app/Services/masterdata.service";
import { EventEmitter } from "@angular/core";
import { Subclient } from "src/app/Model/subclient";
import { SplitParameter } from "src/app/Model/split-parameter";
import { Ftpmaster } from "src/app/Model/ftpmaster";
import { isNullOrUndefined } from "util";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
declare var $: any;

@Component({
  selector: "app-subclientregistration",
  templateUrl: "./subclientregistration.component.html",
  styleUrls: ["./subclientregistration.component.css"]
})
export class SubclientregistrationComponent
  implements OnInit, OnDestroy, OnChanges {
  constructor(
    private fb: FormBuilder,
    private masterData: MasterdataService,
    private toastr: ToastrService
  ) {
    this.clsUtility = new Utility(toastr);
    this.clsSplitParameter = new SplitParameter();
    this.clsSubClient = new Subclient();
    this.subClientDetails = new Subclient();
  }
  public subscription = new SubSink();
  // Received Input from parent component
  @Input() subClientDetails: Subclient;
  // SubClient Count from registration component
  @Input() subClientCount: string;
  // Splitparametervalues from registration component
  @Input() sAllSplitparametervalues: Array<{
    subclientcode: string;
    splitparametervalue: string;
  }>;
  // Send Output to parent component
  @Output() outSubClient = new EventEmitter<string>();

  private clsUtility: Utility;

  private subClient: string;
  private clsSubClient: Subclient;

  private clsSplitParameter: SplitParameter;
  private SplitParameterObject: Array<SplitParameter> = [];
  public arrSplitParameter: SplitParameter[];
  private SubclientFTPObject: Ftpmaster;
  public subClientSubmitted = false;

  public mask = "(999) 000-0000";
  public arrFTPType: Array<string> = ["FTP", "SFTP"];

  // Loading
  loadingSubClient = true;

  get subClientID() {
    return this.SubClientContactGroup.get("fcSubClientID");
  }
  get subClientCode() {
    return this.SubClientContactGroup.get("fcSubClientCode");
  }
  get subClientDivisionCode() {
    return this.SubClientContactGroup.get("fcSubClientDevisionCode");
  }
  get subClientName() {
    return this.SubClientContactGroup.get("fcSubClientName");
  }
  get subContactName() {
    return this.SubClientContactGroup.get("fcSubContactName");
  }
  get subContactEmail() {
    return this.SubClientContactGroup.get("fcSubContactEmail");
  }
  get subContactPhone() {
    return this.SubClientContactGroup.get("fcSubContactPhone");
  }
  get subClientStatus() {
    return this.SubClientContactGroup.get("fcSubClientStatus");
  }
  get ParameterName() {
    return this.SubClientSplitGroup.get("fcSplitParameterName");
  }
  get ParameterValue() {
    return this.SubClientSplitGroup.get("fcSplitParameterValue");
  }
  get FTPUrl() {
    return this.SubClientFTPGroup.get("fcFTPUrl");
  }
  get FTPPort() {
    return this.SubClientFTPGroup.get("fcFTPPort");
  }
  get FTPUsername() {
    return this.SubClientFTPGroup.get("fcFTPUsername");
  }
  get FTPPassword() {
    return this.SubClientFTPGroup.get("fcFTPPassword");
  }
  get FTPName() {
    return this.SubClientFTPGroup.get("fcFTPName");
  }
  get FTPType() {
    return this.SubClientFTPGroup.get("fcFTPType");
  }
  get FTPStatus() {
    return this.SubClientFTPGroup.get("fcFTPStatus");
  }
  get FTP835Outbound() {
    return this.SubClientFTPGroup.get("fcFTP835Outbound");
  }

  // SubClientContactGroup = this.fb.group({
  //   fcSubClientID: [0],
  //   fcSubClientCode: ['SCLT-', Validators.required],
  //   fcSubClientDevisionCode: ['BRO', Validators.required],
  //   fcSubClientName: ['Westland Clinic', Validators.required],
  //   fcSubContactName: ['Timothy D. Guzman', Validators.required],
  //   fcSubContactEmail: ['TimothyDGuzman@dayrep.com', [Validators.required, Validators.email]],
  //   fcSubContactPhone: ['9095533820', [Validators.required, Validators.pattern('^[0-9]*$')]],
  //   fcSubClientStatus: [false, Validators.required]
  // });
  // SubClientSplitGroup = this.fb.group({
  //   fcSplitParameterName: ['', Validators.required],
  //   fcSplitParameterValue: ['', Validators.required],
  // });
  // SubClientFTPGroup = this.fb.group({
  //   fcFTPUrl: ['sftp.gatewayedi.com', Validators.required],
  //   fcFTPPort: ['22', [Validators.required, Validators.pattern('^[0-9]*$')]],
  //   fcFTPUsername: ['V2EL', Validators.required],
  //   fcFTPPassword: ['8evga13m', [Validators.required, Validators.minLength(6)]],
  //   fcFTPName: ['WLC', Validators.required],
  //   fcFTPType: ['SFTP', Validators.required],
  //   fcFTPStatus: [false, Validators.required],
  //   fcFTP835Outbound: [' /remits/Out/835Folder', Validators.required]
  // });
  SubClientContactGroup = this.fb.group({
    fcSubClientID: [1],
    fcSubClientCode: ["", Validators.required],
    fcSubClientDevisionCode: [
      "",
      [Validators.required, Validators.maxLength(10)]
    ],
    fcSubClientName: ["", [Validators.required, Validators.maxLength(100)]],
    fcSubContactName: ["", [Validators.required, Validators.maxLength(100)]],
    fcSubContactEmail: [
      "",
      [Validators.required, Validators.email, Validators.maxLength(50)]
    ],
    fcSubContactPhone: [
      "",
      [Validators.required, Validators.pattern("^[0-9]*$")]
    ],
    fcSubClientStatus: [false, Validators.required]
  });
  SubClientSplitGroup = this.fb.group({
    fcSplitParameterName: ["", Validators.required],
    fcSplitParameterValue: [
      "",
      [Validators.required, Validators.maxLength(100)]
    ]
  });
  SubClientFTPGroup = this.fb.group({
    fcFTPUrl: ["", [Validators.required, Validators.maxLength(100)]],
    fcFTPPort: [
      "",
      [
        Validators.required,
        Validators.pattern("^[0-9]*$"),
        Validators.maxLength(4)
      ]
    ],
    fcFTPUsername: ["", [Validators.required, Validators.maxLength(50)]],
    fcFTPPassword: [
      "",
      [Validators.required, Validators.minLength(6), Validators.maxLength(50)]
    ],
    fcFTPName: ["", [Validators.required, Validators.maxLength(50)]],
    fcFTPType: ["SFTP", Validators.required],
    fcFTPStatus: [false, Validators.required],
    fcFTP835Outbound: ["", [Validators.required, Validators.maxLength(150)]]
  });

  OutputSubClient(data: any) {
    try {
      this.subClient = data;
      this.outSubClient.emit(this.subClient);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnInit() {
    try {
      this.loadingSubClient = true;
      this.FetchSplitValue();
      if (
        this.subClientDetails !== undefined &&
        this.subClientDetails !== null
      ) {
        this.FillsubClientDetails();
      } else {
        const id = this.subClientCount.split("S");
        this.subClientID.setValue(id[1]);
        this.subClientCode.setValue(this.subClientCount);
        this.subClientStatus.setValue(false);
        this.FTPStatus.setValue(false);
        this.FTPType.setValue("SFTP");
        this.loadingSubClient = false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      this.loadingSubClient = true;
      this.FetchSplitValue();
      if (
        this.subClientDetails !== undefined &&
        this.subClientDetails !== null
      ) {
        this.FillsubClientDetails();
      } else {
        //   SubClient Count
        if (this.subClientCount !== undefined && this.subClientCount !== null) {
          this.clsSubClient = new Subclient();
          const id = this.subClientCount.split("S");
          this.subClientID.setValue(id[1]);
          this.subClientCode.setValue(this.subClientCount);
          this.subClientStatus.setValue(false);
          this.FTPStatus.setValue(false);
          this.FTPType.setValue("SFTP");
          this.loadingSubClient = false;
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FetchSplitValue() {
    try {
      this.subscription.add(
        this.masterData
          .getSplitParameter(this.clsSplitParameter)
          .subscribe(data => {
            this.arrSplitParameter = data;
            this.loadingSubClient = false;
          })
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitParameterChange(event: any) {
    try {
      if (event !== null) {
        const objSplitParameter = this.arrSplitParameter.filter(
          x => x.splitparameterid == event
        );
        const parameter = new SplitParameter();
        parameter.splitparameterid = objSplitParameter[0].splitparameterid;
        parameter.splitparametername = objSplitParameter[0].splitparametername;
        parameter.splitparametervalue = this.ParameterValue.value;
        if (this.arrSplitParameter.find(x => x.splitparameterid == event)) {
          const index: number = this.SplitParameterObject.findIndex(
            x => x.splitparameterid == event
          );
          this.SplitParameterObject.splice(index, 1);
          this.SplitParameterObject.push(parameter);
        } else {
          this.SplitParameterObject.push(parameter);
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  subClientStatusChanged(Callingfrom: string) {
    try {
      if (Callingfrom === "subclient") {
        if (this.subClientStatus.value === null) {
        } else {
          if (this.subClientStatus.value) {
            document.getElementById("lblSubClientStatus").innerHTML = "Active";
          } else {
            document.getElementById("lblSubClientStatus").innerHTML =
              "Inactive";
          }
        }
      }
      if (Callingfrom === "ftp") {
        if (this.FTPStatus.value === null) {
        } else {
          if (this.FTPStatus.value) {
            document.getElementById("lblFTPStatus").innerHTML = "Active";
          } else {
            document.getElementById("lblFTPStatus").innerHTML = "Inactive";
          }
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  saveSubclient() {
    try {
      if (this.sAllSplitparametervalues !== undefined) {
        if (this.sAllSplitparametervalues.length != 0) {
          if (
            this.sAllSplitparametervalues.find(
              x =>
                x.splitparametervalue.toUpperCase() ==
                this.ParameterValue.value.toUpperCase()
            )
          ) {
            const index: number = this.sAllSplitparametervalues.findIndex(
              x =>
                x.splitparametervalue.toUpperCase() ==
                this.ParameterValue.value.toUpperCase()
            );
            if (
              this.sAllSplitparametervalues[index][
                "subclientcode"
              ].toUpperCase() != this.subClientCode.value.toUpperCase()
            ) {
              this.clsUtility.showError("Split parameter value already exists");
              return;
            }
          }
        }
      }

      this.subClientSubmitted = true;
      if (
        this.SubClientContactGroup.valid &&
        this.SubClientSplitGroup.valid &&
        this.SubClientFTPGroup.valid
      ) {
        if (this.SubClientContactGroup.valid) {
          this.clsSubClient.subclientid = this.subClientID.value;
          this.clsSubClient.subclientcode = this.subClientCode.value;
          this.clsSubClient.subclientname = this.subClientName.value;
          this.clsSubClient.subclientdivisioncode = this.subClientDivisionCode.value;
          this.clsSubClient.subclientcontactname = this.subContactName.value;
          this.clsSubClient.subclientcontactemail = this.subContactEmail.value;
          this.clsSubClient.subclientcontactphone = this.subContactPhone.value;
          this.clsSubClient.subclientstatus = this.subClientStatus.value;
        }
        if (this.SubClientSplitGroup.valid) {
          this.SplitParameterObject[0].splitparametervalue = this.ParameterValue.value;
          this.clsSubClient.subclientsplitparameters = this.SplitParameterObject;
        }
        if (this.SubClientFTPGroup.valid) {
          const objFTP = new Ftpmaster();
          objFTP.ftpurl = this.FTPUrl.value;
          objFTP.ftpport = this.FTPPort.value;
          objFTP.ftpusername = this.FTPUsername.value;
          objFTP.ftppassword = this.FTPPassword.value;
          // objFTP.ftppassword = window.btoa(this.FTPPassword.value);
          objFTP.ftpname = this.FTPName.value;
          objFTP.ftptype = this.FTPType.value;
          objFTP.status = this.FTPStatus.value;
          objFTP.ftp835outboundfolder = this.FTP835Outbound.value;
          // this.SubclientFTPObject.push(objFTP);
          this.SubclientFTPObject = objFTP;
          this.clsSubClient.subclientoutboundftp = this.SubclientFTPObject;
        }

        this.OutputSubClient(this.clsSubClient);
        this.subClientDetails = null;
        // Reset the controls
      } else {
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ResetComponents(): any {
    try {
      this.SubClientContactGroup.reset();
      this.SubClientSplitGroup.reset();
      this.SubClientFTPGroup.reset();
      this.SplitParameterObject = [];
      this.subClientDetails = null;
      // Sub-client details : Sub-client code is not generated (display as blank) High bug #60
      // this.sAllSplitparametervalues = [];
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateSubClient() {
    if (
      this.SubClientContactGroup.valid &&
      this.SubClientSplitGroup.valid &&
      this.SubClientFTPGroup.valid
    ) {
      return true;
    } else {
      return false;
    }
  }

  FillsubClientDetails() {
    try {
      this.SplitParameterObject.pop();

      const subclientSplitParameter: SplitParameter = this.subClientDetails
        .subclientsplitparameters;
      const subclientFtp: Ftpmaster = this.subClientDetails
        .subclientoutboundftp;
      this.subClientID.setValue(this.subClientDetails.subclientid);
      this.subClientCode.setValue(this.subClientDetails.subclientcode);
      this.subClientDivisionCode.setValue(
        this.subClientDetails.subclientdivisioncode
      );
      this.subClientName.setValue(this.subClientDetails.subclientname);
      this.subContactName.setValue(this.subClientDetails.subclientcontactname);
      this.subContactEmail.setValue(
        this.subClientDetails.subclientcontactemail
      );
      this.subContactPhone.setValue(
        this.subClientDetails.subclientcontactphone
      );
      this.subClientStatus.setValue(this.subClientDetails.subclientstatus);

      // split parameter
      this.ParameterName.setValue(subclientSplitParameter[0].splitparameterid);
      this.ParameterValue.setValue(
        subclientSplitParameter[0].splitparametervalue
      );
      // active/Deactivate screen: duplicate entry on sub-client details High bug #46
      //this.SplitParameterObject.push(subclientSplitParameter[0]);

      // FTP outbound
      this.FTPUrl.setValue(subclientFtp.ftpurl);
      this.FTPPort.setValue(subclientFtp.ftpport);
      this.FTPUsername.setValue(subclientFtp.ftpusername);
      this.FTPPassword.setValue(subclientFtp.ftppassword);
      // this.FTPPassword.setValue(window.atob(subclientFtp.ftppassword));
      this.FTPName.setValue(subclientFtp.ftpname);
      this.FTPType.setValue(subclientFtp.ftptype);
      this.FTPStatus.setValue(subclientFtp.status);
      this.FTP835Outbound.setValue(subclientFtp.ftp835outboundfolder);
      this.loadingSubClient = false;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      this.subClientDetails = null;
      this.SubClientContactGroup.reset();
      this.SubClientSplitGroup.reset();
      this.SubClientFTPGroup.reset();
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnClose() {
    try {
      this.OutputSubClient(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
