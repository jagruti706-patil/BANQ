import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientstatusComponent } from './clientstatus.component';

describe('ClientstatusComponent', () => {
  let component: ClientstatusComponent;
  let fixture: ComponentFixture<ClientstatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientstatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
