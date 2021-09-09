import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchedanypracticetoanyclaimComponent } from './matchedanypracticetoanyclaim.component';

describe('MatchedanypracticetoanyclaimComponent', () => {
  let component: MatchedanypracticetoanyclaimComponent;
  let fixture: ComponentFixture<MatchedanypracticetoanyclaimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatchedanypracticetoanyclaimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchedanypracticetoanyclaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
