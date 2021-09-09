import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HUBPendingFilesComponent } from './hubpending-files.component';

describe('HUBPendingFilesComponent', () => {
  let component: HUBPendingFilesComponent;
  let fixture: ComponentFixture<HUBPendingFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HUBPendingFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HUBPendingFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
