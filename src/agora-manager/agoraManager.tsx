import { useState, useEffect, useRef } from 'react';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  RtcConnection,
  UserOfflineReasonType,
  AreaCode
} from 'react-native-agora';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import config from './config';

const AgoraManager = () => {
  const agoraEngineRef = useRef<IRtcEngine | null>(null);
  const [joined, setJoined] = useState(false);
  const [remoteUIDs, addRemoteUser] = useState<number[]>([]);
  const [agoraRegion, setAgoraRegion] =  useState<AreaCode>(AreaCode.AreaCodeGlob);
  const getPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ]);
        const permissionsGranted =
          result['android.permission.RECORD_AUDIO'] === 'granted' &&
          result['android.permission.CAMERA'] === 'granted';

        if (permissionsGranted) {
          console.log('Permissions granted');
        } else {
          console.log('Permissions denied');
        }
      } catch (error) {
        console.error('Permission request error:', error);
      }
    }
  };

  const fetchRTCToken = async (channelName: string) => {
    try {
      if(channelName == "")
      {
        console.log("You did not input the channel name, joining with the channel name: " + config.channelName);
      }
      if (config.serverUrl !== "") {
        const response = await fetch(
          `${config.serverUrl}/rtc/${channelName}/publisher/uid/${config.uid}/?expiry=${config.tokenExpiryTime}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch RTC token');
          return;
        }

        const data = await response.json();
        console.log("RTC token fetched from server:", data.rtcToken);

        config.token = data.rtcToken;
        config.channelName = channelName;
        return data.rtcToken;
      } else {
        console.log("Add a token server URL in the `config.json` to fetch a token.");
        return config.token;
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const setupAgoraEngine = async () => {
    try {
      await getPermission();
      agoraEngineRef.current = createAgoraRtcEngine();
      agoraEngineRef.current.registerEventHandler({
        onJoinChannelSuccess: onJoinChannelSuccess,
        onUserJoined: onUserJoined,
        onUserOffline: onUserOffline,
      });

      const channelProfile =
        config.product !== "ILS"
          ? ChannelProfileType.ChannelProfileLiveBroadcasting
          : ChannelProfileType.ChannelProfileCommunication;
      
      if( config.appId == "")
      {
        Alert.prompt("Please specify a valid app ID to initialize the engine instance");
        return;
      }
      agoraEngineRef.current.initialize({
        appId: config.appId,
        channelProfile: channelProfile,
        areaCode: agoraRegion
      });

      agoraEngineRef.current.enableVideo();
      console.log('Engine initialized');
    } catch (e) {
      console.error('Error initializing engine:', e);
    }
  };

  const setUserRole = async (role: string) => {
    if (agoraEngineRef.current) {
      const clientRole =
        role === "Host"
          ? ClientRoleType.ClientRoleBroadcaster
          : ClientRoleType.ClientRoleAudience;

      agoraEngineRef.current.setClientRole(clientRole);
    }
  };

  const joinChannel = async () => {
    try {
      agoraEngineRef.current?.startPreview();
      agoraEngineRef.current?.joinChannel(
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

  const leaveChannel = async () => {
    try {
      await agoraEngineRef.current?.leaveChannel();
      setJoined(false);
    } catch (error) {
      console.error('Failed to leave channel:', error);
    }
  };

  const destroyEngine =  async () =>
  {
    agoraEngineRef.current?.release();
    agoraEngineRef.current = null;
    addRemoteUser([]);

  }

  const showMessage = (msg: any) => {
    console.log(msg);
  };

  const onJoinChannelSuccess = () => {
    showMessage('Successfully joined the channel ' + config.channelName);
  };

  const onUserJoined = (connection: RtcConnection, remoteUid: number, elapsed: number) => {
    showMessage('Remote user joined with uid ' + remoteUid);
    if ( connection.channelId === config.channelName)
    {
      if (!remoteUIDs.includes(remoteUid)) {
        addRemoteUser([...remoteUIDs, remoteUid]);
      }
    }
  };

  const onUserOffline = (connection: RtcConnection, remoteUid: number, reason: UserOfflineReasonType) => {
    showMessage('Remote user left the channel. uid: ' + remoteUid + ' , Reason:' + reason);
    addRemoteUser(remoteUIDs.filter((uid) => uid !== remoteUid));
  };

  useEffect(() => {
    return () => {
      if (agoraEngineRef.current) {
        try {
          agoraEngineRef.current.release();
          console.log('Engine destroyed');
        } catch (error) {
          console.error('Error releasing resources:', error);
        }
      }
    };
  }, []);

  return {
    agoraEngineRef,
    joinChannel,
    leaveChannel,
    joined,
    addRemoteUser,
    setUserRole,
    fetchRTCToken,
    setupAgoraEngine,
    destroyEngine,
    setAgoraRegion,
    remoteUIDs
  };
};

export default AgoraManager;
