import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientftplistComponent } from './clientftplist.component';

describe('ClientftplistComponent', () => {
  let component: ClientftplistComponent;
  let fixture: ComponentFixture<ClientftplistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientftplistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientftplistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
