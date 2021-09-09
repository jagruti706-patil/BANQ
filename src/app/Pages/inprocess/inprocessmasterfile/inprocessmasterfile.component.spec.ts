import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InprocessmasterfileComponent } from './inprocessmasterfile.component';

describe('InprocessmasterfileComponent', () => {
  let component: InprocessmasterfileComponent;
  let fixture: ComponentFixture<InprocessmasterfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InprocessmasterfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InprocessmasterfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
