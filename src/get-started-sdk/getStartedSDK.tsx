import React from "react";
import AgoraManager from "../agora-manager/agoraManager";
import AgoraUI from "../agora-manager/agoraUI";

const GetStartedSDK = () => {
  const agoraManager = AgoraManager();

  // Create an instance of the engine and join the channel
  const handleJoinCall = async () => {
    await agoraManager.joinCall();
  };

  // Leave the channel and release the engine instance.
  const handleLeaveCall = async () => {
    await agoraManager.leaveCall();
  };

  return (
    <AgoraUI
      joined={agoraManager.joined}
      handleJoinCall={handleJoinCall}
      handleLeaveCall={handleLeaveCall}
      remoteUids={agoraManager.remoteUids}
      setUserRole={agoraManager.setUserRole}
    />
  );
};

export default GetStartedSDK;

