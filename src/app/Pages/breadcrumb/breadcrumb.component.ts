import { Component, OnInit } from '@angular/core';
import { BreadcrumbService } from 'src/app/Services/breadcrumb.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {

  constructor(public breadcrumbsvr: BreadcrumbService) { }

  ngOnInit() {
  }

}
