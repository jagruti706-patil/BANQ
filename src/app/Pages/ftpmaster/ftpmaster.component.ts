import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MasterdataService } from "src/app/Services/masterdata.service";
import { Ftpmaster } from "src/app/Model/ftpmaster";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../node_modules/subsink";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";

@Component({
  selector: "app-ftpmaster",
  templateUrl: "./ftpmaster.component.html",
  styleUrls: ["./ftpmaster.component.css"]
})
export class FtpmasterComponent implements OnInit, OnDestroy, OnChanges {
  constructor(
    private fb: FormBuilder,
    private masterData: MasterdataService,
    private toastr: ToastrService,
    private coreService: CoreoperationsService
  ) {
    this.clsFtpmaster = new Ftpmaster();
    this.FTPDetails = new Ftpmaster();
    this.clsUtility = new Utility(toastr);
  }

  // Received Input from parent component
  @Input() FTPDetails: Ftpmaster;
  @Input() FTPCount: string;
  // Send Output to parent component
  @Output() OutFTP = new EventEmitter<string>();

  private subscription = new SubSink();
  private clsUtility: Utility;

  public arrFTPType: Array<string> = ["FTP", "SFTP"];
  private clsFtpmaster: Ftpmaster;

  OutFTPData: string;
  OutputfromChild(data: any) {
    this.OutFTPData = data;
    this.OutFTP.emit(this.OutFTPData);
  }

  loadingFtpdetails = true;

  FTPGroup = this.fb.group({
    // fcFTPID: [1],
    // fcFTPCode: ["", Validators.required],
    // fcFTPUrl: ["sftp.gatewayedi.com", Validators.required],
    // fcFTPPort: [
    //   "22",
    //   [
    //     Validators.required,
    //     Validators.pattern("^[0-9]*$"),
    //     Validators.maxLength(4)
    //   ]
    // ],
    // fcFTPUsername: ["V2EL", Validators.required],
    // fcFTPPassword: ["8evga13m", [Validators.required, Validators.minLength(8)]],
    // fcFTPName: ["MHP", Validators.required],
    // fcFTPType: ["SFTP", Validators.required],
    // fcFTPStatus: [false, Validators.required],
    // fcClient835Ftpfolder: [
    //   "Inbound",
    //   [Validators.required, Validators.maxLength(150)]
    // ],
    // fcClient837Ftpfolder: [
    //   "Outbound",
    //   [Validators.required, Validators.maxLength(150)]
    // ]
    fcFTPID: [1],
    fcFTPCode: ["", Validators.required],
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
      [Validators.required, Validators.minLength(8), Validators.maxLength(50)]
    ],
    fcFTPName: ["", [Validators.required, Validators.maxLength(50)]],
    fcFTPType: ["SFTP", Validators.required],
    fcFTPStatus: [false, Validators.required],
    fcClient835Ftpfolder: [
      "",
      [Validators.required, Validators.maxLength(150)]
    ],
    fcClient837Ftpfolder: ["", [Validators.required, Validators.maxLength(150)]]
  });

  get FTPID() {
    return this.FTPGroup.get("fcFTPID");
  }
  get FTPCode() {
    return this.FTPGroup.get("fcFTPCode");
  }
  get FTPUrl() {
    return this.FTPGroup.get("fcFTPUrl");
  }
  get FTPPort() {
    return this.FTPGroup.get("fcFTPPort");
  }
  get FTPUsername() {
    return this.FTPGroup.get("fcFTPUsername");
  }
  get FTPPassword() {
    return this.FTPGroup.get("fcFTPPassword");
  }
  get FTPName() {
    return this.FTPGroup.get("fcFTPName");
  }
  get FTPType() {
    return this.FTPGroup.get("fcFTPType");
  }
  get FTPStatus() {
    return this.FTPGroup.get("fcFTPStatus");
  }
  get client835FtpFolder() {
    return this.FTPGroup.get("fcClient835Ftpfolder");
  }
  get client837FtpFolder() {
    return this.FTPGroup.get("fcClient837Ftpfolder");
  }

  ngOnInit() {
    try {
      // console.log("ngOnInit() FTPMaster: ", this.FTPDetails);
      if (this.FTPDetails !== undefined && this.FTPDetails !== null) {
        this.FillClientFTP();
      } else {
        //   SubClient Count
        const id = this.FTPCount.split("F");
        this.FTPID.setValue(id[1]);
        this.FTPCode.setValue(this.FTPCount);
        this.FTPStatus.setValue(false);
        this.FTPType.setValue("SFTP");
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      // console.log("ngOnChanges() FTPMaster: ", this.FTPDetails);
      if (this.FTPDetails !== undefined && this.FTPDetails !== null) {
        this.FillClientFTP();
      } else {
        if (this.FTPCount !== undefined && this.FTPCount !== null) {
          this.clsFtpmaster = new Ftpmaster();
          const id = this.FTPCount.split("F");
          this.FTPID.setValue(id[1]);
          this.FTPCode.setValue(this.FTPCount);
          this.FTPStatus.setValue(false);
          this.FTPType.setValue("SFTP");
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateFTP() {
    try {
      if (
        this.FTPUrl.valid &&
        this.FTPPort.valid &&
        this.FTPUsername.valid &&
        this.FTPPassword.valid &&
        this.FTPName.valid &&
        this.FTPType.valid &&
        this.FTPStatus.valid &&
        this.client835FtpFolder.valid &&
        this.client837FtpFolder.valid
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ClientStatusChanged() {
    try {
      if (this.FTPStatus.value === null) {
      } else {
        if (this.FTPStatus.value) {
          document.getElementById("lblFTPMasterStatus").innerHTML = "Active";
        } else {
          document.getElementById("lblFTPMasterStatus").innerHTML = "Inactive";
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSaveFTP() {
    try {
      if (this.FTPGroup.valid) {
        this.clsFtpmaster.ftpid = this.FTPID.value;
        this.clsFtpmaster.ftpcode = this.FTPCode.value;
        this.clsFtpmaster.ftpurl = this.FTPUrl.value;
        this.clsFtpmaster.ftpport = this.FTPPort.value;
        this.clsFtpmaster.ftpusername = this.FTPUsername.value;
        this.clsFtpmaster.ftppassword = this.FTPPassword.value;
        // this.clsFtpmaster.ftppassword = window.btoa(this.FTPPassword.value);
        this.clsFtpmaster.ftpname = this.FTPName.value;
        this.clsFtpmaster.ftptype = this.FTPType.value;
        this.clsFtpmaster.status = this.FTPStatus.value;
        this.clsFtpmaster.ftp835inboundfolder = this.client835FtpFolder.value;
        this.clsFtpmaster.ftp837inboundfolder = this.client837FtpFolder.value;
        // console.log("saveFTP in FTPMASTER" + JSON.stringify(this.clsFtpmaster));
        this.OutputfromChild(this.clsFtpmaster);

        this.FTPDetails = null;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FillClientFTP() {
    try {
      this.FTPID.setValue(this.FTPDetails.ftpid);
      this.FTPCode.setValue(this.FTPDetails.ftpcode);
      this.FTPGroup.controls.fcFTPUrl.setValue(this.FTPDetails.ftpurl);
      this.FTPGroup.controls.fcFTPPort.setValue(this.FTPDetails.ftpport);
      this.FTPGroup.controls.fcFTPUsername.setValue(
        this.FTPDetails.ftpusername
      );
      this.FTPGroup.controls.fcFTPPassword.setValue(
        this.FTPDetails.ftppassword
      );
      // this.FTPGroup.controls.fcFTPPassword.setValue(window.atob(this.FTPDetails.ftppassword));
      this.FTPGroup.controls.fcFTPName.setValue(this.FTPDetails.ftpname);
      this.FTPGroup.controls.fcFTPType.setValue(this.FTPDetails.ftptype);
      this.FTPGroup.controls.fcFTPStatus.setValue(this.FTPDetails.status);
      this.FTPGroup.controls.fcClient835Ftpfolder.setValue(
        this.FTPDetails.ftp835inboundfolder
      );
      this.FTPGroup.controls.fcClient837Ftpfolder.setValue(
        this.FTPDetails.ftp837inboundfolder
      );
      this.FTPStatus.setValue(this.FTPDetails.status);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  IsConnectionExists = -1;
  OnCheckFTPConnection() {
    this.loadingFtpdetails = true;
    try {
      var strHost: string = this.FTPUrl.value;
      var strPort: string = this.FTPPort.value;
      var strUserName: string = this.FTPUsername.value;
      var strPassword: string = this.FTPPassword.value;
      // var strPassword: string = this.clsUtility
      //   .encryptAES(this.FTPPassword.value)
      //   .toString();
      var str835FtpFolder: string = this.client835FtpFolder.value;
      var str837FtpFolder: string = this.client837FtpFolder.value;
      var strFTPName: string = this.FTPName.value;
      let currentDateTime = this.clsUtility.currentDateTime();
      var clsFtpdetails: Ftpmaster = new Ftpmaster();
      // console.log(clsFtpdetails);

      this.clsFtpmaster.ftpid = this.FTPID.value;
      this.clsFtpmaster.ftpcode = this.FTPCode.value;
      this.clsFtpmaster.ftpurl = this.FTPUrl.value;
      this.clsFtpmaster.ftpport = this.FTPPort.value;
      this.clsFtpmaster.ftpusername = this.FTPUsername.value;
      this.clsFtpmaster.ftppassword = this.FTPPassword.value;
      // this.clsFtpmaster.ftppassword = window.btoa(this.FTPPassword.value);
      this.clsFtpmaster.ftpname = this.FTPName.value;
      this.clsFtpmaster.ftptype = this.FTPType.value;
      this.clsFtpmaster.status = this.FTPStatus.value;
      this.clsFtpmaster.ftp835inboundfolder = this.client835FtpFolder.value;
      this.clsFtpmaster.ftp837inboundfolder = this.client837FtpFolder.value;

      clsFtpdetails.ftpid = this.FTPID.value;
      clsFtpdetails.ftpcode = this.FTPCode.value;
      clsFtpdetails.ftpurl = strHost.trim();
      clsFtpdetails.ftpport = strPort.trim();
      clsFtpdetails.ftpusername = strUserName.trim();
      clsFtpdetails.ftppassword = strPassword.trim();
      clsFtpdetails.ftp835inboundfolder = str835FtpFolder.trim();
      clsFtpdetails.ftp837inboundfolder = str837FtpFolder.trim();
      clsFtpdetails.ftpname = strFTPName.trim();
      clsFtpdetails.status = this.FTPStatus.value;
      const jsonqsuite = JSON.stringify(clsFtpdetails);
      // console.log(jsonqsuite);

      this.subscription.add(
        this.coreService.CheckFtpExists(jsonqsuite).subscribe(
          (data: {}) => {
            if (data != null || data != undefined) {
              // console.log(data);

              if (data == 0) {
                this.clsUtility.showError(
                  "Unable to establish ftp connection."
                );
                this.IsConnectionExists = 1;
              } else if (data == 1) {
                this.clsUtility.showError(
                  "FTP connection established but folder not found."
                );
                this.IsConnectionExists = 1;
              } else if (data == 2) {
                this.clsUtility.showSuccess("FTP connection  established.");
                this.IsConnectionExists = 1;
              }
              this.loadingFtpdetails = false;
            } else {
              this.clsUtility.showError("Unable to establish ftp connection.");
              this.IsConnectionExists = 1;
            }
          },
          err => {
            this.clsUtility.showError("Unable to establish ftp connection.");
            this.IsConnectionExists = 1;
            this.loadingFtpdetails = false;
          }
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    } finally {
      clsFtpdetails = null;
    }
  }

  ngOnDestroy() {
    try {
      // Reset the controls
      this.FTPDetails = null;
      this.FTPGroup.reset();
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ResetComponents() {
    try {
      this.FTPDetails = null;
      this.FTPGroup.reset();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnClose() {
    try {
      this.OutputfromChild(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
