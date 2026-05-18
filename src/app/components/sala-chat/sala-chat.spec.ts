import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalaChat } from './sala-chat';

describe('SalaChat', () => {
  let component: SalaChat;
  let fixture: ComponentFixture<SalaChat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalaChat],
    }).compileComponents();

    fixture = TestBed.createComponent(SalaChat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
