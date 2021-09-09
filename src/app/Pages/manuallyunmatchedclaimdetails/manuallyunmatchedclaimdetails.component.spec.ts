import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManuallyunmatchedclaimdetailsComponent } from './manuallyunmatchedclaimdetails.component';

describe('ManuallyunmatchedclaimdetailsComponent', () => {
  let component: ManuallyunmatchedclaimdetailsComponent;
  let fixture: ComponentFixture<ManuallyunmatchedclaimdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManuallyunmatchedclaimdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManuallyunmatchedclaimdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
