import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as assignmentApi from '../../../api/assignmentApi';

/**
 * 과제 관련 커스텀 훅
 * 
 * 주요 기능:
 * - 과제 CRUD (등록, 조회, 수정, 삭제)
 * - 과제 제출 (학생)
 * - 제출 목록 조회 (교수)
 * - 과제 채점 (교수)
 * - 내 제출 조회 (학생)
 */
export const useAssignment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 강의별 과제 목록 조회
   */
  const getAssignmentsByCourse = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentApi.getAssignmentsByCourse(courseId);
      return data || [];
    } catch (err) {
      console.error('과제 목록 조회 실패:', err);
      setError(err.response?.data?.message || '과제 목록을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 과제 상세 조회
   */
  const getAssignment = async (assignmentId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentApi.getAssignment(assignmentId);
      return data;
    } catch (err) {
      console.error('과제 조회 실패:', err);
      if (err.response?.status === 404) {
        setError('과제를 찾을 수 없습니다.');
      } else {
        setError(err.response?.data?.message || '과제를 불러오는데 실패했습니다.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 과제 등록 (교수)
   */
  const createAssignment = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assignmentApi.createAssignment(data);
      return result;
    } catch (err) {
      console.error('과제 등록 실패:', err);
      setError(err.response?.data?.message || '과제 등록에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 과제 수정 (교수)
   */
  const updateAssignment = async (assignmentId, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assignmentApi.updateAssignment(assignmentId, data);
      return result;
    } catch (err) {
      console.error('과제 수정 실패:', err);
      setError(err.response?.data?.message || '과제 수정에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 과제 삭제 (교수)
   */
  const deleteAssignment = async (assignmentId) => {
    setLoading(true);
    setError(null);
    try {
      await assignmentApi.deleteAssignment(assignmentId);
    } catch (err) {
      console.error('과제 삭제 실패:', err);
      setError(err.response?.data?.message || '과제 삭제에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 과제 제출 (학생)
   */
  const submitAssignment = async (assignmentId, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assignmentApi.submitAssignment(assignmentId, data);
      return result;
    } catch (err) {
      console.error('과제 제출 실패:', err);
      setError(err.response?.data?.message || '과제 제출에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 과제 제출 목록 조회 (교수)
   */
  const getSubmissions = async (assignmentId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentApi.getSubmissions(assignmentId);
      return data || [];
    } catch (err) {
      console.error('제출 목록 조회 실패:', err);
      setError(err.response?.data?.message || '제출 목록을 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 과제 채점 (교수)
   */
  const gradeSubmission = async (submissionId, data) => {
    setLoading(true);
    setError(null);
    try {
      const result = await assignmentApi.gradeSubmission(submissionId, data);
      return result;
    } catch (err) {
      console.error('과제 채점 실패:', err);
      setError(err.response?.data?.message || '과제 채점에 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 내 제출 조회 (학생)
   */
  const getMySubmission = async (assignmentId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentApi.getMySubmission(assignmentId);
      return data;
    } catch (err) {
      console.error('내 제출 조회 실패:', err);
      // 404는 제출 안 함
      if (err.response?.status === 404) {
        return null;
      }
      setError(err.response?.data?.message || '제출 정보를 불러오는데 실패했습니다.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getAssignmentsByCourse,
    getAssignment,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    getSubmissions,
    gradeSubmission,
    getMySubmission,
  };
};
