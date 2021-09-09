import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddemailconfigurationComponent } from './addemailconfiguration.component';

describe('AddemailconfigurationComponent', () => {
  let component: AddemailconfigurationComponent;
  let fixture: ComponentFixture<AddemailconfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddemailconfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddemailconfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
