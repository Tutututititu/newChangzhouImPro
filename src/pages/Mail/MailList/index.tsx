import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useModel } from 'umi';
import {
  UserAddOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  ProjectFilled,
  ContactsFilled,
} from '@ant-design/icons';
import LayoutCenterHeader from '@/components/LayoutCenterHeader';
import classNames from 'classnames';
interface organizationalProps {
  deptId: any;
  deptName: any;
  deptPath: any;
  deptUuid: any;
  isDeleted: any;
  isMain: any;
  children: any;
  show: boolean;
}
import './style.less';
export default function (props: any) {
  const { newFirend } = useModel('global');
  const { activePage, onActivePageChange, UserInfo, toOrganizationalChange } =
    props;
  const [organizationalList, setOrganizationalList] = useState([]);
  const [activeOrganizationalPage, setActiveOrganizationalPage] = useState('');
  useEffect(() => {
    //${UserInfo.appId}
    let urlTitle = window.location.protocol;
    axios
      .get(`/api/gov/cz/user/deptAll?userId=${UserInfo.userId}`)
      // .get(`/api/gov/cz/user/deptAll?userId=${UserInfo.userId}`)
      .then((res) => {
        let data = res.data.data;
        let list: string | any[] | ((prevState: never[]) => never[]) = [];
        if (data && data.length > 0) {
          list = [
            {
              deptId: '0',
              deptName: '组织架构',
              deptPath: '组织架构',
              deptUuid: '0',
              isDeleted: 0,
              isMain: 0,
              children: data,
              show: true,
            },
          ];
        }
        if (list.length > 0) {
          list = changeList(list);
          // @ts-ignore
          setOrganizationalList(list);
        }
      });
  }, []);
  const changeList = (list: any) => {
    for (let item of list) {
      item.show = false;
      const children = item.children ? item.children : [];
      if (children && children.length > 0) {
        changeList(item.children);
      }
    }
    return list;
  };
  const onActiveOrganizationalChange = async (
    item: organizationalProps,
    activePage: string,
  ) => {
    getChildList(item, activePage);
  };
  const getChildList = (item: organizationalProps, activePage: string) => {
    let urlTitle = window.location.protocol;
    console.log(item, '请求的入参');
    axios
      .get(`/api/gov/cz/dept/querySub?parentId=${item.deptId}`)
      // .get(`/api/gov/cz/dept/querySub?parentId=${item.deptId}`)
      .then((res) => {
        console.log(res, '返回豹纹');

        let data = res.data.data;
        console.log('data====', data);
        if (data && data.length > 0) {
          let newList = JSON.parse(JSON.stringify(organizationalList));
          // @ts-ignore
          newList = renderChild(newList, item.deptId, data);
          console.log(newList, '处理的数据');

          setOrganizationalList(newList);
        } else {
          toOrganizationalChange(item);
          setActiveOrganizationalPage(activePage);
          onActivePageChange('organizationalList');
        }
      });
  };
  const renderChild = (list: any, iid: any, child: any) => {
    for (let item of list) {
      if (item.deptId == iid) {
        item.show = true;
        item.children = child;
      }
      if (item.children) {
        renderChild(item.children, iid, child);
      }
    }
    return list;
  };
  const organizationalChange = async (item: organizationalProps) => {
    console.log('item===', item);
    let newList = JSON.parse(JSON.stringify(organizationalList));
    newList = renderOrganizationalChange(newList, item.deptId);
    setOrganizationalList(newList);
  };
  const activePageChange = (value: string) => {
    onActivePageChange(value);
    if (value !== 'organizationalList') {
      setActiveOrganizationalPage('');
    }
  };
  const renderOrganizationalChange = (list: any, iid: any) => {
    for (let item of list) {
      if (item.deptId === iid) {
        item.show = !item.show;
      }
      if (item.children) {
        renderOrganizationalChange(item.children, iid);
      }
    }
    return list;
  };
  const renderTreeOrganizational = (list: any) => {
    return list.map((item: any, index: number) => {
      if (!item.children) {
        return (
          <div
            key={index}
            className={classNames({
              operationBar: true,
              active: activeOrganizationalPage === item.deptId,
            })}
            onClick={() => onActiveOrganizationalChange(item, item.deptId)}
          >
            <div className="apartment">
              <img src={require('@/assets/department.png')} alt="" />
            </div>
            {item.deptName}
          </div>
        );
      } else {
        return (
          <div key={index}>
            <div
              className={classNames({
                operationBar: true,
                active: item.show,
              })}
              onClick={() => organizationalChange(item)}
            >
              <div className="apartment">
                <img src={require('@/assets/apartment.png')} alt="" />
              </div>
              {item.deptName}
              {item.show && (
                <img
                  className="apartment-down"
                  src={require('@/assets/caret-down.png')}
                  alt=""
                />
              )}
              {!item.show && (
                <img
                  className="apartment-down"
                  src={require('@/assets/caret-up.png')}
                  alt=""
                />
              )}
            </div>
            {item.show && renderTreeOrganizational(item.children)}
          </div>
        );
      }
    });
  };
  const [havNewFirend, setHavNewFirend] = useState(false);
  useEffect(() => {
    if (newFirend) {
      setHavNewFirend(true);
    } else {
      setHavNewFirend(false);
    }
  }, [newFirend]);
  // @ts-ignore
  return (
    <div className="mailListPage" style={{ height: window.innerHeight }}>
      <LayoutCenterHeader title="通讯录" />
      <div className="operationBarWrap">
        <div
          className={classNames({
            operationBar: true,
            active: activePage === 'commonContactorList',
          })}
          onClick={() => activePageChange('commonContactorList')}
        >
          <div className="operationIcon">
            <ContactsFilled style={{ color: '#fff', fontSize: 18 }} />
          </div>
          常用联系人
        </div>
        <div
          className={classNames({
            operationBar: true,
            active: activePage === 'newFriendList',
          })}
          onClick={() => activePageChange('newFriendList')}
          style={{ position: 'relative' }}
        >
          {havNewFirend ? <div className="havNewFirend"></div> : ''}
          <div
            className="operationIcon"
            style={{ background: 'rgba(253,127,44,1)' }}
          >
            <UserAddOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          新的朋友
        </div>
        <div
          className={classNames({
            operationBar: true,
            active: activePage === 'friendList',
          })}
          onClick={() => activePageChange('friendList')}
        >
          <div className="operationIcon">
            <UserOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          我的好友
        </div>
        <div
          className={classNames({
            operationBar: true,
            active: activePage === 'groupList',
          })}
          onClick={() => activePageChange('groupList')}
        >
          <div className="operationIcon">
            <UsergroupAddOutlined style={{ color: '#fff', fontSize: 18 }} />
          </div>
          我的群组
        </div>
        <div
          className={classNames({
            operationBar: true,
            active: activePage === 'contactorList',
          })}
          onClick={() => activePageChange('contactorList')}
        >
          <div className="operationIcon">
            <ProjectFilled style={{ color: '#fff', fontSize: 18 }} />
          </div>
          全部联系人
        </div>
        <hr className="listHr" />
        {renderTreeOrganizational(organizationalList)}
      </div>
    </div>
  );
}
