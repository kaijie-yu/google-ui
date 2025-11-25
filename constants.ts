import { OperationType, UIElement, TestWorkflow } from './types';

export const OPS_DESCRIPTIONS: Record<OperationType, { label: string; description: string; icon: string }> = {
  OPEN_URL: {
    label: 'Open Webpage',
    description: 'Navigates the browser to a specific URL.',
    icon: 'globe'
  },
  CLICK: { 
    label: 'Click Element', 
    description: 'Simulates a mouse click on a specific UI element.',
    icon: 'mouse-pointer' 
  },
  INPUT: { 
    label: 'Input Text', 
    description: 'Types text into a target input field or text area.',
    icon: 'type'
  },
  WAIT: { 
    label: 'Wait', 
    description: 'Pauses the execution for a specified amount of milliseconds.',
    icon: 'clock'
  },
  ASSERT_TEXT: { 
    label: 'Assert Text', 
    description: 'Verifies that an element contains specific text.',
    icon: 'check-circle'
  },
  CONFIRM_MODAL: { 
    label: 'Confirm Modal', 
    description: 'Automatically accepts/confirms a browser alert or popup.',
    icon: 'alert-triangle'
  },
};

export const INITIAL_ELEMENTS: UIElement[] = [
  { id: '1', name: 'Login Username', locator: '#username', locatorType: 'ID', description: 'Main login input' },
  { id: '2', name: 'Login Password', locator: '#password', locatorType: 'ID', description: 'Main password input' },
  { id: '3', name: 'Submit Button', locator: '//button[@type="submit"]', locatorType: 'XPATH', description: 'Login form submit' },
];

export const INITIAL_WORKFLOWS: TestWorkflow[] = [
  {
    id: 'w1',
    name: 'Standard Login Flow',
    steps: [
      { id: 's0', operation: 'OPEN_URL', value: 'https://example.com/login' },
      { id: 's1', operation: 'INPUT', targetElementId: '1', value: 'admin' },
      { id: 's2', operation: 'INPUT', targetElementId: '2', value: 'secret' },
      { id: 's3', operation: 'CLICK', targetElementId: '3' },
      { id: 's4', operation: 'ASSERT_TEXT', targetElementId: '3', value: 'Welcome' },
    ],
    lastRunStatus: 'SUCCESS',
    lastRunDate: new Date().toISOString(),
  },
];