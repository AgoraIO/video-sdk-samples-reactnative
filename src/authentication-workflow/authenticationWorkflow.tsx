import React from "react";
import AgoraUI, { styles } from "../agora-manager/agoraUI";
import { TextInput, View } from "react-native";
import AuthenticationWorkflowManager from "./authenticationWorkflowManager";


const AuthenticationWorkflow = () => {
  const authenticationWorkflowManager = AuthenticationWorkflowManager();

  return (
    <AgoraUI
      joined={authenticationWorkflowManager.joined}
      handleJoinCall={authenticationWorkflowManager.joinChannel}
      handleLeaveCall={authenticationWorkflowManager.leaveChannel}
      remoteUids={authenticationWorkflowManager.remoteUIDs}
      setUserRole={authenticationWorkflowManager.setUserRole}
      additionalContent={
        <View>
          <TextInput
            placeholder="Type a channel name here"
            placeholderTextColor={'white'}
            onChangeText={(text) => authenticationWorkflowManager.setChannelName(text)}
            style={styles.input}
          />
        </View>
      }
    />
  );
};

export default AuthenticationWorkflow;
