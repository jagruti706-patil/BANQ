import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicatecheckpaymenthistoryComponent } from './duplicatecheckpaymenthistory.component';

describe('DuplicatecheckpaymenthistoryComponent', () => {
  let component: DuplicatecheckpaymenthistoryComponent;
  let fixture: ComponentFixture<DuplicatecheckpaymenthistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicatecheckpaymenthistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicatecheckpaymenthistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
