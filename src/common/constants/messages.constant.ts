export const AUTH_MESSAGES = {
  ERROR: {
    EMAIL_INCORRECT: 'Email is incorrect',
    PASSWORD_INCORRECT: 'Password is incorrect!',
    MISSING_FIELDS: 'Missing required fields',
    USER_NOT_FOUND: 'User not found',
    UPDATE_FAILED: 'Failed to update password',
  },
  SUCCESS: {
    PASSWORD_UPDATED: 'Password is Successfully updated! 🎉',
  },
  VALIDATION: {
    NAME_EMPTY: 'Name should not be empty.',
    EMAIL_INVALID: 'Please enter a valid email address.',
    EMAIL_EMPTY: 'Email address is required.',
    PASSWORD_SHORT: 'Password must be at least 8 characters long.',
    PASSWORD_EMPTY: 'Password is required.',
    OLD_PASSWORD_EMPTY: 'Current password is required.',
    NEW_PASSWORD_EMPTY: 'New password is required.',
    NEW_PASSWORD_SHORT: 'New password must be at least 8 characters long.',
  },
};

export const COMPANY_MESSAGES = {
  SUCCESS: {
    REGISTERED: 'Company was successfully registered',
    FETCHED: 'All companies fetched successfully',
  },
};

export const STOCK_MESSAGES = {
  ERROR: {
    NOT_FOUND: 'Daily stock record not found.',
  },
  SUCCESS: {
    CREATED: 'Today Stock is created successfully.',
    FETCHED: 'All daily stocks fetched successfully.',
  },
};

export const PRICE_MESSAGES = {
  SUCCESS: {
    CREATED: 'Price registry created successfully',
    FETCHED: 'Prices fetched successfully',
  },
};
