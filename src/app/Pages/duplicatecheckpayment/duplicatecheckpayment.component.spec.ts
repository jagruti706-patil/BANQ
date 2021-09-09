import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicatecheckpaymentComponent } from './duplicatecheckpayment.component';

describe('DuplicatecheckpaymentComponent', () => {
  let component: DuplicatecheckpaymentComponent;
  let fixture: ComponentFixture<DuplicatecheckpaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DuplicatecheckpaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicatecheckpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
