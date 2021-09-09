import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZeromenupermissionComponent } from './zeromenupermission.component';

describe('ZeromenupermissionComponent', () => {
  let component: ZeromenupermissionComponent;
  let fixture: ComponentFixture<ZeromenupermissionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZeromenupermissionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZeromenupermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
