import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientchartComponent } from './clientchart.component';

describe('ClientchartComponent', () => {
  let component: ClientchartComponent;
  let fixture: ComponentFixture<ClientchartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientchartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
