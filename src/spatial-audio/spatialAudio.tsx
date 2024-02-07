import React, { useState } from "react";
import AgoraUI, { styles } from "../agora-manager/agoraUI";
import Slider from "@react-native-community/slider";
import { View, TextInput } from "react-native";
import SpatialAudioManager from "./spatialAudioManager";

const SpatialAudio = () => {
  const {
    joined,
    join,
    leave,
    remoteUIDs,
    setUserRole,
    setChannelName,
    updateRemoteSpatialAudioPosition,
  } = SpatialAudioManager();

  const initialDistanceUnit = 5; // Initial value for the audio range, adjusted to be within the Slider range
  const [distanceUnit, setDistanceUnit] = useState(initialDistanceUnit);

  return (
    <>
      <AgoraUI
        joined={joined}
        handleJoinCall={join}
        handleLeaveCall={leave}
        remoteUids={remoteUIDs}
        setUserRole={setUserRole}
        additionalContent={
          <View>
            <TextInput
              placeholder="Type a channel name here"
              placeholderTextColor="white"
              onChangeText={(text) => setChannelName(text)}
              style={styles.input}
            />
            <Slider
              style={styles.sliderStyle}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={distanceUnit}
              onValueChange={(sourceDistance) => updateRemoteSpatialAudioPosition(sourceDistance)}
            />
          </View>
        }
      />
    </>
  );
};

export default SpatialAudio;
