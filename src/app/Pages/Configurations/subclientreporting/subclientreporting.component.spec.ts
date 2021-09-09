import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubclientreportingComponent } from './subclientreporting.component';

describe('SubclientreportingComponent', () => {
  let component: SubclientreportingComponent;
  let fixture: ComponentFixture<SubclientreportingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubclientreportingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubclientreportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
