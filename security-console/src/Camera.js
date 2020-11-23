import React, { useEffect, useState, useCallback } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import Webcam from 'react-webcam';
import { updateCheckinWithPhoto } from './graphql/customMutations'

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: 'user',
};

const Camera = (props) => {
  const webcamRef = React.useRef(null);

  const capture = React.useCallback(async () => {
    if (props.maskId)
    {
      const imageSrc = webcamRef.current.getScreenshot();
      const checkinWithPhoto = { 
        id: props.checkinId,
       }
      await API.graphql(graphqlOperation(updateCheckinWithPhoto, {input: checkinWithPhoto}))
    }
  }, [webcamRef]);

  return (
    <>
      <Webcam
        audio={false}
        height={videoConstraints.height}
        ref={webcamRef}
        screenshotFormat='image/jpeg'
        width={videoConstraints.width}
        videoConstraints={videoConstraints}
      />
      <button onClick={capture}>{props.maskId ? 'Capture Photo' : 'Please enter a MaskID to capture a photo'}</button>
    </>
  );
};

export default Camera;
