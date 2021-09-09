import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayeridentifierComponent } from './payeridentifier.component';

describe('PayeridentifierComponent', () => {
  let component: PayeridentifierComponent;
  let fixture: ComponentFixture<PayeridentifierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayeridentifierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayeridentifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
