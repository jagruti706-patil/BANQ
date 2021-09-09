import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingdownloadComponent } from './pendingdownload.component';

describe('PendingdownloadComponent', () => {
  let component: PendingdownloadComponent;
  let fixture: ComponentFixture<PendingdownloadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingdownloadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingdownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
