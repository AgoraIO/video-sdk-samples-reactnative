import React from "react";
import AgoraUI, { styles } from "../agora-manager/agoraUI";
import { View, TextInput } from "react-native";
import GeofencingManager from "./geofencingManager";

const Geofencing = () => {
  const geofencingManager = GeofencingManager();

  return (
    <AgoraUI
      joined={geofencingManager.joined}
      handleJoinCall={geofencingManager.join}
      handleLeaveCall={geofencingManager.leave}
      remoteUids={geofencingManager.remoteUIDs}
      setUserRole={geofencingManager.setUserRole}
      additionalContent={
        <View>
          <TextInput
            placeholder="Type a channel name here"
            onChangeText={(text) =>  geofencingManager.setChannelName(text)}
            style={styles.input}
            placeholderTextColor={"white"}
          />
        </View>
      }
    />
  );
};

export default Geofencing;
