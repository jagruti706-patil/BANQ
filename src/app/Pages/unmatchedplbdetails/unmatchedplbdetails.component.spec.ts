import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnmatchedplbdetailsComponent } from './unmatchedplbdetails.component';

describe('UnmatchedplbdetailsComponent', () => {
  let component: UnmatchedplbdetailsComponent;
  let fixture: ComponentFixture<UnmatchedplbdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnmatchedplbdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnmatchedplbdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
