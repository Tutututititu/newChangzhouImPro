import React, { useState } from 'react';

import ChatRecordDrawer from '../ChatRecordDrawer';

import './style.less';

export default function (props) {
  const { msgTitle, originalMessageDigest, originalCid, originalMessageIds } =
    props.msgContent;
  const [chatRecordDrawerVisible, setChatRecordDrawerVisible] = useState(false);

  return (
    <>
      <div
        className="chatRecordComponent"
        onClick={() => setChatRecordDrawerVisible(true)}
      >
        <div className="titleBar">{msgTitle}</div>
        <div className="content">
          {originalMessageDigest
            .filter((_, index) => index < 5)
            .map((item, index) => (
              <div key={index}>{item}</div>
            ))}
        </div>
      </div>
      {chatRecordDrawerVisible && (
        <ChatRecordDrawer
          title={msgTitle}
          originalCid={originalCid}
          originalMessageIds={originalMessageIds}
          onClose={() => setChatRecordDrawerVisible(false)}
        />
      )}
    </>
  );
}
