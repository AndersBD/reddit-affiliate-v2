import { describe, test, expect } from 'vitest';
import { cn, getIntentColor } from './utils';

describe('Utils', () => {
  describe('cn function', () => {
    test('should merge class names correctly', () => {
      // Test basic class merging
      expect(cn('class1', 'class2')).toBe('class1 class2');
      
      // Test with conditional classes
      expect(cn('base', true && 'active', false && 'disabled')).toBe('base active');
      
      // Test with objects
      expect(cn('base', { active: true, disabled: false })).toBe('base active');
      
      // Test with arrays
      expect(cn('base', ['class1', 'class2'])).toBe('base class1 class2');
      
      // Test with Tailwind conflicts that should be resolved
      expect(cn('p-4', 'p-8')).toBe('p-8');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });
  });
  
  describe('getIntentColor function', () => {
    test('should return correct color classes for each intent type', () => {
      // Test each intent type color
      expect(getIntentColor('COMPARISON')).toBe('bg-blue-100 text-blue-800 border-blue-100');
      expect(getIntentColor('QUESTION')).toBe('bg-purple-100 text-purple-800 border-purple-100');
      expect(getIntentColor('REVIEW')).toBe('bg-green-100 text-green-800 border-green-100');
      expect(getIntentColor('DISCOVERY')).toBe('bg-amber-100 text-amber-800 border-amber-100');
      expect(getIntentColor('DISCUSSION')).toBe('bg-indigo-100 text-indigo-800 border-indigo-100');
      
      // Test default case for unknown intent
      expect(getIntentColor('UNKNOWN_TYPE')).toBe('bg-gray-100 text-gray-800 border-gray-100');
      
      // Test with undefined
      expect(getIntentColor(undefined)).toBe('');
      
      // Test with empty string
      expect(getIntentColor('')).toBe('bg-gray-100 text-gray-800 border-gray-100');
    });
  });
});