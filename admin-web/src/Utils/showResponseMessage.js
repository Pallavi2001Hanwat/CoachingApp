// utils/showResponseMessage.js
import { toast } from 'react-toastify';

export const showResponseMessage = (response) => {
    
  const  status   = response.success;
  const   message  = response.message;

  if (!status) {
    toast.error('Unknown response status');
    return;
  }

  if (status) {
    toast.success(message);
  } else if (status === 400) {
    toast.error(message);
  } else if (status === 401) {
    toast.error('Unauthorized. Please log in again.');
  } else if (status === 500) {
    toast.error('Server error. Please try again later.');
  } else {
    toast.info(message || 'Unexpected response');
  }
};
