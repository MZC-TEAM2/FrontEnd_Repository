import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCourseDetail, getCourseWeeks } from '../../../api/courseApi';
import useMyCourses from './useMyCourses';
import attendanceService from '../../../services/attendanceService';

/**
 * 학생 강의실(과목 상세)용 데이터 로더
 * - 수강중 목록(enrollments/my)에서 기본 메타(교수/시간표/학점/정원 등)
 * - 과목 상세(/courses/{courseId})에서 설명/강의계획서
 * - 주차 목록(/courses/{courseId}/weeks)에서 콘텐츠 목록
 * - 출석 현황(/api/v1/attendance/courses/{courseId})에서 출석 데이터
 *
 * 전부 read-only 렌더링 목적
 */
export default function useStudentCourseDetail(courseId) {
  const { loading: loadingMy, error: errorMy, courses: myCourses } = useMyCourses();

  const courseMeta = useMemo(() => {
    if (!courseId) return null;
    return myCourses.find((c) => String(c.id) === String(courseId)) || null;
  }, [myCourses, courseId]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [weeksNotFound, setWeeksNotFound] = useState(false);
  const [attendance, setAttendance] = useState(null);

  const load = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    setWeeksNotFound(false);

    try {
      const detailRes = await getCourseDetail(courseId);
      if (!detailRes?.success) throw new Error(detailRes?.message || '강의 상세 정보를 불러올 수 없습니다.');
      setDetail(detailRes.data || null);

      try {
        const weeksRes = await getCourseWeeks(courseId);
        if (!weeksRes?.success) throw new Error(weeksRes?.message || '주차 정보를 불러올 수 없습니다.');
        setWeeks(weeksRes.data || []);
      } catch (eWeeks) {
        // 404: 백엔드 엔드포인트 미구현/경로 불일치/권한 이슈 가능 → 화면은 유지하고 안내만
        if (eWeeks?.status === 404 || eWeeks?.status === 403) {
          setWeeksNotFound(true);
          setWeeks([]);
        } else {
          throw eWeeks;
        }
      }

      // 출석 데이터 로드
      try {
        const attendanceRes = await attendanceService.getCourseAttendance(courseId);
        if (attendanceRes?.success) {
          setAttendance(attendanceRes.data);
        }
      } catch (eAttendance) {
        // 출석 API 실패해도 다른 데이터는 표시
        console.warn('출석 데이터 로드 실패:', eAttendance);
        setAttendance(null);
      }
    } catch (e) {
      setError(e?.message || '강의 정보를 불러오는 중 오류가 발생했습니다.');
      setDetail(null);
      setWeeks([]);
      setAttendance(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    loading: loadingMy || loading,
    error: errorMy || error,
    courseMeta,
    detail,
    weeks,
    weeksNotFound,
    attendance,
    reload: load,
  };
}


