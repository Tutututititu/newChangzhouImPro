import { Drawer } from 'antd';
export default function ({ onOk, onClose }: Props) {
  return (
    <Drawer
      visible
      title="富文本"
      width={480}
      onClose={onClose}
      bodyStyle={{ height: '100%', background: 'rgba(242,244,245,1)' }}
    ></Drawer>
  );
}
