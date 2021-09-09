import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeFileSummaryComponent } from './practice-file-summary.component';

describe('PracticeFileSummaryComponent', () => {
  let component: PracticeFileSummaryComponent;
  let fixture: ComponentFixture<PracticeFileSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PracticeFileSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeFileSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
