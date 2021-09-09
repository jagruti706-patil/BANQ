import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSummaryInfoComponent } from './file-summary-info.component';

describe('FileSummaryInfoComponent', () => {
  let component: FileSummaryInfoComponent;
  let fixture: ComponentFixture<FileSummaryInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileSummaryInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSummaryInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
