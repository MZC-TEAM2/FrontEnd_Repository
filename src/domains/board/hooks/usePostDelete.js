import {useState} from 'react';
import {deletePost} from '../../../api/postApi';

/**
 * 게시글 삭제 기능 Hook
 * 모든 게시판 타입에서 사용 가능
 */
export const usePostDelete = (navigate) => {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async (postId, options = {}) => {
        const {
            confirmMessage = '정말 삭제하시겠습니까?',
            successMessage = '게시글이 삭제되었습니다.',
            redirectPath = '/notices',
            onSuccess,
            onError,
        } = options;

        if (!window.confirm(confirmMessage)) return;

        setDeleting(true);
        try {
            await deletePost(postId);
            alert(successMessage);

            if (onSuccess) {
                onSuccess();
            } else {
                navigate(redirectPath);
            }
        } catch (err) {
            console.error('삭제 실패:', err);
            alert('삭제에 실패했습니다.');
            if (onError) {
                onError(err);
            }
        } finally {
            setDeleting(false);
        }
    };

    return {
        deleting,
        handleDelete,
    };
};
