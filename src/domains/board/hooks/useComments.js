import { useState, useEffect } from 'react';
import * as commentApi from '../../../api/commentApi';
import attachmentApi from '../../../api/attachmentApi';

// 댓글 관리 Hook
// 게시글의 댓글 CRUD 기능 제공
export const useComments = (postId, currentUserId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  // 페이지 로드 시 댓글 목록 자동 조회
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // 댓글 목록 조회
  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await commentApi.getComments(postId);
      
      // 백엔드 응답 구조를 프론트엔드 구조로 변환
      const flattenComments = (commentList) => {
        const result = [];
        commentList.forEach(comment => {
          result.push({
            id: comment.id,
            postId: comment.postId,
            authorId: comment.authorId || currentUserId,
            authorName: comment.authorName || '사용자',
            content: comment.content,
            depth: comment.depth,
            parentCommentId: comment.parentCommentId,
            isAnonymous: comment.isAnonymous || false,
            isDeleted: comment.isDeleted || false,
            attachments: comment.attachments || [],
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
          });
          
          // 대댓글도 flat 배열에 추가
          if (comment.childComments && comment.childComments.length > 0) {
            comment.childComments.forEach(child => {
              result.push({
                id: child.id,
                postId: child.postId,
                authorId: child.authorId || currentUserId,
                authorName: child.authorName || '사용자',
                content: child.content,
                depth: child.depth,
                parentCommentId: child.parentCommentId,
                isAnonymous: child.isAnonymous || false,
                isDeleted: child.isDeleted || false,
                attachments: child.attachments || [],
                createdAt: child.createdAt,
                updatedAt: child.updatedAt,
              });
            });
          }
        });
        return result;
      };
      
      setComments(flattenComments(data));
    } catch (error) {
      console.error('댓글 목록 조회 실패:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 댓글 작성
  const createComment = async (content, isAnonymous = false, attachedFiles = [], removedAttachmentIds = []) => {
    try {
      // 첨부파일 업로드
      let attachmentIds = [];
      if (attachedFiles.length > 0) {
        const uploadResult = await attachmentApi.uploadMultipleFiles(attachedFiles, 'COMMENT');
        attachmentIds = uploadResult.data.map(file => file.id);
      }

      const response = await commentApi.createComment({
        postId: parseInt(postId),
        authorId: currentUserId,
        content: content,
        parentCommentId: null,
        attachmentIds: attachmentIds,
      });
      
      // 댓글 목록 다시 조회
      await fetchComments();
      
      return response;
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      throw error;
    }
  };

  // 대댓글 작성
  const createReply = async (parentCommentId, content, attachedFiles = [], removedAttachmentIds = []) => {
    try {
      // 첨부파일 업로드
      let attachmentIds = [];
      if (attachedFiles.length > 0) {
        const uploadResult = await attachmentApi.uploadMultipleFiles(attachedFiles, 'COMMENT');
        attachmentIds = uploadResult.data.map(file => file.id);
      }

      const response = await commentApi.createComment({
        postId: parseInt(postId),
        authorId: currentUserId,
        content: content,
        parentCommentId: parentCommentId,
        attachmentIds: attachmentIds,
      });
      
      // 댓글 목록 다시 조회
      await fetchComments();
      
      return response;
    } catch (error) {
      console.error('답글 작성 실패:', error);
      throw error;
    }
  };

  // 댓글 수정
  const updateComment = async (commentId, newContent, attachedFiles = [], removedAttachmentIds = []) => {
    try {
      // 새 첨부파일 업로드
      let newAttachmentIds = [];
      if (attachedFiles.length > 0) {
        const uploadResult = await attachmentApi.uploadMultipleFiles(attachedFiles, 'COMMENT');
        newAttachmentIds = uploadResult.data.map(file => file.id);
      }

      // 기존 첨부파일 중 삭제할 파일 제외하고 새 파일 추가
      const updateData = {
        content: newContent,
      };

      // 새로 추가된 첨부파일이 있으면 추가
      if (newAttachmentIds.length > 0) {
        updateData.attachmentIds = newAttachmentIds;
      }

      // 삭제할 첨부파일 ID가 있으면 추가
      if (removedAttachmentIds.length > 0) {
        updateData.removedAttachmentIds = removedAttachmentIds;
      }

      await commentApi.updateComment(commentId, updateData);
      
      // 댓글 목록 다시 조회
      await fetchComments();
    } catch (error) {
      console.error('댓글 수정 실패:', error);
      throw error;
    }
  };

  // 댓글 삭제
  const deleteComment = async (commentId) => {
    try {
      await commentApi.deleteComment(commentId);
      
      // 댓글 목록 다시 조회
      await fetchComments();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      throw error;
    }
  };

  return {
    comments,
    loading,
    fetchComments,
    createComment,
    createReply,
    updateComment,
    deleteComment,
  };
};
