import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FTPPendingFilesComponent } from './ftppending-files.component';

describe('FTPPendingFilesComponent', () => {
  let component: FTPPendingFilesComponent;
  let fixture: ComponentFixture<FTPPendingFilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FTPPendingFilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FTPPendingFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
