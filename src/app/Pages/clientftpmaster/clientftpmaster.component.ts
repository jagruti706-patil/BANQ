import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Api } from "./../../Services/api";
import { clsclientftp } from "./clsclientftp";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  Output,
  EventEmitter
} from "@angular/core";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from "@angular/forms";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { DatePipe } from "@angular/common";
import { CoreoperationsService } from "src/app/Services/coreoperations.service";
import { Ftpmaster } from "src/app/Model/ftpmaster";
import { isNullOrUndefined } from "util";
import { SubSink } from "subsink";
declare var $: any;
import { clsPermission } from "src/app/Services/settings/clspermission";

@Component({
  selector: "app-clientftpmaster",
  templateUrl: "./clientftpmaster.component.html",
  styleUrls: ["./clientftpmaster.component.css"]
})
export class ClientftpmasterComponent implements OnInit, OnDestroy {
  hide: boolean =  true;
  public clsPermission: clsPermission;
  @Input() callfrom: string = "";
  @Input() callftpid: string = "";
  @Input() callingclientid: string;
  @Input() FTPCount: string;
  @Output() ftpsavedchnages = new EventEmitter<void>();
  @Output() ftpcancel = new EventEmitter<void>();

  makeModalDisabled: boolean = false;
  loginGCPUserID: string = "";
  private clsUtility: Utility;
  frmclient: FormGroup;
  formtitle: string = "Add Client FTP";
  buttonCaption: string = "Add Client FTP";
  isaddmode: boolean = true;
  isLoading = false;
  objclient = new clsclientftp();
  public mask: string = "000-000-0000";
  public arrFTPType: Array<string> = ["FTP", "SFTP"];
  // loadingFtpdetails = true;
  loadingFtpdetails: boolean;
  public clientid: any;
  public currentselectedclientid: any;
  public currentselectedftpid: any;
  public currentselectedclientcode: any;
  public currentselectedclientname: any;
  public currentselectedclientftpcode: any;
  public disableSave: boolean = false;
  ftpConnectionMsg: string;
  private originalFTPdetails: any;
  public subscription = new SubSink();

  constructor(
    fb: FormBuilder,
    private _router: Router,
    private _routeParams: ActivatedRoute,
    public api: Api,
    private datatransfer: DatatransaferService,
    private coreService: CoreoperationsService,
    private toaster: ToastrService
  ) {
    this.clsUtility = new Utility(toaster);
    // this.datatransfer.currentclientftpid.subscribe(data => {
    //   this.currentselectedftpid = data;

    //   console.log('this.currentselectedftpid', this.currentselectedftpid);
    // });

    // this.datatransfer.currentclientid.subscribe(data => {
    //   this.currentselectedclientid = data;
    //   console.log('this.currentselectedclientid', this.currentselectedclientid);
    // });

    this.frmclient = fb.group({
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
      fcFTPPassword: ["", [Validators.required]],
      fcFTPName: ["", [Validators.required, Validators.maxLength(50)]],
      fcFTPType: ["SFTP", Validators.required],
      fcFTPStatus: [false, Validators.required],
      fcClient835Ftpfolder: [
        "",
        [Validators.required, Validators.maxLength(150)]
      ],
      fcFileExtension: ["", [Validators.required, Validators.pattern('^(.[A-Za-z0-9]*;)*(.[A-Za-z0-9]*;)')]],
      // fcClient837Ftpfolder:
      //   "",
      //   [Validators.required, Validators.maxLength(150)]
      // ]
    });
  }

  ngOnInit() {
    try{
      this.subscription.add(
        this.datatransfer.newpermission.subscribe(
          value => (this.clsPermission = value)
        )
      );
  
      this.datatransfer.currentclientftpid.subscribe(data => {
        this.datatransfer.loginGCPUserID.subscribe(data => {
          this.loginGCPUserID = data;
        });
  
        this.ResetComponents();
        this.currentselectedftpid = data;
  
        if (this.currentselectedftpid == "new") {
          this.objclient = new clsclientftp();
          this.frmclient.controls["fcFTPStatus"].setValue(false);
        }
  
        this.datatransfer.currentclientid.subscribe(data => {
          this.currentselectedclientid = data;
  
          this.datatransfer.currentclientcode.subscribe(data => {
            this.currentselectedclientcode = data;
          });
  
          this.datatransfer.currentclientname.subscribe(data => {
            this.currentselectedclientname = data;
          });
  
          this.datatransfer.clientnewftpcode.subscribe(data => {
            this.currentselectedclientftpcode = data;
            this.frmclient.controls["fcFTPCode"].setValue(
              this.currentselectedclientftpcode
            );
          });
  
          if (
            this.currentselectedclientid != undefined &&
            this.currentselectedftpid != undefined
            //&& this.currentselectedclientcode != undefined
          ) {
            var id = String(this.currentselectedftpid);
            var clientid = String(this.currentselectedclientid);
            this.clientid = clientid;
            //var clientcode = String(this.currentselectedclientcode);
  
            if (id == "new") {
              this.formtitle = "Add Group FTP";
              this.buttonCaption = "Add Group FTP";
              this.isaddmode = true;
              this.frmclient.controls["fcFTPType"].setValue("SFTP");
            } else {
              this.formtitle = "Edit Group FTP";
              this.buttonCaption = "Update Group FTP";
              this.isaddmode = false;
            }
  
            if (id == "new") {
              // var res_id;
              // let seq_inboundid = this.api.get("FTP/GetInboundId");
              // seq_inboundid.subscribe(
              //   res => {
              //     console.log(res);
              //     this.objclient.ftpcode = res.toString();
  
              //   },
              //   err => {
              //     this.clsUtility.LogError(err);
              //   }
              // );
  
              //#region "Set Default FTP Values"
  
              // let seq2 = this.api.post("SubClient/GetDefaultSubClientFTP", null);
              // this.subscription.add(
              //   seq2.subscribe(
              //     res2 => {
              //       if (res2 != null && res2 != undefined) {
              //         if (res2[0] != null && res2[0] != undefined) {
              //           this.frmclient.controls["fcFTPName"].setValue(
              //             String(res2[0].ftpname)
              //           );
              //           this.frmclient.controls["fcFTPUrl"].setValue(
              //             res2[0].ftpurl
              //           );
              //           this.frmclient.controls["fcFTPPort"].setValue(
              //             res2[0].ftpport
              //           );
              //           this.frmclient.controls["fcFTPType"].setValue(
              //             res2[0].ftptype
              //           );
              //         }
              //         this.isLoading = false;
              //       }
              //     },
              //     err => {
              //       this.isLoading = false;
              //       this.clsUtility.LogError(err);
              //     }
              //   )
              // );
  
              //#endregion "Set Default FTP Values"
  
              return;
            } else {
              this.isLoading = true;
              let getclient: { clientid: string; ftpid: string } = {
                clientid: id,
                ftpid: id
              };
              let seq = this.api.post("FTP/GetFTP", getclient);
              this.subscription.add(
                seq.subscribe(
                  res => {
                    this.originalFTPdetails = null;
                    this.originalFTPdetails = { ...res };
                    this.objclient = <clsclientftp>res;
                    this.objclient.ftppassword = this.clsUtility
                      .decryptAES(this.objclient.ftppassword)
                      .toString();
                  },
                  err => {
                    this.clsUtility.LogError(err);
                  }
                )
              );
              this.isLoading = false;
            }
          }
        });
      });
    }  catch (error) {
      this.clsUtility.LogError(error);
    }   
  }

  get f() {
    return this.frmclient.controls;
  }

  addupdateclientftp() {
    try {
      // console.log("addupdateclientftp : ", this.f.fcFTPPassword.value);

      this.frmclient.patchValue({
        fcFTPUrl: this.f.fcFTPUrl.value
          ? this.f.fcFTPUrl.value.trim()
          : this.f.fcFTPUrl.value,
        fcFTPUsername: this.f.fcFTPUsername.value
          ? this.f.fcFTPUsername.value.trim()
          : this.f.fcFTPUsername.value,
        fcFTPPassword: this.f.fcFTPPassword.value
          ? this.f.fcFTPPassword.value.trim()
          : this.f.fcFTPPassword.value,
        fcFTPName: this.f.fcFTPName.value
          ? this.f.fcFTPName.value.trim()
          : this.f.fcFTPName.value,
        fcClient835Ftpfolder: this.f.fcClient835Ftpfolder.value
          ? this.f.fcClient835Ftpfolder.value.trim()
          : this.f.fcClient835Ftpfolder.value
        // fcClient837Ftpfolder: this.f.fcClient837Ftpfolder.value?this.f.fcClient837Ftpfolder.value.trim():this.f.fcClient837Ftpfolder.value
      });
      this.frmclient.updateValueAndValidity();
      if (!this.frmclient.valid) {
        this.disableSave = false;
        return;
      }
      const datepipe = new DatePipe("en-US");
      const currentDate = datepipe.transform(
        Date.now(),
        "yyyy-MM-ddTHH:mm:ss.SSSZ"
      );

      this.objclient.ftp837inboundfolder = ""; // commented 837 input field.
      if (this.objclient.ftpid) {
        //update  Client
        // console.log("objectclient" + this.objclient.ftppassword);
        // console.log("addupdateclientftp" + this.f.fcFTPPassword.value.trim());
        this.objclient.ftppassword = this.clsUtility
          .encryptAES(this.f.fcFTPPassword.value.trim())
          .toString();
        this.objclient.createdby = this.loginGCPUserID;
        this.objclient.createdon = currentDate;
        this.objclient.clientid = this.clientid;

        //#region "Get Modified Items of ClientFTP"

        let oldchangeditems = {};
        let ModifiedItems = "";
        let changeditems: any = this.clsUtility.jsondiff(
          this.originalFTPdetails,
          this.objclient
        );

        if (!isNullOrUndefined(changeditems) && changeditems != {}) {
          if (changeditems.hasOwnProperty("clientid")) {
            delete changeditems.clientid;
          }

          for (let key of Object.keys(changeditems)) {
            let oldvalue: string = this.originalFTPdetails[key];
            oldchangeditems[key] = oldvalue;
          }
          if (
            !isNullOrUndefined(changeditems) &&
            JSON.stringify(changeditems) != "{}"
          ) {
            ModifiedItems =
              "OLD : " +
              JSON.stringify(oldchangeditems) +
              ",NEW : " +
              JSON.stringify(changeditems);
          }
        }

        //#endregion "Get Modified Items of ClientFTP"

        let seq = this.api.post("FTP/UpdateFTP", this.objclient);
        this.subscription.add(
          seq.subscribe(
            res => {
              if (res != null || res != undefined) {
                if (res == 1) {
                  this.toaster.success(
                    "Group FTP details updated successfully."
                  );
                  this.disableSave = false;
                  this.api.insertActivityLogPostcall(
                    "Group (Group name: " +
                      this.objclient.clientname +
                      ") FTP Details Modified (FTP name: " +
                      this.objclient.ftpname +
                      ")" +
                      ModifiedItems,
                    "Group FTP",
                    "UPDATE"
                  );
                  this.datatransfer.clientftpsaved.next(true);
                  document.getElementById("closeModal").click();
                } else if (res == 2) {
                  this.disableSave = false;
                  this.objclient.ftppassword = this.clsUtility
                    .decryptAES(this.f.fcFTPPassword.value.trim())
                    .toString();
                  this.toaster.warning("FTP Configuration Is Duplicate");
                }
              }
            },
            err => {
              this.clsUtility.LogError(err);
            }
          )
        );
      } else {
        //add Client
        this.objclient.ftppassword = this.clsUtility
          .encryptAES(this.f.fcFTPPassword.value.trim())
          .toString();
        this.objclient.createdby = this.loginGCPUserID;
        this.objclient.createdon = currentDate;
        this.objclient.clientid = this.clientid;
        let seq = this.api.post("FTP/SaveFTP", this.objclient);
        this.subscription.add(
          seq.subscribe(
            res => {
              if (res != null || res != undefined) {
                if (res == 1) {
                  this.disableSave = false;
                  this.datatransfer.clientftpsaved.next(true);
                  this.toaster.success(
                    "Group FTP details saved successfully. "
                  );
                  this.api.insertActivityLog(
                    "Group (Group name: " +
                      this.currentselectedclientname +
                      ") FTP Details Saved (FTP name: " +
                      this.objclient.ftpname +
                      ")",
                    "Group FTP",
                    "ADD"
                  );
                  // $("#addftpModal").modal("hide");
                  document.getElementById("closeModal").click();
                  // this._router.navigate(['clientlist']);
                } else if (res == 2) {
                  this.disableSave = false;
                  this.objclient.ftppassword = this.clsUtility
                    .decryptAES(this.f.fcFTPPassword.value.trim())
                    .toString();
                  this.toaster.warning("FTP Configuration Is Duplicate");
                }
              }
            },
            err => {
              this.clsUtility.LogError(err);
            }
          )
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    try {
      // Reset the controls
      this.subscription.unsubscribe();
      this.frmclient.reset();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ResetComponents() {
    try {
      this.frmclient.reset();
      this.hide = true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onCloseClick() {
    this.datatransfer.clientftpsaved.next(false);    
  }

  IsConnectionExists = -1;
  OnCheckFTPConnection() {
    this.loadingFtpdetails = true;
    var strFTPId = this.objclient.ftpid;
    var strFTPCode: string = this.objclient.ftpcode.trim();
    var strURL: string = this.objclient.ftpurl.trim();
    var strPort: string = this.objclient.ftpport.trim();
    var strUserName: string = this.objclient.ftpusername.trim();
    // console.log("OnCheckFTPConnection : ", this.objclient.ftppassword.trim());
    var strPassword: string = this.clsUtility
      .encryptAES(this.objclient.ftppassword.trim())
      .toString();
    // var strPassword: string = this.clsUtility
    //   .encryptAES(this.FTPPassword.value)
    //   .toString();
    var str835FtpFolder: string = this.objclient.ftp835inboundfolder.trim();
    // var str837FtpFolder: string = this.objclient.ftp837inboundfolder.trim();
    var clsFtpdetails: Ftpmaster = new Ftpmaster();
    clsFtpdetails.ftpid = strFTPId;
    clsFtpdetails.ftpcode = strFTPCode;
    clsFtpdetails.ftpurl = strURL;
    clsFtpdetails.ftpport = strPort;
    clsFtpdetails.ftpusername = strUserName;
    clsFtpdetails.ftppassword = strPassword;
    // this.clsFtpdetails.ftppassword = window.btoa(this.FTPPassword.value);
    clsFtpdetails.ftp835inboundfolder = str835FtpFolder;
    // clsFtpdetails.ftp837inboundfolder = str837FtpFolder;
    clsFtpdetails.status =
      this.objclient.status === null ? false : this.objclient.status;
    const jsonqsuite = JSON.stringify(clsFtpdetails);

    // for (let i = 0; i < 3; )
    {
      let seq = this.api.post_edi(
        "ClientInboundFTP/CheckConnection",
        clsFtpdetails
      );
      this.subscription.add(
        seq.subscribe(
          res => {
            this.coreService.CheckFtpExists(jsonqsuite).subscribe(
              (data: {}) => {
                if (data != null || data != undefined) {
                  if (data == 0) {
                    // i++;
                    this.objclient.status = false;
                    this.clsUtility.showError(
                      "Unable to establish ftp connection."
                    );
                    this.IsConnectionExists = 1;
                  } else if (data == 1) {
                    // i++;
                    this.objclient.status = false;
                    this.clsUtility.showError(
                      "FTP connection established but folder not found."
                    );
                    this.IsConnectionExists = 1;
                  } else if (data == 2) {
                    this.clsUtility.showSuccess("FTP connection  established.");
                    this.IsConnectionExists = 1;
                    this.loadingFtpdetails = false;
                    // return;
                  }
                  this.loadingFtpdetails = false;
                } else {
                  // i++;
                  this.objclient.status = false;
                  this.clsUtility.showError(
                    "Unable to establish ftp connection."
                  );
                  this.IsConnectionExists = 1;
                  this.loadingFtpdetails = false;
                }
                this.api.insertActivityLog(
                  "Checkconnection for Group (Group name : " +
                    this.objclient.clientname +
                    " ,FTP code : " +
                    this.objclient.ftpcode +
                    " ,FTP name : " +
                    this.objclient.ftpname +
                    " )",
                  "Group FTP",
                  "READ"
                );
              },
              err => {
                // i++;
                this.objclient.status = false;
                this.clsUtility.showError(
                  "Unable to establish ftp connection."
                );
                this.IsConnectionExists = 1;
                this.loadingFtpdetails = false;
              }
            );
          },
          err => {
            this.clsUtility.LogError(err);
            this.loadingFtpdetails = false;
          }
        )
      );
    }
  }

  OnSaveorUpdateClicked() {
    try {
      this.disableSave = true;
      if (!this.objclient.status) {
        this.addupdateclientftp();
      } else {
        // console.log(
        //   "OnSaveorUpdateClicked : ",
        //   this.f.fcFTPPassword.value.trim()
        // );
        this.frmclient.patchValue({
          fcFTPUrl: this.f.fcFTPUrl.value
            ? this.f.fcFTPUrl.value.trim()
            : this.f.fcFTPUrl.value,
          fcFTPUsername: this.f.fcFTPUsername.value
            ? this.f.fcFTPUsername.value.trim()
            : this.f.fcFTPUsername.value,

          fcFTPPassword: this.f.fcFTPPassword.value
            ? this.f.fcFTPPassword.value.trim()
            : this.f.fcFTPPassword.value,
          fcFTPName: this.f.fcFTPName.value
            ? this.f.fcFTPName.value.trim()
            : this.f.fcFTPName.value,
          fcClient835Ftpfolder: this.f.fcClient835Ftpfolder.value
            ? this.f.fcClient835Ftpfolder.value.trim()
            : this.f.fcClient835Ftpfolder.value
          // fcClient837Ftpfolder: this.f.fcClient837Ftpfolder.value?this.f.fcClient837Ftpfolder.value.trim():this.f.fcClient837Ftpfolder.value
        });
        this.frmclient.updateValueAndValidity();
        if (!this.frmclient.valid) {
          this.disableSave = false;
          return;
        }
        this.loadingFtpdetails = true;
        var strFTPId = this.objclient.ftpid;
        var strFTPCode: string = this.objclient.ftpcode.trim();
        var strURL: string = this.objclient.ftpurl.trim();
        var strPort: string = this.objclient.ftpport.trim();
        var strUserName: string = this.objclient.ftpusername.trim();
        // console.log(
        //   "OnSaveorUpdateClicked strPassword: ",
        //   this.objclient.ftppassword.trim()
        // );
        var strPassword: string = this.clsUtility
          .encryptAES(this.objclient.ftppassword.trim())
          .toString();
        var str835FtpFolder: string = this.objclient.ftp835inboundfolder.trim();
        // var str837FtpFolder: string = this.objclient.ftp837inboundfolder.trim();

        var clsFtpdetails: Ftpmaster = new Ftpmaster();

        clsFtpdetails.ftpid = strFTPId;
        clsFtpdetails.ftpcode = strFTPCode;
        clsFtpdetails.ftpurl = strURL;
        clsFtpdetails.ftpport = strPort;
        clsFtpdetails.ftpusername = strUserName;
        clsFtpdetails.ftppassword = strPassword;
        clsFtpdetails.ftp835inboundfolder = str835FtpFolder;
        // clsFtpdetails.ftp837inboundfolder = str837FtpFolder;
        clsFtpdetails.status =
          this.objclient.status === null ? false : this.objclient.status;
        const jsonqsuite = JSON.stringify(clsFtpdetails);

        let seq = this.api.post_edi(
          "ClientInboundFTP/CheckConnection",
          clsFtpdetails
        );
        this.subscription.add(
          seq.subscribe(
            res => {
              this.coreService.CheckFtpExists(jsonqsuite).subscribe(
                (data: {}) => {
                  if (data) {
                    if (data == 0) {
                      this.makeModalDisabled = true;
                      $("#confirmationModal").modal("show");
                      this.disableSave = true;
                      this.ftpConnectionMsg =
                        "Unable to establish ftp connection.";
                      // );
                    } else if (data == 1) {
                      this.makeModalDisabled = true;
                      $("#confirmationModal").modal("show");
                      this.disableSave = true;
                      this.ftpConnectionMsg =
                        "FTP connection established but folder not found.";
                    } else if (data == 2) {
                      this.makeModalDisabled = false;
                      this.disableSave = true;
                      this.addupdateclientftp();
                    }
                    this.loadingFtpdetails = false;
                  } else {
                    this.makeModalDisabled = true;
                    $("#confirmationModal").modal("show");
                    this.disableSave = true;
                    this.ftpConnectionMsg =
                      "Unable to establish ftp connection.";
                    this.loadingFtpdetails = false;
                  }
                },
                err => {
                  this.makeModalDisabled = true;
                  $("#confirmationModal").modal("show");
                  this.disableSave = true;
                  this.ftpConnectionMsg = "Unable to establish ftp connection.";
                  this.loadingFtpdetails = false;
                }
              );
            },
            err => {
              this.clsUtility.LogError(err);
              this.loadingFtpdetails = false;
            }
          )
        );
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  onClientFtpChange(event: any) {
    // try {
    //   if (this.objclient.ftptype == "SFTP") {
    //     this.objclient.ftpport = "22";
    //   } else if (this.objclient.ftptype == "FTP") {
    //     this.objclient.ftpport = "21";
    //   }
    // } catch (error) {
    //   this.clsUtility.LogError(error);
    // }
  }
  onYes() {
    this.makeModalDisabled = false;
    this.addupdateclientftp();
  }
  onCloseConfirmationClick() {
    this.makeModalDisabled = false;
    this.disableSave = false;
    $("#confirmationModal").modal("hide");
  }
}

// var id = this._routeParams.params.subscribe(params => {
//   this.ResetComponents();
//   var id = String(params["id"]);
//   var clientid = String(params["clientid"]);
//   this.clientid = clientid;

//   if (id == "new") {
//     this.formtitle = "Add Client FTP";
//     this.buttonCaption = "Add Client FTP"
//     this.isaddmode = true;
//   }

//   else {
//     this.formtitle = "Edit Client FTP";
//     this.buttonCaption = "Update Client FTP"
//     this.isaddmode = false;
//   }

//   if (id == "new") {
//     return;
//   }
//   else {
//     this.isLoading = true;

//     let getclient: { clientid: string, ftpid: string } = {
//       clientid: id, ftpid: id
//     };
//     let seq = this.api.post('FTP/GetFTP', getclient);
//     seq
//       .subscribe(res => {
//         console.log(res);
//         this.objclient = <clsclientftp>res;
//       }, err => {
//         this.clsUtility.LogError(err);
//       });
//     this.isLoading = false;
//   }
// });

// $('#addftpModal').modal('hide');
//this._router.navigate(['clientlist']);

// this._router.navigate(
//   [
//     // NOTE: No relative-path navigation is required because we are accessing
//     // the parent's "activatedRoute" instance. As such, this will be executed
//     // as if we were doing this in the parent view component.
//     {
//       outlets: {
//         modal: null
//       }
//     }
//   ],
//   {
//     relativeTo: this._routeParams.parent // <--- PARENT activated route.
//   }
// );
