import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitfiledetailsComponent } from './splitfiledetails.component';

describe('SplitfiledetailsComponent', () => {
  let component: SplitfiledetailsComponent;
  let fixture: ComponentFixture<SplitfiledetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitfiledetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitfiledetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
