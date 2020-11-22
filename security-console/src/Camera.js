import React, { useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: 'user',
};

const Camera = (props) => {
  const webcamRef = React.useRef(null);

  const capture = React.useCallback(() => {
    if (props.maskId)
    {
      const imageSrc = webcamRef.current.getScreenshot();
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
