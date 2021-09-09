import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtpmasterComponent } from './ftpmaster.component';

describe('FtpmasterComponent', () => {
  let component: FtpmasterComponent;
  let fixture: ComponentFixture<FtpmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtpmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtpmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
