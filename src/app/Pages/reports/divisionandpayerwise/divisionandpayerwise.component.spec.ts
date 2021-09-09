import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DivisionandpayerwiseComponent } from './divisionandpayerwise.component';

describe('DivisionandpayerwiseComponent', () => {
  let component: DivisionandpayerwiseComponent;
  let fixture: ComponentFixture<DivisionandpayerwiseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DivisionandpayerwiseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DivisionandpayerwiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
