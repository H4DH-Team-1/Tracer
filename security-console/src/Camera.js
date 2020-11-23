import React, { useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: 'user',
};

const Camera = (props) => {
  const webcamRef = React.useRef(null);

  const capturePhoto = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    props.callPhotoCapturedFunc(props.data, imageSrc);
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
      <button onClick={capturePhoto}>Capture Photo</button>
    </>
  );
};

export default Camera;
