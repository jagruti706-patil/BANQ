import { clsPermission } from "./../../Services/settings/clspermission";
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { AllConfigurationService } from "src/app/Services/all-configuration.service";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "subsink";
import { Utility } from "src/app/Model/utility";

@Component({
  selector: "app-configuration",
  templateUrl: "./configuration.component.html",
  styleUrls: ["./configuration.component.css"]
})
export class ConfigurationComponent implements OnInit, OnDestroy {
  toggleme: boolean = true;
  clsPermission: clsPermission;
  private clsUtility: Utility;
  private subscription = new SubSink();
  constructor(
    private dataService: DatatransaferService,
    private allConfigService: AllConfigurationService,
    private toastr: ToastrService
  ) {
    this.clsUtility = new Utility(toastr);
  }

  ngOnInit() {
    try {
      this.subscription.add(
        this.allConfigService.toggleSidebar.subscribe(isToggle => {
          this.toggleme = isToggle;
        })
      );

      this.subscription.add(
        this.dataService.newpermission.subscribe(
          value => (this.clsPermission = value)
        )
      );
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  ngOnDestroy() {
    this.allConfigService.toggleSidebar.next(true);
    this.subscription.unsubscribe();
  }
}
