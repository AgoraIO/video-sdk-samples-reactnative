import { useState, useEffect } from "react";
import AgoraManager from "../agora-manager/agoraManager";
import { CloudProxyType, ConnectionChangedReasonType, ConnectionStateType, ProxyType, RtcConnection } from "react-native-agora";

const CloudProxyManager = () => {
  const agoraManager = AgoraManager();
  const { agoraEngineRef, joined, remoteUIDs } = agoraManager;
  const [channelName, setChannelName] = useState("");
  const [directConnectionFailed, setDirectConnectionFailed] = useState(false);

  useEffect(() => {
    return () => {
      // Release the engine when the component unmounts.
      agoraManager.destroyEngine();
    };
  }, []);

  const registerConnectionStateHandler = () => {
    agoraEngineRef.current?.registerEventHandler({
      onConnectionStateChanged: (connection: RtcConnection, state: ConnectionStateType, reason: ConnectionChangedReasonType) => {
        if (state === ConnectionStateType.ConnectionStateFailed && reason === ConnectionChangedReasonType.ConnectionChangedJoinFailed) {
          setDirectConnectionFailed(true);
        }
      },
      onProxyConnected : (
        channel: string,
        uid: number,
        proxyType: ProxyType,
        localProxyIp: string,
        elapsed: number) => {
            console.log("Proxy server connected.");
        }
    });
  };

  useEffect(() => {
    if (directConnectionFailed) {
      agoraEngineRef.current?.setCloudProxy(CloudProxyType.UdpProxy);
    }
  }, [directConnectionFailed]);

  const joinChannel = async () => {
    try {
      await agoraManager.setupAgoraEngine();
      registerConnectionStateHandler();
      await agoraManager.fetchRTCToken(channelName);
      await agoraManager.joinChannel();
    } catch (error) {
      console.error("Error joining channel:", error);
    }
  };

  const leaveChannel = async () => {
    try {
      await agoraManager.leaveChannel();
      agoraManager.destroyEngine();
    } catch (error) {
      console.error("Error leaving channel:", error);
    }
  };

  return {
    agoraEngineRef,
    join: joinChannel,
    leave: leaveChannel,
    joined,
    fetchRTCToken: agoraManager.fetchRTCToken,
    remoteUIDs,
    setUserRole: agoraManager.setUserRole,
    setChannelName,
  };
};

export default CloudProxyManager;
