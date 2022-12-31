import { useState, useEffect } from 'react';
import { useModel } from 'umi';
import { Input, List, Image, Button, Checkbox } from 'antd';
import AvatarImage from '../../AvatarImage';

import './style.less';

interface PropsType {
  visible: boolean,
  title: string;
  cid: string;
  getListApi: string,
  listFilterFunc?: (list: any[]) => any[];
  onOk: (selectedItem: any[]) => void;
  onClose: () => void;
}

export default function(props: PropsType) {
  const mySdkStore = useModel('global');
  const { title, cid, getListApi, listFilterFunc, onOk, onClose } = props;
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({});

  const getList = async (pageIndex) => {
    const data = await mySdkStore.sdk[getListApi]({ cid, pageIndex, pageSize: 20 });
    // todo: 返回current为0
    const { next, current, totalItemCount, totalPage } = data;
    let { rows = []} = data;
    if (listFilterFunc) {
      rows = listFilterFunc(rows);
    }
    setList([...list, ...rows]);
    setPagination({ pageIndex, totalItemCount, totalPage });
  }

  useEffect(() => {
    getList(1);
  }, []);

  const handleOk = (userInfo) => {
    onOk(userInfo);
  }

  const renderList = () => {
    return <List style={{ '--border-inner': 0 }}>
      {list.map(item => {
        return <List.Item
          key={item.userId}
          prefix={
          <>
            <AvatarImage
              src={item.avatarUrl}
              nickName={item.nickName}
              userName={item.userName}
              userId={item.userId}
              style={{ display: 'inline-block', borderRadius: 8 }}
              fit='cover'
              width={36}
              height={36}
            />
        </>}><span onClick={() => handleOk(item)}>{item.userName || item.nickName}</span></List.Item>
      })}
    </List>
  }

  return null;
  // <Popup
  //     visible={true}
  //     bodyClassName="popupbody">
  //     <div className="sendUserCardComponent">
  //       <NavBar
  //         mode="light"
  //         onLeftClick={onClose}
  //         icon={<Icon type="left" style={{ color: 'rgba(0,0,0,0.65)' }} />}>
  //         { title }
  //       </NavBar>
  //       {/* todo: 没有关键词搜索参数 */}
  //       {/* <SearchBar className="searchBar" /> */}
  //         {renderList()}
  //         <InfiniteScroll loadMore={() => getList(pagination.pageIndex + 1)} hasMore={pagination.pageIndex < pagination.totalPage}>
  //         </InfiniteScroll>
  //     </div>
  // </Popup>;
}