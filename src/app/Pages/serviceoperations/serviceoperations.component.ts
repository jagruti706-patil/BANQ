import { Api } from "src/app/Services/api";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { ConfigurationService } from "src/app/Services/configuration.service";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../node_modules/subsink";
import { CoreauthService } from "../../Services/coreauth.service";
import * as moment from "moment";
import { MailSend } from "../Configurations/emailconfiguration/clsemail";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { isNullOrUndefined } from "util";
import { FormBuilder, Validators } from "@angular/forms";

@Component({
  selector: "app-serviceoperations",
  templateUrl: "./serviceoperations.component.html",
  styleUrls: ["./serviceoperations.component.css"]
})
export class ServiceoperationsComponent implements OnInit, OnDestroy {
  public QBANQEDIServiceStatus;
  public QBANQEDIValidateFile;
  public Q835ParserServiceStatus;
  public Q835RivenServiceStatus;
  index = 0;
  ParserServiceStatus: number;
  isParserServiceStarted = false;
  isBANQEDIServiceStarted = false;
  isStartButtonDisabled = true;
  isStopButtonDisabled = true;

  isValidateONButton = true;
  isValidateOFFButton = true;
  isValidateONButtonDisabled = true;
  isValidateOFFButtonDisabled = true;

  isRivenServiceStarted = false;
  private clsUtility: Utility;
  private subscription = new SubSink();
  public IsStopClicked: boolean = false;

  result: any = [];
  resultarray: any = [];
  public currentusername: string = "";

  public sSelectInterval: number;

  frmtimer = this.fb.group({
    fcinterval: ["", [Validators.pattern('[0-9]*')]]   
  });

  get fbcinterval() {
    return this.frmtimer.get("fcinterval");
  }
  
  constructor(
    public api: Api,
    private configService: ConfigurationService,
    private toastr: ToastrService,
    private authService: CoreauthService,
    public dataService: DatatransaferService,
    private fb: FormBuilder
  ) {
    this.clsUtility = new Utility(toastr);
  }

  ngOnInit() {
    try {
      this.currentusername = this.dataService.loginName["_value"];
      this.GetBANQEDIServiceStatus();
      this.GetBANQValidateFileStatus();
      this.GetTimeIntervalDetails();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  GetBANQEDIServiceStatus() {
    try {
      this.subscription.add(
        this.configService.getQBANQEdiServiceStatus().subscribe(
          data => {
            this.setBANQEDIStatus(data);
            if (!isNullOrUndefined(data)) {
              if (data == 0 && this.IsStopClicked) {
                this.api.insertActivityLog(
                  "EDI Service Stopped",
                  "Service Controller",
                  "STOP"
                );
                this.getMailConfigurationByTitle("EDI service stop");
              }
            }
            this.IsStopClicked = false;
          },
          err => {}
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  setBANQEDIStatus(data: number): any {
    try {
      this.ParserServiceStatus = data;
      switch (data) {
        case 0:
          this.QBANQEDIServiceStatus = "EDI service is stopped";
          this.isBANQEDIServiceStarted = false;
          this.isStartButtonDisabled = false;
          this.isStopButtonDisabled = true;
          break;
        case 1:
          this.QBANQEDIServiceStatus = "EDI service started";
          this.isBANQEDIServiceStarted = true;
          this.isStartButtonDisabled = true;
          this.isStopButtonDisabled = false;
          break;
        case 2:
          this.QBANQEDIServiceStatus = "EDI service running";
          this.isBANQEDIServiceStarted = true;
          this.isStartButtonDisabled = true;
          this.isStopButtonDisabled = false;
          break;
        case 3:
          this.QBANQEDIServiceStatus = "EDI files parsing is in progress";
          this.isBANQEDIServiceStarted = true;
          this.isStartButtonDisabled = true;
          this.isStopButtonDisabled = false;
          break;
        case 4:
          this.QBANQEDIServiceStatus =
            "Service will stop after pending EDI file process is completed";
          this.isBANQEDIServiceStarted = true;
          this.isStartButtonDisabled = true;
          this.isStopButtonDisabled = true;
          break;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onStartService(serviceName: string) {
    try {
      this.isStartButtonDisabled = true;
      this.isStopButtonDisabled = false;
      switch (serviceName.toLowerCase()) {
        case "banqedi":
          this.BanqEDIServiceStatusChanged(1);
          break;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  BanqEDIServiceStatusChanged(status: number): any {
    try {
      this.subscription.add(
        this.configService.postBANQEdiServiceStatus(status).subscribe(
          data => {
            if (status == 1) {
              this.api.insertActivityLog(
                "EDI Service Started",
                "Service Controller",
                "START"
              );
              this.getMailConfigurationByTitle("EDI service start");
            }
            this.GetBANQEDIServiceStatus();
          },
          err => {}
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onStopService(serviceName: string) {
    try {
      this.IsStopClicked = true;
      this.isStartButtonDisabled = false;
      this.isStopButtonDisabled = true;
      switch (serviceName.toLowerCase()) {
        case "banqedi":
          this.BanqEDIServiceStatusChanged(0);
          break;
      }
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

  getMailConfigurationByTitle(Title: String) {
    var date = moment(new Date()).format("MM/DD/YYYY h:mm:ss a z");
    var objMailSend = new MailSend();

    let seq = this.api.get_email("EmailConfigurationByTitle/" + Title);
    seq.subscribe(res => {
      let response = res;
      if (response != null && response != undefined) {
        this.resultarray = response["content"];

        if (this.resultarray != null || this.resultarray != undefined) {
          this.result = this.resultarray[0];
          objMailSend.FromEmail = this.result.emailfrom.toString();
          objMailSend.FromPassword = "";

          if (
            this.result.emailsubject == null ||
            this.result.emailsubject == undefined ||
            this.result.emailbody == null ||
            this.result.emailbody == undefined
          ) {
            this.clsUtility.showError(
              "Email Configuration not proper. Please contact system administrator."
            );
            return;
          } else {
            objMailSend.Subject = this.result.emailsubject.replace(
              "{{date}}",
              date
            );
            objMailSend.Body = this.result.emailbody.replace("{{date}}", date);
            objMailSend.Body = objMailSend.Body.replace(
              "{{username}}",
              this.currentusername
            );
            objMailSend.Body = objMailSend.Body.replace("{{timeinterval}}", this.sSelectInterval.toString());
          }

          if (
            this.result.emailtoreceive != null ||
            this.result.emailtoreceive != undefined
          ) {
            objMailSend.To = this.result.emailtoreceive
              .toString()
              .replace(/,/g, ";");
          }
          if (
            this.result.emailccreceive != null ||
            this.result.emailccreceive != undefined
          ) {
            objMailSend.Cc = this.result.emailccreceive
              .toString()
              .replace(/,/g, ";");
          }

          this.subscription.add(
            this.authService.sendMail(objMailSend).subscribe(
              response => {
                this.clsUtility.showSuccess(response.status);
              },
              err => {
                this.clsUtility.showError("Error in mail send");
              }
            )
          );
        } else {
          this.clsUtility.showInfo(
            "Title '" + Title + "' is not registered in email configuration."
          );
        }
      }
    });
  }

  GetBANQValidateFileStatus() {
    try {
      this.subscription.add(
        this.configService.getQBANQEdiValidateFileStatus().subscribe(
          data => {
            if (data != null && data != undefined) {
              if (data.toString().toLowerCase() == "true") {
                this.QBANQEDIValidateFile = "File will be validated";
                this.isValidateONButtonDisabled = true;
                this.isValidateOFFButtonDisabled = false;
                this.isValidateONButton = false;
                this.isValidateOFFButton = true;
              } else {
                this.QBANQEDIValidateFile = "File will not be validated";
                this.isValidateONButtonDisabled = false;
                this.isValidateOFFButtonDisabled = true;
                this.isValidateONButton = true;
                this.isValidateOFFButton = false;
              }
            }
          },
          err => {}
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onBANQValidateSetStatus(Status: string) {
    try {
      let bisValidate: boolean = false;
      if (Status.toString().toLowerCase() == "true") {
        bisValidate = true;
        this.isValidateONButton = false;
        this.isValidateOFFButton = true;
      } else {
        bisValidate = false;
        this.isValidateONButton = true;
        this.isValidateOFFButton = false;
      }
      let UpdateValidatestatus: { biserafilevalidate: boolean } = {
        biserafilevalidate: bisValidate
      };
      this.subscription.add(
        this.configService
          .postBANQEdiValidateFileStatus(UpdateValidatestatus)
          .subscribe(
            data => {
              if (data != null && data != undefined) {
                if (data == 1) {
                  this.GetBANQValidateFileStatus();
                }
              }
              if (bisValidate) {
                this.api.insertActivityLog(
                  "Validate EDI Files Active",
                  "Service Controller",
                  "ACTIVATE"
                );
              } else if (!bisValidate) {
                this.api.insertActivityLog(
                  "Validate ED Files inactive",
                  "Service Controller",
                  "DEACTIVATE"
                );
              }
            },
            err => {}
          )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  GetTimeIntervalDetails(): any {
    try {
      this.subscription.add(
        this.configService.GetTimeInterval().subscribe(
          data => {
              if(data != undefined && data != null){
                if(<number>data == 0){
                  this.sSelectInterval = 60;
                } else {
                  this.sSelectInterval = <number>data;
                }                
              } else {
                this.sSelectInterval = 60;
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
 
  SetTimeIntervalDetails(): any {
    try {
      if(this.sSelectInterval > 0 ){
        this.subscription.add(
          this.configService.SetTimeInterval(this.sSelectInterval).subscribe(
            data => {
                if(data != undefined && data != null){
                  if(<number>data == 0){
                    this.clsUtility.showError("Error to set Time Interval");
                  } else {
                    this.clsUtility.showSuccess("Time Interval set successfully");
                    this.api.insertActivityLog(
                      "Time Interval set to " + this.sSelectInterval + " minutes", 
                      "Service Controller",
                      "READ"
                    );
                    this.getMailConfigurationByTitle("EDI service time interval");
                  }                
                } else {
                  this.clsUtility.showError("Error to set Time Interval");
                }          
              },
            err => {
              this.clsUtility.LogError(err);
            }
          )
        );
      } else {
        this.clsUtility.showError("Time Interval value should be greater than 0");
      }      
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
