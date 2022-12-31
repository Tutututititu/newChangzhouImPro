import { useState, useEffect } from 'react';
import { Drawer, Space, Button, Spin } from 'antd';
import { message as Message } from 'antd';
import './style.less';

interface PropsType {
  onOk?: (positionResult: any) => void;
  onClose?: () => void;
  title: string;
}

export default function (props: PropsType) {
  const { onOk = () => {}, onClose, title } = props;
  const [positionResult, setPositionResult] = useState({});

  useEffect(() => {
    (window as any).AMapUI.loadUI(
      ['misc/PositionPicker'],
      function (PositionPicker) {
        var map = new (window as any).AMap.Map('mapContainer', {
          zoom: 16,
          resizeEnable: true,
        });

        var positionPicker = new PositionPicker({
          mode: 'dragMap',
          map: map,
        });

        positionPicker.on('fail', function (positionResult) {
          console.error(positionResult);
        });

        (window as any).AMap.plugin('AMap.Geolocation', function () {
          var geolocation = new (window as any).AMap.Geolocation({
            enableHighAccuracy: true, //是否使用高精度定位，默认:true
            timeout: 10000, //超过10秒后停止定位，默认：5s
            buttonPosition: 'RB', //定位按钮的停靠位置
            // buttonOffset: new (window as any).AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            zoomToAccuracy: true, //定位成功后是否自动调整地图视野到定位点
          });

          map.addControl(geolocation);
          geolocation.getCurrentPosition(function (status, result) {
            if (status == 'complete') {
              setTimeout(() => {
                positionPicker.start();
                positionPicker.on('success', function (positionResult) {
                  console.log('positionResult>>>', positionResult);
                  const { address, position } = positionResult;
                  const { lat, lng } = position;
                  const imageWidth = 450;
                  const imageHeight = 300;
                  const imageFileUrl = `https://restapi.amap.com/v3/staticmap?location=${lng},${lat}&zoom=17&size=${imageWidth}*${imageHeight}&scale=2&markers=mid,,A:${lng},${lat}&key=d542e1db2cc6c852891d9e9a91f60238`;
                  setPositionResult({
                    address,
                    lat,
                    lng,
                    imageFileUrl,
                    imageHeight,
                    imageWidth,
                  });
                });
              }, 300);
            } else {
              console.error({ status, result });
              Message.error('请求定位超时');
            }
          });
        });
        map.panBy(0, 1);

        map.addControl(
          new (window as any).AMap.ToolBar({
            liteStyle: true,
          }),
        );
      },
    );
  }, []);

  return (
    <div>
      <Drawer
        visible
        title="发送位置"
        width={480}
        onClose={onClose}
        placement="right"
        bodyStyle={{ height: '100%', background: 'rgba(242,244,245,1)' }}
        footer={
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button
              type="primary"
              onClick={() => {
                onOk(positionResult);
              }}
            >
              发送
            </Button>
          </Space>
        }
      >
        <div className="mapBody">
          {/* <div style={{ height: '90%', padding: '0 16px', wordBreak: 'break-all' }}>{positionResult.address}</div> */}
          <div
            id="mapContainer"
            style={{ height: '90%', width: '100%' }}
            tabIndex="0"
          ></div>
          <div className="address">{positionResult.address}</div>
        </div>
      </Drawer>
    </div>
  );
}
