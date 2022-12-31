import { Button, Drawer, Checkbox, List, Radio } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import InfiniteScroll from 'react-infinite-scroll-component';
import AvatarImage from '../../AvatarImage';
import './style.less';
export default function (props: any) {
  const { sdk, userInfo } = useModel('global');
  const { cid, onOk, onClose } = props;
  const [list, setList] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    totalPage: 1,
    totalItmeCount: 0,
  });
  const [selectedSingle, setSelectedSingle] = useState([]);

  const myUserId = userInfo.userId;
  const handleOk = (userId?: string, userInfo?: Object) => {
    let allInfoItems;
    if (userInfo) {
      allInfoItems = [userInfo];
    } else {
      allInfoItems = list.filter(
        (item) => selectedSingle.indexOf(item.userId) > -1,
      );
    }
    if (userId) {
      if (isMultiSelecting) {
        return;
      } else {
        onClose();
      }
      // console.log([{ userId, userName: allInfoItems[0]?.nickName}], allInfoItems, '11223344');
      // console.log(userId, '---');
      onOk([{ userId, userName: allInfoItems[0]?.nickName }], allInfoItems);
      return;
    }
    let changeData = selectedSingle.map((item) => {
      return {
        userId: item.userId,
        nickName: item?.userName || item?.nickName,
      };
    });
    onClose();
    onOk([...changeData], allInfoItems);
  };
  const getList = async (pageIndex) => {
    const res = await sdk.listGroupMembers({ pageIndex, cid });
    console.log(res);
    const { rows: list = [], next, currentPageIndex } = res;
    const rows = list.filter((item) => item.userId !== myUserId);
    setPagination({ pageIndex: currentPageIndex, next });
    setList(pageIndex === 1 ? rows : [...list, ...rows]);
  };
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  useEffect(() => {
    getList(1);
  }, [cid]);

  const renderList = () => {
    return (
      <>
        <Radio.Group>
          <List split={false}>
            {!isMultiSelecting && (
              <List.Item
                key={'__at_all__'}
                prefix={<div className="atIcon">@</div>}
              >
                <div
                  onClick={() =>
                    handleOk('__at_all__', {
                      nickName: '所有人',
                      userId: '__at_all__',
                    })
                  }
                >
                  @所有人
                </div>
              </List.Item>
            )}
            {list.map((item) => {
              return (
                <List.Item
                  key={item.userId}
                  onClick={() => handleOk(item.userId, item)}
                >
                  {isMultiSelecting && (
                    <Checkbox value={item} style={{ marginRight: 8 }} />
                  )}
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
                    // title={item.nickName}
                  ></List.Item.Meta>
                  <div>{item.nickName || item.userName || item.userId}</div>
                </List.Item>
              );
            })}
          </List>
        </Radio.Group>
        {/* <List style={{ '--border-inner': 0 }}>
        {!isMultiSelecting && <List.Item
          key={'__at_all__'}
          prefix={<div className="atIcon">@</div>}><div onClick={() => handleOk('__at_all__', { nickName: '所有人', userId: '__at_all__' })}>所有人</div>
        </List.Item>}
        {list.map(item => {
          return <List.Item
            key={item.userId}
            prefix={
              <>
                {isMultiSelecting && <Checkbox value={item.userId} style={{ marginRight: 12, marginBottom: 10 }} />}
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
              </>
            }
          ><div onClick={() => handleOk(item.userId, item)}>{item.nickName || item.userName || item.userId}</div></List.Item>
        })
        }
      </List> */}
        {/* <InfiniteScroll next={() => getList(pagination.pageIndex + 1)} hasMore={pagination.pageIndex < pagination.totalPage} /> */}
      </>
    );
  };

  return (
    <Drawer
      visible
      title="请选择"
      placement="bottom"
      style={{ width: '100vw' }}
      onClose={onClose}
      mask={false}
      autoFocus={false}
    >
      <div>
        <div className="selectAtUserComponent">
          {/* <NavBar
          mode="light"
          onLeftClick={onClose}
          icon={<Icon type="left" style={{ color: 'rgba(0,0,0,0.65)' }} />}
          rightContent={
            isMultiSelecting ?
              <a onClick={() => { setIsMultiSelecting(false) }} style={{ color: 'rgba(0,0,0,0.65)' }}>取消多选</a> :
              <a onClick={() => { setIsMultiSelecting(true) }} style={{ color: 'rgba(0,0,0,0.65)' }}>多选</a>
          }>
          选择要@的人
        </NavBar> */}
          <div>
            {isMultiSelecting ? (
              <a
                className="moreBtn"
                onClick={() => {
                  setIsMultiSelecting(false);
                }}
                style={{ color: 'rgba(0,0,0,0.65)' }}
              >
                取消多选
              </a>
            ) : (
              <a
                className="moreBtn"
                onClick={() => {
                  setIsMultiSelecting(true);
                }}
                style={{ color: 'rgba(0,0,0,0.65)' }}
              >
                多选
              </a>
            )}
          </div>
          {/* todo: listGroupMembers 没有关键词搜索参数 */}
          {/* <SearchBar className="searchBar" /> */}
          <Checkbox.Group onChange={(val) => setSelectedSingle(val)}>
            {renderList()}
          </Checkbox.Group>
          {isMultiSelecting && (
            <div className="bottomOperationBar">
              <div style={{ lineHeight: '29px' }}>
                已选择：{selectedSingle.length}人
              </div>
              <Button
                color="primary"
                size="small"
                onClick={() => handleOk()}
                disabled={!selectedSingle.length}
              >
                确定
              </Button>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
