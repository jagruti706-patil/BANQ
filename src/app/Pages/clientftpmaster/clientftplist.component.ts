import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { Api } from "./../../Services/api";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
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
import {
  GridComponent,
  GridDataResult,
  DataStateChangeEvent,
  PageChangeEvent,
  SelectableSettings,
  RowArgs
} from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { process, State } from "@progress/kendo-data-query";

@Component({
  selector: "app-clientftplist",
  templateUrl: "./clientftplist.component.html",
  styleUrls: ["./clientftplist.component.css"]
})
export class ClientftplistComponent implements OnInit {
  private clsUtility: Utility;
  ftplist: any;
  public gridView: GridDataResult;
  public pageSize: number = 10;
  public skip = 0;
  public pagenumber: number = 0;
  public sort: SortDescriptor[] = [
    {
      field: "clientname",
      dir: "asc"
    }
  ];
  public state: State = {
    skip: 0,
    take: 15
  };

  constructor(
    private _router: Router,
    private _routeParams: ActivatedRoute,
    public api: Api
  ) {}

  ngOnInit() {
    this.getclientftpdetails(0);
  }

  public dataStateChange(event: any): void {}

  getclientftpdetails(id: any) {
    let getftp: { clientid: string; ftpid: number } = {
      clientid: String(id),
      ftpid: 0
    };
    let seq = this.api.post("FTP/GetFTP", getftp);
    seq.subscribe(
      res => {
        // console.log('FTP list');
        // console.log(res);
        this.ftplist = res;
        this.gridView = process(this.ftplist, this.state);
        // console.log(this.ftplist);
      },
      err => {
        this.clsUtility.LogError(err);
      }
    );
  }
}
