import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditconfirmationComponent } from './editconfirmation.component';

describe('EditconfirmationComponent', () => {
  let component: EditconfirmationComponent;
  let fixture: ComponentFixture<EditconfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditconfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditconfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
