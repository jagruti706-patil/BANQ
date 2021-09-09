import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InprocesssplitfileComponent } from './inprocesssplitfile.component';

describe('InprocesssplitfileComponent', () => {
  let component: InprocesssplitfileComponent;
  let fixture: ComponentFixture<InprocesssplitfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InprocesssplitfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InprocesssplitfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
