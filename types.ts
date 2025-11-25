export type OperationType = 'CLICK' | 'INPUT' | 'WAIT' | 'ASSERT_TEXT' | 'CONFIRM_MODAL' | 'OPEN_URL';

export interface UIElement {
  id: string;
  name: string;
  locator: string; // e.g., //div[@id='btn'] or #btn
  locatorType: 'XPATH' | 'CSS' | 'ID';
  description?: string;
}

export interface TestStep {
  id: string;
  operation: OperationType;
  targetElementId?: string; // Optional because WAIT doesn't need an element
  value?: string; // For Input or specific wait time
  description?: string;
}

export interface TestWorkflow {
  id: string;
  name: string;
  steps: TestStep[];
  lastRunStatus?: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'NONE';
  lastRunDate?: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}