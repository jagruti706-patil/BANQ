import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientmasterComponent } from './clientmaster.component';

describe('ClientmasterComponent', () => {
  let component: ClientmasterComponent;
  let fixture: ComponentFixture<ClientmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
