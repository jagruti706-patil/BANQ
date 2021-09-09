import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlbsummaryComponent } from './plbsummary.component';

describe('PlbsummaryComponent', () => {
  let component: PlbsummaryComponent;
  let fixture: ComponentFixture<PlbsummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlbsummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlbsummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
