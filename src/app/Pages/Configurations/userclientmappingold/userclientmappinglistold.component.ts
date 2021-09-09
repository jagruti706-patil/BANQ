import { Component, OnInit } from '@angular/core';
import { log } from 'util';
import { GridComponent, GridDataResult, DataStateChangeEvent, PageChangeEvent, SelectableSettings, RowArgs } from '@progress/kendo-angular-grid';
import { CoreoperationsService } from 'src/app/Services/coreoperations.service';
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { Utility } from "src/app/Model/utility";
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { process, State } from '@progress/kendo-data-query';
declare var $: any;
import { Api } from './../../../Services/api';
import { AllConfigurationService } from 'src/app/Services/all-configuration.service';

@Component({
  selector: 'app-userclientmappinglistold',
  templateUrl: './userclientmappinglistold.component.html',
  styleUrls: ['./userclientmappinglistold.component.css']
})
export class UserclientmappinglistoldComponent implements OnInit {
  public loading: boolean = false;
  private clsUtility: Utility;
  public userlist: any;
  public gridView: GridDataResult;
  public pageSize: number = 10;
  public skip = 0;
  public pagenumber: number = 0;
  public deleteClientID: string = "";
  public del_client: string = "";
  public del_subclient: string = "";
  public del_email: string = "";

  public sort: SortDescriptor[] = [{
    field: 'clientname',
    dir: 'asc'
  }];

  public state: State = {
    skip: 0,
    take: 15,
  };

  public ClientDetailsInputDeleteMessage: string;
  public deletemessage: string = "";
  public ClientDetailsOutDeleteResult: boolean;
  toggleme: any;

  constructor(private coreOperationservice: CoreoperationsService,
    private route: ActivatedRoute,
    public api: Api,
    private router: Router, private toastr: ToastrService,
    private allConfigService: AllConfigurationService) {
  }

  ngOnInit() {
    this.getUserClientMapping();
    this.allConfigService.toggleSidebar.subscribe((isToggle) => {
      this.toggleme = isToggle;
    })
  }
  togglesidebar() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }

  getUserClientMapping(insertlog: boolean = true) {
    this.loading = true;
    let seq = this.api.get('UserClientMapping');
    seq
      .subscribe(data => {
        this.userlist = data;     
        
        if(this.userlist != null && this.userlist != undefined && this.userlist.length > 0){
          this.loading = false;
          this.gridView = process(this.userlist, this.state);
        } else {
          this.userlist = [];
          this.loading = false;
        }
        
        if (insertlog) {
          this.api.insertActivityLog("User Client Mapping List Viewed", "User Client Mapping", "READ");
        }
      }, err => {
        this.loading = false;
        this.clsUtility.LogError(err);
      });
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    this.gridView = process(this.userlist, this.state);
  }


  deleteConfiratmion(dataItem: any) {
    this.deleteClientID = dataItem.id;

    this.del_client = dataItem.clientname;
    this.del_subclient = dataItem.subclientcode;
    this.del_email = dataItem.username;

    this.deletemessage = "Do you want to delete user Mapping for " + dataItem.firstname + ' ' + dataItem.lastname + "?";
    $('#deletemodal').modal('show');
  }


  deleteusermapping() {
    let seq = this.api.delete('UserClientMapping/Delete/' + this.deleteClientID);
    seq
      .subscribe(data => {
        this.api.insertActivityLog("User Client Mapping Removed for Client ("+ this.del_client +") "  + (this.del_subclient == '0' ? "" : "Sub Client (" + this.del_subclient +")") + ", User ("+ this.del_email +") " , "User Client Mapping", "DELETE");
        this.getUserClientMapping(false);
      }, err => {
        this.clsUtility.LogError(err);
      });
  }

}
