import { Component, OnInit, Input } from "@angular/core";
import { Client } from "src/app/Model/client";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-previewdetails",
  templateUrl: "./previewdetails.component.html",
  styleUrls: ["./previewdetails.component.css"]
})
export class PreviewdetailsComponent implements OnInit {
  // Received Input from registration component
  @Input() clsObject: Client;
  @Input() CallingForm: string;
  loading = true;
  clsUtility: Utility;

  constructor(private toastr: ToastrService) {
    this.clsUtility = new Utility(toastr);
  }

  ngOnInit() {
    try {
      this.loadingdelay();
      this.loading = false;
      // if (this.clsClientPreviewObject != null) {
      //   this.clsClientPreviewObject = null;
      // }
      // else {
      //   this.clsClientPreviewObject = new Client();
      //   this.clsClientPreviewObject = this.clsObject;
      // }
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  async loadingdelay() {
    try {
      await this.clsUtility.delay(5000);
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
