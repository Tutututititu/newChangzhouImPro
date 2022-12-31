import React from 'react';
import { Card, Image } from 'antd';
import { GlobalOutlined, RightOutlined } from '@ant-design/icons';

interface PropsType {
  msgContent: {
    imageFileUrl: string;
    latitude: number;
    longitude: number;
    title: string;
  }
}

export default function(props: PropsType) {
  const { latitude, longitude, title, imageFileUrl } = props.msgContent;
  const u = navigator.userAgent;
  const isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;   //判断是否是 android终端
  const isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
  const andriodGaode = () => {
    return `amapuri://route/plan/?sourceApplication=mhc&dlat=${latitude}&dlon=${longitude}&dev=0&t=0`
  }

  const iOSGaode = () => {
    return `iosamap://path?sourceApplication=mhc&dlat=${latitude}&dlon=${longitude}&dev=0&t=0`
  }

  return <Card
    title={
      <div style={{ fontWeight: 'normal' }}>
      <GlobalOutlined style={{ marginRight: '4px', color: '#1677ff' }} />
      {title}
      </div>
    }
    extra={<RightOutlined />}
    onHeaderClick={() => {
      let url = 'https://www.amap.com/';
      if(isAndroid) url = andriodGaode();
      if(isIOS) url = iOSGaode();
      window.open(url);
    }}
    style={{ borderRadius: '16px' }}
    >
      <Image src={imageFileUrl} />
    </Card>;
}