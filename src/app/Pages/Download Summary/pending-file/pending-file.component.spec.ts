import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingFileComponent } from './pending-file.component';

describe('PendingFileComponent', () => {
  let component: PendingFileComponent;
  let fixture: ComponentFixture<PendingFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
