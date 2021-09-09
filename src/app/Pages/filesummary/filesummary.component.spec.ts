import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesummaryComponent } from './filesummary.component';

describe('FilesummaryComponent', () => {
  let component: FilesummaryComponent;
  let fixture: ComponentFixture<FilesummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
