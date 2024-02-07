import {EncryptionMode} from 'react-native-agora'
import { getResourcePath } from '../../utils';
const config: configType = {
    uid: 0,
    appId: "",
    channelName: "demo",
    token: "",
    serverUrl: "",
    tokenExpiryTime: 60,
    encryptionMode: EncryptionMode.Aes128Gcm2,
    salt: "",
    cipherKey: "",
    product: "",
    audioFilePath: getResourcePath('effect.mp3'),
    soundEffectId: 1,
    soundEffectFilePath: getResourcePath('applause.mp3'),
    logFilePath: "",
    mediaLocation: "https://www.appsloveworld.com/wp-content/uploads/2018/10/640.mp4",
    encryptionBase64: "",
    encryptionKey: "",
    imagePath: getResourcePath('background.jpeg'),
    destChannelName : '',
    destChannelToken : '',
    destUid : 100,
    secondChannelToken: "",
    secondChannelUid: 100,
    secondChannelName: ""
  };
  
  export type configType = {
    uid: number;
    appId: string;
    channelName: string;
    serverUrl: string;
    tokenExpiryTime: number;
    token: string;
    encryptionMode: EncryptionMode;
    salt: string;
    cipherKey: string;
    product: string;
    audioFilePath: string;
    soundEffectId: number;
    soundEffectFilePath: string,
    logFilePath: string,
    mediaLocation: string,
    encryptionBase64: string,
    encryptionKey: string,
    imagePath: string,
    destChannelName : string,
    destChannelToken : string,
    destUid : 100 // User ID that the user uses in the destination channel.
    secondChannelUid: number,
    secondChannelName: string,
    secondChannelToken: string
  };
  
  export default config;