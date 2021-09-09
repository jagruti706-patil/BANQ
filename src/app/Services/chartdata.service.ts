import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ChartdataService {
  constructor() {}

  getChartData(): any {
    return [
      {
        clientid: 259,
        clientname: "Michigan Healthcare Professionals",
        payments: [
          {
            paymentyear: "2010",
            paymentyearsum: 7602.4,
            paymentmonthlydistribution:
              "225,540,480,900,710,760.8,943,642,190,348,813,1050.6"
          },
          {
            paymentyear: "2016",
            paymentyearsum: 10500.93,
            paymentmonthlydistribution:
              "980,650,142,842,684.54,269.8,1832.5,691,974.54,1358,1243,833.55"
          },
          {
            paymentyear: "2018",
            paymentyearsum: 9913.24,
            paymentmonthlydistribution:
              "972,648,625,1428.3,364,647,512.45,1238.4,1010.5,823,798.59,846"
          }
        ],
        subclient: [
          {
            subclientcode: "THG4S3",
            subclientname: "Oakland Family Practice",
            splitparameter: "TLC",
            payments: [
              {
                paymentyear: "2010",
                paymentyearsum: 4331.4,
                paymentmonthlydistribution:
                  "100,240,300,700,355,380.4,943,300,100,150,313,450"
              },
              {
                paymentyear: "2016",
                paymentyearsum: 5971.94,
                paymentmonthlydistribution:
                  "400,340,60,300,320.54,169.4,632,460,640,850,1000,800"
              },
              {
                paymentyear: "2018",
                paymentyearsum: 4741.93,
                paymentmonthlydistribution:
                  "400, 310, 200, 800.6, 0, 284, 280.1, 821, 409, 420, 350.23, 467"
              }
            ]
          },
          {
            subclientcode: "THG4S7",
            subclientname:
              "Millennium Medical Group West - Long Term Care of Michigan",
            splitparameter: "TNH",
            payments: [
              {
                paymentyear: "2010",
                paymentyearsum: 3271,
                paymentmonthlydistribution:
                  "125,300,180,200,355,380,0,342,90,198,500,600.6"
              },
              {
                paymentyear: "2016",
                paymentyearsum: 4528.99,
                paymentmonthlydistribution:
                  "580,310,82,542,364,100.4,1200.5,231,334.54,508,243,33.55"
              },
              {
                paymentyear: "2018",
                paymentyearsum: 5171.31,
                paymentmonthlydistribution:
                  "572, 338, 425, 627.7, 364, 363, 232.35, 417.4, 601.5, 403, 448.36, 379"
              }
            ]
          }
        ]
      }
    ];
  }

  getAllCardsData(): any {
    return [
      {
        clientid: 0,
        totalfiles: 2514,
        totalcheck: 2315,
        totalpaidamt: "$25141.15",
        totaladjsamt: "$12251.25",
        totalpatrespamt: "$8215.35"
      },
      {
        clientid: 252,
        totalfiles: 1015,
        totalcheck: 980,
        totalpaidamt: "$10251.65",
        totaladjsamt: "$6812.81",
        totalpatrespamt: "$5123.15"
      },
      {
        clientid: 259,
        totalfiles: 1499,
        totalcheck: 1335,
        totalpaidamt: "$14889.50",
        totaladjsamt: "$5438.44",
        totalpatrespamt: "$3002.20"
      }
    ];
  }

  getSubclientCardsData(): any {
    return [
      {
        clientid: 259,
        subclientcode: "THG4S3",
        totalfiles: 815,
        totalcheck: 1425,
        totalpaidamt: "$8451.84",
        totaladjsamt: "$1580.15",
        totalpatrespamt: "$1847.00"
      },
      {
        clientid: 259,
        subclientcode: "THG4S7",
        totalfiles: 684,
        totalcheck: 890,
        totalpaidamt: "$6437.66",
        totaladjsamt: "$3858.29",
        totalpatrespamt: "$1155.20"
      }
    ];
  }
}
