import React, { useState, useEffect, useRef } from 'react';
import ChatList from './ChatList';
import ChatDetail from './ChatDetail/ChatDetail';
import Blank from './Blank';

export default (props: { pagePath: any }) => {
  const updaterRef = useRef(null);
  const { pagePath } = props;
  const [cid, setCid] = useState<string>('');
  useEffect(() => {
    setCid(pagePath.cid);
  }, [pagePath.cid]);
  const onCidChange = (cid: string) => {
    setCid(cid);
  };

  const toChangeGroupName = () => {
    updaterRef.current && updaterRef.current.toChangeGroupName();
  };
  return (
    <>
      <div className="im-layout-center">
        <ChatList ref={updaterRef} onCidChange={onCidChange} />
      </div>
      <div className="im-layout-right">
        {cid ? (
          <ChatDetail cid={cid} toChangeGroupName={toChangeGroupName} />
        ) : (
          <Blank />
        )}
      </div>
    </>
  );
};
