/**
 * 학점 관련 유틸리티 함수
 */

const MAX_CREDITS = 21;

/**
 * 현재 학점과 추가할 학점의 합이 최대 학점을 초과하는지 확인
 * @param {number} currentCredits - 현재 총 학점
 * @param {number} additionalCredits - 추가할 학점
 * @returns {boolean} 최대 학점 초과 여부
 */
export const isCreditLimitExceeded = (currentCredits, additionalCredits) => {
    return currentCredits + additionalCredits > MAX_CREDITS;
};

/**
 * 강의 목록의 총 학점 계산
 * @param {Array} courses - 강의 목록 [{ credits: number }]
 * @returns {number} 총 학점
 */
export const calculateTotalCredits = (courses) => {
    return courses.reduce((sum, course) => sum + (course.credits || 0), 0);
};

/**
 * 남은 학점 계산
 * @param {number} currentCredits - 현재 총 학점
 * @returns {number} 남은 학점
 */
export const getRemainingCredits = (currentCredits) => {
    return Math.max(0, MAX_CREDITS - currentCredits);
};

/**
 * 최대 학점 반환
 * @returns {number} 최대 학점
 */
export const getMaxCredits = () => {
    return MAX_CREDITS;
};
