import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Switch } from 'react-native';
import { RtcSurfaceView } from 'react-native-agora';
import config from './config';

export const styles = StyleSheet.create({
  videoView: { width: '100%', height: 200, flex: 1 },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    marginHorizontal: 10,
  },
  input: {
    alignSelf: "center",
    borderColor: "white",
    borderWidth: 1,
    height: 40,
  },
  mediaPlayerView: {width: '100%', height: 200 },
  sliderStyle: { width: 200, marginTop: 20, alignSelf: 'center' },
  volumeControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
},
volumeText: {
    color: "white",
    marginHorizontal: 10,
},
muteSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
},
muteLabel: {
    marginRight: 10,
    color: "white",
},
screenShareView: {
    width: '100%',
    height: 200,
},
networkQuality: {
  color: "white",
},
buttonContainer: {
  padding: 2,
},


});

interface AgoraUIProps {
  joined: boolean;
  remoteUids: number[];
  handleLeaveCall: () => void;
  handleJoinCall: () => void;
  setUserRole: (role: string) => void;
  additionalContent?: React.ReactNode;
  additionalViews?: React.ReactNode
}

const AgoraUI: React.FC<AgoraUIProps> = ({
  joined,
  remoteUids,
  handleLeaveCall,
  handleJoinCall,
  setUserRole,
  additionalContent,
  additionalViews
}: AgoraUIProps) => {
  const [remoteUIs, setRemoteUIs] = useState<JSX.Element[]>([]);
  const [clientRole, setRole] = useState(false);

  useEffect(() => {
    // Create remote UI components when remoteUids change
    const newRemoteUIs = remoteUids.map((uid) => (
      <View key={uid}>
        <Text>Remote user uid: {uid}</Text>
        <RtcSurfaceView canvas={{ uid }} style={styles.videoView} />
      </View>
    ));

    setRemoteUIs(newRemoteUIs);
  }, [remoteUids]);

  useEffect(() => {
    setRemoteUIs((prevRemoteUIs) => {
      // Filter out remote UI components that are no longer in remoteUids
      const updatedRemoteUIs = prevRemoteUIs.filter((ui) => {
        const key = ui.key as string;
        const uid = parseInt(key);
        return remoteUids.includes(uid);
      });
      return updatedRemoteUIs;
    });
  }, [remoteUids]);

  return (
    <View>
      {joined && config.product === 'ILS' && (
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Host</Text>
          <Switch
            value={clientRole}
            onValueChange={(newValue) => {
              setRole(newValue);
              setUserRole(newValue ? 'Audience' : 'Host');
            }}
          />
          <Text style={styles.switchLabel}>Audience</Text>
        </View>
      )}
      <View>
        {additionalContent && (
          <View>
            {additionalContent}
          </View>
        )}
        <View style = {{padding: 2}}>
        <Button
          title={joined ? 'Leave' : 'Join'}
          onPress={() => {
            if (joined) {
              handleLeaveCall();
            } else {
              handleJoinCall();
            }
          }}
        />
        </View>
      </View>
      <ScrollView style={{ padding: 5 }}>
        {joined ? (
          <View key={config.uid}>
            <Text style = {{color: "white"}}>Local user uid: {config.uid}</Text>
            <RtcSurfaceView canvas={{ uid: config.uid }} style={styles.videoView} />
          </View>
        ) : (
          <Text style = {{color: '#FFFFFF'}}>Join a channel</Text>
        )}
        {additionalViews}
        {remoteUIs}
      </ScrollView>
    </View>
  );
};

export default AgoraUI;
