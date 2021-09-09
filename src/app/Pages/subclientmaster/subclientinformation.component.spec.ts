import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubclientinformationComponent } from './subclientinformation.component';

describe('SubclientinformationComponent', () => {
  let component: SubclientinformationComponent;
  let fixture: ComponentFixture<SubclientinformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubclientinformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubclientinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
