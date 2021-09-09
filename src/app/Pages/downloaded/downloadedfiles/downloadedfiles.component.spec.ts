import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadedfilesComponent } from './downloadedfiles.component';

describe('DownloadedfilesComponent', () => {
  let component: DownloadedfilesComponent;
  let fixture: ComponentFixture<DownloadedfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownloadedfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownloadedfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
