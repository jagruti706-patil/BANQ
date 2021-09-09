import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubclientregistrationComponent } from './subclientregistration.component';

describe('SubclientregistrationComponent', () => {
  let component: SubclientregistrationComponent;
  let fixture: ComponentFixture<SubclientregistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubclientregistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubclientregistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
