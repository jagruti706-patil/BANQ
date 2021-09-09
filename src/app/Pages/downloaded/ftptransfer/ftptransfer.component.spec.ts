import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtptransferComponent } from './ftptransfer.component';

describe('FtptransferComponent', () => {
  let component: FtptransferComponent;
  let fixture: ComponentFixture<FtptransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtptransferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtptransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
