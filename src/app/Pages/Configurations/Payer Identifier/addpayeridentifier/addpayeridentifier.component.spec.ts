import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddpayeridentifierComponent } from './addpayeridentifier.component';

describe('AddpayeridentifierComponent', () => {
  let component: AddpayeridentifierComponent;
  let fixture: ComponentFixture<AddpayeridentifierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddpayeridentifierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddpayeridentifierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
