<!-- First Name Error -->
<p *ngIf="getErrorMessage('firstName')" class="error">{{ getErrorMessage('firstName') }}</p>

<!-- Last Name Error -->
<p *ngIf="getErrorMessage('lastName')" class="error">{{ getErrorMessage('lastName') }}</p>

<!-- Date of Birth Error (Custom logic based on your date validation) -->
<div *ngIf="error" class="error">
  ! Enter a valid date as MM/DD/YYYY
</div>

<!-- Member ID Error -->
<p *ngIf="getErrorMessage('memberId')" class="error">{{ getErrorMessage('memberId') }}</p>

<!-- Continue Button -->
<div>
  <ps-button is-full-width="true" size="md" submit="true" variant="solid" (click)="getMemberInfoAndToken()" class="continue-button">
    Continue
  </ps-button>
</div>


getErrorMessage(fieldName: string): string {
  const control = this.memberForm.get(fieldName);
  
  if (control?.hasError('required') && control.touched) {
    return `! ${fieldName} is required`;
  }
  if (control?.hasError('pattern') && control.touched) {
    if (fieldName === 'firstName' || fieldName === 'lastName') {
      return `! ${fieldName} must contain only letters`;
    }
    if (fieldName === 'memberId') {
      return `! ${fieldName} must contain only numbers`;
    }
  }
  return '';  // No error
}
