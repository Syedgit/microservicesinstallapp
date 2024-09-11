import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Renderer2, ElementRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { MemberAuthenticationComponent } from './member-authentication.component';

describe('MemberAuthenticationComponent', () => {
  let component: MemberAuthenticationComponent;
  let fixture: ComponentFixture<MemberAuthenticationComponent>;
  let rendererMock: Renderer2;

  beforeEach(async () => {
    rendererMock = {
      listen: jest.fn((el, event, cb) => {
        if (cb && typeof cb === 'function') {
          cb(); // Simulate triggering the callback
        }
        return () => {}; // Cleanup function mock
      }),
    } as unknown as Renderer2;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: Renderer2, useValue: rendererMock },
        provideMockStore(),
      ],
      declarations: [MemberAuthenticationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberAuthenticationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should add date field listeners for month, day, and year', () => {
    const monthEl = { nativeElement: document.createElement('input') } as ElementRef;
    const dayEl = { nativeElement: document.createElement('input') } as ElementRef;
    const yearEl = { nativeElement: document.createElement('input') } as ElementRef;

    component.month = monthEl;
    component.day = dayEl;
    component.year = yearEl;

    component.addDateFieldListeners();

    // Check if listen is called for each field
    expect(rendererMock.listen).toHaveBeenCalledWith(monthEl.nativeElement, 'input', expect.any(Function));
    expect(rendererMock.listen).toHaveBeenCalledWith(dayEl.nativeElement, 'input', expect.any(Function));
    expect(rendererMock.listen).toHaveBeenCalledWith(yearEl.nativeElement, 'input', expect.any(Function));
  });

  it('should validate form fields and set formErrors correctly when fields are invalid', () => {
    component.memberForm.get('firstName')?.setValue(''); // Empty first name
    component.memberForm.get('lastName')?.setValue(''); // Empty last name
    component.memberForm.get('memberId')?.setValue('abc'); // Invalid memberId (should be numeric)
    component.month = { nativeElement: { value: '13' } } as ElementRef; // Invalid month
    component.day = { nativeElement: { value: '32' } } as ElementRef; // Invalid day
    component.year = { nativeElement: { value: '1899' } } as ElementRef; // Invalid year

    component.validateFormFields();

    expect(component.formErrors['firstName']).toEqual('! Enter a first name');
    expect(component.formErrors['lastName']).toEqual('! Enter a last name');
    expect(component.formErrors['memberId']).toEqual('! Enter a valid memberId');
    expect(component.formErrors['dateOfBirth']).toEqual('! Enter a valid date as MM/DD/YYYY');
  });

  it('should validate form fields and clear formErrors when fields are valid', () => {
    component.memberForm.get('firstName')?.setValue('John'); // Valid first name
    component.memberForm.get('lastName')?.setValue('Doe'); // Valid last name
    component.memberForm.get('memberId')?.setValue('12345'); // Valid memberId
    component.month = { nativeElement: { value: '12' } } as ElementRef; // Valid month
    component.day = { nativeElement: { value: '25' } } as ElementRef; // Valid day
    component.year = { nativeElement: { value: '1990' } } as ElementRef; // Valid year

    component.validateFormFields();

    expect(component.formErrors['firstName']).toEqual('');
    expect(component.formErrors['lastName']).toEqual('');
    expect(component.formErrors['memberId']).toEqual('');
    expect(component.formErrors['dateOfBirth']).toEqual('');
  });

  it('should trigger the callback when an input event occurs', () => {
    const monthEl = { nativeElement: document.createElement('input') } as ElementRef;
    const dayEl = { nativeElement: document.createElement('input') } as ElementRef;
    const yearEl = { nativeElement: document.createElement('input') } as ElementRef;

    component.month = monthEl;
    component.day = dayEl;
    component.year = yearEl;

    const mockCallback = jest.fn();

    // Mock the renderer.listen method to trigger the callback
    rendererMock.listen = jest.fn((el, event, callback) => {
      callback(); // Trigger the callback
      return () => {}; // Cleanup mock
    });

    component.addDateFieldListeners();

    // Simulate user input
    monthEl.nativeElement.value = '12';
    const event = new Event('input');
    monthEl.nativeElement.dispatchEvent(event);

    expect(rendererMock.listen).toHaveBeenCalled();
  });
});
