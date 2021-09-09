import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecksummaryComponent } from './checksummary.component';

describe('ChecksummaryComponent', () => {
  let component: ChecksummaryComponent;
  let fixture: ComponentFixture<ChecksummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChecksummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChecksummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
