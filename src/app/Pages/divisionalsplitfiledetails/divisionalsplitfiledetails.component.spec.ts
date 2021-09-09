import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionalsplitfiledetailsComponent } from './divisionalsplitfiledetails.component';

describe('DivisionalsplitfiledetailsComponent', () => {
  let component: DivisionalsplitfiledetailsComponent;
  let fixture: ComponentFixture<DivisionalsplitfiledetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionalsplitfiledetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionalsplitfiledetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
