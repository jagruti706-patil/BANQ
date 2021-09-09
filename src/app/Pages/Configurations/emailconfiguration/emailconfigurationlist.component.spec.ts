import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailconfigurationlistComponent } from './emailconfigurationlist.component';

describe('EmailconfigurationlistComponent', () => {
  let component: EmailconfigurationlistComponent;
  let fixture: ComponentFixture<EmailconfigurationlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailconfigurationlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailconfigurationlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
