import { Component, OnInit } from "@angular/core";
import { Utility } from "src/app/Model/utility";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-notfound",
  templateUrl: "./notfound.component.html",
  styleUrls: ["./notfound.component.css"]
})
export class NotfoundComponent implements OnInit {
  private clsUtility: Utility;

  constructor(private toastr: ToastrService) {
    this.clsUtility = new Utility(toastr);
  }

  ngOnInit() {
    try {
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }
}
