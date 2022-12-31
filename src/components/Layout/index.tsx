import React, { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Spin } from 'antd';
import LeftMenu from '../LeftMenu';
import Chat from '@/pages/Chat';
import Mail from '@/pages/Mail';
import Collect from '@/pages/Collect';

import ConferenceModal from '@/components/ConferenceModal';
import MeetingModel from '@/components/MeetingModel';

import './style.less';

export default function () {
  const {
    visible,
    props
  } = useModel('meetingModal');

  const { loading, pagePath, userInfo } = useModel('global');
  const [activeIcon, setActiveIcon] = useState(pagePath.activeIcon || 'chat');
  function initRem(): void {
    const docEle = document.documentElement;
    function setHtmlFontSize() {
      let deviceWidth = docEle.clientWidth || window.innerWidth;
      let multiple = deviceWidth / 1440;
      let size = 14.4 * multiple;
      if (deviceWidth < 800) {
        docEle.style.fontSize = size.toFixed(3) + 'px';
      } else {
        if (size > 14.4) {
          docEle.style.fontSize = size.toFixed(3) + 'px';
        } else {
          docEle.style.fontSize = '14' + 'px';
        }
      }
    }
    setHtmlFontSize();
    window.addEventListener('resize', setHtmlFontSize);
  }
  initRem();

  useEffect(() => {
    setActiveIcon(pagePath.activeIcon || 'chat');
  }, [pagePath]);
  const getMainContent = () => {
    switch (activeIcon) {
      case 'chat':
        return <Chat pagePath={pagePath} />;
      case 'mail':
        return <Mail pagePath={pagePath} UserInfo={userInfo} />;
      case 'collect':
        return <Collect />;
    }
  };
  const { rtcType, toList, selectedUserIds } = props;

  return loading ? (
    <Spin size="large" className="loginSpin" />
  ) : (
    <div className="im-layout-container">
      <div className="im-layout-top">
        <LeftMenu
          onActiveIconChange={(activeIcon: string) => setActiveIcon(activeIcon)}
        />
      </div>
      <div className="body">
        {getMainContent()}
        <ConferenceModal />
        {!visible ? null : rtcType == 'VIDEO' ? <MeetingModel /> : ''}
      </div>
    </div>
  );
}
