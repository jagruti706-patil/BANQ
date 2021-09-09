import { Component, OnInit, OnDestroy } from "@angular/core";
import { Api } from "../../../Services/api";
import { clsemail, MailInput, MailSave, MailSend } from "./clsemail";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router } from "@angular/router";
import { CoreauthService } from "../../../Services/coreauth.service";
import { SubSink } from "../../../../../node_modules/subsink";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { BehaviorSubject, Observable } from "rxjs";
import * as moment from "moment";
import { retry, map } from "rxjs/operators";
import { DatePipe } from "@angular/common";
import { isNullOrUndefined } from "util";

@Component({
  selector: "app-addemailconfiguration",
  templateUrl: "./addemailconfiguration.component.html",
  styleUrls: ["./addemailconfiguration.component.css"]
})
export class AddemailconfigurationComponent implements OnInit, OnDestroy {
  private clsUtility: Utility;
  frmemail: FormGroup;
  formtitle: string = "Add Email Configuration";
  buttonCaption: string = "Save";
  isaddmode: boolean = true;
  objemail = new clsemail();
  objemailsave = new MailSave();
  emaclient: any;
  result: any = [];
  userslist: any = [];
  globaluserslist: any = [];
  toggleme: boolean = false;
  private subscription = new SubSink();
  public emailtousersarray: any = [];
  public emailccusersarray: any = [];
  saveresult: any = [];
  updateresult: any = [];
  public currentuserid: string = "0";
  public currentusername: string = "";
  public EmailItems: any = [];
  public EmailResponse: any[] = [];
  public globalemailfrom: string = "noreply@triarqhealth.com";
  emailPattern = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  private originalEmailConfigurationdetails: any;

  constructor(
    public api: Api,
    private toaster: ToastrService,
    fb: FormBuilder,
    private _routeParams: ActivatedRoute,
    private authService: CoreauthService,
    private allConfigService: AllConfigurationService,
    private _router: Router,
    public dataService: DatatransaferService,
    public datepipe: DatePipe
  ) {
    this.clsUtility = new Utility(toaster);

    this.frmemail = fb.group({
      fcTitle: ["", [Validators.required, this.noWhitespaceValidator]],
      fcTo: ["", Validators.required],
      fcCC: [""],
      // fcemailfrom: ["", [Validators.required, this.noWhitespaceValidator]],
      // fcfrompassword: ["", [Validators.required, this.noWhitespaceValidator]],
      fcsubject: ["", [Validators.required, this.noWhitespaceValidator]],
      fcbody: ["", [Validators.required, this.noWhitespaceValidatorbody]]
    });
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.allConfigService.toggleSidebar.subscribe(isToggle => {
          this.toggleme = isToggle;
        })
      );

      this.currentuserid = this.dataService.SelectedUserid;
      this.currentusername = this.dataService.loginName["_value"];

      this.getuserslist();

      var id;
      this._routeParams.params.subscribe(params => {
        id = String(params["id"]);

        if (id == "new") {
          this.formtitle = "Add Email Configuration";
          this.buttonCaption = "Save";
          this.isaddmode = true;
        } else {
          this.formtitle = "Edit Email Configuration";
          this.buttonCaption = "Save";
          this.isaddmode = false;
        }
      });

      if (id == "new") {
      } else {
        this.getEmailConfigurationById(id);
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
  public fcToValueNormalizer = (email$: Observable<string>) =>
    email$.pipe(
      map((email: string) => {
        //search for matching item to avoid duplicates

        //search in values
        const matchingValue: any = this.objemail.emailtoreceive.find(
          (item: any) => {
            return item["email"].toLowerCase() === email.toLowerCase();
          }
        );

        if (matchingValue) {
          return matchingValue; //return the already selected matching value and the component will remove it
        }

        //search in data
        const matchingItem: any = this.userslist.find((item: any) => {
          return item["email"].toLowerCase() === email.toLowerCase();
        });

        if (matchingItem) {
          return matchingItem;
        } else {
          if (this.emailPattern.test(email)) {
            return {
              email: email, //generate unique value for the custom item
              userid: ""
            };
          } else {
            this.clsUtility.showError("Please enter valid email address");
            return null;
          }
        }
      })
    );

  public fcCCValueNormalizer = (email$: Observable<string>) =>
    email$.pipe(
      map((email: string) => {
        //search for matching item to avoid duplicates

        //search in values
        const matchingValue: any = this.objemail.emailccreceive.find(
          (item: any) => {
            return item["email"].toLowerCase() === email.toLowerCase();
          }
        );

        if (matchingValue) {
          return matchingValue; //return the already selected matching value and the component will remove it
        }

        //search in data
        const matchingItem: any = this.userslist.find((item: any) => {
          return item["email"].toLowerCase() === email.toLowerCase();
        });

        if (matchingItem) {
          return matchingItem;
        } else {
          if (this.emailPattern.test(email)) {
            return {
              email: email, //generate unique value for the custom item
              userid: ""
            };
          } else {
            this.clsUtility.showError("Please enter valid email address");
            return null;
          }
        }
      })
    );

  getEmailConfigurationById(id: any) {
    try {
      let para: { configid: Number } = {
        configid: id
      };

      let seq = this.api.post_email("EmailConfiguration/10/0", para);
      this.subscription.add(
        seq.subscribe(res => {
          this.EmailResponse = res;
          if (this.EmailResponse != null) {
            this.originalEmailConfigurationdetails = null;
            this.originalEmailConfigurationdetails = {
              ...this.EmailResponse["content"][0]
            };
            this.EmailItems = this.EmailResponse["content"];
            if (this.EmailItems != null && this.EmailItems != undefined) {
              let emailArray = [];
              this.EmailItems[0].emailtoreceive.forEach(element => {
                let json = { email: element };
                emailArray.push(json);
              });
              this.EmailItems[0].emailtoreceive = emailArray;
              emailArray = [];
              this.EmailItems[0].emailccreceive.forEach(element => {
                let json = { email: element };
                emailArray.push(json);
              });
              this.EmailItems[0].emailccreceive = emailArray;
              this.objemail = <clsemail>this.EmailItems[0];
              this.objemail.emailfrom = this.globalemailfrom;
              // this.objemail.frompassword = this.clsUtility
              // .decryptAES(this.globalfrompassword)
              // .toString();
            } else {
              this.objemail = null;
            }
          }
        })
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  saveMailConfiguration() {
    try {
      this.emailccusersarray = [];
      this.emailtousersarray = [];

      if (
        this.objemail.emailccreceive != null &&
        this.objemail.emailccreceive != undefined
      ) {
        if (!this.validateEmails(this.objemail.emailtoreceive)) {
          this.clsUtility.showError('Invalid email address in "To" field');
          return;
        }
        if (!this.validateEmails(this.objemail.emailccreceive)) {
          this.clsUtility.showError('Invalid email address in "Cc" field');
          return;
        }
        if (this.objemail.emailccreceive.length > 0) {
          // for (let i of this.objemail.emailccreceive) {
          //   let data = this.userslist.find(x => x.email === i);
          //   var ccemail: MailInput = new MailInput();
          //   ccemail.Id = data.userid;
          //   ccemail.Email = data.email;
          //   this.emailccusersarray.push(ccemail);
          //   this.objemail.emailcc = this.emailccusersarray;
          // }
          let emailArray: any = this.objemail.emailccreceive;
          for (let i = 0; i < emailArray.length; i++) {
            let emailObj = this.userslist.find(
              x => x.email === emailArray[i].email
            );
            var ccemail: MailInput = new MailInput();
            if (emailObj) {
              ccemail.Id = emailObj.userid;
            } else {
              ccemail.Id = null;
            }
            ccemail.Email = emailArray[i].email;
            this.emailccusersarray.push(ccemail);
            this.objemail.emailcc = this.emailccusersarray;
          }
        } else {
          this.objemail.emailcc = this.emailccusersarray;
        }
      } else {
        this.objemail.emailcc = this.emailccusersarray;
      }

      if (
        this.objemail.emailtoreceive != null &&
        this.objemail.emailtoreceive != undefined
      ) {
        if (this.objemail.emailtoreceive.length > 0) {
          // for (let i of this.objemail.emailtoreceive) {
          //   let data = this.userslist.find(x => x.email === i);
          //   var toemail: MailInput = new MailInput();
          //   toemail.Id = data.userid;
          //   toemail.Email = data.email;
          //   this.emailtousersarray.push(toemail);
          //   this.objemail.emailto = this.emailtousersarray;
          // }
          let emailArray: any = this.objemail.emailtoreceive;
          for (let i = 0; i < emailArray.length; i++) {
            let emailObj = this.userslist.find(
              x => x.email === emailArray[i].email
            );
            var toemail: MailInput = new MailInput();
            if (emailObj) {
              toemail.Id = emailObj.userid;
            } else {
              toemail.Id = null;
            }
            toemail.Email = emailArray[i].email;
            this.emailtousersarray.push(toemail);
            this.objemail.emailto = this.emailtousersarray;
          }
        } else {
          this.objemail.emailto = this.emailtousersarray;
        }
      } else {
        this.objemail.emailto = this.emailtousersarray;
      }

      if (
        this.objemail.title.trim() != "" &&
        // this.objemail.emailfrom.trim() != "" &&
        // this.objemail.frompassword.trim() != "" &&
        this.objemail.emailsubject.trim() != "" &&
        this.objemail.emailbody.replace(/<[^>]*>/g, "").trim() != ""
      ) {
        if (this.isaddmode == false && this.objemail.configid) {
          //Update Emaiil config details
          if (this.objemail != null && this.objemail != undefined) {
            this.objemailsave.configid = this.objemail.configid;
            this.objemailsave.title = this.objemail.title.trim();
            this.objemailsave.emailfrom = this.objemail.emailfrom.trim();
            this.objemailsave.frompassword = this.objemail.frompassword;
            // this.objemailsave.frompassword = this.clsUtility
            //   .encryptAES(this.objemail.frompassword.trim())
            //   .toString();
            this.objemailsave.emailto = this.objemail.emailto;
            this.objemailsave.emailcc = this.objemail.emailcc;
            this.objemailsave.userid = this.currentuserid;
            this.objemailsave.username = this.currentusername;

            const currentDate = this.datepipe.transform(
              Date.now(),
              "yyyy-MM-ddTHH:mm:ss.SSSZ"
            );
            // this.objemailsave.createdon = currentDate;
            this.objemailsave.modifiedon = currentDate;

            this.objemailsave.emailsubject = this.objemail.emailsubject.trim();
            this.objemailsave.emailbody = this.objemail.emailbody.trim();

            //#region "Get Modified Items of Email"

            let oemailobj = JSON.parse(JSON.stringify(this.objemailsave));
            let oldemailconfigurationitems = {};
            let ModifiedEmailConfigurationItems = "";

            console.log(this.originalEmailConfigurationdetails);
            console.log(oemailobj);

            let changedemailconfigurationitems: any = this.clsUtility.jsondiff(
              this.originalEmailConfigurationdetails,
              oemailobj
            );

            console.log(changedemailconfigurationitems);

            if (
              !isNullOrUndefined(changedemailconfigurationitems) &&
              changedemailconfigurationitems != {}
            ) {
              if (changedemailconfigurationitems.hasOwnProperty("modifiedon")) {
                delete changedemailconfigurationitems.modifiedon;
              }

              for (
                let emailtoreceiveindex = 0;
                emailtoreceiveindex <
                Object.keys(
                  this.originalEmailConfigurationdetails["emailtoreceive"]
                ).length;
                emailtoreceiveindex++
              ) {
                for (let emailtokey of Object.keys(
                  changedemailconfigurationitems["emailto"]
                )) {
                  let emailtoindex = changedemailconfigurationitems[
                    "emailto"
                  ].findIndex(
                    x =>
                      x.Email ==
                      this.originalEmailConfigurationdetails["emailtoreceive"][
                        emailtoreceiveindex
                      ]
                  );

                  if (emailtoindex >= 0) {
                    changedemailconfigurationitems["emailto"].splice(
                      emailtoindex,
                      1
                    );
                  }
                }
              }

              for (
                let emailccreceiveindex = 0;
                emailccreceiveindex <
                Object.keys(
                  this.originalEmailConfigurationdetails["emailccreceive"]
                ).length;
                emailccreceiveindex++
              ) {
                for (let emailcckey of Object.keys(
                  changedemailconfigurationitems["emailcc"]
                )) {
                  let emailccindex = changedemailconfigurationitems[
                    "emailcc"
                  ].findIndex(
                    x =>
                      x.Email ==
                      this.originalEmailConfigurationdetails["emailccreceive"][
                        emailccreceiveindex
                      ]
                  );

                  if (emailccindex >= 0) {
                    changedemailconfigurationitems["emailcc"].splice(
                      emailccindex,
                      1
                    );
                  }
                }
              }

              // if (
              //   changedemailconfigurationitems.hasOwnProperty("emailto") &&
              //   (isNullOrUndefined(changedemailconfigurationitems["emailto"]) ||
              //     JSON.stringify(changedemailconfigurationitems["emailto"]) ==
              //       "[]" ||
              //     JSON.stringify(changedemailconfigurationitems["emailto"]) ==
              //       "[null]")
              // ) {
              //   delete changedemailconfigurationitems["emailto"];
              //   delete changedemailconfigurationitems["emailtoreceive"];
              // }

              // if (
              //   changedemailconfigurationitems.hasOwnProperty("emailcc") &&
              //   (isNullOrUndefined(changedemailconfigurationitems["emailcc"]) ||
              //     JSON.stringify(changedemailconfigurationitems["emailcc"]) ==
              //       "[]" ||
              //     JSON.stringify(changedemailconfigurationitems["emailcc"]) ==
              //       "[null]")
              // ) {
              //   delete changedemailconfigurationitems["emailcc"];
              //   delete changedemailconfigurationitems["emailccreceive"];
              // }

              for (let key of Object.keys(changedemailconfigurationitems)) {
                let oldvalue: string = this.originalEmailConfigurationdetails[
                  key
                ];
                oldemailconfigurationitems[key] = oldvalue;
              }
              if (
                !isNullOrUndefined(changedemailconfigurationitems) &&
                JSON.stringify(changedemailconfigurationitems) != "{}"
              ) {
                ModifiedEmailConfigurationItems =
                  "OLD : " +
                  JSON.stringify(oldemailconfigurationitems) +
                  ",NEW : " +
                  JSON.stringify(changedemailconfigurationitems);
              }
            }

            console.log(ModifiedEmailConfigurationItems);

            //#endregion "Get Modified Items of Email"

            let seq = this.api.put_email(
              "EmailConfiguration/Update",
              this.objemailsave
            );
            this.subscription.add(
              seq.subscribe(res => {
                this.updateresult = res;
                if (
                  this.updateresult != undefined &&
                  this.updateresult != null
                ) {
                  if (this.updateresult == 1) {
                    this.clsUtility.showSuccess(
                      "Email configuration updated successfully."
                    );

                    this.api.insertActivityLog(
                      "Updated Email Configuration for Title : " +
                        this.objemailsave.title,
                      "Email configuration",
                      "UPDATE"
                    );

                    this._router.navigate([
                      "/Configuration/emailconfigurationlist"
                    ]);
                  } else if (this.updateresult == 2) {
                    this.clsUtility.showError("Title already registered.");
                    // this._router.navigate([
                    //   "/Configuration/emailconfigurationlist"
                    // ]);
                  } else {
                    this.clsUtility.showError("Email configuration not saved.");
                    this._router.navigate([
                      "/Configuration/emailconfigurationlist"
                    ]);
                  }
                }
              })
            );
          }
        } else {
          //Add Emaiil config details
          if (this.objemail != null && this.objemail != undefined) {
            this.objemailsave.configid = 0;
            this.objemailsave.title = this.objemail.title.trim();
            this.objemailsave.emailfrom = this.objemail.emailfrom.trim();
            this.objemailsave.frompassword = this.objemail.frompassword;
            // this.objemailsave.emailfrom = this.objemail.emailfrom.trim();
            // this.objemailsave.frompassword = this.clsUtility
            //   .encryptAES(this.objemail.frompassword.trim())
            //   .toString();
            this.objemailsave.emailto = this.objemail.emailto;
            this.objemailsave.emailcc = this.objemail.emailcc;
            this.objemailsave.userid = this.currentuserid;
            this.objemailsave.username = this.currentusername;

            const currentDate = this.datepipe.transform(
              Date.now(),
              "yyyy-MM-ddTHH:mm:ss.SSSZ"
            );

            this.objemailsave.createdon = currentDate;
            this.objemailsave.modifiedon = currentDate;

            this.objemailsave.emailsubject = this.objemail.emailsubject.trim();
            this.objemailsave.emailbody = this.objemail.emailbody.trim();

            let seq = this.api.post_email(
              "EmailConfiguration/Save",
              this.objemailsave
            );
            this.subscription.add(
              seq.subscribe(res => {
                this.saveresult = res;
                if (this.saveresult != undefined && this.saveresult != null) {
                  if (this.saveresult == 1) {
                    this.clsUtility.showSuccess(
                      "Email configuration saved successfully."
                    );

                    this.api.insertActivityLog(
                      "Added Email Configuration for Title : " +
                        this.objemailsave.title,
                      "Email configuration",
                      "ADD"
                    );

                    this._router.navigate([
                      "/Configuration/emailconfigurationlist"
                    ]);
                  } else if (this.saveresult == 2) {
                    this.clsUtility.showError("Title already registered.");
                    // this._router.navigate([
                    //   "/Configuration/emailconfigurationlist"
                    // ]);
                  } else {
                    this.clsUtility.showError("Email configuration not saved.");
                    this._router.navigate([
                      "/Configuration/emailconfigurationlist"
                    ]);
                  }
                }
              })
            );
          }
        }
      } else {
        this.clsUtility.showError(
          "Plese enter valid details for email Configuration"
        );
        this.objemail.title =
          this.objemail.title.trim() != "" ? this.objemail.title : "";
        // this.objemail.emailfrom =
        //   this.objemail.emailfrom.trim() != "" ? this.objemail.emailfrom : "";
        // this.objemail.frompassword =
        //   this.objemail.frompassword.trim() != ""
        //     ? this.objemail.frompassword
        //     : "";
        this.objemail.emailsubject =
          this.objemail.emailsubject.trim() != ""
            ? this.objemail.emailsubject
            : "";
        this.objemail.emailbody =
          this.objemail.emailbody.replace(/<[^>]*>/g, "").trim() != ""
            ? this.objemail.emailbody
            : "";
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getuserslist() {
    try {
      this.subscription.add(
        this.authService.getAllLocalGCPUser().subscribe(data => {
          if (data != null || data != undefined) {
            this.userslist = data.filter(
              (thing, i, arr) =>
                arr.findIndex(t => t.email === thing.email) === i
            );
            this.globaluserslist = this.userslist;
          }
        })
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || "").trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  public noWhitespaceValidatorbody(control: FormControl) {
    const isWhitespace =
      (control.value || "").replace(/<[^>]*>/g, "").trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  togglesidebar() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }

  onchangeemailto(event: any) {
    try {
      this.emailtousersarray = [];
      for (let i of event) {
        let data = this.userslist.find(x => x.email === i);
        var toemail: MailInput = new MailInput();
        toemail.Id = data.userid;
        toemail.Email = data.email;
        this.emailtousersarray.push(toemail);
        this.objemail.emailto = this.emailtousersarray;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onchangeemailcc(event: any) {
    try {
      this.emailccusersarray = [];
      for (let i of event) {
        let data = this.userslist.find(x => x.email === i);
        var ccemail: MailInput = new MailInput();
        ccemail.Id = data.userid;
        ccemail.Email = data.email;
        this.emailccusersarray.push(ccemail);
        this.objemail.emailcc = this.emailccusersarray;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  sendemail() {
    try {
      var objMailSend = new MailSend();
      var date = moment(new Date()).format("MM/DD/YYYY");

      if (
        this.objemail.title.trim() != "" &&
        // this.objemail.emailfrom.trim() != "" &&
        // this.objemail.frompassword.trim() != "" &&
        this.objemail.emailsubject.trim() != "" &&
        this.objemail.emailbody.replace(/<[^>]*>/g, "").trim() != ""
      ) {
        objMailSend.FromEmail = this.objemail.emailfrom.trim();
        objMailSend.FromPassword = "";
        objMailSend.Subject = this.objemail.emailsubject
          .replace("{{date}}", date)
          .trim();
        objMailSend.Body = this.objemail.emailbody
          .replace("{{date}}", date)
          .trim();

        let emailtoreceive: any = this.objemail.emailtoreceive;
        let emailArray = [];
        emailtoreceive.forEach(item => {
          emailArray.push(item.email);
        });

        if (emailArray != null && emailArray != undefined) {
          objMailSend.To = emailArray.toString().replace(/,/g, ";");
        } else {
          objMailSend.To = "";
        }

        let emailccreceive: any = this.objemail.emailccreceive;
        emailArray = [];
        emailccreceive.forEach(item => {
          emailArray.push(item.email);
        });
        if (emailArray != null && emailArray != undefined) {
          objMailSend.Cc = emailArray.toString().replace(/,/g, ";");
        } else {
          objMailSend.Cc = "";
        }

        this.subscription.add(
          this.authService.sendMail(objMailSend).subscribe(
            response => {
              this.clsUtility.showSuccess(response.status);

              this.api.insertActivityLog(
                "Test email Send from user " +
                  objMailSend.FromEmail +
                  " for title " +
                  this.objemail.title.trim() +
                  "",
                "Email configuration",
                "SEND EMAIL"
              );
            },
            err => {
              this.clsUtility.showError("Error in mail send");
            }
          )
        );
      } else {
        this.clsUtility.showError(
          "Plese enter valid details for email configuration"
        );
        this.objemail.title =
          this.objemail.title.trim() != "" ? this.objemail.title : "";
        this.objemail.emailfrom =
          this.objemail.emailfrom.trim() != "" ? this.objemail.emailfrom : "";
        this.objemail.frompassword =
          this.objemail.frompassword.trim() != ""
            ? this.objemail.frompassword
            : "";
        this.objemail.emailsubject =
          this.objemail.emailsubject.trim() != ""
            ? this.objemail.emailsubject
            : "";
        this.objemail.emailbody =
          this.objemail.emailbody.replace(/<[^>]*>/g, "").trim() != ""
            ? this.objemail.emailbody
            : "";
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  handleFilter(value) {
    if (value != null && value != undefined) {
      this.userslist = this.globaluserslist.filter(
        s =>
          s.email.toLowerCase().indexOf(value.toLowerCase()) !== -1 ||
          s.displayname.toLowerCase().indexOf(value.toLowerCase()) !== -1
      );
    } else {
      this.userslist = this.globaluserslist;
    }
  }

  validateEmails(emailArray: any): boolean {
    let isValid = true;
    try {
      for (let i = 0; i < emailArray.length; i++) {
        if (!this.emailPattern.test(emailArray[i].email)) {
          isValid = false;
          break;
        }
      }
      return isValid;
    } catch (error) {
      this.clsUtility.LogError(error);
      return isValid;
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
