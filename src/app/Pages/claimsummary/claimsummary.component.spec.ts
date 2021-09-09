import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsummaryComponent } from './claimsummary.component';

describe('ClaimsummaryComponent', () => {
  let component: ClaimsummaryComponent;
  let fixture: ComponentFixture<ClaimsummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimsummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimsummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
