import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllUnmatchedclaimsComponent } from './all-unmatchedclaims.component';

describe('AllUnmatchedclaimsComponent', () => {
  let component: AllUnmatchedclaimsComponent;
  let fixture: ComponentFixture<AllUnmatchedclaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllUnmatchedclaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllUnmatchedclaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
