import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientinformationComponent } from './clientinformation.component';

describe('ClientinformationComponent', () => {
  let component: ClientinformationComponent;
  let fixture: ComponentFixture<ClientinformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientinformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientinformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
