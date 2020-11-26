import React, { useEffect, useState, useCallback } from 'react'
import Webcam from 'react-webcam'
import Button from '@material-ui/core/Button'
import PhotoCamera from '@material-ui/icons/PhotoCamera'

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
      /><br />
      <Button size='small' variant="outlined" color="primary" onClick={capturePhoto}><PhotoCamera /> Capture Photo</Button>
    </>
  );
};

export default Camera;
