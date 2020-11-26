/* src/App.js */
import React, { useState } from 'react'
import QrReader from 'react-qr-scanner'
import { makeStyles } from '@material-ui/core/styles'
import FormGroup from '@material-ui/core/FormGroup'
import TextField from '@material-ui/core/TextField'
import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

const initialState = { name: '', phone: '', postcode: '', maskId: '' }

const previewStyle = {
  height: 256,
  width: 256,
}

const useStyles = makeStyles((theme) => ({
  container: {
    padding: 10,
  },
}))

const App = (props) => {
  const [formState, setFormState] = useState(initialState)

  const classes = useStyles()

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  function callSaveAddCheckin()
  {
    props.saveAddCheckin(formState)
    setFormState(initialState)
  }

  function handleScan(data) {
    if (data)
    {
      console.log('GotQR:', data)
      setFormState({ ...formState, maskId: data })
    }
  }
  function handleError(err) {
    console.error(err)
  }

  return (
    <Paper elevation={3} className={classes.container}>
      <FormGroup>
        <TextField
          onChange={event => setInput('name', event.target.value)}
          value={formState.name}
          label="Name"
        /><br />
        <TextField
          onChange={event => setInput('phone', event.target.value)}
          value={formState.phone}
          label="Phone"
        /><br />
        <TextField
          onChange={event => setInput('postcode', event.target.value)}
          value={formState.postcode}
          label="Postcode"
        /><br />
        <Divider />
        <Typography>Use the camera to scan the QR Code on the Mask:</Typography>
        <QrReader
          delay={500}
          style={previewStyle}
          onError={handleError}
          onScan={handleScan}
          />
        <TextField
          onChange={event => setInput('maskId', event.target.value)}
          value={formState.maskId}
          label="Mask ID"
        />
        <br />
        <Button size='small' variant="contained" color="primary" fullWidth={false} onClick={callSaveAddCheckin} disabled={!formState.name || !formState.phone || !formState.postcode || !formState.maskId}><AddIcon /> Create Checkin</Button>
      </FormGroup>
    </Paper>
  )
}

export default App