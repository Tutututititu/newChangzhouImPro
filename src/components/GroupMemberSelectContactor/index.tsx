import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  Form,
  List,
  Divider,
  Space,
  Input,
  message as Message,
  Checkbox,
  Empty,
  Radio,
} from 'antd';
import AvatarImage from '@/components/AvatarImage';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useModel } from '@@/plugin-model/useModel';
interface PropsType {
  visible: boolean;
  title: string;
  cid: string;
  getListApi: string;
  listFilterFunc?: (list: any[]) => any[];
  onOk: (arg0: any) => void;
  onClose: () => void;
}
export default function (props: any) {
  const { visible, title, cid, getListApi, listFilterFunc, onOk, onClose } =
    props;
  const {
    sdk,
    userInfo: { userId: myUserId },
    mySdkStore,
  } = useModel('global');
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
  });
  const [selectedUsersId, setSelectedUsersId] = useState();
  useEffect(() => {
    getList(1).then((r) => {});
  }, []);
  const getList = async (pageIndex: number) => {
    const data = await sdk[getListApi]({
      cid,
      pageIndex,
      pageSize: 20,
    });
    const { next, current, totalItemCount, totalPage } = data;
    let { rows = [] } = data;
    if (listFilterFunc) {
      rows = listFilterFunc(rows);
    }
    // @ts-ignore
    setList([...list, ...rows]);
    setPagination({ pageIndex, totalItemCount, totalPage });
    console.log('====data====', data);
  };
  const getNextData = async () => {
    await getList(pagination.pageIndex + 1);
  };
  const handleOk = () => {
    onOk(selectedUsersId);
  };
  return (
    <Modal title={title} open={visible} onOk={handleOk} onCancel={onClose}>
      <div className="selectContractorComponent">
        <div>
          <InfiniteScroll
            height={400}
            dataLength={list.length}
            next={getNextData}
            hasMore={pagination.totalPage > pagination.pageIndex}
            loader={<div style={{ textAlign: 'center' }}>加载中...</div>}
            scrollableTarget="scrollableDiv"
          >
            <Radio.Group
              onChange={(e) => setSelectedUsersId(e.target.value)}
              style={{ width: '100%' }}
            >
              <List split={false}>
                {list.map((item) => {
                  return (
                    <List.Item key={item.userId}>
                      <Radio value={item.userId} style={{ marginRight: 8 }} />
                      <List.Item.Meta
                        avatar={
                          <AvatarImage
                            src={item.avatarUrl}
                            style={{ borderRadius: 8 }}
                            fit="cover"
                            width={42}
                            height={42}
                            nickName={item.nickName}
                            userName={item.userName}
                            userId={item.userId}
                          />
                        }
                        // description={<>ID: {item.userId}</>}
                        title={item.nickName}
                      />
                    </List.Item>
                  );
                })}
              </List>
            </Radio.Group>
          </InfiniteScroll>
          {!list.length && <Empty />}
        </div>
      </div>
    </Modal>
  );
}
