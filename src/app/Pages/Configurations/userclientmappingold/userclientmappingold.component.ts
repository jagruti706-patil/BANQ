// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-userclientmappingold',
//   templateUrl: './userclientmappingold.component.html',
//   styleUrls: ['./userclientmappingold.component.css']
// })
// export class UserclientmappingoldComponent implements OnInit {

//   constructor() { }

//   ngOnInit() {
//   }

// }

import { CoreoperationsService } from 'src/app/Services/coreoperations.service';
import { CoreauthService } from 'src/app/Services/coreauth.service';
import { DatatransaferService } from "src/app/Services/datatransafer.service";
import { log } from 'util';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { SubSink } from "../../../../../node_modules/subsink";
import { Utility } from "src/app/Model/utility";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { SortDescriptor, orderBy } from '@progress/kendo-data-query';
import { GridDataResult, PageChangeEvent, SelectableSettings, RowArgs } from '@progress/kendo-angular-grid';
import { DatePipe } from "@angular/common";
import { Api } from './../../../Services/api';
import { AllConfigurationService } from 'src/app/Services/all-configuration.service';
declare var $: any;

@Component({
  selector: 'app-userclientmappingold',
  templateUrl: './userclientmappingold.component.html',
  styleUrls: ['./userclientmappingold.component.css']
})
export class UserclientmappingoldComponent implements OnInit {
  public mode = 'multiple';

  loginGCPUserID: string = "";
  type: number = 0;
  selectedClient: any;
  frmgroup: FormGroup;
  frmclient: FormGroup;
  public loading: boolean = false;
  private clsUtility: Utility;
  private subscription = new SubSink();
  public groupList: any;
  public clientList: any = [];
  public subClientList: any = [];
  public copygroupList: any;
  public userlist: any;
  public flag: any = false;
  public gridView: GridDataResult;
  public pageSize: number = 10;
  public skip = 0;
  public pagenumber: number = 0;
  public sort: SortDescriptor[] = [{
    field: 'firstname',
    dir: 'asc'
  }];
  public mySelectionKey(context: RowArgs): string {
    return context.dataItem.ProductName + ' ' + context.index;
  }
  public mySelection: any[] = [];
  public selectableSettings: SelectableSettings = {
    enabled: true
  };
  toggleme: any;

  public defaultItem: { groupdescription: string, groupid: number, groupname: string } = { groupname: "Select Group...", groupid: null, groupdescription: "" };

  constructor(
    fb: FormBuilder,
    private coreService: CoreauthService,
    private coreOperationservice: CoreoperationsService,
    private datatransfer: DatatransaferService,
    private route: ActivatedRoute,
    public api: Api,
    private router: Router, private toastr: ToastrService,
    private allConfigService: AllConfigurationService
  ) {
    this.frmgroup = fb.group({
      currentvalue: ['']
    });

    this.frmclient = fb.group({
      clientid: ['', Validators.required],
      subclientcode: ['']
    });
  }


  public selectedCallback = (args) => args.dataItem;

  ngOnInit() {

    this.datatransfer.loginGCPUserID.subscribe(data => { this.loginGCPUserID = data; });
    this.getGroupList();

    this.allConfigService.toggleSidebar.subscribe((isToggle) => {
      this.toggleme = isToggle;
    })
  }
  togglesidebar() {
    this.allConfigService.toggleSidebar.next(!this.toggleme);
  }
  getGroupList() {
    this.coreService.getGroupList().subscribe(data => {
      this.groupList = data['content'];
      this.copygroupList = this.groupList.slice();
    }, err => {
      this.clsUtility.LogError(err);
    });
  }


  getClientlist() {
    this.loading = true;
    let getclient: { clientid: string, clientstatus: boolean } = {
      clientid: "0", clientstatus: true
    };
    let seq = this.api.post('GetClient', getclient);
    seq
      .subscribe(res => {
        this.clientList = res;
        if(this.clientList != null && this.clientList != undefined && this.clientList.length > 0 ){
          this.loading = false;
        } else {
          this.clientList = [];
          this.loading = false;
        }        
      }, err => {
        this.loading = false;
        this.clsUtility.LogError(err);
      });
  }

  getsubClientlist(clientid: any) {
    let getsubclient: { clientid: string, subclientcode: string } = {
      clientid: clientid, subclientcode: ""
    };
    let seq = this.api.post('SubClient/GetSubClient', getsubclient);
    seq
      .subscribe(res => {
        this.subClientList = res
        if(this.subClientList != null && this.subClientList != undefined && this.subClientList.length > 0 ){
        } else {
          this.subClientList = [];        
        }    
      }, err => {
        this.clsUtility.LogError(err);
      })
  }


  mapselecteduser() {
    let client = "";
    let subclient = "";
    if (this.frmclient.controls.clientid.value == undefined || this.frmclient.controls.clientid.value == "") {
      client = "0";
    }
    else {
      client = this.frmclient.controls.clientid.value;
    }

    if (this.frmclient.controls.subclientcode.value == undefined || this.frmclient.controls.subclientcode.value == "") {
      subclient = "0";
    }
    else {
      subclient = this.frmclient.controls.subclientcode.value;
    }


    const datepipe = new DatePipe("en-US");
    const currentDate = datepipe.transform(
      Date.now(),
      "yyyy-MM-ddTHH:mm:ss.SSSZ"
    );

    let arrUsers = {
      userclientmapping: []
    };

    for (var i in this.mySelection) {
      var item = this.mySelection[i];

      arrUsers.userclientmapping.push({
        "userid": this.mySelection[i].userid,
        "firstname": this.mySelection[i].firstname,
        "lastname": this.mySelection[i].lastname,
        "username": this.mySelection[i].email,
        "clientid": Number(client),
        "subclientcode": subclient,
        "createdon": currentDate,
        "createdby": this.loginGCPUserID
      });
    }

    let seq = this.api.post('UserClientMapping/Save', arrUsers);
    seq
      .subscribe(data => {
        if (data != null && data != undefined) {
          if (data == 1) {
            if (this.clientList != null && this.clientList != undefined) {
              if (this.clientList.length > 0) {
                let filterResult: any = this.clientList.filter(s => s.clientid.toString() == client.toString());
                if (filterResult.length > 0) {
                  this.api.insertActivityLog("User Client Mapping Added for Client (" + filterResult[0].clientname + ")"  + (subclient.toString() == '0' ? "" : ", Sub Client (" + subclient +")") + ""  , "User Client Mapping", "ADD");
                }
              }
            }
          }
        }
      }, err => {
        this.clsUtility.LogError(err);
      })
    this.toastr.info("Mapping Added!");
    this.mySelection = [];
    this.pageSize = 10;
    this.skip = 0;
    this.pagenumber = 0;
    this.loadItems();
  }


  cmbsubclientchange() {
   
  }

  cmbclientchange() {
    this.frmclient.controls['subclientcode'].setValue('');
    if (this.frmclient.controls.clientid.value == undefined || this.frmclient.controls.clientid.value == "") {
    }
    else {
      this.getsubClientlist(this.frmclient.controls.clientid.value)
    }
  }

  handleFilter(value) {
    this.copygroupList = this.groupList.filter((s) => s.groupname.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }

  open() {
  }

  getGroupUser() {
    this.mySelection = [];
    this.userlist = [];
    //this.gridView = [];
    if (this.frmgroup.controls.currentvalue.value == null || this.frmgroup.controls.currentvalue.value == "") {
      this.toastr.warning("Please Select Group");
    }
    else {
      this.getgroupwiseuser(this.frmgroup.controls.currentvalue.value);
    }
  }

  getselected() {
    this.frmclient.reset({
      clientid: '', subclientcode: ''
    });
    //this.clientList = [];
    this.getClientlist();
    this.subClientList = [];
    $('#clientmodal').modal('show');
  }

  getgroupwiseuser(groupID) {
    //userlist
    this.loading = true;
    this.coreService.getgroupwiseuser(groupID).subscribe(data => {
      this.userlist = data;
      if (this.userlist != null || this.userlist != undefined) {
        if (this.userlist.length == 0) {
          this.toastr.info("No user present in group")
        }
      }
      this.loadItems();
      this.loading = false;
    }, err => {
      this.loading = false;
      this.clsUtility.LogError(err);
    });

  }

  private loadItems(): void {
    try {
      this.gridView = {
        data: orderBy(
          this.userlist.slice(
            this.skip,
            this.skip + this.pageSize
          ),
          this.sort
        ),
        total: this.userlist.length
      };
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public pageChange(event: PageChangeEvent): void {
    try {
      this.skip = event.skip;
      this.loadItems();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  public sortChange(event: any): void {

  }

}

