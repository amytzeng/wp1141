'use client';

import { useState, useEffect } from 'react';
import styles from './rich-menu.module.css';

interface RichMenuInfo {
  success: boolean;
  richMenus?: Array<{
    richMenuId: string;
    name: string;
    size: { width: number; height: number };
  }>;
  defaultRichMenuId?: string | null;
  error?: string;
}

export default function RichMenuPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [richMenuInfo, setRichMenuInfo] = useState<RichMenuInfo | null>(null);
  const [imagePath, setImagePath] = useState('public/rich-menu.png');
  const [imagePathSelect, setImagePathSelect] = useState('public/rich-menu.png');
  const [customPath, setCustomPath] = useState('');

  const handleInitialize = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/rich-menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePath }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Rich Menu 初始化成功！Rich Menu ID: ${data.richMenuId}`,
        });
        // Refresh info after initialization
        await fetchRichMenuInfo();
      } else {
        setMessage({
          type: 'error',
          text: data.error || '初始化失敗',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '發生未知錯誤',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRichMenuInfo = async () => {
    try {
      const response = await fetch('/api/admin/rich-menu');
      const data: RichMenuInfo = await response.json();
      setRichMenuInfo(data);
    } catch (error) {
      console.error('Failed to fetch Rich Menu info:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除目前的預設 Rich Menu 嗎？')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/rich-menu', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Rich Menu 已刪除',
        });
        await fetchRichMenuInfo();
      } else {
        setMessage({
          type: 'error',
          text: data.error || '刪除失敗',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : '發生未知錯誤',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load info on mount
  useEffect(() => {
    fetchRichMenuInfo();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Rich Menu 管理</h1>

      {/* Message Display */}
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {/* Initialize Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>初始化 Rich Menu</h2>
        <p className={styles.description}>
          此功能會建立新的 Rich Menu、上傳圖片、設定所有按鈕的 Postback 動作，並設為預設選單。
        </p>

        <div className={styles.formGroup}>
          <label htmlFor="imagePathSelect" className={styles.label}>
            圖片路徑：
          </label>
          <select
            id="imagePathSelect"
            value={imagePathSelect}
            onChange={(e) => {
              setImagePathSelect(e.target.value);
              if (e.target.value !== 'custom') {
                setImagePath(e.target.value);
              } else {
                setImagePath(customPath || 'public/rich-menu.png');
              }
            }}
            className={styles.input}
          >
            <option value="public/rich-menu.png">public/rich-menu.png (預設)</option>
            <option value="public/rich-menu-full.png">public/rich-menu-full.png (完整大圖)</option>
            <option value="custom">自訂路徑...</option>
          </select>
          {imagePathSelect === 'custom' && (
            <input
              type="text"
              value={customPath}
              onChange={(e) => {
                setCustomPath(e.target.value);
                setImagePath(e.target.value || 'public/rich-menu.png');
              }}
              className={styles.input}
              placeholder="public/rich-menu.png"
              style={{ marginTop: '0.5rem' }}
            />
          )}
          <small className={styles.hint}>
            圖片必須位於伺服器的 <code>public/</code> 目錄下，尺寸應為 2500x1686 像素。
            <br />
            <strong>注意：</strong>如果應用程式部署在雲端（如 Vercel、Netlify），請確保圖片已透過 Git 包含在部署中。
          </small>
        </div>

        <button
          onClick={handleInitialize}
          disabled={loading}
          className={styles.button}
        >
          {loading ? '初始化中...' : '初始化 Rich Menu'}
        </button>
      </div>

      {/* Rich Menu Info Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Rich Menu 資訊</h2>
        <button
          onClick={fetchRichMenuInfo}
          className={styles.buttonSecondary}
        >
          重新載入資訊
        </button>

        {richMenuInfo && (
          <div className={styles.infoBox}>
            {richMenuInfo.defaultRichMenuId ? (
              <div>
                <p className={styles.infoItem}>
                  <strong>預設 Rich Menu ID:</strong> {richMenuInfo.defaultRichMenuId}
                </p>
                <p className={styles.infoItem}>
                  <strong>Rich Menu 總數:</strong>{' '}
                  {richMenuInfo.richMenus?.length || 0}
                </p>
                {richMenuInfo.richMenus && richMenuInfo.richMenus.length > 0 && (
                  <div className={styles.richMenuList}>
                    <h3>所有 Rich Menu：</h3>
                    <ul>
                      {richMenuInfo.richMenus.map((rm) => (
                        <li key={rm.richMenuId} className={styles.richMenuItem}>
                          <strong>{rm.name || rm.richMenuId}</strong>
                          {rm.richMenuId === richMenuInfo.defaultRichMenuId && (
                            <span className={styles.defaultBadge}>預設</span>
                          )}
                          <br />
                          <small>
                            尺寸: {rm.size.width} x {rm.size.height}
                          </small>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className={styles.infoItem}>目前沒有設定預設 Rich Menu</p>
            )}
          </div>
        )}

        {richMenuInfo?.defaultRichMenuId && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className={`${styles.button} ${styles.buttonDanger}`}
          >
            {loading ? '刪除中...' : '刪除預設 Rich Menu'}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>使用說明</h2>
        <div className={styles.instructions}>
          <ol>
            <li>
              確認圖片檔案已上傳到 <code>{imagePath}</code>
            </li>
            <li>點擊「初始化 Rich Menu」按鈕</li>
            <li>等待初始化完成（可能需要幾秒鐘）</li>
            <li>在 LINE 應用程式中檢查 Rich Menu 是否顯示</li>
            <li>如果沒有立即顯示，請重新啟動 LINE 應用程式</li>
          </ol>

          <h3>按鈕配置</h3>
          <p>Rich Menu 包含以下六個按鈕（3 列 x 2 行）：</p>
          <ul>
            <li>重點整理 - 根據對話內容生成重點整理</li>
            <li>快速複習 - 生成快速複習內容</li>
            <li>例題示範 - 提供相關例題</li>
            <li>再解釋一次 - 用不同方式重新解釋</li>
            <li>清除 - 清除對話上下文</li>
            <li>幫助 - 顯示幫助訊息</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
