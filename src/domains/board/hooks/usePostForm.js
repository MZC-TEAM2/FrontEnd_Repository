import {useState} from 'react';

/**
 * 게시글 폼 데이터 관리 Hook
 * 게시글 작성/수정 시 폼 데이터 관리
 */
export const usePostForm = (initialData = {}) => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        postType: 'NORMAL',
        isAnonymous: false,
        ...initialData,
    });

    // 입력 필드 변경 핸들러
    const handleInputChange = (e) => {
        const {name, value, checked, type} = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    // 폼 데이터 직접 설정
    const setFormField = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });
    };

    // 폼 초기화
    const resetForm = (data = {}) => {
        setFormData({
            title: '',
            content: '',
            postType: 'NORMAL',
            isAnonymous: false,
            ...data,
        });
    };

    // 폼 검증
    const validateForm = () => {
        if (!formData.title.trim()) {
            return {valid: false, message: '제목을 입력해주세요.'};
        }
        if (!formData.content.trim()) {
            return {valid: false, message: '내용을 입력해주세요.'};
        }
        return {valid: true};
    };

    return {
        formData,
        setFormData,
        handleInputChange,
        setFormField,
        resetForm,
        validateForm,
    };
};
