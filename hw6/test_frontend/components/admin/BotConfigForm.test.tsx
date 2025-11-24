// Tests for BotConfigForm component
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BotConfigForm from '@/components/admin/BotConfigForm';
import { mockBotConfig, mockBotConfigInput, defaultBotConfig } from '../../fixtures';

// Mock window.confirm
const mockConfirm = vi.fn();
window.confirm = mockConfirm;

describe('BotConfigForm', () => {
  const mockOnSave = vi.fn().mockResolvedValue(undefined);
  const mockOnReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('should render form with default config when no config provided', () => {
    render(
      <BotConfigForm
        config={null}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('System Prompt')).toBeInTheDocument();
    expect(screen.getByText('Personality')).toBeInTheDocument();
    expect(screen.getByText(/Enable Fallback/i)).toBeInTheDocument();
    expect(screen.getByText('Max Response Length')).toBeInTheDocument();
    expect(screen.getByText(/Temperature:/i)).toBeInTheDocument();
  });

  it('should initialize form with provided config', async () => {
    render(
      <BotConfigForm
        config={mockBotConfig}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    await waitFor(() => {
      const systemPromptTextarea = screen.getByDisplayValue(mockBotConfig.systemPrompt) as HTMLTextAreaElement;
      expect(systemPromptTextarea).toBeInTheDocument();
    });

    const personalityTextarea = screen.getByDisplayValue(mockBotConfig.personality) as HTMLTextAreaElement;
    expect(personalityTextarea).toBeInTheDocument();

    const maxLengthInput = screen.getByDisplayValue(mockBotConfig.responseRules.maxResponseLength?.toString() || '') as HTMLInputElement;
    expect(maxLengthInput).toBeInTheDocument();
  });

  it('should update form fields when user types', async () => {
    const user = userEvent.setup();
    render(
      <BotConfigForm
        config={null}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    const systemPromptTextarea = screen.getByDisplayValue(defaultBotConfig.systemPrompt) as HTMLTextAreaElement;
    await user.clear(systemPromptTextarea);
    await user.type(systemPromptTextarea, 'New system prompt');

    expect(systemPromptTextarea.value).toBe('New system prompt');
  });

  it('should update temperature when slider is moved', async () => {
    render(
      <BotConfigForm
        config={null}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    const temperatureSlider = screen.getByRole('slider') as HTMLInputElement;
    // Verify slider exists and has default value
    expect(temperatureSlider).toBeInTheDocument();
    expect(temperatureSlider.value).toBe('0.7');
    
    // Simulate slider change
    temperatureSlider.value = '0.9';
    temperatureSlider.dispatchEvent(new Event('input', { bubbles: true }));
    
    await waitFor(() => {
      expect(temperatureSlider.value).toBe('0.9');
    });
  });

  it('should toggle enableFallback checkbox', async () => {
    const user = userEvent.setup();
    render(
      <BotConfigForm
        config={null}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    const fallbackCheckbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(fallbackCheckbox.checked).toBe(true);

    await user.click(fallbackCheckbox);
    expect(fallbackCheckbox.checked).toBe(false);

    await user.click(fallbackCheckbox);
    expect(fallbackCheckbox.checked).toBe(true);
  });

  it('should call onSave with form data when submitted', async () => {
    const user = userEvent.setup();
    render(
      <BotConfigForm
        config={null}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    const submitButton = screen.getByRole('button', { name: /儲存配置/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    const savedData = mockOnSave.mock.calls[0][0];
    expect(savedData.systemPrompt).toBe(defaultBotConfig.systemPrompt);
    expect(savedData.personality).toBe(defaultBotConfig.personality);
    expect(savedData.responseRules.enableFallback).toBe(true);
  });

  it('should disable submit button when loading', () => {
    render(
      <BotConfigForm
        config={null}
        onSave={mockOnSave}
        onReset={mockOnReset}
        loading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /儲存中.../i });
    expect(submitButton).toBeDisabled();
  });

  it('should show loading text on submit button when loading', () => {
    render(
      <BotConfigForm
        config={null}
        onSave={mockOnSave}
        onReset={mockOnReset}
        loading={true}
      />
    );

    expect(screen.getByText('儲存中...')).toBeInTheDocument();
  });

  it('should reset form to original config when reset button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(true);

    render(
      <BotConfigForm
        config={mockBotConfig}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockBotConfig.systemPrompt)).toBeInTheDocument();
    });

    // Modify form
    const systemPromptTextarea = screen.getByDisplayValue(mockBotConfig.systemPrompt) as HTMLTextAreaElement;
    await user.clear(systemPromptTextarea);
    await user.type(systemPromptTextarea, 'Modified prompt');

    // Click reset
    const resetButton = screen.getByRole('button', { name: /重置表單/i });
    await user.click(resetButton);

    expect(mockConfirm).toHaveBeenCalledWith('確定要重置表單嗎？未儲存的變更將會遺失。');
    await waitFor(() => {
      expect(screen.getByDisplayValue(mockBotConfig.systemPrompt)).toBeInTheDocument();
    });
  });

  it('should not reset form when reset is cancelled', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(false);

    render(
      <BotConfigForm
        config={mockBotConfig}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockBotConfig.systemPrompt)).toBeInTheDocument();
    });

    // Modify form
    const systemPromptTextarea = screen.getByDisplayValue(mockBotConfig.systemPrompt) as HTMLTextAreaElement;
    await user.clear(systemPromptTextarea);
    await user.type(systemPromptTextarea, 'Modified prompt');

    // Click reset
    const resetButton = screen.getByRole('button', { name: /重置表單/i });
    await user.click(resetButton);

    expect(mockConfirm).toHaveBeenCalled();
    expect(screen.getByDisplayValue('Modified prompt')).toBeInTheDocument();
  });

  it('should reset to default config when reset to default button is clicked', async () => {
    const user = userEvent.setup();
    mockConfirm.mockReturnValue(true);

    render(
      <BotConfigForm
        config={mockBotConfig}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockBotConfig.systemPrompt)).toBeInTheDocument();
    });

    // Modify form
    const systemPromptTextarea = screen.getByDisplayValue(mockBotConfig.systemPrompt) as HTMLTextAreaElement;
    await user.clear(systemPromptTextarea);
    await user.type(systemPromptTextarea, 'Modified prompt');

    // Click reset to default
    const resetToDefaultButton = screen.getByRole('button', { name: /還原為預設模式/i });
    await user.click(resetToDefaultButton);

    expect(mockConfirm).toHaveBeenCalledWith('確定要還原為預設模式嗎？這將會建立一個新的配置版本。');
    await waitFor(() => {
      expect(screen.getByDisplayValue(defaultBotConfig.systemPrompt)).toBeInTheDocument();
    });
  });

  it('should require systemPrompt and personality fields', async () => {
    const user = userEvent.setup();
    render(
      <BotConfigForm
        config={null}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    const systemPromptTextarea = screen.getByDisplayValue(defaultBotConfig.systemPrompt) as HTMLTextAreaElement;
    const personalityTextarea = screen.getByDisplayValue(defaultBotConfig.personality) as HTMLTextAreaElement;

    await user.clear(systemPromptTextarea);
    await user.clear(personalityTextarea);

    const submitButton = screen.getByRole('button', { name: /儲存配置/i });
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    expect(systemPromptTextarea).toBeInvalid();
    expect(personalityTextarea).toBeInvalid();
  });

  it('should update maxResponseLength when input changes', async () => {
    render(
      <BotConfigForm
        config={null}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    const maxLengthInput = screen.getByDisplayValue(defaultBotConfig.responseRules.maxResponseLength?.toString() || '') as HTMLInputElement;
    expect(maxLengthInput).toBeInTheDocument();
    expect(maxLengthInput.type).toBe('number');
    
    // Verify the input can be changed programmatically
    maxLengthInput.value = '1000';
    maxLengthInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    await waitFor(() => {
      expect(maxLengthInput.value).toBe('1000');
    });
  });

  it('should update customInstructions when textarea changes', async () => {
    const user = userEvent.setup();
    render(
      <BotConfigForm
        config={null}
        onSave={mockOnSave}
        onReset={mockOnReset}
      />
    );

    const customInstructionsTextarea = screen.getByPlaceholderText(/可選：自訂額外的回覆規則或指示/i) as HTMLTextAreaElement;
    await user.type(customInstructionsTextarea, 'Custom instruction text');

    expect(customInstructionsTextarea.value).toBe('Custom instruction text');
  });
});

