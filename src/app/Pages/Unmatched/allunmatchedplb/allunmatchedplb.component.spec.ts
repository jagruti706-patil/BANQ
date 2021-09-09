import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllunmatchedplbComponent } from './allunmatchedplb.component';

describe('AllunmatchedplbComponent', () => {
  let component: AllunmatchedplbComponent;
  let fixture: ComponentFixture<AllunmatchedplbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllunmatchedplbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllunmatchedplbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
