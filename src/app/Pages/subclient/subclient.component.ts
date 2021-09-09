import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { MasterdataService } from "src/app/Services/masterdata.service";
import { SplitParameter } from "src/app/Model/split-parameter";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-subclient",
  templateUrl: "./subclient.component.html",
  styleUrls: ["./subclient.component.css"]
})
export class SubclientComponent implements OnInit {
  private clsUtility: Utility;

  SubClientContactGroup = this.fb.group({
    fcSubClientName: ["client ", Validators.required],
    fcSubContactName: ["Fernando L. Walker ", Validators.required],
    fcSubContactEmail: ["abc@pqr.com", [Validators.required, Validators.email]],
    fcSubContactPhone: [
      "1234567891",
      [Validators.required, Validators.pattern("^[0-9]*$")]
    ],
    fcSubClientStatus: [false, Validators.required],
    fcSplitParameterName: ["", Validators.required],
    fcSplitParameterValue: ["", Validators.required],
    fcFTPUrl: ["", Validators.required],
    fcFTPPort: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
    fcFTPUsername: ["", Validators.required],
    fcFTPPassword: ["", [Validators.required, Validators.minLength(6)]],
    fcFTPName: ["", Validators.required],
    fcFTPType: ["FTP", Validators.required],
    fcFTPStatus: [null, Validators.required]
  });
  // SubClientSplitGroup = this.fb.group({
  //   fcSplitParameterName: ['', Validators.required],
  //   fcSplitParameterValue: ['', Validators.required],
  // });
  // SubClientFTPGroup = this.fb.group({
  //   fcFTPUrl: ['', Validators.required],
  //   fcFTPPort: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
  //   fcFTPUsername: ['', Validators.required],
  //   fcFTPPassword: ['', [Validators.required, Validators.minLength(6)]],
  //   fcFTPName: ['', Validators.required],
  //   fcFTPType: ['FTP', Validators.required],
  //   fcFTPStatus: [null, Validators.required],
  // });
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
  // get ParameterName() {
  //   return this.SubClientSplitGroup.get('fcSplitParameterName');
  // }
  // get ParameterValue() {
  //   return this.SubClientSplitGroup.get('fcSplitParameterValue');
  // }
  // get FTPUrl() {
  //   return this.SubClientFTPGroup.get('fcFTPUrl');
  // }
  // get FTPPort() {
  //   return this.SubClientFTPGroup.get('fcFTPPort');
  // }
  // get FTPUsername() {
  //   return this.SubClientFTPGroup.get('fcFTPUsername');
  // }
  // get FTPPassword() {
  //   return this.SubClientFTPGroup.get('fcFTPPassword');
  // }
  // get FTPName() {
  //   return this.SubClientFTPGroup.get('fcFTPName');
  // }
  // get FTPType() {
  //   return this.SubClientFTPGroup.get('fcFTPType');
  // }
  // get FTPStatus() {
  //   return this.SubClientFTPGroup.get('fcFTPStatus');
  // }
  get ParameterName() {
    return this.SubClientContactGroup.get("fcSplitParameterName");
  }
  get ParameterValue() {
    return this.SubClientContactGroup.get("fcSplitParameterValue");
  }
  get FTPUrl() {
    return this.SubClientContactGroup.get("fcFTPUrl");
  }
  get FTPPort() {
    return this.SubClientContactGroup.get("fcFTPPort");
  }
  get FTPUsername() {
    return this.SubClientContactGroup.get("fcFTPUsername");
  }
  get FTPPassword() {
    return this.SubClientContactGroup.get("fcFTPPassword");
  }
  get FTPName() {
    return this.SubClientContactGroup.get("fcFTPName");
  }
  get FTPType() {
    return this.SubClientContactGroup.get("fcFTPType");
  }
  get FTPStatus() {
    return this.SubClientContactGroup.get("fcFTPStatus");
  }
  public mask: string = "(999) 000-0000";
  public arrSplitParameter: {};
  clsSplitParameter: SplitParameter;
  public arrFTPType: Array<string> = ["FTP", "SFTP"];
  constructor(
    private fb: FormBuilder,
    private masterData: MasterdataService,
    private toastr: ToastrService
  ) {
    this.clsUtility = new Utility(toastr);
    this.clsSplitParameter = new SplitParameter();
  }

  ngOnInit() {
    try {
      this.statusChanged();
      this.FetchSplitValue();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  FetchSplitValue() {
    try {
      this.masterData
        .getSplitParameter(this.clsSplitParameter)
        .subscribe((data: {}) => {
          this.arrSplitParameter = data;
          // console.log(this.arrSplitParameter);
        });
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  onSplitParameterChange($event: any) {
    try {
      //alert($event);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  // OnChange($event){
  //   alert("Hi");
  // }
  statusChanged() {
    try {
      if (this.FTPStatus.value === null) {
      } else {
        if (this.FTPStatus.value) {
          document.getElementById("lblFTPStatus").innerHTML = "Active";
        } else {
          document.getElementById("lblFTPStatus").innerHTML = "Inactive";
        }
      }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  validateSubClient() {
    try {
      alert(JSON.stringify(this.SubClientContactGroup.value));
      //   // return true;
      //   alert('in validateSubClient');
      //   this.SubClientSplitGroup.statusChanges.subscribe(status => {
      //     alert('Form validation status: '+ status);
      //  });
      //   alert('this.SubClientContactGroup.valid: '+this.SubClientContactGroup.valid);
      //   alert('this.SubClientSplitGroup.valid: '+this.SubClientSplitGroup.valid);
      //   alert(JSON.stringify(this.SubClientSplitGroup.value));
      //   alert('this.SubClientFTPGroup.valid: '+this.SubClientFTPGroup.valid);

      if (this.SubClientContactGroup.valid) {
        return true;
      } else {
        return false;
      }
      return true;
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
