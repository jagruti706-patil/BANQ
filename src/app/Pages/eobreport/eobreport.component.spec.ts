import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EobreportComponent } from './eobreport.component';

describe('EobreportComponent', () => {
  let component: EobreportComponent;
  let fixture: ComponentFixture<EobreportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EobreportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EobreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
