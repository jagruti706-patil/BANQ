import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HubCardsComponent } from './hub-cards.component';

describe('HubCardsComponent', () => {
  let component: HubCardsComponent;
  let fixture: ComponentFixture<HubCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HubCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HubCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
