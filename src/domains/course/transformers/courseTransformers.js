/**
 * API 응답 데이터를 UI 형식으로 변환하는 함수들
 */

/**
 * 강의 목록 API 응답 데이터를 UI 형식으로 변환
 * @param {Object} apiCourse - API 응답의 강의 데이터
 * @returns {Object} UI에서 사용할 강의 데이터
 */
export const transformCourseData = (apiCourse) => {
  return {
    id: apiCourse.id,
    subjectCode: apiCourse.courseCode,
    subjectName: apiCourse.courseName,
    professor: apiCourse.professor?.name || '',
    department: apiCourse.department?.name || '',
    departmentId: apiCourse.department?.id || null,
    courseType: apiCourse.courseType?.name || '',
    courseTypeCode: apiCourse.courseType?.code || '',
    credits: apiCourse.credits,
    currentStudents: apiCourse.enrollment?.current || 0,
    maxStudents: apiCourse.enrollment?.max || 0,
    isFull: apiCourse.enrollment?.isFull || false,
    schedule: apiCourse.schedule || [],
    classroom: apiCourse.schedule?.[0]?.classroom || '',
    isInCart: apiCourse.isInCart || false,
    isEnrolled: apiCourse.isEnrolled || false,
    canEnroll: apiCourse.canEnroll, // API 응답값 그대로 사용
  };
};

/**
 * 장바구니 API 응답 데이터를 UI 형식으로 변환
 * @param {Object} cartItem - API 응답의 장바구니 아이템 데이터
 * @returns {Object} UI에서 사용할 장바구니 아이템 데이터
 */
export const transformCartData = (cartItem) => {
  return {
    cartId: cartItem.cartId,
    id: cartItem.course?.id,
    subjectCode: cartItem.course?.code,
    subjectName: cartItem.course?.name,
    professor: cartItem.professor?.name || '',
    credits: cartItem.course?.credits || 0,
    courseType: cartItem.course?.courseType || '',
    schedule: cartItem.schedule || [],
    classroom: cartItem.schedule?.[0]?.classroom || '',
    currentStudents: cartItem.enrollment?.current || 0,
    maxStudents: cartItem.enrollment?.max || 0,
    isFull: cartItem.enrollment?.isFull || false,
    addedAt: cartItem.addedAt,
  };
};

/**
 * 수강신청 API 응답 데이터를 UI 형식으로 변환
 * @param {Object} enrollmentItem - API 응답의 수강신청 아이템 데이터
 * @returns {Object} UI에서 사용할 수강신청 아이템 데이터
 */
export const transformEnrollmentData = (enrollmentItem) => {
  return {
    enrollmentId: enrollmentItem.enrollmentId,
    id: enrollmentItem.course?.id,
    subjectCode: enrollmentItem.course?.courseCode,
    subjectName: enrollmentItem.course?.courseName,
    professor: enrollmentItem.professor?.name || '',
    credits: enrollmentItem.course?.credits || 0,
    courseType: enrollmentItem.course?.courseType?.name || '',
    schedule: enrollmentItem.schedule || [],
    classroom: enrollmentItem.schedule?.[0]?.classroom || '',
    canCancel: enrollmentItem.canCancel || false,
    currentStudents: enrollmentItem.course?.currentStudents || 0,
    maxStudents: enrollmentItem.course?.maxStudents || 0,
    isFull: enrollmentItem.course?.currentStudents >= enrollmentItem.course?.maxStudents || false,
  };
};

/**
 * 현재 학기 수강 과목 목록(/enrollments/current) 응답을 UI 형식으로 변환
 * - courseType 코드(MAJOR_REQ 등)를 화면에서 쓰는 한글 라벨로 변환해 기존 UI 색상 로직 유지
 */
export const transformCurrentEnrolledCourse = (course) => {
  const typeCode = course?.courseType;
  const typeLabelMap = {
    MAJOR_REQ: '전공필수',
    MAJOR_ELEC: '전공선택',
    GEN_REQ: '교양필수',
    GEN_ELEC: '교양선택',
  };

  return {
    id: course?.id,
    subjectCode: course?.courseCode,
    subjectName: course?.courseName,
    professor: course?.professor?.name || '',
    credits: course?.credits || 0,
    courseType: typeLabelMap[typeCode] || typeCode || '',
    schedule: course?.schedule || [],
    classroom: course?.schedule?.[0]?.classroom || '',
    currentStudents: course?.currentStudents || course?.enrollment?.current || 0,
    maxStudents: course?.maxStudents || course?.enrollment?.max || 0,
    isFull: !!course?.enrollment?.isFull,
  };
};

