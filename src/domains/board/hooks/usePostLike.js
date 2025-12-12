import { useState } from 'react';
import { toggleLike, checkLiked } from '../../../api/postApi';

/**
 * 게시글 좋아요 기능 Hook
 * 모든 게시판 타입에서 사용 가능
 */
export const usePostLike = (postId, userId) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // 좋아요 여부 조회
  const fetchLikeStatus = async () => {
    try {
      const data = await checkLiked(postId, userId);
      setIsLiked(data.liked || false);
    } catch (err) {
      console.error('좋아요 상태 조회 실패:', err);
    }
  };

  // 좋아요 토글
  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await toggleLike(postId, userId);
      
      // 서버 응답에 따라 상태 업데이트
      setIsLiked(response.liked);
      
      // 좋아요 수 업데이트
      if (response.liked) {
        setLikeCount((prev) => prev + 1);
      } else {
        setLikeCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
      alert('좋아요 처리에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    setLikeCount,
    loading,
    handleLike,
    fetchLikeStatus,
  };
};
