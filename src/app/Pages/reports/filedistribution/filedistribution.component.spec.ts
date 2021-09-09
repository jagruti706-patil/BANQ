import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FiledistributionComponent } from './filedistribution.component';

describe('FiledistributionComponent', () => {
  let component: FiledistributionComponent;
  let fixture: ComponentFixture<FiledistributionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FiledistributionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FiledistributionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
