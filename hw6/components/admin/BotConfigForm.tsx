'use client';

import { useState, useEffect } from 'react';
import type { BotConfig, BotConfigInput } from '@/lib/types/admin';
import styles from './BotConfigForm.module.css';

interface BotConfigFormProps {
  config: BotConfig | null;
  onSave: (config: BotConfigInput) => Promise<void>;
  onReset: () => void;
  loading?: boolean;
}

const DEFAULT_CONFIG: BotConfigInput = {
  systemPrompt: 'You are a friendly and helpful learning assistant. Provide clear, well-structured answers.',
  personality: 'Friendly, helpful, and encouraging learning assistant.',
  responseRules: {
    enableFallback: true,
    maxResponseLength: 500,
    temperature: 0.7,
    customInstructions: '',
  },
};

export default function BotConfigForm({
  config,
  onSave,
  onReset,
  loading = false,
}: BotConfigFormProps) {
  const [formData, setFormData] = useState<BotConfigInput>(DEFAULT_CONFIG);
  const [temperature, setTemperature] = useState(0.7);

  useEffect(() => {
    if (config) {
      setFormData({
        systemPrompt: config.systemPrompt,
        personality: config.personality,
        responseRules: {
          enableFallback: config.responseRules.enableFallback,
          maxResponseLength: config.responseRules.maxResponseLength || 500,
          temperature: config.responseRules.temperature || 0.7,
          customInstructions: config.responseRules.customInstructions || '',
        },
      });
      setTemperature(config.responseRules.temperature || 0.7);
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleReset = () => {
    if (confirm('確定要重置表單嗎？未儲存的變更將會遺失。')) {
      if (config) {
        setFormData({
          systemPrompt: config.systemPrompt,
          personality: config.personality,
          responseRules: {
            enableFallback: config.responseRules.enableFallback,
            maxResponseLength: config.responseRules.maxResponseLength || 500,
            temperature: config.responseRules.temperature || 0.7,
            customInstructions: config.responseRules.customInstructions || '',
          },
        });
        setTemperature(config.responseRules.temperature || 0.7);
      } else {
        setFormData(DEFAULT_CONFIG);
        setTemperature(0.7);
      }
    }
  };

  const handleResetToDefault = () => {
    if (confirm('確定要還原為預設模式嗎？這將會建立一個新的配置版本。')) {
      setFormData(DEFAULT_CONFIG);
      setTemperature(0.7);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label className={styles.label}>System Prompt</label>
        <textarea
          rows={6}
          value={formData.systemPrompt}
          onChange={(e) =>
            setFormData({ ...formData, systemPrompt: e.target.value })
          }
          className={styles.textarea}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Personality</label>
        <textarea
          rows={4}
          value={formData.personality}
          onChange={(e) =>
            setFormData({ ...formData, personality: e.target.value })
          }
          className={styles.textarea}
          required
        />
      </div>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.responseRules.enableFallback}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  responseRules: {
                    ...formData.responseRules,
                    enableFallback: e.target.checked,
                  },
                })
              }
              className={styles.checkbox}
            />
            Enable Fallback
          </label>
          <div className={styles.helpText}>
            當 LLM 服務不可用時啟用降級回覆
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Max Response Length</label>
          <input
            type="number"
            min={100}
            max={2000}
            step={50}
            value={formData.responseRules.maxResponseLength || 500}
            onChange={(e) =>
              setFormData({
                ...formData,
                responseRules: {
                  ...formData.responseRules,
                  maxResponseLength: parseInt(e.target.value, 10),
                },
              })
            }
            className={styles.input}
            required
          />
          <div className={styles.helpText}>最大回覆長度（字元數）</div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Temperature: <span className={styles.tempValue}>{temperature}</span>
          </label>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              setTemperature(value);
              setFormData({
                ...formData,
                responseRules: {
                  ...formData.responseRules,
                  temperature: value,
                },
              });
            }}
            className={styles.range}
          />
          <div className={styles.helpText}>控制回覆的創造性（0-2）</div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Custom Instructions</label>
        <textarea
          rows={4}
          placeholder="可選：自訂額外的回覆規則或指示..."
          value={formData.responseRules.customInstructions || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              responseRules: {
                ...formData.responseRules,
                customInstructions: e.target.value,
              },
            })
          }
          className={styles.textarea}
        />
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.resetButton}
          onClick={handleReset}
        >
          重置表單
        </button>
        <button
          type="button"
          className={styles.defaultButton}
          onClick={handleResetToDefault}
        >
          還原為預設模式
        </button>
        <button
          type="submit"
          className={styles.saveButton}
          disabled={loading}
        >
          {loading ? '儲存中...' : '儲存配置'}
        </button>
      </div>
    </form>
  );
}

