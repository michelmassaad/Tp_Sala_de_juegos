import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiciRush } from './bici-rush';

describe('BiciRush', () => {
  let component: BiciRush;
  let fixture: ComponentFixture<BiciRush>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BiciRush],
    }).compileComponents();

    fixture = TestBed.createComponent(BiciRush);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
