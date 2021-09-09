import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionConfirmationComponent } from './action-confirmation.component';

describe('ActionConfirmationComponent', () => {
  let component: ActionConfirmationComponent;
  let fixture: ComponentFixture<ActionConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
