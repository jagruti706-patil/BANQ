import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckwiseeobreportComponent } from './checkwiseeobreport.component';

describe('CheckwiseeobreportComponent', () => {
  let component: CheckwiseeobreportComponent;
  let fixture: ComponentFixture<CheckwiseeobreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CheckwiseeobreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckwiseeobreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
