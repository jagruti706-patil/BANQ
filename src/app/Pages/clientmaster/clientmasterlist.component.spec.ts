import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientmasterlistComponent } from './clientmasterlist.component';

describe('ClientmasterlistComponent', () => {
  let component: ClientmasterlistComponent;
  let fixture: ComponentFixture<ClientmasterlistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientmasterlistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientmasterlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
