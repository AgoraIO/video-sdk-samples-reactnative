import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Switch } from 'react-native';
import { RtcSurfaceView } from 'react-native-agora';
import config from './config';

const styles = StyleSheet.create({
  videoView: { width: '100%', height: 200 },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    marginHorizontal: 10,
  },
});

interface AgoraUIProps {
  joined: boolean;
  remoteUids: number[];
  handleLeaveCall: () => void;
  handleJoinCall: () => void;
  setUserRole: (role: string) => void;
  additionalContent?: React.ReactNode;
}

const AgoraUI: React.FC<AgoraUIProps> = ({
  joined,
  remoteUids,
  handleLeaveCall,
  handleJoinCall,
  setUserRole,
  additionalContent,
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
      <ScrollView style={{ padding: 10 }}>
        {joined ? (
          <View key={0}>
            <Text>Local user uid: {0}</Text>
            <RtcSurfaceView canvas={{ uid: 0 }} style={styles.videoView} />
          </View>
        ) : (
          <Text>Join a channel</Text>
        )}
        {remoteUIs}
      </ScrollView>
    </View>
  );
};

export default AgoraUI;
