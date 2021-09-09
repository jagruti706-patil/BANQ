import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
// import { ChartOptions, ChartDataSets } from "chart.js";
import { ChartdataService } from "src/app/Services/chartdata.service";
// import { forEach } from "@angular/router/src/utils/collection";
// import { Color, BaseChartDirective, Label } from "ng2-charts";
import { CurrencyPipe } from "@angular/common";
// import * as pluginAnnotations from "chartjs-plugin-annotation";
import { Utility } from "src/app/Model/utility";
import { Api } from "./../../Services/api";
import { SubSink } from "subsink";
import { DatatransaferService } from "src/app/Services/datatransafer.service";

@Component({
  selector: "app-summarydashboard",
  templateUrl: "./summarydashboard.component.html",
  styleUrls: ["./summarydashboard.component.css"]
})
export class SummarydashboardComponent implements OnInit, OnDestroy {
  // public revenueChartData: ChartDataSets[] = [
  //   {
  //     data: [6144.15, 6540.06, 5434.53, 2826.4, 7255.97],
  //     label: "Paid",
  //     fill: false
  //   },
  //   {
  //     data: [1506.75, 1850.15, 1108.25, 1256.6, 1213.99],
  //     label: "Adjustment",
  //     fill: false
  //   },
  //   {
  //     data: [1024.25, 1590.01, 1185.75, 1814.4, 5152.66],
  //     label: "Patient Responsibility",
  //     fill: false
  //   }
  // ];
  // public denialChartData: ChartDataSets[] = [
  //   {
  //     data: [1524.25, 1390.01, 1485.75, 1814.4, 1652.66],
  //     label: "Denial Amount",
  //     fill: false
  //   }
  // ];
  // public lineChartLabels: Label[] = [
  //   "January",
  //   "February",
  //   "March",
  //   "April",
  //   "May"
  // ];
  // public lineChartOptions: ChartOptions & { annotation: any } = {
  //   responsive: true,
  //   tooltips: {
  //     mode: "index",
  //     intersect: false
  //   },
  //   scales: {
  //     xAxes: [
  //       {
  //         display: true,
  //         gridLines: {
  //           display: false
  //         },
  //         scaleLabel: {
  //           display: true,
  //           labelString: "Month"
  //         }
  //       }
  //     ],
  //     yAxes: [
  //       {
  //         display: true,
  //         gridLines: {
  //           display: false
  //         },
  //         scaleLabel: {
  //           display: true,
  //           labelString: "$"
  //         }
  //       }
  //     ]
  //   },
  //   annotation: {
  //     annotations: [
  //       {
  //         type: "line",
  //         mode: "vertical",
  //         scaleID: "x-axis-0",
  //         value: "March",
  //         borderColor: "orange",
  //         borderWidth: 2,
  //         label: {
  //           enabled: true,
  //           fontColor: "orange",
  //           content: "LineAnno"
  //         }
  //       }
  //     ]
  //   }
  // };
  // public lineChartColors: Color[] = [
  //   {
  //     // grey
  //     borderColor: "green"
  //   },
  //   {
  //     // dark grey
  //     borderColor: "red"
  //   },
  //   {
  //     // red
  //     borderColor: "blue"
  //   }
  // ];

  // public lineChartLegend = false;
  // public lineChartType = "line";
  // public lineChartPlugins = [pluginAnnotations];

  // @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  public tilesummary: any;
  public loading: boolean = false;
  // public comboloading: boolean = false;

  private clsUtility: Utility;
  // public piechartdata: any;
  // public piepaid: any;
  // public pieadjust: any;
  // public piedenial: any;
  // public datapiepaid = [];
  // public datapieadjustment = [];
  // public datapiedenial = [];
  // public combochartdata: any;
  // public combopaid: any;
  // public comboseries: any;
  // public combofinaldata = [];
  // public pieChartDataPayment: any;
  // public pieChartDataAdjustment: any;
  // public pieChartDataDenial: any;
  // public mixtop10: any;
  // public cmb_data: any;
  // public cmb_paid: any;
  // public cmb_denial: any;
  // public cmb_adjust: any;
  // public new_paid = [];
  // public new_denial = [];
  // public new_adjust = [];

  // public new_bar = [];
  // public new_series = [];
  // public barPadding = 10;

  // view: any[] = [1200, 600];
  // showXAxis = true;
  // showYAxis = true;
  // gradient = false;
  // showLegend = true;
  // legendTitle = "Legend";
  // legendPosition = "right";
  // showXAxisLabel = true;
  // xAxisLabel = "Division";
  // showYAxisLabel = false;
  // yAxisLabel = "Paid";
  // showGridLines = true;
  // innerPadding = "10%";
  // animations: boolean = true;
  // barChart: any[] = barChart;
  // lineChartSeries: any[] = lineChartSeries;

  // lineChartScheme = {
  //   name: "coolthree",
  //   selectable: true,
  //   group: "Ordinal",
  //   domain: ["#01579b", "#7aa3e5", "#a8385d", "#00bfa5"]
  // };

  // comboBarScheme = {
  //   name: "singleLightBlue",
  //   selectable: true,
  //   group: "Ordinal",
  //   domain: ["#01579b"]
  // };

  // showRightYAxisLabel: boolean = true;
  // yAxisLabelRight: string = "Utilization";

  // yLeftTickFormat: any;
  // yRightTickFormat: any;
  // yLeftAxisScale: any;
  // yRightAxisScale: any;

  constructor(
    // private chartService: ChartdataService,
    public api: Api,
    private dataService: DatatransaferService
  ) {}
  // lineChart: ChartDataSets[];
  // lineDataset: ChartDataSets[];
  // @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  public subscription = new SubSink();
  showSystemAdminCards: boolean = false;
  ngOnInit() {
    try {
      // this.view = [window.innerWidth - 300, 400];
      this.api.insertActivityLog("Summary Viewed", "Summary", "READ");
      //Permission session Start
      this.subscription.add(
        this.dataService.newpermission.subscribe(data => {
          if (data != null || data != undefined) {
            this.showSystemAdminCards = data.summarysystemadmincards;
          }
        })
      );

      //Permission session End
      if (this.showSystemAdminCards) {
        this.getsummaryfortiles();
      }
      // this.getpiechartdata();
      // this.getclientdivisonsummary();
    } catch (error) {
      this.clsUtility.LogError(error);
    }
  }

  getsummaryfortiles() {
    this.loading = true;
    try {
      let seq = this.api.get_edi("api/Dashboard/getDashboardSummary");
      this.subscription.add(
        seq.subscribe(
          res => {
            this.tilesummary = res;
            this.loading = false;
          },
          err => {
            this.loading = false;
            this.clsUtility.LogError(err);
          }
        )
      );
    } catch (error) {
      this.loading = false;
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
  // getpiechartdata() {
  //   this.datapiepaid = [];
  //   this.datapieadjustment = [];
  //   this.datapiedenial = [];

  //   this.loading = true;
  //   try {
  //     let getdata: {
  //       paymentdistribution: boolean;
  //       adjustmentdistribution: boolean;
  //       denialdistribution: boolean;
  //     } = {
  //       paymentdistribution: true,
  //       adjustmentdistribution: true,
  //       denialdistribution: true
  //     };
  //     let seq = this.api.post_edi(
  //       "api/Dashboard/getClientDistributionSummary ",
  //       getdata
  //     );
  //     seq.subscribe(
  //       res => {
  //         this.loading = false;
  //         if (res != undefined && res != null) {
  //           this.piechartdata = res;

  //           this.piepaid = this.piechartdata.paymentditribution;
  //           this.datapiepaid.push(["Paid Distribution", "Top Division"]);
  //           for (var i in this.piepaid) {
  //             this.datapiepaid.push(Object.values(this.piepaid[i]));
  //           }
  //           this.pieChartDataPayment = {
  //             chartType: "PieChart",
  //             dataTable: this.datapiepaid,
  //             options: {
  //               is3D: true,
  //               //height:400,
  //               //legend: 'bottom'
  //               legend: { position: "right", maxLines: 10 },
  //               chartArea: { left: 5, top: 5, width: "100%", height: "100%" }
  //               //title: 'Tasks',
  //               //colors: ['#1862c6','#DEE4E8','#3a84eb'],
  //             }
  //           };

  //           this.pieadjust = this.piechartdata.adjustmentditribution;
  //           this.datapieadjustment.push([
  //             "Adjustment Distribution",
  //             "Top Division"
  //           ]);
  //           for (var i in this.pieadjust) {
  //             this.datapieadjustment.push(Object.values(this.pieadjust[i]));
  //           }

  //           this.pieChartDataAdjustment = {
  //             chartType: "PieChart",
  //             dataTable: this.datapieadjustment,
  //             options: {
  //               is3D: false,
  //               //height:400,
  //               //legend: 'bottom'
  //               legend: { position: "right", maxLines: 10 },
  //               chartArea: { left: 5, top: 5, width: "100%", height: "100%" }
  //               //title: 'Tasks',
  //               // , colors: ['#1862c6', '#DEE4E8', '#3a84eb', 'red', 'green'],
  //             }
  //           };

  //           this.piedenial = this.piechartdata.denialdistribution;
  //           this.datapiedenial.push(["Payment Denial", "Top Division"]);
  //           for (var i in this.piedenial) {
  //             this.datapiedenial.push(Object.values(this.piedenial[i]));
  //           }

  //           this.pieChartDataDenial = {
  //             chartType: "PieChart",
  //             dataTable: this.datapiedenial,
  //             options: {
  //               is3D: true,
  //               //height:400,
  //               //legend: 'bottom'
  //               legend: { position: "right", maxLines: 10 },
  //               chartArea: { left: 5, top: 5, width: "100%", height: "100%" }
  //               //title: 'Tasks',
  //               // , colors: ['#1862c6', '#DEE4E8', '#3a84eb', 'red', 'green'],
  //             }
  //           };
  //         }
  //       },
  //       err => {
  //         this.loading = false;
  //         this.clsUtility.LogError(err);
  //       }
  //     );
  //   } catch (error) {
  //     this.loading = false;
  //     this.clsUtility.LogError(error);
  //   }
  // }

  // getclientdivisonsummary() {
  //   try {
  //     this.comboloading = true;
  //     let seq = this.api.get_edi("api/Dashboard/getClientDivisionSummary");
  //     seq.subscribe(
  //       res => {
  //         this.combochartdata = res;
  //         this.cmb_data = res;
  //         this.cmb_paid = this.cmb_data.paymentditribution;
  //         this.cmb_denial = this.cmb_data.denialdistribution;
  //         this.cmb_adjust = this.cmb_data.adjustmentditribution;
  //         this.combopaid = this.combochartdata.paymentditribution;
  //         this.comboseries = this.combochartdata.adjustmentditribution;
  //         this.combofinaldata.push(["Month", "Paid", "Adjustment"]);

  //         for (var i in this.combopaid) {
  //           var ogobj = Object.values(this.combopaid[i]);
  //           let filterResult: any = this.comboseries.filter(
  //             s => s.clientname == this.combopaid[i].clientname
  //           );
  //           if (filterResult.length > 0) {
  //             ogobj.push(filterResult[0].totaladjustmentamount);
  //           } else {
  //             ogobj.push(0);
  //           }
  //           this.combofinaldata.push(ogobj);
  //         }

  //         this.mixtop10 = {
  //           chartType: "ComboChart",
  //           //dataTable: [["Month", "Paid", "Adjustment"], ["Triarq Health Alliance", 10640.25, 0], ["Heather N. Key", 192.18, 3204], ["Walter J. Gomez", 192.18, 3204], ["Michigan Healthcare ", 146.42, 0]],
  //           dataTable: this.combofinaldata,
  //           options: {
  //             legend: { position: "right", maxLines: 10 },
  //             //  title : 'Monthly Coffee Production by Country',
  //             colors: ["orange", "#DEE4E8", "#3a84eb"],
  //             //vAxis: {title: 'Cups'},
  //             //hAxis: {title: 'Month'},
  //             seriesType: "bars",
  //             series: { 5: { type: "line" } }
  //           }
  //         };

  //         //// Formatting Data for ngx-Combo Chart

  //         // changed json key text
  //         for (var i in this.cmb_paid) {
  //           var objpaid = this.cmb_paid[i];
  //           objpaid.name = objpaid.clientname;
  //           objpaid.value = objpaid.claimpaidamount;
  //           delete objpaid.clientname;
  //           delete objpaid.claimpaidamount;
  //           this.new_paid.push(objpaid);
  //         }

  //         // changed json key text
  //         for (var i in this.cmb_denial) {
  //           var objdenial = this.cmb_denial[i];
  //           objdenial.name = objdenial.clientname;
  //           objdenial.value = objdenial.totaldenialamount;
  //           delete objdenial.clientname;
  //           delete objdenial.claimpaidamount;
  //           this.new_denial.push(objdenial);
  //         }

  //         // changed json key text
  //         for (var i in this.cmb_adjust) {
  //           var objadjust = this.cmb_adjust[i];
  //           objadjust.name = objadjust.clientname;
  //           objadjust.value = objadjust.totaladjustmentamount;
  //           delete objadjust.clientname;
  //           delete objadjust.claimpaidamount;
  //           this.new_adjust.push(objadjust);
  //         }

  //         this.new_bar = this.new_paid;

  //         if (this.new_bar != undefined && this.new_bar != null) {
  //           if (this.new_bar.length <= 2) {
  //             this.barPadding = 400;
  //           } else if (this.new_bar.length <= 3) {
  //             this.barPadding = 200;
  //           } else if (this.new_bar.length <= 4) {
  //             this.barPadding = 150;
  //           } else {
  //             this.barPadding = 10;
  //           }
  //         }

  //         let arrUsers2 = {
  //           series: [],
  //           name: ""
  //         };
  //         let arrUsers3 = {
  //           series: [],
  //           name: ""
  //         };

  //         // let mainobject = [];
  //         for (var i in this.cmb_denial) {
  //           var item = this.cmb_denial[i];
  //           arrUsers2.name = "Denial";
  //           arrUsers2.series.push({
  //             name: this.cmb_denial[i].name,
  //             value: this.cmb_denial[i].totaldenialamount
  //           });
  //         }
  //         this.new_series.push(arrUsers2);

  //         for (var i in this.cmb_adjust) {
  //           var item = this.cmb_adjust[i];
  //           arrUsers3.name = "Adjustment";
  //           arrUsers3.series.push({
  //             name: this.cmb_adjust[i].name,
  //             value: this.cmb_adjust[i].totaladjustmentamount
  //           });
  //         }

  //         this.new_series.push(arrUsers3);
  //         // console.log(JSON.stringify(this.new_bar));
  //         // console.log(JSON.stringify(this.new_series));
  //         this.comboloading = false;
  //       },
  //       err => {
  //         this.comboloading = false;
  //         this.clsUtility.LogError(err);
  //       }
  //     );
  //   } catch (error) {
  //     this.loading = false;
  //     this.comboloading = false;
  //     this.clsUtility.LogError(error);
  //   }
  // }

  // fetchChartdata() {
  //   var data: [];
  //   data = this.chartService.getAllCardsData();
  //   for (const client in data) {
  //   }
  // }
}

// export let barChart = [
//   {
//     name: "Oakland Family",
//     value: 3689620
//   },
//   {
//     name: "Downriver Oncology",
//     value: 2233626
//   },
//   {
//     name: "Womens Health",
//     value: 1498419
//   },
//   {
//     name: "Health",
//     value: 1498419
//   }
// ];

// export let lineChartSeries: any = [
//   {
//     name: "Paid",
//     series: [
//       {
//         name: "Oakland Family",
//         value: 3689620
//       },
//       {
//         value: 2233626,
//         name: "Downriver Oncology"
//       },
//       {
//         value: 1498419,
//         name: "Womens Health"
//       },
//       {
//         value: 22626,
//         name: "Health"
//       }
//     ]
//   },
//   {
//     name: "Adjustment",
//     series: [
//       {
//         value: 662500,
//         name: "Oakland Family"
//       },
//       {
//         value: 610464,
//         name: "Downriver Oncology"
//       },
//       {
//         value: 278545,
//         name: "Womens Health"
//       },
//       {
//         value: 352626,
//         name: "Health"
//       }
//     ]
//   }
// ];

// export let colorSets = [
//   {
//     name: "vivid",
//     selectable: true,
//     group: "Ordinal",
//     domain: [
//       "#647c8a",
//       "#3f51b5",
//       "#2196f3",
//       "#00b862",
//       "#afdf0a",
//       "#a7b61a",
//       "#f3e562",
//       "#ff9800",
//       "#ff5722",
//       "#ff4514"
//     ]
//   },
//   {
//     name: "natural",
//     selectable: true,
//     group: "Ordinal",
//     domain: [
//       "#bf9d76",
//       "#e99450",
//       "#d89f59",
//       "#f2dfa7",
//       "#a5d7c6",
//       "#7794b1",
//       "#afafaf",
//       "#707160",
//       "#ba9383",
//       "#d9d5c3"
//     ]
//   },
//   {
//     name: "cool",
//     selectable: true,
//     group: "Ordinal",
//     domain: [
//       "#a8385d",
//       "#7aa3e5",
//       "#a27ea8",
//       "#aae3f5",
//       "#adcded",
//       "#a95963",
//       "#8796c0",
//       "#7ed3ed",
//       "#50abcc",
//       "#ad6886"
//     ]
//   },
//   {
//     name: "fire",
//     selectable: true,
//     group: "Ordinal",
//     domain: [
//       "#ff3d00",
//       "#bf360c",
//       "#ff8f00",
//       "#ff6f00",
//       "#ff5722",
//       "#e65100",
//       "#ffca28",
//       "#ffab00"
//     ]
//   },
//   {
//     name: "solar",
//     selectable: true,
//     group: "Continuous",
//     domain: [
//       "#fff8e1",
//       "#ffecb3",
//       "#ffe082",
//       "#ffd54f",
//       "#ffca28",
//       "#ffc107",
//       "#ffb300",
//       "#ffa000",
//       "#ff8f00",
//       "#ff6f00"
//     ]
//   },
//   {
//     name: "air",
//     selectable: true,
//     group: "Continuous",
//     domain: [
//       "#e1f5fe",
//       "#b3e5fc",
//       "#81d4fa",
//       "#4fc3f7",
//       "#29b6f6",
//       "#03a9f4",
//       "#039be5",
//       "#0288d1",
//       "#0277bd",
//       "#01579b"
//     ]
//   },
//   {
//     name: "aqua",
//     selectable: true,
//     group: "Continuous",
//     domain: [
//       "#e0f7fa",
//       "#b2ebf2",
//       "#80deea",
//       "#4dd0e1",
//       "#26c6da",
//       "#00bcd4",
//       "#00acc1",
//       "#0097a7",
//       "#00838f",
//       "#006064"
//     ]
//   },
//   {
//     name: "flame",
//     selectable: false,
//     group: "Ordinal",
//     domain: [
//       "#A10A28",
//       "#D3342D",
//       "#EF6D49",
//       "#FAAD67",
//       "#FDDE90",
//       "#DBED91",
//       "#A9D770",
//       "#6CBA67",
//       "#2C9653",
//       "#146738"
//     ]
//   },
//   {
//     name: "ocean",
//     selectable: false,
//     group: "Ordinal",
//     domain: [
//       "#1D68FB",
//       "#33C0FC",
//       "#4AFFFE",
//       "#AFFFFF",
//       "#FFFC63",
//       "#FDBD2D",
//       "#FC8A25",
//       "#FA4F1E",
//       "#FA141B",
//       "#BA38D1"
//     ]
//   },
//   {
//     name: "forest",
//     selectable: false,
//     group: "Ordinal",
//     domain: [
//       "#55C22D",
//       "#C1F33D",
//       "#3CC099",
//       "#AFFFFF",
//       "#8CFC9D",
//       "#76CFFA",
//       "#BA60FB",
//       "#EE6490",
//       "#C42A1C",
//       "#FC9F32"
//     ]
//   },
//   {
//     name: "horizon",
//     selectable: false,
//     group: "Ordinal",
//     domain: [
//       "#2597FB",
//       "#65EBFD",
//       "#99FDD0",
//       "#FCEE4B",
//       "#FEFCFA",
//       "#FDD6E3",
//       "#FCB1A8",
//       "#EF6F7B",
//       "#CB96E8",
//       "#EFDEE0"
//     ]
//   },
//   {
//     name: "neons",
//     selectable: false,
//     group: "Ordinal",
//     domain: [
//       "#FF3333",
//       "#FF33FF",
//       "#CC33FF",
//       "#0000FF",
//       "#33CCFF",
//       "#33FFFF",
//       "#33FF66",
//       "#CCFF33",
//       "#FFCC00",
//       "#FF6600"
//     ]
//   },
//   {
//     name: "picnic",
//     selectable: false,
//     group: "Ordinal",
//     domain: [
//       "#FAC51D",
//       "#66BD6D",
//       "#FAA026",
//       "#29BB9C",
//       "#E96B56",
//       "#55ACD2",
//       "#B7332F",
//       "#2C83C9",
//       "#9166B8",
//       "#92E7E8"
//     ]
//   },
//   {
//     name: "night",
//     selectable: false,
//     group: "Ordinal",
//     domain: [
//       "#2B1B5A",
//       "#501356",
//       "#183356",
//       "#28203F",
//       "#391B3C",
//       "#1E2B3C",
//       "#120634",
//       "#2D0432",
//       "#051932",
//       "#453080",
//       "#75267D",
//       "#2C507D",
//       "#4B3880",
//       "#752F7D",
//       "#35547D"
//     ]
//   },
//   {
//     name: "nightLights",
//     selectable: false,
//     group: "Ordinal",
//     domain: [
//       "#4e31a5",
//       "#9c25a7",
//       "#3065ab",
//       "#57468b",
//       "#904497",
//       "#46648b",
//       "#32118d",
//       "#a00fb3",
//       "#1052a2",
//       "#6e51bd",
//       "#b63cc3",
//       "#6c97cb",
//       "#8671c1",
//       "#b455be",
//       "#7496c3"
//     ]
//   }
// ];
