import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnmatchedclaimdetailsComponent } from './unmatchedclaimdetails.component';

describe('UnmatchedclaimdetailsComponent', () => {
  let component: UnmatchedclaimdetailsComponent;
  let fixture: ComponentFixture<UnmatchedclaimdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnmatchedclaimdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnmatchedclaimdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
