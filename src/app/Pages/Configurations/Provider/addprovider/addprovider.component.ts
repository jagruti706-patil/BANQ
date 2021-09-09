import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { DatePipe } from "@angular/common";
import { Providers } from "src/app/Model/Configuration/providers";
import { Utility } from "src/app/Model/utility";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../../../node_modules/subsink";
declare var $: any;

@Component({
  selector: "app-addprovider",
  templateUrl: "./addprovider.component.html",
  styleUrls: ["./addprovider.component.css"]
})
export class AddproviderComponent implements OnInit {
  public newProviders = true;
  private Providersdetail: any = [];
  public ProvidersEditid: any;
  public selectedProvidersValue: string;
  private clsProviders: Providers;
  private subscription = new SubSink();
  private clsUtility: Utility;
  public submitted = false;

  // Received Input from parent component
  @Input() InputProvidersEditid: any;

  // Send Output to parent component
  @Output() OutputProvidersEditResult = new EventEmitter<boolean>();

  OutputprovidersEditResult(data: any) {
    let outProvidersEditResult = data;
    this.OutputProvidersEditResult.emit(outProvidersEditResult);
    this;
  }

  constructor(
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private ConfigurationService: AllConfigurationService,
    private datatransfer: DatatransaferService,
    private toastr: ToastrService
  ) {
    this.clsUtility = new Utility(toastr);
  }

  ProvidersGroup = this.fb.group({
    fcProvidersCode: ["", [Validators.required, Validators.maxLength(50)]],
    fcProvidersDescription: [
      "",
      [Validators.required, Validators.maxLength(150)]
    ]
  });

  get ProvidersCode() {
    return this.ProvidersGroup.get("fcProvidersCode");
  }

  get ProvidersDescription() {
    return this.ProvidersGroup.get("fcProvidersDescription");
  }

  ngOnInit() {
    try {
      this.clsProviders = new Providers();
      if (this.InputProvidersEditid != null && this.InputProvidersEditid != 0) {
        this.newProviders = false;
        this.ProvidersEditid = this.InputProvidersEditid;
        this.getProvidersById(this.ProvidersEditid);
      } else {
        this.newProviders = true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnChanges() {
    try {
      this.clsProviders = new Providers();
      if (this.InputProvidersEditid != null && this.InputProvidersEditid != 0) {
        this.newProviders = false;
        this.ProvidersEditid = this.InputProvidersEditid;
        this.getProvidersById(this.ProvidersEditid);
      } else {
        this.newProviders = true;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateProviders() {
    try {
      if (
        this.ProvidersCode.valid &&
        this.ProvidersDescription.valid &&
        !this.clsUtility.CheckEmptyString(this.ProvidersCode.value) &&
        !this.clsUtility.CheckEmptyString(this.ProvidersDescription.value)
      ) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getProvidersById(id: number) {
    try {
      this.subscription
        .add
        // this.ConfigurationService.getActionsById(id).subscribe(data => {
        //   if (data != null || data != undefined) {
        //     this.Providersdetail = data;
        //     if (
        //       this.InputProvidersEditid != null &&
        //       this.InputProvidersEditid != 0
        //     ) {
        //       this.FillProvidersGroup();
        //     }
        //   }
        // })
        ();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  postProviders() {
    try {
      const jsonclient = JSON.stringify(this.clsProviders);
      this.subscription
        .add
        // this.ConfigurationService.saveActions(jsonclient).subscribe(
        //   (data: {}) => {
        //     if (data != null || data != undefined) {
        //       if (data == 1) {
        //         this.clsUtility.showSuccess("Action added successfully");
        //         this.OutputprovidersEditResult(true);
        //       } else if (data == 0) {
        //         this.clsUtility.showError("Action not added");
        //         this.OutputprovidersEditResult(false);
        //       } else {
        //         this.clsUtility.showInfo(
        //           "Action already registered with this description"
        //         );
        //       }
        //     }
        //   }
        // )
        ();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  updateProviders() {
    try {
      const jsonclient = JSON.stringify(this.clsProviders);
      this.subscription
        .add
        // this.ConfigurationService.updateActions(
        //   this.ProvidersEditid,
        //   jsonclient
        // ).subscribe((data: {}) => {
        //   if (data != null || data != undefined) {
        //     if (data == 1) {
        //       this.clsUtility.showSuccess("Action updated successfully");
        //       this.OutputprovidersEditResult(true);
        //     } else if (data == 0) {
        //       this.clsUtility.showError("Action not updated");
        //       this.OutputprovidersEditResult(false);
        //     } else {
        //       this.clsUtility.showInfo(
        //         "Action already registered with this description"
        //       );
        //     }
        //   }
        // })
        ();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  saveProviders() {
    try {
      this.submitted = true;
      if (this.validateProviders()) {
        let SelectedUserid = 0;
        let LoginUsername = null;
        if (this.datatransfer.SelectedGCPUserid != undefined)
          SelectedUserid = this.datatransfer.SelectedGCPUserid;

        if (this.datatransfer.loginUserName != undefined)
          LoginUsername = this.datatransfer.loginUserName;
        var strActionCode: string = this.ProvidersCode.value;
        var strActionDesc: string = this.ProvidersDescription.value;
        if (this.newProviders) {
          // this.clsProviders.nactionid = 0;
          // this.clsProviders.sactioncode = strActionCode.trim();
          // this.clsProviders.sactiondescription = strActionDesc.trim();
          // this.clsProviders.sdisplaycodedesc = strActionDesc.trim();
          // this.clsProviders.bisactive = true;
          // this.clsProviders.createdby = SelectedUserid;
          // this.clsProviders.screatedusername = LoginUsername;
          // this.clsProviders.createdon = this.clsUtility.currentDateTime();
          this.postProviders();
        } else if (
          this.Providersdetail.sactioncode != this.ProvidersCode.value ||
          this.Providersdetail.sactiondescription !=
            this.ProvidersDescription.value ||
          this.Providersdetail.createdby != SelectedUserid
        ) {
          // this.clsProviders.nactionid = this.InputProvidersEditid;
          // this.clsProviders.sactioncode = strActionCode.trim();
          // this.clsProviders.sactiondescription = strActionDesc.trim();
          // this.clsProviders.sdisplaycodedesc = strActionDesc.trim();
          // this.clsProviders.bisactive = this.Providersdetail.bisactive;
          // this.clsProviders.createdby = SelectedUserid;
          // this.clsProviders.screatedusername = LoginUsername;
          this.updateProviders();
        } else {
          this.OutputprovidersEditResult(false);
          $("#addactionsModal").modal("hide");
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FillProvidersGroup() {
    try {
      let Providers: Providers;
      Providers = this.Providersdetail;

      // this.ActionsCode.setValue(Providers.sactioncode);
      // this.ActionsDescription.setValue(Providers.sactiondescription);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  OnClose() {
    try {
      this.OutputprovidersEditResult(false);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ResetComponents() {
    try {
      this.ProvidersGroup.reset();
      this.submitted = false;
      this.InputProvidersEditid = null;
      this.clsProviders = null;
      this.subscription.unsubscribe();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
