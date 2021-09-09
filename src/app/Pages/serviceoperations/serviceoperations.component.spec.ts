import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceoperationsComponent } from './serviceoperations.component';

describe('ServiceoperationsComponent', () => {
  let component: ServiceoperationsComponent;
  let fixture: ComponentFixture<ServiceoperationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceoperationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceoperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
