'use client';

import { useState, useEffect } from 'react';
import BotConfigForm from '@/components/admin/BotConfigForm';
import ConfigHistoryModal from '@/components/admin/ConfigHistoryModal';
import { getBotConfig, updateBotConfig, getBotConfigHistory } from '@/lib/api';
import type {
  BotConfig,
  BotConfigInput,
  BotConfigHistoryItem,
} from '@/lib/types/admin';
import styles from './bot-config.module.css';

export default function BotConfigPage() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [configHistory, setConfigHistory] = useState<BotConfigHistoryItem[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryConfig, setSelectedHistoryConfig] =
    useState<BotConfigHistoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getBotConfig();
      setConfig(response.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bot config');
      console.error('Error fetching bot config:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConfigHistory = async () => {
    try {
      const response = await getBotConfigHistory();
      setConfigHistory(response.configs);
      setIsHistoryModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config history');
      console.error('Error fetching config history:', err);
    }
  };

  const handleSave = async (configInput: BotConfigInput) => {
    try {
      setSaving(true);
      setError(null);
      const response = await updateBotConfig(configInput);
      setConfig(response.config);
      alert('配置已儲存！');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save config');
      alert(`儲存失敗: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleViewHistoryDetail = (historyConfig: BotConfigHistoryItem) => {
    setSelectedHistoryConfig(historyConfig);
    // You can show another modal or expand the row to show full details
    alert(
      `版本 ${historyConfig.version}\n\nSystem Prompt:\n${historyConfig.systemPrompt}\n\nPersonality:\n${historyConfig.personality}\n\nTemperature: ${historyConfig.responseRules.temperature}\nMax Length: ${historyConfig.responseRules.maxResponseLength}`
    );
  };

  if (loading && !config) {
    return (
      <div className={styles.loading}>
        <p>載入中...</p>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className={styles.error}>
        <p>錯誤: {error}</p>
        <button onClick={() => window.location.reload()}>重新載入</button>
      </div>
    );
  }

  return (
    <div className={styles.botConfig}>
      <h1 className={styles.pageTitle}>Bot 配置管理</h1>

      <div className={styles.actionButtons}>
        <button className={styles.historyButton} onClick={fetchConfigHistory}>
          查看歷史紀錄
        </button>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.header}>
          <h2 className={styles.sectionTitle}>當前配置</h2>
          {config && (
            <div className={styles.versionInfo}>
              版本: {config.version} | 建立時間: {new Date(config.createdAt).toLocaleString('zh-TW')}
            </div>
          )}
        </div>

        {config && (
          <BotConfigForm
            config={config}
            onSave={handleSave}
            onReset={fetchConfig}
            loading={saving}
          />
        )}

        {error && (
          <div className={styles.errorMessage}>
            <p>錯誤: {error}</p>
          </div>
        )}
      </div>

      <ConfigHistoryModal
        configs={configHistory}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onViewDetail={handleViewHistoryDetail}
      />
    </div>
  );
}

