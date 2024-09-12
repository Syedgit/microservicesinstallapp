import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { YourComponent } from './your.component';
import { NavigationService } from './navigation.service';
import { Store } from '@ngrx/store';

// Mock the store
const mockStore = {
  getMemberInfoAndToken: jest.fn()
};

// Mock the navigation service
const mockNavigationService = {
  navigate: jest.fn()
};

describe('YourComponent', () => {
  let component: YourComponent;
  let fixture: ComponentFixture<YourComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ YourComponent ],
      imports: [ ReactiveFormsModule ],
      providers: [
        FormBuilder,
        { provide: Store, useValue: mockStore },
        { provide: NavigationService, useValue: mockNavigationService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YourComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call updateFormWithDate, patch dateOfBirth, validate the form, and dispatch getMemberInfoAndToken action with correct payload', waitForAsync(() => {
    const patientInfo = {
      firstName: 'John',
      lastName: 'Doe',
      memberId: '12345',
      dateOfBirth: '1990-12-25',
      flowName: 'MEMBER_ID_LOOKUP',
      source: 'CMK'
    };

    // Set form value and mock form validation
    component.memberForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      memberId: '12345',
      dateOfBirth: '1990-12-25'
    });
    component.memberForm.markAllAsTouched();
    jest.spyOn(component.memberForm, 'valid', 'get').mockReturnValue(true);

    // Mock store method
    mockStore.getMemberInfoAndToken.mockResolvedValue({
      statusCode: '0000',
      access_token: 'someToken',
      token_type: 'Bearer',
      statusDescription: 'Success'
    });

    // Mock date validation and form patching
    jest.spyOn(component, 'isDateValid').mockReturnValue(true);
    jest.spyOn(component, 'updateFormWithDate').mockReturnValue('1990-12-25');

    // Mock navigation
    mockNavigationService.navigate.mockResolvedValue(true);

    // Mock memberTokenResponse$
    component.memberTokenResponse$ = of({
      statusCode: '0000',
      access_token: 'someToken',
      token_type: 'Bearer',
      statusDescription: 'Success'
    });

    // Call the component method
    component.getMemberInfoAndToken();

    // Use whenStable to ensure all async operations complete
    fixture.whenStable().then(() => {
      // Assert that all methods were called
      expect(component.isDateValid).toHaveBeenCalled();
      expect(component.updateFormWithDate).toHaveBeenCalled();
      expect(mockStore.getMemberInfoAndToken).toHaveBeenCalledWith(patientInfo);

      // Check if memberTokenResponse$ emitted correct data
      component.memberTokenResponse$.subscribe((data) => {
        expect(data.statusCode).toBe('0000');
        expect(data.access_token).toBe('someToken');
      });

      expect(mockNavigationService.navigate).toHaveBeenCalledWith(
        '/pharmacy/-/transfer/current-prescriptions',
        { queryParamsHandling: 'preserve' },
        { navigateByPath: true }
      );
      expect(mockNavigationService.navigate).toHaveBeenCalledTimes(1);
    });
  }));
});
