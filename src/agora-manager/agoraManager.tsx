import { useState, useEffect } from 'react';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
} from 'react-native-agora';
import { PermissionsAndroid, Platform } from 'react-native';
import config from './config';

const AgoraManager = () => {
  // State variables for managing Agora SDK, call status, and remote user IDs
  const [agoraEngine, setAgoraEngine] = useState<IRtcEngine | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteUids, setRemoteUids] = useState<number[]>([]);

  // Function to request and check permissions (Android specific)
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.INTERNET
        ]);
        if (
          result['android.permission.RECORD_AUDIO'] === 'granted' &&
          result['android.permission.CAMERA'] === 'granted'
        ) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions denied');
        }
      } catch (error) {
        console.error('Permission request error:', error);
      }
    }
  };

  // Function to initialize the Agora SDK engine for video
  const setupVideoSDKEngine = async () => {
    try {
      await getPermission();

      const engine = createAgoraRtcEngine();
      engine.registerEventHandler({
        onJoinChannelSuccess: () => {
          onJoinChannelSuccess();
        },
        onUserJoined: (_connection, Uid) => {
          onUserJoined(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          onUserOffline(Uid);
        },
      });

      engine.initialize({
        appId: config.appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });

      if (config.product !== "ILS") {
        engine.setChannelProfile(
          ChannelProfileType.ChannelProfileLiveBroadcasting
        );
      } else {
        engine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      }

      engine.enableVideo();

      setAgoraEngine(engine);
      console.log('Engine initialized');
    } catch (e) {
      console.error('Error initializing engine:', e);
    }
  };

  // Function to set the user role (Host or Audience)
  const setUserRole = async (role: string) => {
    if (agoraEngine) {
      if (role === "Host") {
        agoraEngine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
      } else {
        agoraEngine.setClientRole(ClientRoleType.ClientRoleAudience);
      }
    }
  }

  // Function to join the call
  const joinCall = async () => {
    if (agoraEngine === null) {
      return;
    }
    try {
      agoraEngine.startPreview();
      agoraEngine.joinChannel(
        config.token,
        config.channelName,
        config.uid,
        {
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
        }
      );
      setJoined(true);
    } catch (e) {
      console.error('Failed to join the call:', e);
    }
  };

  // Function to leave the call
  const leaveCall = async () => {
    try {
      await agoraEngine?.leaveChannel();
      setAgoraEngine(null);
      setRemoteUids([]);
      setJoined(false);
      console.log('You left the channel');
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  };

  // Function to display messages
  const showMessage = (msg: any) => {
    console.log(msg);
  };

  // Event handler for successful channel join
  const onJoinChannelSuccess = () => {
    showMessage('Successfully joined the channel ' + config.channelName);
    setJoined(true);
  };

  // Event handler for remote user join
  const onUserJoined = (Uid: number) => {
    showMessage('Remote user joined with uid ' + Uid);

    if (!remoteUids.includes(Uid)) {
      setRemoteUids([...remoteUids, Uid]);
    }
  };

  // Event handler for remote user leave
  const onUserOffline = (Uid: number) => {
    showMessage('Remote user left the channel. uid: ' + Uid);
    setRemoteUids(remoteUids.filter((uid) => uid !== Uid));
  };

  // Cleanup effect (on component unmount)
  useEffect(() => {
    return () => {
      // Release resources and remove event handlers here if needed
      if (agoraEngine) {
        agoraEngine.release();
      }
    };
  }, [agoraEngine]);

  // Return the functions and state variables for use in the component
  return {
    agoraEngine,
    joinCall,
    leaveCall,
    joined,
    remoteUids,
    setupVideoSDKEngine,
    setUserRole,
  };
};

export default AgoraManager;
