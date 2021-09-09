import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientftpmasterComponent } from './clientftpmaster.component';

describe('ClientftpmasterComponent', () => {
  let component: ClientftpmasterComponent;
  let fixture: ComponentFixture<ClientftpmasterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientftpmasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientftpmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
