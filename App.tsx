import React, { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import GetStartedSDK from './src/get-started-sdk/getStartedSDK';
import config from './src/agora-manager/config';
import AuthenticationWorkflow from './src/authentication-workflow/authenticationWorkflow';

const App = () => {
  const [selectedValues, setSelectedValues] = useState({
    selectedProduct: 'Video Calling',
    selectedSampleCode: '',
  });

  const handleProductChange = (itemValue: string) => {
    setSelectedValues((prevValues) => ({
      ...prevValues,
      selectedProduct: itemValue,
    }));
    config.product = itemValue;
  };

  const handleSampleCodeChange = (itemValue: string) => {
    setSelectedValues((prevValues) => ({
      ...prevValues,
      selectedSampleCode: itemValue,
    }));
  };

  return (
    <SafeAreaView>
      <Picker
        selectedValue={selectedValues.selectedProduct}
        onValueChange={handleProductChange}
      >
        <Picker.Item label="Video Calling" value="Video Calling" />
        <Picker.Item label="ILS" value="ILS" />
      </Picker>
      <Picker
        selectedValue={selectedValues.selectedSampleCode}
        onValueChange={handleSampleCodeChange}
      >
        <Picker.Item label="Select a sample code:" value="" />
        <Picker.Item label="Get Started" value="getStarted" />
        <Picker.Item label="Authentication Workflow" value="authenticationWorkflow"/> 
      </Picker>
      {selectedValues.selectedSampleCode === 'getStarted' && (
        <GetStartedSDK />
      )}
      {selectedValues.selectedSampleCode === 'authenticationWorkflow' && (
        <AuthenticationWorkflow />
      )}
    </SafeAreaView>
  );
};

export default App;
