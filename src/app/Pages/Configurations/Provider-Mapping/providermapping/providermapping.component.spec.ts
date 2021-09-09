import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvidermappingComponent } from './providermapping.component';

describe('ProvidermappingComponent', () => {
  let component: ProvidermappingComponent;
  let fixture: ComponentFixture<ProvidermappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvidermappingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvidermappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
