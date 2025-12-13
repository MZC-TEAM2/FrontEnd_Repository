import React, { useState, useEffect, useRef } from 'react';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

/**
 * Toast 메시지 관리 컴포넌트
 * toast ref를 받아서 리렌더링 없이 토스트를 표시
 */
const ToastManager = ({ toastRef }) => {
  const [toastQueue, setToastQueue] = useState([]);
  const [currentToast, setCurrentToast] = useState({ open: false, message: '', severity: 'error' });
  const currentToastRef = useRef(currentToast);
  const prevToastRef = useRef({ open: false, message: '', severity: 'error' });

  // currentToast 변경 시 ref 업데이트
  useEffect(() => {
    currentToastRef.current = currentToast;
  }, [currentToast]);

  // toast 변경 감지 (polling 방식으로 리렌더링 방지)
  useEffect(() => {
    const checkToast = () => {
      if (!toastRef?.current) return;
      
      const toast = toastRef.current;
      
      // toast가 닫혔을 때 prevToastRef 업데이트
      if (!toast.open) {
        if (prevToastRef.current.open) {
          // 깊은 복사로 저장하여 참조 문제 방지
          prevToastRef.current = { open: false, message: '', severity: 'error' };
        }
        return; // 닫힌 상태에서는 더 이상 처리하지 않음
      }
      
      // toast가 열렸을 때만 처리
      if (toast.open && toast.message) {
        // 이미 표시한 토스트인지 확인 (메시지와 severity로 비교)
        const isAlreadyShown = 
          prevToastRef.current.open &&
          prevToastRef.current.message === toast.message &&
          prevToastRef.current.severity === toast.severity;
        
        // 이미 표시한 토스트는 무시
        if (isAlreadyShown) {
          return;
        }
        
        // 닫힌 상태에서 열린 상태로 변경된 경우만 처리
        const isNewToast = !prevToastRef.current.open && toast.open;
        
        // 새로운 토스트인 경우에만 처리
        if (isNewToast) {
          // 깊은 복사로 저장하여 참조 문제 방지
          prevToastRef.current = { 
            open: toast.open, 
            message: toast.message, 
            severity: toast.severity 
          };
          
          // 토스트를 표시한 후 toastRef를 닫힌 상태로 업데이트 (같은 토스트가 다시 오지 않도록)
          if (toastRef?.current) {
            toastRef.current = { ...toastRef.current, open: false };
          }
          
          if (currentToastRef.current.open) {
            // 현재 토스트가 열려있으면 기존 큐를 비우고 마지막 토스트만 표시
            setTimeout(() => {
              setToastQueue([]); // 기존 큐 비우기
              setCurrentToast({ ...toast }); // 마지막 토스트로 교체 (깊은 복사)
            }, 0);
          } else {
            // 바로 표시
            setTimeout(() => {
              setCurrentToast({ ...toast }); // 깊은 복사
            }, 0);
          }
        }
      }
    };
    
    // 주기적으로 체크 (리렌더링 없이)
    const interval = setInterval(checkToast, 50);
    checkToast(); // 즉시 한 번 체크
    
    return () => clearInterval(interval);
  }, [toastRef]);

  // 토스트가 완전히 사라진 후 다음 메시지 표시
  const handleToastExited = () => {
    // prevToastRef 초기화하여 같은 메시지를 다시 표시할 수 있도록
    prevToastRef.current = { open: false, message: '', severity: 'error' };
    
    if (toastQueue.length > 0) {
      const nextToast = toastQueue[0];
      setToastQueue(prev => prev.slice(1));
      setCurrentToast(nextToast);
    } else {
      setCurrentToast({ open: false, message: '', severity: 'error' });
    }
  };

  return (
    <Snackbar
      open={currentToast.open}
      autoHideDuration={4000}
      onClose={() => setCurrentToast(prev => ({ ...prev, open: false }))}
      TransitionProps={{ onExited: handleToastExited }}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <MuiAlert
        onClose={() => setCurrentToast(prev => ({ ...prev, open: false }))}
        severity={currentToast.severity}
        sx={{ width: '100%' }}
      >
        {currentToast.message}
      </MuiAlert>
    </Snackbar>
  );
};

export default ToastManager;

