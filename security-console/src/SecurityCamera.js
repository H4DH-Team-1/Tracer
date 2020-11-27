/* src/App.js */
import React, { useState } from 'react';
import Webcam from 'react-webcam';
import { makeStyles } from '@material-ui/core/styles';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Paper from '@material-ui/core/Paper';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CameraEnhanceIcon from '@material-ui/icons/CameraEnhance';
import BackupIcon from '@material-ui/icons/Backup';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Storage from '@aws-amplify/storage';
import { v4 } from 'uuid';

const useStyles = makeStyles(() => ({
  container: {
    padding: 10,
  },
}));

const videoConstraints = {
  width: 600,
  facingMode: 'user',
};

const SecurityCamera = () => {
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);
  const webcamRef = React.useRef(null);

  const classes = useStyles();

  const handleChange = (event) => {
    setLocation(event.target.value);
  };

  const capturePhoto = React.useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  async function callSaveAddSecurityImage() {
    const fileName = 'm-' + location + '_' + v4() + '.jpg';
    console.log('Writing file to S3', fileName);

    // eslint-disable-next-line
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );
    await Storage.put(fileName, base64Data, {
      contentType: 'image/jpeg',
      contentEncoding: 'base64',
    });

    setLocation('');
    setImage(null);
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          <Paper elevation={3} className={classes.container}>
            <FormGroup>
              <InputLabel id='lblLoc'>Select Camera Location</InputLabel>
              <Select
                labelId='lblLoc'
                id='ddlLoc'
                value={location}
                onChange={handleChange}
                label='Select Camera Location'>
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                <MenuItem value='Entrance'>Entrance</MenuItem>
                <MenuItem value='Cafeteria'>Cafeteria</MenuItem>
                <MenuItem value='Room101'>Room101</MenuItem>
                <MenuItem value='Room102'>Room102</MenuItem>
                <MenuItem value='Room201'>Room201</MenuItem>
                <MenuItem value='Room202'>Room202</MenuItem>
              </Select>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat='image/jpeg'
                width={videoConstraints.width}
                videoConstraints={videoConstraints}
              />
            </FormGroup>
            <ButtonGroup>
              <Button size='small' variant='contained' onClick={capturePhoto} disabled={!location}>
                <CameraEnhanceIcon />
                &nbsp;Snap Security Image
              </Button>
            </ButtonGroup>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} className={classes.container}>
            <Typography>Captured Image:<br /></Typography>
            { image ? (
            <>
              <FormGroup>
                <img width={videoConstraints.width} src={image} />
              </FormGroup>
              <ButtonGroup>
                <Button
                  size='small'
                  variant='contained'
                  color='primary'
                  onClick={() => callSaveAddSecurityImage()}
                  disabled={!location || !image}>
                  <BackupIcon />
                  &nbsp;Submit for Analysis
                </Button>
              </ButtonGroup>
            </>
            ) : <Typography><em>None</em></Typography> }
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default SecurityCamera;
