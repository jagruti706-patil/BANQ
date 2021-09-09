import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetsessionidComponent } from './setsessionid.component';

describe('SetsessionidComponent', () => {
  let component: SetsessionidComponent;
  let fixture: ComponentFixture<SetsessionidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetsessionidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetsessionidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
