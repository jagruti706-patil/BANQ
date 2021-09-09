import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSideBarComponent } from './file-side-bar.component';

describe('FileSideBarComponent', () => {
  let component: FileSideBarComponent;
  let fixture: ComponentFixture<FileSideBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileSideBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
