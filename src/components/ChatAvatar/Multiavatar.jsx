import React, { useRef, useEffect } from 'react';
import multiavatar from '@multiavatar/multiavatar';

const Multiavatar = ({ size = 36, id = 'ccm-im' }) => {
  const ref = useRef();

  useEffect(() => {
    ref.current.innerHTML = multiavatar(id)
  }, [id]);

  return <div ref={ref} style={{ width: size, height: size }} />;
};

export default Multiavatar;