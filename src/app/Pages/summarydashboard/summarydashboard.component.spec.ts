import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarydashboardComponent } from './summarydashboard.component';

describe('SummarydashboardComponent', () => {
  let component: SummarydashboardComponent;
  let fixture: ComponentFixture<SummarydashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummarydashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummarydashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
