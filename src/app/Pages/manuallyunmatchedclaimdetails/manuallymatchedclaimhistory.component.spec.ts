import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuallymatchedclaimhistoryComponent } from './manuallymatchedclaimhistory.component';

describe('ManuallymatchedclaimhistoryComponent', () => {
  let component: ManuallymatchedclaimhistoryComponent;
  let fixture: ComponentFixture<ManuallymatchedclaimhistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManuallymatchedclaimhistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManuallymatchedclaimhistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
