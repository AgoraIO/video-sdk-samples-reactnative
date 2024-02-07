import { useState, useEffect } from "react";
import AgoraManager from "../agora-manager/agoraManager";
import {
  EncryptionMode,
  EncryptionErrorType,
  RtcConnection
} from "react-native-agora";
import config from "../agora-manager/config";

const MediaEncryptionManager = () => {
  const agoraManager = AgoraManager();
  const { agoraEngineRef, joined, remoteUIDs } = agoraManager;
  const [channelName, setChannelName] = useState("");

  useEffect(() => {
    return () => {
        // Release the engine when component unmount.
        agoraManager.destroyEngine();
    };
  }, []);
  
  const joinChannel = async () => {
    try {
      await setupAgoraEngine();
      await enableEncryption();
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

  const setupAgoraEngine = async () => {
    try {
      await agoraManager.setupAgoraEngine();
      configureAgoraEngine();
    } catch (error) {
      console.error("Error setting up Agora Engine:", error);
    }
  };

  const configureAgoraEngine = () => {
    const { current } = agoraEngineRef;
    if (!current) return;

    current.registerEventHandler({
      onEncryptionError(connection: RtcConnection, errorType: EncryptionErrorType) {
        console.error("Encryption error:", errorType);
      },
    });
  };

  const enableEncryption = async () => {

    if(config.salt ===  "" || config.encryptionKey === "")
    {
      console.log("Please specify encryption key and salt in the config file");
      return;
    }
    const encryptionConfig = {
      encryptionBase64: config.salt,
      encryptionKey: config.encryptionKey,
      encryptionMode: EncryptionMode.Aes128Ecb,
    };

    agoraEngineRef.current?.enableEncryption(true, encryptionConfig);
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

export default MediaEncryptionManager;
