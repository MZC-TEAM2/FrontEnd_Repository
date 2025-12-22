import React from 'react';
import AssessmentManagement from './AssessmentManagement';

export default function ExamManagement({ courseId }) {
  return <AssessmentManagement courseId={courseId} mode="EXAM" />;
}


