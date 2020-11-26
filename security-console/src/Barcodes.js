import React, { useEffect, useState } from 'react'
import { v4 } from 'uuid'
import { QRCode } from 'react-qr-svg'
import { makeStyles } from '@material-ui/core/styles'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import IconButton from '@material-ui/core/IconButton'
import RefreshIcon from '@material-ui/icons/Refresh'

const urlPrefix = 'https://h4dh-team-1.github.io/Capture/?maskId='


const useStyles = makeStyles((theme) => ({
  spaceit: {
    padding: 10,
  },
}));

const Barcodes = (props) => {
  const [launchQr, setLaunchQr] = useState()
  const [kioskQr, setKioskQr] = useState()

  const classes = useStyles()

  const generateLaunch = () => {
    setLaunchQr('https://h4dh-team-1.github.io/Capture/?maskId=' + v4())
  }

  const generateKiosk = () => {
    setKioskQr(v4())
  }

  useEffect(() => {
    generateLaunch()
    generateKiosk()
  }, []);


  return (
    <Grid container spacing={1} className={classes.spaceit}>
      <Grid item xs={6} className={classes.spaceit}>
        <Paper elevation={3}>
          <Typography variant='h5' component='h1'>
            Launch URL with Mask ID for Phones:
          </Typography>
          <Grid alignItems='center'>
            <QRCode value={launchQr} style={{ width: 256 }} />
          </Grid>
          <br />
          <IconButton onClick={() => generateLaunch()}><RefreshIcon /></IconButton>
          <Typography>
            {launchQr}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} className={classes.spaceit}>
        <Paper elevation={3} className={classes.spaceit}>
          <Typography variant='h5' component='h1'>
            Mask ID Only for Kiosk:
          </Typography>
          <Grid alignItems='center'>
            <QRCode value={kioskQr} style={{ width: 256 }} />
          </Grid>
          <br />
          <IconButton onClick={() => generateKiosk()}><RefreshIcon /></IconButton>
          <Typography>
            {kioskQr}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default Barcodes