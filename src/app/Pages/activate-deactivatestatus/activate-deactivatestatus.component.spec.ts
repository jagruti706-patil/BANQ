import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivateDeactivatestatusComponent } from './activate-deactivatestatus.component';

describe('ActivateDeactivatestatusComponent', () => {
  let component: ActivateDeactivatestatusComponent;
  let fixture: ComponentFixture<ActivateDeactivatestatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateDeactivatestatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateDeactivatestatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
