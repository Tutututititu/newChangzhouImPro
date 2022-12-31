import React from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
import './style.less';
import { message as Message, Button } from 'antd';
import { history, useModel } from 'umi';
import { CloseCircleOutlined } from '@ant-design/icons';

class Barcode extends React.Component {
  codeReader = new BrowserQRCodeReader();
  constructor(props) {
    super(props);
    this.state = { reader: {}, selectedDevice: '' };
    this.startButton = this.startButton.bind(this);
    this.resetButton = this.resetButton.bind(this);
    this.getBarcode = this.getBarcode.bind(this);
    this.startButton();
  }
  componentDidMount() {
    this.getBarcode();
  }
  startButton() {
    this.codeReader
      .decodeOnceFromVideoDevice(this.state.selectedDevice, 'video')
      .then(async (result) => {
        if (result?.text) {
          let data = JSON.parse(result.text);
          if (data.type == 'group') {
            const cid = data?.cid;
            const members = [{ userId: this.props.userInfo.userId }];
            let params = {
              cid,
              members,
              owner: data?.iniviteUserId,
              source: '1',
            };
            try {
              await this.props.sdk.addMemberToGroup(params);
              Message.success('加入群聊成功');
              this.resetButton();
              this.props?.setPagePath({ activeIcon: 'chat', cid });
            } catch (e) {
              console.log(e, '000!!!');
              if (e.errorCode == 'SESSION_HAS_CLOSED') {
                Message.error('群组已解散');
              }
              this.resetButton();
            }
          } else {
            try {
              let params = { invitedUserId: data?.userId };
              await this.props.sdk.addFriend(params);
              Message.success('好友请求已发送');
              this.resetButton();
            } catch (e) {
              console.log(e);
              Message.error(e?.errorMessage);
              this.resetButton();
            }
          }
        }
      })
      .catch((err) => {
        console.error(err.toString());
        history.push({ pathname: '/gov/cz/index_dev' });
      });
  }

  async resetButton() {
    try {
      this.codeReader && (await this.codeReader.reset());
    } catch (e) {
      console.log(e);
    }
    this.props.offQRC();
    // document.getElementById("result").textContent = "";
  }
  getBarcode() {
    let selectedDeviceId;

    return this.codeReader
      .getVideoInputDevices()
      .then((videoInputDevices) => {
        // const sourceSelect = document.getElementById("sourceSelect");
        selectedDeviceId = videoInputDevices[0].deviceId;
        // if (videoInputDevices.length > 1) {
        //   videoInputDevices.forEach(element => {
        //     const sourceOption = document.createElement("option");
        //     sourceOption.text = element.label;
        //     sourceOption.value = element.deviceId;
        //     sourceSelect.appendChild(sourceOption);
        //   });

        //   sourceSelect.onchange = () => {
        //     selectedDeviceId = sourceSelect.value;
        //   };

        //   const sourceSelectPanel = document.getElementById(
        //     "sourceSelectPanel"
        //   );
        //   sourceSelectPanel.style.display = "block";
        //   if ( this.codeReader && selectedDeviceId) {
        //     alert('yes')
        //   }
        // }
        this.setState({
          selectedDevice: selectedDeviceId,
        });
      })
      .catch((err) => {
        alert(err);
      });
  }

  render() {
    return (
      <div className="QRCBox">
        {Object.keys(this.codeReader).length > 0 && (
          <div className="ORCBoxItem">
            <div className="buttomFun">
              {/*<Button className="goBack" onClick={this.resetButton}>*/}
              {/*  返回*/}
              {/*</Button>*/}
              <CloseCircleOutlined
                className="CloseCircleOutlinedIcon"
                onClick={this.resetButton}
              />
              {/* <button
                className="button"
                id="startButton"
                onClick={this.startButton}
              >
                Start
              </button> */}
              {/* <button
                className="button"
                id="resetButton"
                onClick={this.resetButton}
              >
                Reset
              </button> */}
            </div>

            <video className="QRCVideo" id="video"></video>

            {/* <label>Result:</label>
            <pre>
              <code id="result"></code>
            </pre> */}
          </div>
        )}
      </div>
    );
  }
}

export default Barcode;
