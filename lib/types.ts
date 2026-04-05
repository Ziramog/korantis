// Shared types for the Korantis Web application

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  errors?: FieldValidationError[];
}

export interface FieldValidationError {
  field: keyof ContactFormData;
  message: string;
}
