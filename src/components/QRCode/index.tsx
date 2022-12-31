import './style.less';
import QRCode from 'qrcode.react';
import { Button } from 'antd';
import AvatarImage from '@/components/AvatarImage';
import { useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
const QRCodeC = (props) => {
  const [QRC, setQRC] = useState({});
  let [QRCTitle, setQRCTitle] = useState('扫一扫, 添加我为联系人');
  useEffect(() => {
    if (props.type == 'group') {
      setQRCTitle('扫一扫, 进入群聊');
      setQRC({
        cid: props?.cid,
        iniviteUserId: props.userId,
        type: props.type,
      });
    } else {
      setQRCTitle('扫一扫, 添加我为联系人');
      setQRC({ type: props.type, userId: props.userId });
    }
  }, []);
  // const downloadCode = () => {
  //   var canvasData = document.getElementsByClassName('qrcode');
  //   var a = document.createElement('a');
  //   a.setAttribute("crossOrigin",'Anonymous');
  //   a.href = canvasData[0].toDataURL();
  //   a.download = 'Qrcode';
  //   a.click();
  // };
  const createImage = () => {
    try {
      console.log('保存图片 我走到这里1');
      console.log(window.ncz, '1111233334');

      let node = document.getElementById('repair');
      const config = {
        useCORS: true,
        width: node.offsetWidth,
        height: node.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      };
      console.log('保存图片 我走到这里2');

      // 调用html2canvas插件
      html2canvas(node, config).then((canvas) => {
        console.log('保存图片 我走到这里3');

        var image = canvas
          .toDataURL('image/png')
          .replace('image/png', 'image/octet-stream');
        var userAgent = navigator.userAgent;
        console.log('保存图片 我走到这里4');
        canvas.toBlob(
          function (blob) {
            const eleLink = document.createElement('a');
            // eleLink.download = 'img.png';
            // eleLink.style.display = 'none';
            console.log('保存图片 我走到这里5');
            // 字符内容转变成blob地址
            eleLink.setAttribute('href', URL.createObjectURL(blob));
            eleLink.setAttribute('download', 'img.png');
            // eleLink.href = URL.createObjectURL(blob);
            eleLink.setAttribute('target', '_blank');
            console.log('保存图片 我走到这里6');
            // 触发点击
            // document.body.appendChild(eleLink);
            eleLink.click();
            console.log('保存图片 我走到这里7');
            // 然后移除
            console.log('保存图片 我走到这里8');
          },
          'image/png',
          1,
        );
      });
    } catch (e) {
      console.log(e, '我是保存图片');
    }
  };

  return (
    <div className="QRCode">
      <div className="title-pic">
        <AvatarImage
          nickName={props.nickName}
          userName={props.userName}
          userId={props.userId}
          style={{ borderRadius: '12px', marginLeft: '21px', paddingTop: 0 }}
          src={props.avatarUrl}
          width={40}
          height={40}
          fit="fill"
        />
      </div>
      <div className="code" id="repair">
        <QRCode
          className="qrcode"
          value={JSON.stringify(QRC)} //生成二维码的内容
          // size={256} //二维码尺寸
          fgColor="#000000" //二维码颜色
        ></QRCode>
        <AvatarImage
          className="logo"
          nickName={props.nickName}
          userName={props.userName}
          userId={props.userId}
          style={{ borderRadius: '12px', marginLeft: '21px', paddingTop: 0 }}
          // src={props?.cid ? props.avatarUrl : props.img}
          src={
            props.type == 'user'
              ? props?.avatarUrl
              : props?.img || props?.avatarUrl
          }
          width={40}
          height={40}
          fit="fill"
        />
        <div className="QRCode-add">{QRCTitle}</div>
      </div>
      <Button type="primary" onClick={() => createImage()}>
        保存图片
      </Button>
    </div>
  );
};

export default QRCodeC;
