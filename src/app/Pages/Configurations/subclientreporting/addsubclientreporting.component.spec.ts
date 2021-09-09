import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddsubclientreportingComponent } from './addsubclientreporting.component';

describe('AddsubclientreportingComponent', () => {
  let component: AddsubclientreportingComponent;
  let fixture: ComponentFixture<AddsubclientreportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddsubclientreportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddsubclientreportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
