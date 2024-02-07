import React, { useState } from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import GetStartedSDK from './src/get-started-sdk/getStartedSDK';
import AuthenticationWorkflow from './src/authentication-workflow/authenticationWorkflow';
import EnsureCallQuality from './src/ensure-call-quality/ensureCallQuality';
import AudioAndVoiceEffects from './src/audio-and-voice-effects/audioAndVoiceEffects';
import PlayMedia from './src/play-media/playMedia';
import DropDownPicker, { ItemType } from 'react-native-dropdown-picker';
import config from './src/agora-manager/config';
import CloudProxy from './src/cloud-proxy/cloudProxy';
import Geofencing from './src/geofencing/geofencing';
import MediaEncryption from './src/encrypt-media-stream/mediaEncryption';
import ProductWorkflow from './src/product-workflow/productWorkflow';
import VirtualBackground from './src/virtual-background/virtualBackground';
import AINoiseSuppression from './src/ai-noise-suppression/aiNoiseSuppression';
import SpatialAudio from './src/spatial-audio/spatialAudio';
import LivesStreamingOverMultipleChannels from './src/live-streaming-over-multiple-channels/livesStreamingOverMultipleChannels';

const App = () => {
  const [selectedProduct, setSelectedProduct] = useState('Video Calling');
  const [selectedFeature, setSelectedFeature] = useState('');

  const [openProduct, setOpenProduct] = useState<boolean>(false);
  const [openFeature, setOpenFeature] = useState<boolean>(false);

  const [productItems, setProductItems] = useState<Array<ItemType<string>>>([
    { label: 'Video Calling', value: 'video-calling' },
    { label: 'ILS', value: 'ILS' },
  ]);

  const [sampleCodeItems, setSampleCodeItems] = useState<Array<ItemType<string>>>([
    { label: 'Select a sample code:', value: '' },
    { label: 'Get Started', value: 'getStarted' },
    { label: 'Authentication Workflow', value: 'authenticationWorkflow' },
    { label: 'Ensure Call Quality', value: 'callQuality' },
    { label: 'Audio and Voice Effects', value: 'audioEffects' },
    { label: 'Stream Media to a Channel', value: 'playMedia' },
    { label: 'Cloud Proxy', value: 'cloudProxy' },
    { label: 'Secure Channel Encryption', value: 'mediaEncryption' },
    { label: 'Geofencing', value: 'geofencing' },
    { label: 'Screen share, mute, and volume control', value: 'productWorkflow' },
    { label: 'Virtual Background', value: 'virtualBackground' },
    { label: 'AI Noise Suppression', value: 'noiseSuppression' },
    { label: '3d Spatial Audio', value: 'spatialAudio' },
    { label: 'Live Streaming Over Multiple Channels', value: 'multiChannelLiveStreaming' }
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1e3a5a' }}>
      <View style={{ backgroundColor: '#3498db', padding: 10, marginBottom: 16, borderRadius: 10 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold',  textAlign : 'center', height: 50}}>Get Started with Agora Video Calling</Text>
      </View>
      <View style={{ flex: 1, padding: 5 }}>
        <DropDownPicker
          open={openProduct}
          value={selectedProduct}
          items={productItems}
          setOpen={setOpenProduct}
          setValue={(value: any) => {
            setSelectedProduct(value); // Update the local state
          }}
          onChangeValue={(product) => {
            console.log('Selected product value:', product);
            config.product = product;
          }}
          setItems={setProductItems}
          placeholder='Choose a product'
          containerStyle={{ borderRadius: 10 }}
          style={{ backgroundColor: '#3498db' }} // Blue button color
        />
        <DropDownPicker
          open={openFeature}
          value={selectedFeature}
          items={sampleCodeItems}
          setOpen={setOpenFeature}
          setValue={(value) => {setSelectedFeature(value)}}
          setItems={setSampleCodeItems}
          placeholder='Choose a sample code'
          zIndex={1001} // Ensure a higher zIndex than the first dropdown
          containerStyle={{ borderRadius: 10, marginTop: 10 }}
          style={{ backgroundColor: '#3498db' }} // Blue button color
        />
        {selectedFeature === 'getStarted' && (
          <GetStartedSDK />
        )}
        {selectedFeature === 'authenticationWorkflow' && (
          <AuthenticationWorkflow />
        )}
        {selectedFeature === 'callQuality' && (
          <EnsureCallQuality />
        )}
        {
          selectedFeature === 'audioEffects' && (
            <AudioAndVoiceEffects />
          )}
        {
          selectedFeature === 'playMedia'  && (
            <PlayMedia/>
          )
        }
        {
          selectedFeature === 'cloudProxy'  && (
            <CloudProxy/>
          )
        }
        {
          selectedFeature === 'geofencing'  && (
            <Geofencing/>
          )
        }
        {
          selectedFeature === 'mediaEncryption'  && (
            <MediaEncryption/>
          )
        }
        {
          selectedFeature === 'productWorkflow'  && (
            <ProductWorkflow/>
          )
        }
        {
          selectedFeature === 'virtualBackground'  && (
            <VirtualBackground/>
          )
        }
        {
          selectedFeature === 'noiseSuppression'  && (
            <AINoiseSuppression/>
            )
        }
        {
          selectedFeature === 'spatialAudio'  && (
            <SpatialAudio/>
          )
        }
        {
          selectedFeature === 'multiChannelLiveStreaming'  && (
            config.product === "ILS" ?
            <LivesStreamingOverMultipleChannels/> : <Text style = {{color: "white"}}> This feature is only available for ILS</Text>
          )
        }
      </View>
    </SafeAreaView>
  );
};

export default App;
