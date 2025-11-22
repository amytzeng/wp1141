'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UserCard from '@/components/admin/UserCard';
import ConversationItem from '@/components/admin/ConversationItem';
import ConversationModal from '@/components/admin/ConversationModal';
import {
  getUsers,
  getUserConversations,
  getConversationById,
} from '@/lib/api';
import type {
  User,
  UserConversationsResponse,
  ConversationDetailResponse,
} from '@/lib/types/admin';
import styles from './detail.module.css';

type ViewMode = 'users' | 'conversations';

function ConversationDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewMode = (searchParams.get('view') as ViewMode) || 'users';
  const userId = searchParams.get('userId') || '';
  const conversationId = searchParams.get('conversationId') || '';

  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<
    UserConversationsResponse['conversations']
  >([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDetailResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users list
  useEffect(() => {
    if (viewMode === 'users') {
      fetchUsers();
    }
  }, [viewMode]);

  // Fetch user conversations
  useEffect(() => {
    if (viewMode === 'conversations' && userId) {
      fetchUserConversations(userId);
    }
  }, [viewMode, userId]);

  // Fetch conversation detail when conversationId changes
  useEffect(() => {
    if (conversationId) {
      setIsModalOpen(true);
      fetchConversationDetail(conversationId);
    }
  }, [conversationId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUsers();
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserConversations = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserConversations(userId);
      setConversations(response.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetail = async (id: string) => {
    try {
      setError(null);
      const response = await getConversationById(id);
      setSelectedConversation(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
      setIsModalOpen(false);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/admin/conversations/detail?view=conversations&userId=${encodeURIComponent(userId)}`);
  };

  const handleConversationClick = (convId: string) => {
    router.push(`/admin/conversations/detail?view=conversations&userId=${encodeURIComponent(userId)}&conversationId=${convId}`);
  };

  const handleBackToUsers = () => {
    router.push('/admin/conversations/detail?view=users');
    setConversations([]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    router.push(`/admin/conversations/detail?view=conversations&userId=${encodeURIComponent(userId)}`);
  };

  if (viewMode === 'users') {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>對話詳情</h1>
        <div className={styles.infoBox}>
          <div className={styles.infoText}>
            <div className={styles.infoTitle}>選擇使用者以查看對話</div>
            <div className={styles.infoSubtitle}>
              點擊下方使用者卡片查看該使用者的所有對話
            </div>
          </div>
        </div>

        {loading && (
          <div className={styles.loading}>
            <p>載入中...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>錯誤: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className={styles.userGrid}>
            {users.map((user) => (
              <UserCard
                key={user.lineUserId}
                user={user}
                onClick={() => handleUserClick(user.lineUserId)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>使用者對話列表</h1>
      <div className={styles.infoBox}>
        <button className={styles.backButton} onClick={handleBackToUsers}>
          ← 返回使用者列表
        </button>
        <div className={styles.infoText}>
          <div className={styles.infoTitle}>使用者 ID: {userId}</div>
          <div className={styles.infoSubtitle}>
            點擊下方對話項目查看詳細內容
          </div>
        </div>
      </div>

      {loading && (
        <div className={styles.loading}>
          <p>載入中...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>錯誤: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className={styles.conversationList}>
          {conversations.map((conv) => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              onClick={() => handleConversationClick(conv._id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ConversationModal
          conversation={selectedConversation}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default function ConversationDetailPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>載入中...</p>
        </div>
      </div>
    }>
      <ConversationDetailContent />
    </Suspense>
  );
}

