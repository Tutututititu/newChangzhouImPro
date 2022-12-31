import { Space } from 'antd';

import './style.less';

export default function (props) {
  const { list = [] } = props;
  return (
    <div className="emoReplyBarComponent">
      <Space wrap={true}>
        {list.map((item, index) => (
          <div className="replyItem" key={index}>
            <img
              src={item?.faceContent?.iconUrl}
              alt="emoji"
              style={{ width: '17px', height: '17px' }}
            />{' '}
            {item?.from?.name || item?.form?.userId}
          </div>
        ))}
        {/* <div className="replyItem">
        todo: icon
        <SmileOutlined style={{ fontSize: 17 }} />
      </div> */}
      </Space>
    </div>
  );
}
