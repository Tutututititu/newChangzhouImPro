import { useState } from 'react';

const useConferenceModal = () => {
  const [visible, setVisible] = useState(false);
  const [props, setProps] = useState({
    cid: null,
    from: {},
    to: {},
    rtcAction: '',
    rtcType: 'VIDEO',
  });

  return {
    visible,
    setVisible,
    props,
    setProps,
  };
};

export default useConferenceModal;
