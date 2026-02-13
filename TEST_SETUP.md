# Test Setup Guide

This document explains how to set up and run the comprehensive test suite for the Translato project.

## Prerequisites

- **Bun**: The project uses Bun as its runtime and test runner
- Install Bun from [bun.sh](https://bun.sh)

## Installing Test Dependencies

The tests require `@testing-library/react` for component testing. Install it with:

```bash
bun add -d @testing-library/react @testing-library/dom happy-dom
```

Note: `happy-dom` is used as the DOM implementation for Bun's test runner.

## Running Tests

Run all tests:
```bash
bun test
```

Run tests in watch mode:
```bash
bun test --watch
```

Run tests with coverage:
```bash
bun test --coverage
```

Run specific test file:
```bash
bun test src/translator/languages.test.ts
```

## Test Structure

### Unit Tests

#### Domain Layer (`src/translator/`)
- **languages.test.ts**: Tests for language data structures
  - Validates language arrays (target and source)
  - Ensures data integrity (unique codes, required fields)
  - Verifies language code format

#### Presentation Layer (`src/ui/`)

**Hooks:**
- **hooks/useTranslate.test.ts**: Tests for translation hook
  - Debounce behavior (400ms delay)
  - API calls and error handling
  - Abort controller for request cancellation
  - Loading states
  - Force translate functionality

**Components:**
- **components/CharCount.test.tsx**: Character counter with warning threshold
- **components/CopyButton.test.tsx**: Clipboard copy with visual feedback
- **components/LanguageSelector.test.tsx**: Dropdown with search and keyboard navigation
- **components/SwapButton.test.tsx**: Language swap with rotation animation
- **components/TextArea.test.tsx**: Auto-height textarea
- **components/TranslatorPanel.test.tsx**: Complete translation panel with error display

**App:**
- **App.test.tsx**: Main application component
  - State management with useReducer
  - Keyboard shortcuts (Cmd+Enter)
  - Integration between components
  - Error handling

### Validation Tests

#### Configuration (`/.ai/.cursor/rules/`)
- **rules.test.ts**: Validates AI assistant rule files
  - YAML frontmatter structure
  - Markdown content quality
  - Consistency across rule files
  - References to design system

## Test Coverage

The test suite covers:

1. **Data Structures**: Language arrays and types
2. **React Hooks**: Custom hooks with async behavior
3. **UI Components**: All React components with user interactions
4. **Application Logic**: Reducer, state management, keyboard events
5. **Configuration**: Rule file validation

## Mocking Strategy

- **Fetch API**: Mocked for translation API calls
- **Clipboard API**: Mocked for copy functionality
- **Timers**: Real timers used for debounce testing
- **Keyboard Events**: Simulated for shortcut testing

## Best Practices

1. **Test Isolation**: Each test is independent
2. **Cleanup**: All mocks and event listeners are cleaned up
3. **Async Handling**: Proper use of `waitFor` for async operations
4. **Real Timers**: Tests use real timers to verify debounce behavior
5. **Edge Cases**: Tests cover empty states, errors, and boundary conditions

## Continuous Integration

To run tests in CI:

```yaml
- name: Run tests
  run: bun test
```

## Troubleshooting

### "Bun not found"
Install Bun: `curl -fsSL https://bun.sh/install | bash`

### "@testing-library/react not found"
Install: `bun add -d @testing-library/react happy-dom`

### Tests timing out
Increase timeout in test: `{ timeout: 2000 }`

### Mock not working
Ensure mock is reset in `afterEach` hook

## Future Enhancements

Potential test improvements:

1. **E2E Tests**: Add Playwright tests for full user flows
2. **Visual Regression**: Add screenshot testing for UI components
3. **Performance Tests**: Add tests for translation speed and debounce optimization
4. **Accessibility Tests**: Add axe-core for a11y testing
5. **API Integration Tests**: Add tests against real DeepL API (in CI only)

## Test Metrics

Current coverage areas:
- ✅ All language data validated
- ✅ All React components tested
- ✅ All custom hooks tested
- ✅ Main App component tested
- ✅ Configuration files validated
- ✅ Error scenarios covered
- ✅ User interactions tested
- ✅ Keyboard shortcuts tested
- ✅ Loading states verified
- ✅ Edge cases handled

## Additional Resources

- [Bun Testing Documentation](https://bun.sh/docs/cli/test)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)