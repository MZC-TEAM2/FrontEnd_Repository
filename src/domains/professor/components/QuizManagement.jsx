import React from 'react';
import AssessmentManagement from './AssessmentManagement';

export default function QuizManagement({courseId}) {
    return <AssessmentManagement courseId={courseId} mode="QUIZ"/>;
}


