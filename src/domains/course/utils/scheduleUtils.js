/**
 * 시간표 관련 유틸리티 함수
 */

/**
 * 시간 문자열을 분 단위로 변환
 * @param {string} timeStr - "HH:mm:ss" 형식의 시간 문자열 (API에서 받아오는 형식)
 * @returns {number} 분 단위 시간
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  // "HH:mm:ss" 형식에서 시간과 분만 추출 (초는 무시)
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

/**
 * 시간 문자열을 표시용 형식으로 변환 (HH:mm 형식으로 통일)
 * @param {string} timeStr - "HH:mm:ss" 형식의 시간 문자열 (API에서 받아오는 형식)
 * @returns {string} "HH:mm" 형식의 시간 문자열
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  // "HH:mm:ss" 형식에서 시간과 분만 추출
  const parts = timeStr.split(':');
  const hours = parts[0] || '00';
  const minutes = parts[1] || '00';
  return `${hours}:${minutes}`;
};

/**
 * 시간표를 표시용 문자열로 변환
 * @param {Object} schedule - 시간표 객체 { dayOfWeek, startTime, endTime, dayName? }
 * @returns {string} "요일 HH:MM-HH:MM" 형식의 문자열
 */
export const formatScheduleTime = (schedule) => {
  if (!schedule) return '';
  
  const dayMap = { 1: '월', 2: '화', 3: '수', 4: '목', 5: '금' };
  const dayName = dayMap[schedule.dayOfWeek] || schedule.dayName || '';
  const startTime = formatTime(schedule.startTime);
  const endTime = formatTime(schedule.endTime);
  
  return `${dayName} ${startTime}-${endTime}`;
};

/**
 * 두 시간표가 충돌하는지 확인
 * @param {Object} schedule1 - 첫 번째 시간표 { dayOfWeek, startTime, endTime }
 * @param {Object} schedule2 - 두 번째 시간표 { dayOfWeek, startTime, endTime }
 * @returns {boolean} 충돌 여부
 */
const isScheduleConflict = (schedule1, schedule2) => {
  // 요일이 다르면 충돌 없음
  if (schedule1.dayOfWeek !== schedule2.dayOfWeek) {
    return false;
  }

  const start1 = timeToMinutes(schedule1.startTime);
  const end1 = timeToMinutes(schedule1.endTime);
  const start2 = timeToMinutes(schedule2.startTime);
  const end2 = timeToMinutes(schedule2.endTime);

  // 시간이 겹치는지 확인
  // 겹치는 경우: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
};

/**
 * 강의의 시간표와 기존 강의 목록의 시간표가 충돌하는지 확인
 * @param {Object} newCourse - 새로 추가할 강의 { schedule: [{ dayOfWeek, startTime, endTime }] }
 * @param {Array} existingCourses - 기존 강의 목록 [{ schedule: [...] }]
 * @returns {Object} { hasConflict: boolean, conflictingCourse: Object|null }
 */
export const checkScheduleConflict = (newCourse, existingCourses) => {
  if (!newCourse.schedule || !Array.isArray(newCourse.schedule)) {
    return { hasConflict: false, conflictingCourse: null };
  }

  for (const existingCourse of existingCourses) {
    if (!existingCourse.schedule || !Array.isArray(existingCourse.schedule)) {
      continue;
    }

    // 새 강의의 각 시간표와 기존 강의의 각 시간표를 비교
    for (const newSchedule of newCourse.schedule) {
      for (const existingSchedule of existingCourse.schedule) {
        if (isScheduleConflict(newSchedule, existingSchedule)) {
          return {
            hasConflict: true,
            conflictingCourse: existingCourse,
            conflictingSchedule: newSchedule,
            existingSchedule: existingSchedule,
          };
        }
      }
    }
  }

  return { hasConflict: false, conflictingCourse: null };
};

/**
 * 여러 강의를 한 번에 추가할 때 시간표 충돌 확인
 * @param {Array} newCourses - 새로 추가할 강의 목록
 * @param {Array} existingCourses - 기존 강의 목록
 * @returns {Object} { hasConflict: boolean, conflicts: Array }
 */
export const checkMultipleScheduleConflicts = (newCourses, existingCourses) => {
  const conflicts = [];
  const allCourses = [...existingCourses];

  for (const newCourse of newCourses) {
    // 기존 강의들과 충돌 확인
    const conflict = checkScheduleConflict(newCourse, allCourses);
    if (conflict.hasConflict) {
      conflicts.push({
        course: newCourse,
        conflictingCourse: conflict.conflictingCourse,
      });
    } else {
      // 충돌이 없으면 임시로 추가하여 다음 강의와의 충돌도 확인
      allCourses.push(newCourse);
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
};
